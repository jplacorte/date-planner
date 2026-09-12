'use client';

import { motion } from 'motion/react';
import { 
  ListChecks, 
  MapPin, 
  BookHeart, 
  Sparkles, 
  Plus
} from 'lucide-react';
import { useDateContext } from '@/context/DateContext';

export default function MobileNav() {
  const { 
    activeTab, 
    setActiveTab, 
    setIsCreateModalOpen, 
    setIsRouletteModalOpen
  } = useDateContext();

  return (
    <nav className="fixed bottom-3 inset-x-3 z-40 md:hidden pointer-events-none pb-safe">
      <div className="max-w-md mx-auto pointer-events-auto">
        <div className="flex items-center justify-around p-1.5 rounded-2xl bg-black/90 backdrop-blur-2xl border border-white/15 shadow-[0_12px_36px_rgba(0,0,0,0.9)]">
          
          {/* Checklist Tab */}
          <button
            onClick={() => setActiveTab('checklist')}
            className={`relative flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-xl transition-all ${
              activeTab === 'checklist' ? 'text-white font-semibold' : 'text-neutral-400 hover:text-white'
            }`}
          >
            {activeTab === 'checklist' && (
              <motion.div
                layoutId="mobileNavActiveTab"
                className="absolute inset-0 bg-white/15 rounded-xl border border-white/20"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <ListChecks className="w-4 h-4 relative z-10" />
            <span className="font-mono text-[9px] uppercase tracking-wider mt-0.5 relative z-10">
              List
            </span>
          </button>

          {/* Map Tab */}
          <button
            onClick={() => setActiveTab('map')}
            className={`relative flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-xl transition-all ${
              activeTab === 'map' ? 'text-white font-semibold' : 'text-neutral-400 hover:text-white'
            }`}
          >
            {activeTab === 'map' && (
              <motion.div
                layoutId="mobileNavActiveTab"
                className="absolute inset-0 bg-white/15 rounded-xl border border-white/20"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <MapPin className="w-4 h-4 relative z-10" />
            <span className="font-mono text-[9px] uppercase tracking-wider mt-0.5 relative z-10">
              Map
            </span>
          </button>

          {/* Central Quick Add Action */}
          <div className="flex items-center justify-center px-1">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-white text-black font-semibold shadow-lg hover:bg-neutral-200 hover:scale-105 active:scale-95 transition-all"
              title="Add New Date"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>

          {/* Spark Roulette Quick Button */}
          <button
            onClick={() => setIsRouletteModalOpen(true)}
            className="flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-xl text-neutral-400 hover:text-white transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span className="font-mono text-[9px] uppercase tracking-wider mt-0.5">
              Roulette
            </span>
          </button>

          {/* Scrapbook Tab */}
          <button
            onClick={() => setActiveTab('scrapbook')}
            className={`relative flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-xl transition-all ${
              activeTab === 'scrapbook' ? 'text-white font-semibold' : 'text-neutral-400 hover:text-white'
            }`}
          >
            {activeTab === 'scrapbook' && (
              <motion.div
                layoutId="mobileNavActiveTab"
                className="absolute inset-0 bg-white/15 rounded-xl border border-white/20"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <BookHeart className="w-4 h-4 relative z-10" />
            <span className="font-mono text-[9px] uppercase tracking-wider mt-0.5 relative z-10">
              Archive
            </span>
          </button>

        </div>
      </div>
    </nav>
  );
}
