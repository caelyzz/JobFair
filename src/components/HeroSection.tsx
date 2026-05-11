import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Zap } from 'lucide-react';
import './HeroSection.css';

export const HeroSection: React.FC = () => {
  return (
    <section className="hero" id="hero">
      {/* Animated background grid */}
      <div className="hero-bg-grid" />
      <div className="hero-bg-glow" />

      <div className="container hero-content">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="hero-logo-wrapper"
        >
          <img src="/logo_rcade_rpl.png" alt="R-CADE Logo" className="hero-logo" />
          <div className="hero-logo-glow" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="hero-text"
        >
          <h1 className="hero-title">
            <span className="hero-title-line">
              <span className="neon-text flicker">R-CADE</span>
            </span>
            <span className="hero-title-sub">Rental Game & Cookies</span>
          </h1>

          <p className="hero-tagline">
            <Zap size={16} className="tagline-icon" />
            Stand XI RPL — Are You Ready?
          </p>

          <p className="hero-description">
            Nikmati pengalaman gaming terbaik dengan harga terjangkau! 
            Main game seru dan camilan cookies enak di stand kami.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="hero-cta"
        >
          <a href="#menu" className="cta-btn cta-primary">
            <Sparkles size={18} />
            Lihat Menu & Harga
          </a>
          <a href="#availability" className="cta-btn cta-outline">
            Cek Ketersediaan PC
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="hero-stats"
        >
          <div className="stat-item">
            <span className="stat-value">4</span>
            <span className="stat-label">PC Tersedia</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-value">3</span>
            <span className="stat-label">Paket Game</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-value neon-text">LIVE</span>
            <span className="stat-label">Status Real-time</span>
          </div>
        </motion.div>
      </div>

      {/* Scanline effect */}
      <div className="scanline-overlay" />
    </section>
  );
};
