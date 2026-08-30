'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, RefreshCw, ArrowRight } from 'lucide-react';
import { useDateContext } from '../context/DateContext';
import { DateIdea, DateCategory, CostLevel, DateSetting } from '../types/date';
import { soundEngine } from '../utils/audio';

export default function DateRouletteModal() {
  const { 
    isRouletteModalOpen, 
    setIsRouletteModalOpen, 
    dates, 
    setSelectedDate, 
    triggerConfetti,
    updateDateStatus 
  } = useDateContext();

  const [selectedCategory, setSelectedCategory] = useState<DateCategory | 'all'>('all');
  const [selectedCost, setSelectedCost] = useState<CostLevel | 'all'>('all');
  const [selectedSetting, setSelectedSetting] = useState<DateSetting | 'all'>('all');

  const [isSpinning, setIsSpinning] = useState(false);
  const [displayedDate, setDisplayedDate] = useState<DateIdea | null>(null);
  const [winnerDate, setWinnerDate] = useState<DateIdea | null>(null);

  if (!isRouletteModalOpen) return null;

  const candidates = dates.filter((d) => {
    if (selectedCategory !== 'all' && d.category !== selectedCategory) return false;
    if (selectedCost !== 'all' && d.estimatedCost !== selectedCost) return false;
    if (selectedSetting !== 'all' && d.setting !== selectedSetting) return false;
    return true;
  });

  const spinRoulette = () => {
    if (candidates.length === 0) return;
    setIsSpinning(true);
    setWinnerDate(null);

    let speed = 50;
    let count = 0;
    const totalSteps = 22;

    const interval = () => {
      count++;
      const randomIdx = Math.floor(Math.random() * candidates.length);
      setDisplayedDate(candidates[randomIdx]);
      soundEngine.playPopSound();

      if (count < totalSteps) {
        speed += 12;
        setTimeout(interval, speed);
      } else {
        const finalWinner = candidates[Math.floor(Math.random() * candidates.length)];
        setDisplayedDate(finalWinner);
        setWinnerDate(finalWinner);
        setIsSpinning(false);
        triggerConfetti();
      }
    };

    interval();
  };

  const handleSelectWinner = () => {
    if (winnerDate) {
      if (winnerDate.status === 'wishlist') {
        updateDateStatus(winnerDate.id, 'planned');
      }
      setSelectedDate(winnerDate);
      setIsRouletteModalOpen(false);
    }
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-lg overscroll-contain"
        data-lenis-prevent
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          className="relative w-full max-w-xl rounded-3xl overflow-hidden bg-zinc-950 border border-white/[0.1] shadow-2xl p-6 sm:p-7 space-y-5 max-h-[88vh] overflow-y-auto overscroll-contain my-auto"
          data-lenis-prevent
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-white text-black">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-serif text-white">
                  Date Spark Roulette
                </h3>
                <p className="text-xs text-zinc-400">
                  Filter by vibe and let romance choose your next adventure.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsRouletteModalOpen(false)}
              className="p-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-black p-3.5 rounded-2xl border border-white/[0.08] text-xs">
            <div>
              <label className="text-zinc-500 font-mono text-[10px] uppercase block mb-1">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as DateCategory | 'all')}
                className="w-full bg-zinc-900 border border-white/[0.08] rounded-xl px-2.5 py-1.5 text-white focus:outline-none"
              >
                <option value="all">Any Category</option>
                <option value="dining">Fine Dining</option>
                <option value="outdoor">Outdoor Scenic</option>
                <option value="creative">Art & Workshops</option>
                <option value="nightlife">Nightlife & Drinks</option>
                <option value="cozy">Cozy At Home</option>
                <option value="adventure">Thrill Adventure</option>
              </select>
            </div>

            <div>
              <label className="text-zinc-500 font-mono text-[10px] uppercase block mb-1">Budget</label>
              <select
                value={selectedCost}
                onChange={(e) => setSelectedCost(e.target.value as CostLevel | 'all')}
                className="w-full bg-zinc-900 border border-white/[0.08] rounded-xl px-2.5 py-1.5 text-white focus:outline-none"
              >
                <option value="all">Any Budget</option>
                <option value="₱">₱ Budget</option>
                <option value="₱₱">₱₱ Moderate</option>
                <option value="₱₱₱">₱₱₱ Upscale</option>
                <option value="₱₱₱₱">₱₱₱₱ Luxury</option>
              </select>
            </div>

            <div>
              <label className="text-zinc-500 font-mono text-[10px] uppercase block mb-1">Setting</label>
              <select
                value={selectedSetting}
                onChange={(e) => setSelectedSetting(e.target.value as DateSetting | 'all')}
                className="w-full bg-zinc-900 border border-white/[0.08] rounded-xl px-2.5 py-1.5 text-white focus:outline-none"
              >
                <option value="all">Any Setting</option>
                <option value="indoor">Indoor</option>
                <option value="outdoor">Outdoor</option>
                <option value="home">At Home</option>
              </select>
            </div>
          </div>

          {/* Roulette Display Card */}
          <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] bg-black min-h-[240px] flex flex-col justify-center items-center text-center p-5 shadow-inner">
            {displayedDate ? (
              <motion.div
                key={displayedDate.id}
                initial={{ opacity: 0.85, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full space-y-2.5"
              >
                <div className="relative h-28 w-full rounded-xl overflow-hidden mb-2">
                  <img
                    src={displayedDate.coverImage}
                    alt={displayedDate.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                  <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-xs">
                    <span className="px-2 py-0.5 rounded bg-white text-black font-bold uppercase text-[9px]">
                      {displayedDate.category}
                    </span>
                    <span className="font-mono text-white font-bold bg-black/80 px-2 py-0.5 rounded border border-white/[0.1]">
                      {displayedDate.estimatedCost}
                    </span>
                  </div>
                </div>

                <h4 className="text-base font-bold font-serif text-white">
                  {displayedDate.title}
                </h4>
                <p className="text-xs text-zinc-400 line-clamp-2 font-light">
                  {displayedDate.subtitle || displayedDate.description}
                </p>

                {winnerDate && (
                  <div className="pt-1">
                    <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-black bg-white px-3 py-0.5 rounded-full">
                      Match Selected
                    </span>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center mx-auto text-zinc-400">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-semibold text-white">
                  {candidates.length} date ideas available
                </h4>
                <p className="text-[11px] text-zinc-500 max-w-xs">
                  Hit the button below to spin the spark wheel.
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2.5">
            <button
              onClick={spinRoulette}
              disabled={isSpinning || candidates.length === 0}
              className="flex-1 py-3 rounded-xl bg-white hover:bg-zinc-200 disabled:opacity-50 text-black font-bold text-xs shadow-lg flex items-center justify-center gap-2 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSpinning ? 'animate-spin' : ''}`} />
              <span>{isSpinning ? 'Selecting...' : 'Spin the Spark Wheel'}</span>
            </button>

            {winnerDate && (
              <button
                onClick={handleSelectWinner}
                className="px-5 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all border border-white/[0.1]"
              >
                <span>Plan Date</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
