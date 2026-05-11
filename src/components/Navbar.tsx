import React from 'react';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Navbar.css';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="navbar"
    >
      <div className="container nav-content">
        <Link to="/" className="nav-logo" onClick={() => setIsOpen(false)}>
          <img src="/logo_rcade_rpl.png" alt="R-CADE Logo" className="nav-logo-img" />
          <div className="nav-logo-text">
            <span className="logo-title">R-CADE</span>
            <span className="logo-subtitle">XI RPL</span>
          </div>
        </Link>

        <div className={`nav-links ${isOpen ? 'active' : ''}`}>
          <a href="/#menu" className="nav-link" onClick={() => setIsOpen(false)}>Menu & Harga</a>
          <a href="/#benefits" className="nav-link" onClick={() => setIsOpen(false)}>Keunggulan</a>
          <a href="/#availability" className="nav-link" onClick={() => setIsOpen(false)}>Status PC</a>
          <a href="/#schedule" className="nav-link" onClick={() => setIsOpen(false)}>Jadwal</a>
          <Link to="/login" className="nav-link login-nav-link" onClick={() => setIsOpen(false)}>Sign In</Link>
        </div>

        <button className="nav-toggle" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </motion.nav>
  );
};
