import React from 'react';
import { motion } from 'framer-motion';
import { Star, Zap, Shield, Wifi, Headphones, Gamepad2 } from 'lucide-react';
import './BenefitSection.css';

const benefits = [
  {
    icon: <Gamepad2 size={28} />,
    title: 'Game Seru & Terbaru',
    desc: 'Koleksi game terbaru dan paling populer siap kamu mainkan.',
    color: 'purple',
  },
  {
    icon: <Zap size={28} />,
    title: 'PC Performa Tinggi',
    desc: '4 unit PC/Laptop siap tempur dengan spesifikasi mumpuni.',
    color: 'cyan',
  },
  {
    icon: <Shield size={28} />,
    title: 'Harga Transparan',
    desc: 'Tidak ada biaya tersembunyi. Bayar sesuai paket pilihanmu.',
    color: 'green',
  },
  {
    icon: <Wifi size={28} />,
    title: 'Status Real-Time',
    desc: 'Cek ketersediaan PC langsung dari handphone-mu. Live!',
    color: 'blue',
  },
  {
    icon: <Headphones size={28} />,
    title: 'Pelayanan Ramah',
    desc: 'Tim XI RPL siap membantu kamu dengan sepenuh hati.',
    color: 'pink',
  },
  {
    icon: <Star size={28} />,
    title: 'Snack Enak',
    desc: 'Cookies homemade lezat untuk menemani sesi gaming-mu!',
    color: 'orange',
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export const BenefitSection: React.FC = () => {
  return (
    <section className="benefit-section" id="benefits">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="section-header"
        >
          <span className="section-badge">
            <Star size={14} /> KEUNGGULAN
          </span>
          <h2 className="section-title">
            Kenapa Harus <span className="gradient-text">R-CADE?</span>
          </h2>
          <p className="section-desc">Main di stand kami, dijamin ketagihan!</p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="benefit-grid"
        >
          {benefits.map((benefit) => (
            <motion.div
              key={benefit.title}
              variants={itemVariants}
              className={`benefit-card benefit-${benefit.color}`}
            >
              <div className={`benefit-icon icon-${benefit.color}`}>
                {benefit.icon}
              </div>
              <h4 className="benefit-title">{benefit.title}</h4>
              <p className="benefit-desc">{benefit.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
