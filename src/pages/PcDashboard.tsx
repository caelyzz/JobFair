import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Monitor, Clock, LogOut, Info, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import './PcDashboard.css';

// ====== Helpers ======
function formatCountdown(endTime: Date): string {
  const diff = endTime.getTime() - Date.now();
  if (diff <= 0) return '00:00:00';
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  if (h > 0) return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

const speak = (text: string) => {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'id-ID';
    utterance.rate = 0.85; // Kembali ke 0.85 karena intonasinya paling pas
    utterance.pitch = 1.05; // Sedikit lebih tinggi
    
    // Cari suara secara langsung (menghindari bug reset saat Hot Reload)
    const availableVoices = window.speechSynthesis.getVoices();
    const idVoices = availableVoices.filter(v => v.lang.includes('id'));
    
    if (idVoices.length > 0) {
      // Prioritaskan suara perempuan yang formal/natural
      const bestVoice = idVoices.find(v => 
        v.name.includes('Google') || 
        v.name.includes('Gadis') || 
        v.name.includes('Premium') || 
        v.name.includes('Female') || 
        v.name.includes('Natural')
      ) || idVoices[0];
      utterance.voice = bestVoice;
    }
    
    window.speechSynthesis.speak(utterance);
    return utterance;
  }
  return null;
};

const PcDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [pcNumber, setPcNumber] = useState<number | null>(null);
  const [status, setStatus] = useState<'available' | 'occupied'>('available');
  const [customerName, setCustomerName] = useState<string>('');
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>('--:--');
  const [loading, setLoading] = useState(true);
  
  const spokenRef = useRef<Set<number>>(new Set());

  // Determine PC Number from logged in user email
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user && user.email) {
        // e.g., pc1@rcade.com -> 1
        const match = user.email.match(/^pc(\d+)@/i);
        if (match && match[1]) {
          setPcNumber(parseInt(match[1]));
        } else {
          // Fallback if not matching format
          setPcNumber(0);
        }
      }
      setLoading(false);
    });
  }, []);

  const fetchSession = useCallback(async () => {
    if (pcNumber === null || pcNumber === 0) return;
    
    const { data } = await supabase
      .from('pc_sessions')
      .select('*, transactions(customer_name)')
      .eq('pc_number', pcNumber)
      .eq('status', 'active')
      .order('start_time', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      const end = new Date(data.end_time);
      if (end.getTime() > Date.now()) {
        setStatus('occupied');
        setCustomerName(data.transactions?.customer_name || 'Player');
        setEndTime(end);
        spokenRef.current.clear(); // Reset spoken memory for new session
      } else {
        setStatus('available');
        setEndTime(null);
      }
    } else {
      setStatus('available');
      setEndTime(null);
    }
  }, [pcNumber]);

  useEffect(() => {
    fetchSession();
    
    if (pcNumber) {
      const ch = supabase.channel(`pc-dashboard-${pcNumber}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'pc_sessions' }, () => {
          fetchSession();
        })
        .subscribe();
      return () => { supabase.removeChannel(ch); };
    }
  }, [pcNumber, fetchSession]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (status === 'occupied' && endTime) {
        const diff = endTime.getTime() - Date.now();
        setTimeLeft(formatCountdown(endTime));
        
        const currentSec = Math.ceil(diff / 1000);
        
        // Timer alarms locally on the PC
        if (currentSec <= 300 && currentSec > 295 && !spokenRef.current.has(300)) {
          speak(`Mohon perhatian. Waktu bermain Anda tersisa lima menit lagi.`);
          spokenRef.current.add(300);
        } else if (currentSec <= 60 && currentSec > 55 && !spokenRef.current.has(60)) {
          speak(`Mohon perhatian. Waktu bermain Anda tersisa satu menit.`);
          spokenRef.current.add(60);
        } else if (currentSec <= 10 && currentSec > 0 && !spokenRef.current.has(10)) {
          speak(`Perhatian. Sepuluh detik terakhir.`);
          spokenRef.current.add(10);
        } else if (currentSec <= 0 && currentSec > -5 && !spokenRef.current.has(0)) {
          speak(`Waktu bermain Anda telah habis. Terima kasih telah bermain di Ar keid, Sebelas Er Pe El.`);
          spokenRef.current.add(0);
          setStatus('available');
          setEndTime(null);
        } else if (currentSec <= -5) {
          setStatus('available');
          setEndTime(null);
        }
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [status, endTime]);

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [logoutPin, setLogoutPin] = useState('');
  const [pinError, setPinError] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
    setLogoutPin('');
    setPinError(false);
  };

  const handleLogoutConfirm = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (logoutPin === '112233') {
      await supabase.auth.signOut();
      navigate('/secret-login');
    } else {
      setPinError(true);
      setLogoutPin('');
    }
  };

  const handleFinishSession = async () => {
    if (pcNumber === null || pcNumber === 0) return;
    
    // Optimistic UI update
    setStatus('available');
    setEndTime(null);
    spokenRef.current.clear();
    
    // Update DB
    await supabase.from('pc_sessions')
      .update({ status: 'finished', end_time: new Date().toISOString() })
      .eq('pc_number', pcNumber)
      .eq('status', 'active');
  };

  if (loading) {
    return <div className="pc-loading">Memuat Data PC...</div>;
  }

  return (
    <div className="pc-dashboard">
      <header className="pc-header">
        <div className="pc-logo-area">
          <Monitor size={28} className="pc-icon" />
          <h1>CLIENT PC {pcNumber || '?'}</h1>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button 
            onClick={() => speak(`Sistem suara untuk PC ${pcNumber} sudah aktif.`)} 
            className="pc-logout-btn" 
            style={{ borderColor: 'rgba(0, 255, 204, 0.3)', color: '#00ffcc', background: 'rgba(0, 255, 204, 0.1)' }}
          >
            <Monitor size={18} /> Test Suara
          </button>
          <button onClick={handleLogoutClick} className="pc-logout-btn">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </header>

      <main className="pc-main-content">
        <motion.div 
          className={`pc-status-card ${status}`}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {status === 'occupied' ? (
            <>
              <div className="pc-card-header">
                <h2>SEDANG DIGUNAKAN</h2>
              </div>
              <div className="pc-user-info">
                <p>Halo, <strong>{customerName}</strong>!</p>
                <p className="pc-enjoy">Selamat Bermain di R-CADE XI RPL</p>
              </div>
              <div className="pc-timer-display">
                <Clock size={40} className="timer-icon" />
                <span className="timer-text">{timeLeft}</span>
              </div>
              <div className="pc-rules">
                <Info size={16} /> Harap menjaga kebersihan dan peralatan. Waktu akan dihitung mundur secara otomatis.
              </div>
              <div className="pc-actions">
                <button onClick={handleFinishSession} className="pc-finish-btn">
                  <CheckCircle size={20} /> Selesaikan Bermain
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="pc-card-header available">
                <h2>KOSONG</h2>
              </div>
              <div className="pc-ready-info">
                <Monitor size={80} className="pc-ready-icon" />
                <h3>PC {pcNumber || '?'} Siap Digunakan</h3>
                <p>Silakan ke meja kasir untuk menyewa PC ini.</p>
              </div>
            </>
          )}
        </motion.div>
      </main>
      
      <div className="pc-background-effects">
        <div className={`pc-glow ${status}`} />
      </div>

      {/* Logout PIN Modal */}
      {showLogoutModal && (
        <div className="pin-modal-overlay">
          <motion.div 
            className="pin-modal"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <h2>Masukkan PIN Logout</h2>
            <form onSubmit={handleLogoutConfirm}>
              <div className="pin-input-group">
                <input 
                  type="password"
                  className="pin-input"
                  value={logoutPin}
                  onChange={(e) => setLogoutPin(e.target.value)}
                  placeholder="••••••"
                  autoFocus
                  maxLength={6}
                />
                {pinError && <p className="pin-error">PIN Salah! Silakan coba lagi.</p>}
              </div>
              <div className="pin-actions">
                <button 
                  type="button" 
                  className="pin-btn cancel" 
                  onClick={() => setShowLogoutModal(false)}
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="pin-btn confirm"
                >
                  Konfirmasi
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default PcDashboard;
