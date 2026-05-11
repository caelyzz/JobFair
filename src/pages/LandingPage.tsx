import React from 'react';
import { Navbar } from '../components/Navbar';
import { HeroSection } from '../components/HeroSection';
import { MenuSection } from '../components/MenuSection';
import { BenefitSection } from '../components/BenefitSection';
import { PcStatusSection } from '../components/PcStatusSection';
import { ScheduleSection } from '../components/ScheduleSection';
import { Footer } from '../components/Footer';
import { FloatingDecorations } from '../components/FloatingDecorations';
import './LandingPage.css';

const LandingPage: React.FC = () => {
  return (
    <div className="landing-page">
      {/* Mesh Gradient Background */}
      <div className="mesh-bg-container">
        <div className="mesh-blob mesh-blob-1"></div>
        <div className="mesh-blob mesh-blob-2"></div>
        <div className="mesh-blob mesh-blob-3"></div>
        <div className="mesh-blob mesh-blob-4"></div>
      </div>

      {/* Floating Gaming Decorations */}
      <FloatingDecorations />
      
      <Navbar />
      <main>
        <HeroSection />
        <MenuSection />
        <BenefitSection />
        <PcStatusSection />
        <ScheduleSection />
      </main>
      <Footer />
    </div>
  );
}

export default LandingPage;

