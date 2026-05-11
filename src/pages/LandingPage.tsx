import React from 'react';
import { Navbar } from '../components/Navbar';
import { HeroSection } from '../components/HeroSection';
import { MenuSection } from '../components/MenuSection';
import { BenefitSection } from '../components/BenefitSection';
import { PcStatusSection } from '../components/PcStatusSection';
import { ScheduleSection } from '../components/ScheduleSection';
import { Footer } from '../components/Footer';

const LandingPage: React.FC = () => {
  return (
    <div className="landing-page">
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
