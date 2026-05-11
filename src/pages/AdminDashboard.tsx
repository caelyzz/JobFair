import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Gamepad2, Cookie, DollarSign, ShoppingCart, Monitor,
  Clock, LogOut, Package, Plus, Minus, CheckCircle, X,
  CreditCard, Banknote, CalendarDays, Volume2
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import './AdminDashboard.css';

// ====== Types ======
interface PcSession {
  pcNumber: number;
  status: 'available' | 'occupied';
  customerName?: string;
  endTime?: Date;
  duration?: number;
}

interface CookieStock {
  id: string;
  variant: string;
  stock: number;
}

interface Transaction {
  id: string;
  customerName: string;
  totalAmount: number;
  paymentMethod: 'cash' | 'qris';
  type: 'game' | 'cookie' | 'package';
  createdAt: Date;
}

// ====== Helpers ======
function formatCountdown(endTime: Date): string {
  const diff = endTime.getTime() - Date.now();
  if (diff <= 0) return '00:00';
  const m = Math.floor(diff / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function formatTime(): string {
  return new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
}

const speak = (text: string) => {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'id-ID';
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    window.speechSynthesis.speak(utterance);
    return utterance;
  }
  return null;
};

// No more dummy data — all fetched from Supabase

// ====== Game Transaction Modal ======
const GameModal: React.FC<{
  pcs: PcSession[];
  stocks: CookieStock[];
  onClose: () => void;
  onSubmit: (data: any) => void;
}> = ({ pcs, stocks, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [duration, setDuration] = useState(15);
  const [pc, setPc] = useState(0);
  const [withCookies, setWithCookies] = useState(false);
  const [payMethod, setPayMethod] = useState<'cash' | 'qris'>('cash');
  const [cashReceived, setCashReceived] = useState('');

  const prices: Record<number, number> = { 15: 3000, 30: 5000, 60: 10000 };
  const bundlePrices: Record<number, number> = { 15: 10000, 30: 12000 };
  const totalPrice = withCookies && (duration === 15 || duration === 30) ? bundlePrices[duration] : prices[duration] + (withCookies ? 8000 : 0);
  const change = payMethod === 'cash' ? Math.max(0, parseInt(cashReceived || '0') - totalPrice) : 0;
  const availablePcs = pcs.filter(p => p.status === 'available');
  const hasCookieStock = stocks.some(s => s.stock > 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !pc) return;
    onSubmit({ name, duration, pc, withCookies, payMethod, totalPrice, cashReceived: payMethod === 'cash' ? parseInt(cashReceived || '0') : null });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="modal glass" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2><Gamepad2 size={22} /> Input Transaksi Game</h2>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label>Nama Customer</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Nama pelanggan" required />
          </div>
          <div className="form-group">
            <label>Pilih Durasi</label>
            <div className="duration-options">
              {[15, 30, 60].map(d => (
                <button key={d} type="button" className={`dur-btn ${duration === d ? 'active' : ''}`} onClick={() => setDuration(d)}>
                  {d}m — {formatCurrency(prices[d])}
                </button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label>Pilih PC</label>
            <div className="pc-options">
              {availablePcs.length === 0 ? <p className="no-pc">Semua PC sedang dipakai!</p> :
                availablePcs.map(p => (
                  <button key={p.pcNumber} type="button" className={`pc-btn ${pc === p.pcNumber ? 'active' : ''}`} onClick={() => setPc(p.pcNumber)}>
                    PC {p.pcNumber}
                  </button>
                ))
              }
            </div>
          </div>
          <div className="form-group">
            <label className="checkbox-label">
              <input type="checkbox" checked={withCookies} onChange={e => setWithCookies(e.target.checked)} disabled={!hasCookieStock} />
              Tambah Cookies (+Rp 8.000) {!hasCookieStock && '(Stok habis)'}
            </label>
            {withCookies && (duration === 15 || duration === 30) && (
              <p className="bundle-info">🎁 Paket Bundling aktif! Harga: {formatCurrency(bundlePrices[duration])}</p>
            )}
          </div>
          <div className="form-group">
            <label>Metode Pembayaran</label>
            <div className="pay-options">
              <button type="button" className={`pay-btn ${payMethod === 'cash' ? 'active' : ''}`} onClick={() => setPayMethod('cash')}><Banknote size={16} /> Cash</button>
              <button type="button" className={`pay-btn ${payMethod === 'qris' ? 'active' : ''}`} onClick={() => setPayMethod('qris')}><CreditCard size={16} /> QRIS</button>
            </div>
          </div>
          {payMethod === 'cash' && (
            <div className="form-group">
              <label>Uang Diterima</label>
              <input type="number" value={cashReceived} onChange={e => setCashReceived(e.target.value)} placeholder="Masukkan nominal" />
              {parseInt(cashReceived || '0') >= totalPrice && (
                <p className="change-info">Kembalian: {formatCurrency(change)}</p>
              )}
            </div>
          )}
          {payMethod === 'qris' && <div className="qris-placeholder">📱 Tampilkan QRIS, lalu verifikasi pembayaran.</div>}
          <div className="modal-footer">
            <div className="total-display">Total: <strong>{formatCurrency(totalPrice)}</strong></div>
            <button type="submit" className="submit-btn" disabled={!name || !pc || (payMethod === 'cash' && parseInt(cashReceived || '0') < totalPrice)}>
              <CheckCircle size={18} /> Bayar & Mulai Sesi
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ====== Cookie Transaction Modal ======
const CookieModal: React.FC<{
  stocks: CookieStock[];
  onClose: () => void;
  onSubmit: (data: any) => void;
}> = ({ stocks, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [cart, setCart] = useState<Record<string, number>>({});
  const [payMethod, setPayMethod] = useState<'cash' | 'qris'>('cash');
  const [cashReceived, setCashReceived] = useState('');

  const totalQty = Object.values(cart).reduce((a, b) => a + b, 0);
  const totalPrice = totalQty * 8000;
  const change = payMethod === 'cash' ? Math.max(0, parseInt(cashReceived || '0') - totalPrice) : 0;

  const updateCart = (id: string, delta: number) => {
    setCart(prev => {
      const stock = stocks.find(s => s.id === id)!;
      const current = prev[id] || 0;
      const next = Math.max(0, Math.min(stock.stock, current + delta));
      return { ...prev, [id]: next };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || totalQty === 0) return;
    onSubmit({ name, cart, payMethod, totalPrice, cashReceived: payMethod === 'cash' ? parseInt(cashReceived || '0') : null });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="modal glass" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2><Cookie size={22} /> Input Transaksi Cookies</h2>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label>Nama Customer</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Nama pelanggan" required />
          </div>
          <div className="form-group">
            <label>Pilih Varian & Jumlah</label>
            <div className="cookie-list">
              {stocks.map(s => (
                <div key={s.id} className="cookie-row">
                  <div className="cookie-info-row">
                    <span className="cookie-vname">{s.variant}</span>
                    <span className="cookie-stock-label">Stok: {s.stock}</span>
                  </div>
                  <div className="qty-control">
                    <button type="button" onClick={() => updateCart(s.id, -1)} disabled={(cart[s.id] || 0) === 0}><Minus size={14} /></button>
                    <span>{cart[s.id] || 0}</span>
                    <button type="button" onClick={() => updateCart(s.id, 1)} disabled={(cart[s.id] || 0) >= s.stock}><Plus size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label>Metode Pembayaran</label>
            <div className="pay-options">
              <button type="button" className={`pay-btn ${payMethod === 'cash' ? 'active' : ''}`} onClick={() => setPayMethod('cash')}><Banknote size={16} /> Cash</button>
              <button type="button" className={`pay-btn ${payMethod === 'qris' ? 'active' : ''}`} onClick={() => setPayMethod('qris')}><CreditCard size={16} /> QRIS</button>
            </div>
          </div>
          {payMethod === 'cash' && (
            <div className="form-group">
              <label>Uang Diterima</label>
              <input type="number" value={cashReceived} onChange={e => setCashReceived(e.target.value)} placeholder="Masukkan nominal" />
              {parseInt(cashReceived || '0') >= totalPrice && totalPrice > 0 && (
                <p className="change-info">Kembalian: {formatCurrency(change)}</p>
              )}
            </div>
          )}
          {payMethod === 'qris' && <div className="qris-placeholder">📱 Tampilkan QRIS, lalu verifikasi pembayaran.</div>}
          <div className="modal-footer">
            <div className="total-display">Total: <strong>{formatCurrency(totalPrice)}</strong> ({totalQty} pcs)</div>
            <button type="submit" className="submit-btn" disabled={!name || totalQty === 0 || (payMethod === 'cash' && parseInt(cashReceived || '0') < totalPrice)}>
              <CheckCircle size={18} /> Bayar
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ====== Main Dashboard ======
const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(formatTime());
  const [pcs, setPcs] = useState<PcSession[]>([1,2,3,4].map(n => ({ pcNumber: n, status: 'available' })));
  const [stocks, setStocks] = useState<CookieStock[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [countdowns, setCountdowns] = useState<string[]>([]);
  const [showGameModal, setShowGameModal] = useState(false);
  const [showCookieModal, setShowCookieModal] = useState(false);

  // ====== Supabase Data Fetching ======
  const fetchPcSessions = useCallback(async () => {
    const { data } = await supabase
      .from('pc_sessions')
      .select('*, transactions(customer_name)')
      .eq('status', 'active');
    const base: PcSession[] = [1,2,3,4].map(n => ({ pcNumber: n, status: 'available' }));
    if (data) {
      const now = Date.now();
      data.forEach((s: any) => {
        const endTime = new Date(s.end_time);
        if (endTime.getTime() > now) {
          const idx = base.findIndex(p => p.pcNumber === s.pc_number);
          if (idx !== -1) {
            base[idx] = {
              pcNumber: s.pc_number,
              status: 'occupied' as const,
              customerName: s.transactions?.customer_name || 'Player',
              endTime,
              duration: Math.round((endTime.getTime() - new Date(s.start_time).getTime()) / 60000),
            };
          }
        }
      });
    }
    setPcs(base);
  }, []);

  const fetchStocks = useCallback(async () => {
    const { data } = await supabase.from('products').select('*').eq('category', 'cookie');
    if (data) setStocks(data.map((p: any) => ({ id: p.id, variant: p.name, stock: p.stock })));
  }, []);

  const fetchTransactions = useCallback(async () => {
    const today = new Date(); today.setHours(0,0,0,0);
    const { data } = await supabase
      .from('transactions')
      .select('*, transaction_items(product_id, products(category))')
      .gte('created_at', today.toISOString())
      .order('created_at', { ascending: false })
      .limit(20);
    if (data) {
      setTransactions(data.map((t: any) => {
        const cats = (t.transaction_items || []).map((i: any) => i.products?.category);
        let type: 'game' | 'cookie' | 'package' = 'game';
        if (cats.includes('package')) type = 'package';
        else if (cats.includes('cookie') && cats.includes('game')) type = 'package';
        else if (cats.includes('cookie')) type = 'cookie';
        return { id: t.id, customerName: t.customer_name, totalAmount: t.total_amount, paymentMethod: t.payment_method, type, createdAt: new Date(t.created_at) };
      }));
    }
  }, []);

  // Initial fetch + realtime subscriptions
  useEffect(() => {
    fetchPcSessions(); fetchStocks(); fetchTransactions();
    const ch = supabase.channel('admin-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pc_sessions' }, () => fetchPcSessions())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => fetchStocks())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => fetchTransactions())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [fetchPcSessions, fetchStocks, fetchTransactions]);
  
  // TTS Queue Management
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechQueue = React.useRef<Array<{ 
    text: string; 
    pcNumber: number; 
    second: number; 
    type: 'countdown' | 'manual' | 'end';
  }>>([]);
  const spokenSecondsRef = React.useRef<Record<number, number>>({});

  const processQueue = () => {
    if (speechQueue.current.length > 0 && !window.speechSynthesis.speaking) {
      const msg = speechQueue.current.shift();
      if (msg) {
        // Anti-lag: Skip countdown messages that are no longer relevant
        if (msg.type === 'countdown') {
          const targetPc = pcs.find(p => p.pcNumber === msg.pcNumber);
          if (targetPc && targetPc.endTime) {
            const currentRealSecond = Math.ceil((targetPc.endTime.getTime() - Date.now()) / 1000);
            // If the countdown message is for a second that has already passed, skip it
            if (msg.second > currentRealSecond + 1) {
              processQueue();
              return;
            }
          }
        }

        setIsSpeaking(true);
        const utterance = speak(msg.text);
        if (utterance) {
          utterance.onend = () => {
            setIsSpeaking(false);
            processQueue();
          };
          utterance.onerror = () => {
            setIsSpeaking(false);
            processQueue();
          };
        } else {
          setIsSpeaking(false);
          processQueue();
        }
      }
    } else if (speechQueue.current.length === 0) {
      setIsSpeaking(false);
    }
  };

  const addToSpeechQueue = (text: string, pcNumber: number = 0, second: number = -1, type: 'countdown' | 'manual' | 'end' = 'manual') => {
    // Avoid duplicate countdowns for the same second
    const isDuplicate = speechQueue.current.some(m => m.pcNumber === pcNumber && m.second === second && m.type === type);
    
    if (!isDuplicate) {
      speechQueue.current.push({ text, pcNumber, second, type });
      if (!window.speechSynthesis.speaking) {
        processQueue();
      }
    }
  };


  // Real-time clock & countdown
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setCurrentTime(formatTime());
      
      setPcs(prev => {
        const nextPcs = prev.map(pc => {
          if (pc.status === 'occupied' && pc.endTime) {
            const timeLeft = pc.endTime.getTime() - now;
            const currentSec = Math.ceil(timeLeft / 1000);
            
            // Logic for 10s countdown to 0s
            if (currentSec <= 10 && currentSec >= 0) {
              if (spokenSecondsRef.current[pc.pcNumber] !== currentSec) {
                spokenSecondsRef.current[pc.pcNumber] = currentSec;
                
                let msg = "";
                let type: 'countdown' | 'end' = 'countdown';
                
                if (currentSec === 10) {
                  msg = `Peringatan, PC ${pc.pcNumber} Kak ${pc.customerName}, sepuluh detik lagi.`;
                } else if (currentSec > 0) {
                  msg = `Kak ${pc.customerName}, ${currentSec}.`;
                } else if (currentSec === 0) {
                  msg = `Waktu PC ${pc.pcNumber} Kak ${pc.customerName} sudah habis.`;
                  type = 'end';
                }

                if (msg) {
                  addToSpeechQueue(msg, pc.pcNumber, currentSec, type);
                }
              }
            }

            if (timeLeft <= 0) {
              delete spokenSecondsRef.current[pc.pcNumber];
              return { ...pc, status: 'available' as const, customerName: undefined, endTime: undefined, duration: undefined };
            }
          }
          return pc;
        });

        setCountdowns(nextPcs.map(pc => pc.status === 'occupied' && pc.endTime ? formatCountdown(pc.endTime) : ''));
        return nextPcs;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [pcs]); // Include pcs to have latest values in processQueue logic


  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Stats
  const totalRevenue = transactions.reduce((s, t) => s + t.totalAmount, 0);
  const totalCookies = transactions.filter(t => t.type === 'cookie' || t.type === 'package').length;
  const totalGameSessions = transactions.filter(t => t.type === 'game' || t.type === 'package').length;

  const handleFinishPc = async (pcNum: number) => {
    // Optimistic UI update
    setPcs(prev => prev.map(pc => pc.pcNumber === pcNum ? { ...pc, status: 'available' as const, customerName: undefined, endTime: undefined, duration: undefined } : pc));
    delete spokenSecondsRef.current[pcNum];

    // Update DB
    await supabase.from('pc_sessions').update({ status: 'finished', end_time: new Date().toISOString() }).eq('pc_number', pcNum).eq('status', 'active');
  };

  const handleManualCall = (pc: PcSession) => {
    if (pc.customerName) {
      addToSpeechQueue(`Panggilan untuk Kak ${pc.customerName}, silakan menuju ke PC ${pc.pcNumber}.`, pc.pcNumber, -1, 'manual');
    }
  };

  const handleGameSubmit = async (data: any) => {
    setShowGameModal(false);
    const change = data.payMethod === 'cash' ? Math.max(0, data.cashReceived - data.totalPrice) : null;
    
    // 1. Insert Transaction
    const { data: tx, error } = await supabase.from('transactions').insert({
      customer_name: data.name,
      total_amount: data.totalPrice,
      payment_method: data.payMethod,
      cash_received: data.cashReceived,
      change_amount: change,
      payment_status: 'paid'
    }).select().single();

    if (error || !tx) { console.error("Error creating tx", error); return; }

    // 2. Insert Game Item
    const { data: gameProducts } = await supabase.from('products').select('*').eq('category', 'game').eq('duration_minutes', data.duration).limit(1);
    const gameProduct = gameProducts?.[0];
    
    if (gameProduct) {
      await supabase.from('transaction_items').insert({ transaction_id: tx.id, product_id: gameProduct.id, quantity: 1, subtotal: gameProduct.price });
    } else {
      console.error("Produk game tidak ditemukan di database untuk durasi:", data.duration);
    }

    // 3. Handle Cookies if bundled
    if (data.withCookies) {
      const { data: availableCookies } = await supabase.from('products').select('*').eq('category', 'cookie').gt('stock', 0).limit(1);
      if (availableCookies && availableCookies.length > 0) {
        const cookie = availableCookies[0];
        await supabase.from('transaction_items').insert({ transaction_id: tx.id, product_id: cookie.id, quantity: 1, subtotal: 8000 });
        await supabase.from('products').update({ stock: cookie.stock - 1 }).eq('id', cookie.id);
      }
    }

    // 4. Create PC Session
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + data.duration * 60000);
    await supabase.from('pc_sessions').insert({
      transaction_id: tx.id,
      pc_number: data.pc,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      status: 'active'
    });
  };

  const handleCookieSubmit = async (data: any) => {
    setShowCookieModal(false);
    const change = data.payMethod === 'cash' ? Math.max(0, data.cashReceived - data.totalPrice) : null;

    const { data: tx, error } = await supabase.from('transactions').insert({
      customer_name: data.name,
      total_amount: data.totalPrice,
      payment_method: data.payMethod,
      cash_received: data.cashReceived,
      change_amount: change,
      payment_status: 'paid'
    }).select().single();

    if (error || !tx) { console.error("Error creating tx", error); return; }

    // Insert items & update stock
    for (const [id, qty] of Object.entries(data.cart)) {
      if ((qty as number) > 0) {
        const stockItem = stocks.find(s => s.id === id);
        if (stockItem) {
          await supabase.from('transaction_items').insert({ transaction_id: tx.id, product_id: id, quantity: qty, subtotal: (qty as number) * 8000 });
          await supabase.from('products').update({ stock: stockItem.stock - (qty as number) }).eq('id', id);
        }
      }
    }
  };

  const updateStock = async (id: string, delta: number) => {
    const stockItem = stocks.find(s => s.id === id);
    if (stockItem) {
      const newStock = Math.max(0, stockItem.stock + delta);
      // Optimistic update
      setStocks(prev => prev.map(s => s.id === id ? { ...s, stock: newStock } : s));
      await supabase.from('products').update({ stock: newStock }).eq('id', id);
    }
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-topbar">
        <div className="topbar-left">
          <img src="/logo_rcade_rpl.png" alt="R-CADE" className="topbar-logo" />
          <div>
            <h1 className="topbar-title">DASHBOARD <span className="gradient-text">ADMIN</span></h1>
            <p className="topbar-sub">Sistem Manajemen Stand XI RPL</p>
          </div>
        </div>
        <div className="topbar-right">
          <div className={`topbar-clock ${isSpeaking ? 'speaking-active' : ''}`}>
            {isSpeaking ? <Volume2 size={18} className="speaking-icon" /> : <Clock size={18} />}
            <span className="clock-val">{currentTime}</span>
            <span className="clock-wib">WIB</span>
          </div>
          <button className="logout-btn" onClick={() => navigate('/')}><LogOut size={16} /> Keluar</button>
        </div>
      </header>

      <main className="admin-main">
        <section className="action-btns">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="action-btn game-action" onClick={() => setShowGameModal(true)}>
            <Gamepad2 size={28} /> Input Transaksi Game
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="action-btn cookie-action" onClick={() => setShowCookieModal(true)}>
            <Cookie size={28} /> Input Transaksi Cookies
          </motion.button>
        </section>

        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon icon-green"><DollarSign size={24} /></div>
            <div><p className="stat-label">Total Pendapatan</p><p className="stat-value green">{formatCurrency(totalRevenue)}</p></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon icon-orange"><ShoppingCart size={24} /></div>
            <div><p className="stat-label">Cookies Terjual</p><p className="stat-value orange">{totalCookies} transaksi</p></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon icon-purple"><Gamepad2 size={24} /></div>
            <div><p className="stat-label">Total Sesi Game</p><p className="stat-value purple">{totalGameSessions} sesi</p></div>
          </div>
        </section>

        <section className="panel">
          <div className="panel-header"><Monitor size={20} /> <h2>Monitor PC</h2></div>
          <div className="pc-monitor-grid">
            {pcs.map((pc, i) => (
              <div key={pc.pcNumber} className={`pc-monitor-card ${pc.status === 'available' ? 'mon-available' : 'mon-occupied'}`}>
                <div className="mon-header">
                  <div className={`mon-icon ${pc.status}`}><Monitor size={28} /></div>
                  <span className="mon-label">PC {pc.pcNumber}</span>
                  <span className={`mon-status-badge ${pc.status}`}>{pc.status === 'available' ? 'KOSONG' : 'DIPAKAI'}</span>
                </div>
                {pc.status === 'occupied' ? (
                  <div className="mon-body">
                    <div className="mon-row"><span>Player</span><strong>{pc.customerName}</strong></div>
                    <div className="mon-countdown">{countdowns[i] || '--:--'}</div>
                    <div className="mon-actions">
                      <button className="call-btn" onClick={() => handleManualCall(pc)}><Volume2 size={16} /> Panggil</button>
                      <button className="finish-btn" onClick={() => handleFinishPc(pc.pcNumber)}><CheckCircle size={16} /> Selesaikan</button>
                    </div>
                  </div>
                ) : (
                  <div className="mon-body"><p className="mon-ready">✅ Siap dimainkan!</p></div>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-header"><Package size={20} /> <h2>Manajemen Stok Cookies</h2></div>
          <div className="stock-grid">
            {stocks.map(s => (
              <div key={s.id} className="stock-card">
                <Cookie size={24} className="stock-cookie-icon" />
                <h4>{s.variant}</h4>
                <div className="stock-qty">
                  <button onClick={() => updateStock(s.id, -1)} disabled={s.stock === 0}><Minus size={14} /></button>
                  <span className={s.stock === 0 ? 'out' : ''}>{s.stock}</span>
                  <button onClick={() => updateStock(s.id, 1)}><Plus size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-header"><CalendarDays size={20} /> <h2>Transaksi Terakhir</h2></div>
          <div className="tx-table-wrapper">
            <table className="tx-table">
              <thead><tr><th>Waktu</th><th>Customer</th><th>Tipe</th><th>Metode</th><th>Total</th></tr></thead>
              <tbody>
                {transactions.map(tx => (
                  <tr key={tx.id}>
                    <td>{tx.createdAt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</td>
                    <td>{tx.customerName}</td>
                    <td><span className={`tx-type type-${tx.type}`}>{tx.type === 'game' ? 'Game' : tx.type === 'cookie' ? 'Cookies' : 'Paket'}</span></td>
                    <td className="tx-pay">{tx.paymentMethod === 'cash' ? '💵 Cash' : '📱 QRIS'}</td>
                    <td className="tx-amount">{formatCurrency(tx.totalAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {showGameModal && <GameModal pcs={pcs} stocks={stocks} onClose={() => setShowGameModal(false)} onSubmit={handleGameSubmit} />}
      {showCookieModal && <CookieModal stocks={stocks} onClose={() => setShowCookieModal(false)} onSubmit={handleCookieSubmit} />}
    </div>
  );
};

export default AdminDashboard;
