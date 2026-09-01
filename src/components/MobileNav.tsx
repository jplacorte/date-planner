'use client';

import React from 'react';
import { motion } from 'motion/react';
import { 
  ListChecks, 
  MapPin, 
  BookHeart, 
  Sparkles, 
  Plus
} from 'lucide-react';
import { useDateContext } from '../context/DateContext';

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
        <div className="flex items-center justify-around p-1.5 rounded-2xl bg-zinc-950/90 backdrop-blur-2xl border border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.8)]">
          
          {/* Checklist Tab */}
          <button
            onClick={() => setActiveTab('checklist')}
            className={`relative flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-xl transition-all ${
              activeTab === 'checklist' ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {activeTab === 'checklist' && (
              <motion.div
                layoutId="mobileNavActiveTab"
                className="absolute inset-0 bg-white/15 rounded-xl border border-white/10"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <ListChecks className="w-4 h-4 relative z-10" />
            <span className="text-[10px] font-semibold tracking-tight mt-0.5 relative z-10">
              Checklist
            </span>
          </button>

          {/* Map Tab */}
          <button
            onClick={() => setActiveTab('map')}
            className={`relative flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-xl transition-all ${
              activeTab === 'map' ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {activeTab === 'map' && (
              <motion.div
                layoutId="mobileNavActiveTab"
                className="absolute inset-0 bg-white/15 rounded-xl border border-white/10"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <MapPin className="w-4 h-4 relative z-10" />
            <span className="text-[10px] font-semibold tracking-tight mt-0.5 relative z-10">
              Map
            </span>
          </button>

          {/* Central Quick Add Action */}
          <div className="flex items-center justify-center px-1">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-white text-black font-bold shadow-lg hover:scale-105 active:scale-95 transition-all"
              title="Add New Date"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>

          {/* Spark Roulette Quick Button */}
          <button
            onClick={() => setIsRouletteModalOpen(true)}
            className="flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-xl text-zinc-400 hover:text-zinc-200 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-[10px] font-semibold tracking-tight mt-0.5">
              Roulette
            </span>
          </button>

          {/* Scrapbook Tab */}
          <button
            onClick={() => setActiveTab('scrapbook')}
            className={`relative flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-xl transition-all ${
              activeTab === 'scrapbook' ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {activeTab === 'scrapbook' && (
              <motion.div
                layoutId="mobileNavActiveTab"
                className="absolute inset-0 bg-white/15 rounded-xl border border-white/10"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <BookHeart className="w-4 h-4 relative z-10" />
            <span className="text-[10px] font-semibold tracking-tight mt-0.5 relative z-10">
              Scrapbook
            </span>
          </button>

        </div>
      </div>
    </nav>
  );
}
