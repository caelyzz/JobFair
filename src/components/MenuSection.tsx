import React from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, Cookie, Package, Clock, Coins } from 'lucide-react';
import './MenuSection.css';

const gamePackages = [
  { duration: '15 Menit', price: 'Rp 3.000', icon: <Clock size={20} />, color: 'cyan' },
  { duration: '30 Menit', price: 'Rp 5.000', icon: <Clock size={20} />, color: 'blue' },
  { duration: '60 Menit', price: 'Rp 10.000', icon: <Clock size={20} />, color: 'purple', popular: true },
];

const bundlePackages = [
  {
    name: 'Paket Hemat',
    price: 'Rp 10.000',
    items: ['Cookies 1 pcs', 'Game 15 Menit'],
    badge: 'HEMAT 1K',
    color: 'green',
  },
  {
    name: 'Paket Combo',
    price: 'Rp 12.000',
    items: ['Cookies 1 pcs', 'Game 30 Menit'],
    badge: 'BEST VALUE',
    color: 'orange',
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export const MenuSection: React.FC = () => {
  return (
    <section className="menu-section" id="menu">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="section-header"
        >
          <span className="section-badge">
            <Coins size={14} /> MENU & PRICELIST
          </span>
          <h2 className="section-title">
            Pilih <span className="gradient-text">Paketmu!</span>
          </h2>
          <p className="section-desc">Harga terjangkau, pengalaman luar biasa</p>
        </motion.div>

        {/* Rental Game */}
        <div className="menu-category">
          <div className="category-label">
            <Gamepad2 size={20} />
            <h3>Rental Game</h3>
          </div>
          
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="game-cards"
          >
            {gamePackages.map((pkg) => (
              <motion.div
                key={pkg.duration}
                variants={itemVariants}
                className={`game-card game-card-${pkg.color} ${pkg.popular ? 'popular' : ''}`}
              >
                {pkg.popular && <span className="popular-badge">POPULER</span>}
                <div className="game-card-icon">{pkg.icon}</div>
                <h4 className="game-card-duration">{pkg.duration}</h4>
                <p className="game-card-price">{pkg.price}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Cookies */}
        <div className="menu-category">
          <div className="category-label">
            <Cookie size={20} />
            <h3>Cookies</h3>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="cookie-card"
          >
            <div className="cookie-info">
              <Cookie size={40} className="cookie-icon" />
              <div>
                <h4>Semua Varian Cookies</h4>
                <p className="cookie-desc">Cookies lezat dengan berbagai pilihan rasa 🍪</p>
              </div>
            </div>
            <div className="cookie-price-tag">
              <span className="cookie-price">Rp 8.000</span>
              <span className="cookie-unit">/ pcs</span>
            </div>
          </motion.div>
        </div>

        {/* Paket Bundling */}
        <div className="menu-category">
          <div className="category-label">
            <Package size={20} />
            <h3>Paket Bundling</h3>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="bundle-cards"
          >
            {bundlePackages.map((bundle) => (
              <motion.div
                key={bundle.name}
                variants={itemVariants}
                className={`bundle-card bundle-card-${bundle.color}`}
              >
                <span className={`bundle-badge badge-${bundle.color}`}>{bundle.badge}</span>
                <h4 className="bundle-name">{bundle.name}</h4>
                <p className="bundle-price">{bundle.price}</p>
                <ul className="bundle-items">
                  {bundle.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
