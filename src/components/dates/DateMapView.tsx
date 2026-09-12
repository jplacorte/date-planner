'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, 
  Navigation, 
  ExternalLink, 
  Layers,
  ArrowRight
} from 'lucide-react';
import { useDateContext } from '@/context/DateContext';
import { DateIdea, DateCategory, DateStatus } from '@/types/date';

export default function DateMapView() {
  const { dates, setSelectedDate } = useDateContext();

  const [activeCategory, setActiveCategory] = useState<DateCategory | 'all'>('all');
  const [activeStatus, setActiveStatus] = useState<DateStatus | 'all'>('all');
  const [highlightedDate, setHighlightedDate] = useState<DateIdea | null>(null);

  // Filter dates
  const mappedDates = dates.filter((d) => {
    if (activeCategory !== 'all' && d.category !== activeCategory) return false;
    if (activeStatus !== 'all' && d.status !== activeStatus) return false;
    return true;
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      
      {/* Top Filter Bar — Utilitarian Index */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-black/80 p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-white/[0.1] backdrop-blur-2xl">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none touch-scroll font-mono -mx-1 px-1">
          <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 mr-1 flex items-center gap-1.5 shrink-0">
            <Layers className="w-3.5 h-3.5 text-neutral-400" />
            <span className="hidden xs:inline">Series:</span>
          </span>
          {(['all', 'dining', 'outdoor', 'creative', 'nightlife', 'cozy', 'adventure'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs uppercase tracking-wider transition-all whitespace-nowrap shrink-0 ${
                activeCategory === cat
                  ? 'bg-white text-black font-semibold shadow-sm'
                  : 'bg-white/[0.03] text-neutral-400 border border-white/[0.08] hover:bg-white/[0.06] hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none touch-scroll font-mono">
          {(['all', 'wishlist', 'planned', 'booked', 'completed'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setActiveStatus(st)}
              className={`px-2.5 py-1 rounded-lg text-xs uppercase tracking-wider transition-all whitespace-nowrap shrink-0 ${
                activeStatus === st
                  ? 'bg-white text-black font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Map Canvas Visualizer */}
      <div className="relative w-full h-[440px] sm:h-[560px] rounded-2xl sm:rounded-3xl overflow-hidden border border-white/[0.1] bg-black shadow-2xl flex flex-col justify-between">
        
        {/* Monochrome Grid Background */}
        <div className="absolute inset-0 z-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px] opacity-30" />
        
        {/* Subtle Map Routing Overlay Lines */}
        <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <path d="M 60,160 Q 350,70 650,220 T 1150,260" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="5,5" />
          <path d="M 140,460 Q 420,320 840,460 T 1180,410" fill="none" stroke="#71717a" strokeWidth="1.5" strokeDasharray="5,5" />
        </svg>

        {/* Top Info Badge */}
        <div className="relative z-10 p-3.5 sm:p-5 flex items-center justify-between pointer-events-none">
          <div className="bg-neutral-950/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/[0.12] pointer-events-auto">
            <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.2em] text-neutral-300 flex items-center gap-2">
              <Navigation className="w-3 h-3 text-white animate-pulse" />
              <span>COORDINATES // {mappedDates.length} LOCATIONS MAPPED</span>
            </span>
          </div>
        </div>

        {/* Map Pins Layout */}
        <div className="relative z-10 w-full h-full flex-1">
          {mappedDates.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center p-6 text-center z-10">
              <div className="bg-neutral-950/90 border border-white/[0.12] rounded-2xl p-6 sm:p-8 max-w-sm backdrop-blur-xl space-y-3 shadow-2xl">
                <div className="w-10 h-10 rounded-full bg-white/[0.05] border border-white/[0.12] flex items-center justify-center mx-auto text-neutral-400">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <h4 className="text-base font-serif text-white">No Coordinates Inscribed</h4>
                <p className="text-xs text-neutral-400 font-serif italic">
                  &ldquo;Add date ideas with locations or venues to plot them on your private monograph map.&rdquo;
                </p>
              </div>
            </div>
          )}

          {mappedDates.map((date, idx) => {
            const xPercent = 12 + ((idx * 27) % 76);
            const yPercent = 20 + ((idx * 33) % 65);
            const isSelected = highlightedDate?.id === date.id;

            return (
              <motion.div
                key={date.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: idx * 0.04 }}
                style={{ left: `${xPercent}%`, top: `${yPercent}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-10"
                onClick={() => setHighlightedDate(isSelected ? null : date)}
              >
                {/* Map Pin Marker */}
                <div
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-mono backdrop-blur-md transition-all shadow-md ${
                    isSelected
                      ? 'bg-white text-black border-white scale-110 shadow-xl'
                      : date.status === 'completed'
                      ? 'bg-neutral-900 text-neutral-200 border-neutral-700 hover:scale-105'
                      : date.status === 'booked'
                      ? 'bg-white/20 text-white border-white/40 hover:scale-105'
                      : 'bg-black/90 text-neutral-400 border-white/[0.12] hover:scale-105 hover:text-white'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span className="text-[10px] sm:text-[11px] uppercase tracking-wider whitespace-nowrap max-w-[100px] xs:max-w-[130px] truncate">
                    {date.locationName}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Floating Date Card for Highlighted Pin */}
        <AnimatePresence>
          {highlightedDate && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="relative z-20 p-3 sm:p-5"
            >
              <div className="max-w-2xl mx-auto rounded-2xl bg-black/95 border border-white/[0.15] p-4 sm:p-5 backdrop-blur-2xl shadow-2xl flex flex-row gap-4 items-center">
                <div className="relative w-20 h-20 xs:w-28 xs:h-24 sm:w-40 sm:h-28 rounded-xl overflow-hidden shrink-0 border border-white/10">
                  <img
                    src={highlightedDate.coverImage}
                    alt={highlightedDate.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/80 text-white text-[9px] font-mono font-bold">
                    {highlightedDate.estimatedCost}
                  </div>
                </div>

                <div className="flex-1 space-y-1.5 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] sm:text-[10px] font-mono font-semibold uppercase text-neutral-400 tracking-[0.16em] truncate">
                      {`${highlightedDate.category} // ${highlightedDate.status}`}
                    </span>
                    <button
                      onClick={() => setHighlightedDate(null)}
                      className="text-neutral-400 hover:text-white text-xs p-1"
                    >
                      ✕
                    </button>
                  </div>

                  <h4 className="text-sm sm:text-base font-serif text-white truncate">
                    {highlightedDate.title}
                  </h4>
                  <p className="text-[11px] text-neutral-400 font-mono flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3 text-neutral-400 shrink-0" />
                    <span className="truncate uppercase">{highlightedDate.locationAddress || highlightedDate.locationName}</span>
                  </p>

                  <div className="flex items-center gap-2 pt-1 font-mono text-xs uppercase tracking-wider">
                    <button
                      onClick={() => setSelectedDate(highlightedDate)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white hover:bg-neutral-200 text-black text-[11px] font-semibold shadow-sm transition-colors"
                    >
                      <span>Dossier</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>

                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        highlightedDate.locationAddress || highlightedDate.locationName
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-neutral-300 text-[11px] border border-white/[0.1]"
                    >
                      <span>Directions</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
