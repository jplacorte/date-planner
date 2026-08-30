'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, 
  Navigation, 
  ExternalLink, 
  Layers,
  ArrowRight
} from 'lucide-react';
import { useDateContext } from '../context/DateContext';
import { DateIdea, DateCategory, DateStatus } from '../types/date';

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
    <div className="space-y-6">
      
      {/* Top Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-950/70 p-3.5 sm:p-4 rounded-3xl border border-white/[0.08] backdrop-blur-2xl">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-zinc-500 mr-1.5 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-zinc-400" />
            Category:
          </span>
          {(['all', 'dining', 'outdoor', 'creative', 'nightlife', 'cozy', 'adventure'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-all ${
                activeCategory === cat
                  ? 'bg-white text-black font-bold shadow-sm'
                  : 'bg-zinc-900/80 text-zinc-400 border border-white/[0.06] hover:bg-zinc-800 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          {(['all', 'wishlist', 'planned', 'booked', 'completed'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setActiveStatus(st)}
              className={`px-2 py-1 rounded-md text-xs font-medium capitalize transition-all ${
                activeStatus === st
                  ? 'bg-white/20 text-white font-bold'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Map Canvas Visualizer */}
      <div className="relative w-full h-[560px] rounded-3xl overflow-hidden border border-white/[0.08] bg-black shadow-2xl flex flex-col justify-between">
        
        {/* Monochrome Grid Background */}
        <div className="absolute inset-0 z-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
        
        {/* Subtle Map Routing Overlay Lines */}
        <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <path d="M 60,160 Q 350,70 650,220 T 1150,260" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="5,5" />
          <path d="M 140,460 Q 420,320 840,460 T 1180,410" fill="none" stroke="#a1a1aa" strokeWidth="1.5" strokeDasharray="5,5" />
        </svg>

        {/* Top Info Badge */}
        <div className="relative z-10 p-5 flex items-center justify-between pointer-events-none">
          <div className="bg-zinc-950/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/[0.08] pointer-events-auto">
            <span className="text-xs font-mono text-zinc-300 flex items-center gap-2">
              <Navigation className="w-3 h-3 text-white animate-pulse" />
              <span>{mappedDates.length} Date Locations Mapped</span>
            </span>
          </div>
        </div>

        {/* Map Pins Layout */}
        <div className="relative z-10 w-full h-full flex-1">
          {mappedDates.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center p-6 text-center z-10">
              <div className="bg-zinc-950/85 border border-white/[0.1] rounded-2xl p-6 max-w-sm backdrop-blur-xl space-y-2.5 shadow-2xl">
                <div className="w-10 h-10 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center mx-auto text-zinc-400">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <h4 className="text-sm font-bold font-serif text-white">No Date Locations Yet</h4>
                <p className="text-xs text-zinc-400 font-light">
                  Add date ideas with locations or venues to visualize them on your couple map.
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
                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                onClick={() => setHighlightedDate(isSelected ? null : date)}
              >
                {/* Map Pin Marker */}
                <div
                  className={`relative flex items-center gap-1.5 px-2.5 py-1 rounded-xl border backdrop-blur-md transition-all shadow-md ${
                    isSelected
                      ? 'bg-white text-black border-white scale-110 shadow-lg'
                      : date.status === 'completed'
                      ? 'bg-zinc-900 text-zinc-200 border-zinc-700 hover:scale-105'
                      : date.status === 'booked'
                      ? 'bg-zinc-900 text-white border-white/30 hover:scale-105'
                      : 'bg-black/90 text-zinc-400 border-white/[0.1] hover:scale-105 hover:text-white'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span className="text-xs font-semibold whitespace-nowrap max-w-[130px] truncate">
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
              className="relative z-20 p-4 sm:p-5"
            >
              <div className="max-w-2xl mx-auto rounded-2xl bg-zinc-950 border border-white/[0.15] p-4 backdrop-blur-2xl shadow-2xl flex flex-col sm:flex-row gap-4 items-center">
                <div className="relative w-full sm:w-40 h-28 rounded-xl overflow-hidden shrink-0">
                  <img
                    src={highlightedDate.coverImage}
                    alt={highlightedDate.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded bg-black/80 text-white text-[10px] font-mono font-bold">
                    {highlightedDate.estimatedCost}
                  </div>
                </div>

                <div className="flex-1 space-y-1.5 w-full">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase text-zinc-400 tracking-wider">
                      {highlightedDate.category} • {highlightedDate.status}
                    </span>
                    <button
                      onClick={() => setHighlightedDate(null)}
                      className="text-zinc-500 hover:text-white text-xs"
                    >
                      ✕
                    </button>
                  </div>

                  <h4 className="text-sm font-bold font-serif text-white">
                    {highlightedDate.title}
                  </h4>
                  <p className="text-xs text-zinc-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-zinc-500 shrink-0" />
                    <span className="truncate">{highlightedDate.locationAddress || highlightedDate.locationName}</span>
                  </p>

                  <div className="flex items-center gap-2.5 pt-1">
                    <button
                      onClick={() => setSelectedDate(highlightedDate)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white text-black text-xs font-bold shadow-sm"
                    >
                      <span>Checklist</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>

                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        highlightedDate.locationAddress || highlightedDate.locationName
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 text-xs font-medium border border-white/[0.08]"
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
