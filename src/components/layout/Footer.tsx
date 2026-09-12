'use client';

import { Sparkles, Download, Plus } from 'lucide-react';
import { useDateContext } from '@/context/DateContext';

export default function Footer() {
  const { coupleProfile, setIsCreateModalOpen, setIsRouletteModalOpen, exportDataJSON, dates } = useDateContext();

  const completedCount = dates.filter((d) => d.status === 'completed').length;

  return (
    <footer className="w-full border-t border-white/[0.08] bg-black/95 mt-16 sm:mt-28 pt-10 sm:pt-14 pb-32 md:pb-14 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          
          {/* Couple Colophon & Motto */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-center md:justify-start gap-2.5">
              <span className="text-base sm:text-lg font-serif tracking-tight text-white">
                {coupleProfile.partner1Name} <span className="italic font-light opacity-80">&</span> {coupleProfile.partner2Name}
              </span>
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-neutral-400 px-2 py-0.5 rounded-full border border-white/10 bg-white/[0.03]">
                MONOGRAPH
              </span>
            </div>
            <p className="text-xs text-neutral-400 max-w-md font-serif italic leading-relaxed">
              &ldquo;{coupleProfile.relationshipMotto}&rdquo;
            </p>
          </div>

          {/* Catalog Stats Plate */}
          <div className="flex items-center gap-3.5 bg-neutral-950 px-4 py-2 rounded-xl border border-white/[0.1] text-xs font-mono">
            <div>
              <span className="font-semibold text-white">{completedCount}</span> <span className="text-neutral-400 text-[10px] uppercase tracking-wider">Lived</span>
            </div>
            <div className="h-3 w-px bg-white/15" />
            <div>
              <span className="font-semibold text-white">{dates.length}</span> <span className="text-neutral-400 text-[10px] uppercase tracking-wider">In Index</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap justify-center items-center gap-2 font-mono text-[11px] uppercase tracking-wider">
            <button
              onClick={() => setIsRouletteModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 border border-white/[0.1] transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Roulette</span>
            </button>
            <button
              onClick={exportDataJSON}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 border border-white/[0.1] transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>New Entry</span>
            </button>
          </div>

        </div>

        <div className="mt-10 pt-6 border-t border-white/[0.07] flex flex-col sm:flex-row items-center justify-between gap-2.5 text-[10px] text-neutral-400 font-mono uppercase tracking-[0.16em]">
          <p>COLOPHON // EDITED & PRIVATELY PRINTED FOR {coupleProfile.partner1Name.toUpperCase()} & {coupleProfile.partner2Name.toUpperCase()}</p>
          <p>© 2026 // ALL MOMENTS PRESERVED</p>
        </div>
      </div>
    </footer>
  );
}
