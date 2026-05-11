import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, Lock, User, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import './LoginPage.css';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      // Redirect to admin dashboard (to be implemented)
      window.location.href = '/admin';
    } catch (err: any) {
      setError(err.message || 'Login gagal. Periksa kembali email dan password Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg-grid" />
      <div className="login-bg-glow" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="login-container glass"
      >
        <a href="/" className="back-link">
          <ArrowLeft size={16} /> Kembali ke Landing
        </a>

        <div className="login-header">
          <div className="login-logo-wrapper">
            <img src="/logo_rcade_rpl.png" alt="R-CADE" className="login-logo" />
          </div>
          <h1 className="login-title neon-text">ADMIN LOGIN</h1>
          <p className="login-subtitle">Akses Dashboard Manajemen R-CADE</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="error-message"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <div className="input-wrapper">
              <User size={18} className="input-icon" />
              <input 
                type="email" 
                id="email" 
                placeholder="admin@rcade.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input 
                type="password" 
                id="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? (
              <span className="spinner"></span>
            ) : (
              <>
                <LogIn size={20} /> MASUK KE SISTEM
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>Stand XI RPL — Stand Paling Kece 😎</p>
        </div>
      </motion.div>

      <div className="scanline-overlay" />
    </div>
  );
};

export default LoginPage;
