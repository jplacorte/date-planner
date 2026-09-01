'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trophy } from 'lucide-react';
import { useDateContext } from '../context/DateContext';
import { DateCategory } from '../types/date';

export default function StatsModal() {
  const { isStatsModalOpen, setIsStatsModalOpen, dates, coupleProfile, badges } = useDateContext();

  if (!isStatsModalOpen) return null;

  const completedDates = dates.filter((d) => d.status === 'completed');
  const wishlistDates = dates.filter((d) => d.status === 'wishlist');
  const totalSpent = completedDates.reduce((acc, d) => acc + (d.actualCost || 0), 0);

  // Calculate days together from anniversary
  let daysTogether = 0;
  if (coupleProfile.anniversaryDate) {
    const anniversary = new Date(coupleProfile.anniversaryDate);
    if (!isNaN(anniversary.getTime())) {
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - anniversary.getTime());
      daysTogether = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
  }

  const categoryCounts: Record<DateCategory, number> = {
    dining: completedDates.filter((d) => d.category === 'dining').length,
    outdoor: completedDates.filter((d) => d.category === 'outdoor').length,
    creative: completedDates.filter((d) => d.category === 'creative').length,
    nightlife: completedDates.filter((d) => d.category === 'nightlife').length,
    cozy: completedDates.filter((d) => d.category === 'cozy').length,
    adventure: completedDates.filter((d) => d.category === 'adventure').length,
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 overflow-y-auto bg-black/85 backdrop-blur-lg overscroll-contain pb-safe"
        data-lenis-prevent
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 20 }}
          className="relative w-full max-w-2xl rounded-t-[28px] sm:rounded-3xl overflow-hidden bg-zinc-950 border border-white/[0.1] shadow-2xl p-4 sm:p-7 space-y-4 sm:space-y-5 max-h-[92vh] sm:max-h-[88vh] overflow-y-auto overscroll-contain touch-scroll my-0 sm:my-auto"
          data-lenis-prevent
        >
          {/* Mobile Sheet Drag Indicator Bar */}
          <div className="sm:hidden flex justify-center pb-1">
            <div className="w-10 h-1 bg-white/30 rounded-full" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-2.5">
              <div className="p-1.5 sm:p-2 rounded-xl bg-white text-black shrink-0">
                <Trophy className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold font-serif text-white">
                  Couple Milestones & Stats
                </h3>
                <p className="text-[11px] sm:text-xs text-zinc-400">
                  {coupleProfile.partner1Name} & {coupleProfile.partner2Name}’s journey in numbers.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsStatsModalOpen(false)}
              className="p-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-zinc-400 hover:text-white shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
            <div className="bg-black p-3 sm:p-3.5 rounded-2xl border border-white/[0.08] text-center space-y-0.5">
              <div className="text-xl sm:text-2xl font-bold font-mono text-white">
                {completedDates.length}
              </div>
              <div className="text-[9px] sm:text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">
                Completed
              </div>
            </div>

            <div className="bg-black p-3.5 rounded-2xl border border-white/[0.08] text-center space-y-0.5">
              <div className="text-2xl font-bold font-mono text-white">
                {daysTogether}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">
                Days Together
              </div>
            </div>

            <div className="bg-black p-3.5 rounded-2xl border border-white/[0.08] text-center space-y-0.5">
              <div className="text-2xl font-bold font-mono text-white">
                {wishlistDates.length}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">
                Wishlist
              </div>
            </div>

            <div className="bg-black p-3.5 rounded-2xl border border-white/[0.08] text-center space-y-0.5">
              <div className="text-2xl font-bold font-mono text-white">
                ₱{totalSpent.toLocaleString()}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">
                Invested (PHP)
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-black p-4 rounded-2xl border border-white/[0.08] space-y-2.5">
            <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">
              Completed By Category
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-900 border border-white/[0.04]">
                <span className="text-zinc-300">Fine Dining</span>
                <span className="font-mono font-bold text-white">{categoryCounts.dining}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-900 border border-white/[0.04]">
                <span className="text-zinc-300">Outdoor Scenic</span>
                <span className="font-mono font-bold text-white">{categoryCounts.outdoor}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-900 border border-white/[0.04]">
                <span className="text-zinc-300">Art & Creative</span>
                <span className="font-mono font-bold text-white">{categoryCounts.creative}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-900 border border-white/[0.04]">
                <span className="text-zinc-300">Nightlife</span>
                <span className="font-mono font-bold text-white">{categoryCounts.nightlife}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-900 border border-white/[0.04]">
                <span className="text-zinc-300">Cozy At Home</span>
                <span className="font-mono font-bold text-white">{categoryCounts.cozy}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-900 border border-white/[0.04]">
                <span className="text-zinc-300">Adventure</span>
                <span className="font-mono font-bold text-white">{categoryCounts.adventure}</span>
              </div>
            </div>
          </div>

          {/* Badges Collection */}
          <div className="space-y-2.5">
            <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">
              Achievement Milestones
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    badge.unlocked
                      ? 'bg-zinc-900 border-white/20'
                      : 'bg-black/60 border-white/[0.06] opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-xl p-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08] shrink-0">
                      {badge.icon}
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between">
                        <h5 className="text-xs font-bold text-white">{badge.title}</h5>
                        {badge.unlocked ? (
                          <span className="text-[9px] font-mono font-bold text-black bg-white px-2 py-0.5 rounded-full">
                            Unlocked
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-zinc-500">
                            {badge.progress}/{badge.maxProgress}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-tight">
                        {badge.description}
                      </p>

                      {/* Progress Bar */}
                      <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden mt-1.5">
                        <div
                          className="h-full bg-white rounded-full"
                          style={{ width: `${(badge.progress / badge.maxProgress) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
