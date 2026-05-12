import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Monitor, Clock, Activity } from 'lucide-react';
import { supabase } from '../lib/supabase';
import './PcStatusSection.css';

interface PcSession {
  pcNumber: number;
  status: 'available' | 'occupied';
  customerName?: string;
  endTime?: Date;
}

function formatCountdown(endTime: Date): string {
  const diff = endTime.getTime() - Date.now();
  if (diff <= 0) return '00:00';
  const m = Math.floor(diff / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function formatCurrentTime(): string {
  const now = new Date();
  return now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function buildPcList(sessions: any[]): PcSession[] {
  const pcList: PcSession[] = [1, 2, 3, 4, 5, 6].map(n => ({ pcNumber: n, status: 'available' as const }));
  const now = new Date();
  sessions.forEach(s => {
    if (s.status === 'active' && new Date(s.end_time) > now) {
      const idx = pcList.findIndex(p => p.pcNumber === s.pc_number);
      if (idx !== -1) {
        pcList[idx] = {
          pcNumber: s.pc_number,
          status: 'occupied',
          customerName: s.transactions?.customer_name || 'Player',
          endTime: new Date(s.end_time),
        };
      }
    }
  });
  return pcList;
}

export const PcStatusSection: React.FC = () => {
  const [pcList, setPcList] = useState<PcSession[]>([1, 2, 3, 4, 5, 6].map(n => ({ pcNumber: n, status: 'available' })));
  const [currentTime, setCurrentTime] = useState(formatCurrentTime());
  const [countdowns, setCountdowns] = useState<string[]>([]);

  // Fetch active sessions from Supabase
  const fetchSessions = async () => {
    const { data } = await supabase
      .from('pc_sessions')
      .select('*, transactions(customer_name)')
      .eq('status', 'active');
    if (data) setPcList(buildPcList(data));
  };

  useEffect(() => {
    fetchSessions();

    // Subscribe to real-time changes on pc_sessions
    const channel = supabase
      .channel('pc-status-landing')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pc_sessions' }, () => {
        fetchSessions();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // Clock & countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(formatCurrentTime());
      setPcList(prev => prev.map(pc => {
        if (pc.status === 'occupied' && pc.endTime && pc.endTime.getTime() <= Date.now()) {
          return { ...pc, status: 'available', customerName: undefined, endTime: undefined };
        }
        return pc;
      }));
      setCountdowns(
        pcList.map((pc) =>
          pc.status === 'occupied' && pc.endTime ? formatCountdown(pc.endTime) : ''
        )
      );
    }, 1000);
    return () => clearInterval(timer);
  }, [pcList]);

  const availableCount = pcList.filter((pc) => pc.status === 'available').length;

  return (
    <section className="pc-status-section" id="availability">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="section-header"
        >
          <span className="section-badge">
            <Activity size={14} /> LIVE STATUS
          </span>
          <h2 className="section-title">
            Ketersediaan <span className="gradient-text">PC</span>
          </h2>
          <p className="section-desc">Status real-time, diperbarui setiap detik</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="digital-clock"
        >
          <Clock size={20} className="clock-icon" />
          <span className="clock-time">{currentTime}</span>
          <span className="clock-label">WIB</span>
          <div className="clock-divider" />
          <span className={`avail-indicator ${availableCount > 0 ? 'has-available' : 'all-busy'}`}>
            {availableCount} / {pcList.length} PC Tersedia
          </span>
        </motion.div>

        <div className="pc-grid">
          {pcList.map((pc, index) => (
            <motion.div
              key={pc.pcNumber}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`pc-card ${pc.status === 'available' ? 'pc-available' : 'pc-occupied'}`}
            >
              <div className="pc-card-header">
                <div className={`pc-monitor-icon ${pc.status}`}>
                  <Monitor size={32} />
                </div>
                <span className="pc-number">PC {pc.pcNumber}</span>
              </div>

              <div className="pc-status-info">
                {pc.status === 'available' ? (
                  <>
                    <span className="status-dot available" />
                    <span className="status-text available-text">KOSONG</span>
                  </>
                ) : (
                  <>
                    <span className="status-dot occupied" />
                    <span className="status-text occupied-text">DIPAKAI</span>
                  </>
                )}
              </div>

              {pc.status === 'occupied' && (
                <div className="pc-details">
                  <div className="detail-row">
                    <span className="detail-label">Player</span>
                    <span className="detail-value">{pc.customerName}</span>
                  </div>
                  <div className="countdown-display">
                    <span className="countdown-label">Sisa Waktu</span>
                    <span className="countdown-value">{countdowns[index] || '--:--'}</span>
                  </div>
                </div>
              )}

              {pc.status === 'available' && (
                <div className="pc-available-msg">
                  <span>Siap dimainkan! 🎮</span>
                </div>
              )}

              <div className={`pc-glow-border ${pc.status}`} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
