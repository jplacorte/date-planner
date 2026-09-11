'use client';

import { useEffect } from 'react';
import Header from '@/components/layout/Header';
import HeroCountdown from '@/components/dates/HeroCountdown';
import ChecklistHub from '@/components/dates/ChecklistHub';
import DateMapView from '@/components/dates/DateMapView';
import ScrapbookView from '@/components/dates/ScrapbookView';
import DateDetailModal from '@/components/modals/DateDetailModal';
import DateRouletteModal from '@/components/modals/DateRouletteModal';
import StatsModal from '@/components/modals/StatsModal';
import CreateDateModal from '@/components/modals/CreateDateModal';
import ProfileModal from '@/components/modals/ProfileModal';
import Footer from '@/components/layout/Footer';
import MobileNav from '@/components/layout/MobileNav';
import { useDateContext } from '@/context/DateContext';

function AppContent() {
  const {
    activeTab,
    selectedDate,
    isCreateModalOpen,
    isRouletteModalOpen,
    isStatsModalOpen,
    isProfileModalOpen,
  } = useDateContext();

  const isAnyModalOpen = Boolean(
    selectedDate ||
    isCreateModalOpen ||
    isRouletteModalOpen ||
    isStatsModalOpen ||
    isProfileModalOpen
  );

  useEffect(() => {
    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden';
      const lenis = (window as unknown as { __lenis?: { stop: () => void; start: () => void } }).__lenis;
      lenis?.stop();
      return () => {
        document.body.style.overflow = '';
        lenis?.start();
      };
    }
  }, [isAnyModalOpen]);

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-white/25 selection:text-white">
      <div>
        {/* Navigation Bar */}
        <Header />

        {/* Hero Countdown & Next Scheduled Date */}
        <HeroCountdown />

        {/* Main Tab Area */}
        <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-4 pb-24 md:pb-6">
          {activeTab === 'checklist' && <ChecklistHub />}
          {activeTab === 'map' && <DateMapView />}
          {activeTab === 'scrapbook' && <ScrapbookView />}
        </main>
      </div>

      {/* Floating Mobile Dock */}
      <MobileNav />

      {/* Modals & Drawers */}
      <DateDetailModal />
      <DateRouletteModal />
      <StatsModal />
      <CreateDateModal />
      <ProfileModal />

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default function HomePage() {
  return <AppContent />;
}
