'use client';

import React from 'react';
import { Heart, Sparkles, Download, Plus } from 'lucide-react';
import { useDateContext } from '../context/DateContext';

export default function Footer() {
  const { coupleProfile, setIsCreateModalOpen, setIsRouletteModalOpen, exportDataJSON, dates } = useDateContext();

  const completedCount = dates.filter((d) => d.status === 'completed').length;

  return (
    <footer className="w-full border-t border-white/[0.08] bg-black/90 backdrop-blur-xl mt-10 sm:mt-16 pt-8 pb-28 md:pb-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-6 text-center md:text-left">
          
          {/* Couple Motto & Logo */}
          <div className="space-y-1">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="text-base font-bold font-serif text-white tracking-tight">
                {coupleProfile.partner1Name} & {coupleProfile.partner2Name}
              </span>
              <Heart className="w-3.5 h-3.5 text-white fill-white" />
            </div>
            <p className="text-xs text-zinc-500 max-w-sm font-light">
              {coupleProfile.relationshipMotto}
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-3 bg-zinc-900/80 px-3.5 py-1.5 rounded-xl border border-white/[0.08] text-xs text-zinc-300">
            <div>
              <span className="font-bold text-white font-mono">{completedCount}</span> Completed
            </div>
            <div className="h-3 w-px bg-white/10" />
            <div>
              <span className="font-bold text-white font-mono">{dates.length}</span> In Checklist
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap justify-center items-center gap-2">
            <button
              onClick={() => setIsRouletteModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 border border-white/[0.08] text-xs font-medium transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Roulette</span>
            </button>
            <button
              onClick={exportDataJSON}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 border border-white/[0.08] text-xs font-medium transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Date</span>
            </button>
          </div>

        </div>

        <div className="mt-8 pt-5 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-zinc-500 font-mono">
          <p>© 2026 Phillip&apos;s Date Planner.</p>
          <p>Curated for {coupleProfile.partner1Name} & {coupleProfile.partner2Name}</p>
        </div>
      </div>
    </footer>
  );
}
