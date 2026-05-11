import React from 'react';
import './Footer.css';

export const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="container footer-content">
        <div className="footer-brand">
          <img src="/logo_rcade_rpl.png" alt="R-CADE" className="footer-logo" />
          <div>
            <span className="footer-title">R-CADE</span>
            <span className="footer-subtitle">Game Rental & Cookies by XI RPL</span>
          </div>
        </div>

        <div className="footer-copy">
          <p>
            Made by Totox Developer
          </p>
          <p className="footer-year">&copy; 2026 R-CADE. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
