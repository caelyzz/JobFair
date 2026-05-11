import React from 'react';
import { motion } from 'framer-motion';
import './Card.css';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', hoverable = true }) => {
  return (
    <motion.div
      whileHover={hoverable ? { y: -5, boxShadow: '0 10px 30px rgba(0,0,0,0.3)' } : {}}
      className={`card glass ${className}`}
    >
      {children}
    </motion.div>
  );
};
