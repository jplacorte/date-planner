'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar, Clock, MapPin, Sparkles, CheckCircle2, ArrowRight, Flame, Plus } from 'lucide-react';
import { useDateContext } from '../context/DateContext';
import { DateIdea } from '../types/date';
import { formatDateString, formatTimeString, parseDateAndTimeToTimestamp } from '../utils/date';

export default function HeroCountdown() {
  const { dates, setSelectedDate, setIsRouletteModalOpen, setIsCreateModalOpen, coupleProfile } = useDateContext();

  // Find the next upcoming scheduled date
  const upcomingDate: DateIdea | undefined = dates
    .filter((d) => (d.status === 'booked' || d.status === 'planned') && d.scheduledDate)
    .sort((a, b) => {
      const timeA = parseDateAndTimeToTimestamp(a.scheduledDate, a.scheduledTime);
      const timeB = parseDateAndTimeToTimestamp(b.scheduledDate, b.scheduledTime);
      return timeA - timeB;
    })[0];

  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isPast: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false });

  useEffect(() => {
    if (!upcomingDate?.scheduledDate) return;

    const calculateTime = () => {
      const targetTime = parseDateAndTimeToTimestamp(upcomingDate.scheduledDate, upcomingDate.scheduledTime);
      const now = new Date().getTime();
      const difference = targetTime - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isPast: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [upcomingDate]);

  const completedChecklistCount = upcomingDate?.checklist.filter((i) => i.completed).length || 0;
  const totalChecklistCount = upcomingDate?.checklist.length || 0;
  const checklistPercent = totalChecklistCount > 0 ? Math.round((completedChecklistCount / totalChecklistCount) * 100) : 0;

  const completedDatesTotal = dates.filter((d) => d.status === 'completed').length;
  const wishlistDatesTotal = dates.filter((d) => d.status === 'wishlist').length;

  return (
    <section className="relative overflow-hidden py-8 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {upcomingDate ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative rounded-3xl overflow-hidden border border-white/[0.08] bg-zinc-950/70 backdrop-blur-2xl shadow-2xl"
          >
            {/* Background Cover Image with High-Contrast Dark Gradient */}
            <div className="absolute inset-0 z-0">
              <img
                src={upcomingDate.coverImage}
                alt={upcomingDate.title}
                className="w-full h-full object-cover object-center opacity-30 scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-black/60" />
            </div>

            <div className="relative z-10 p-6 sm:p-10 lg:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Left Column: Date Details & Countdown */}
              <div className="lg:col-span-7 space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-white text-[11px] font-mono uppercase tracking-wider">
                  <Flame className="w-3.5 h-3.5 text-white" />
                  <span>Upcoming Date Itinerary</span>
                </div>

                <div>
                  <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold font-serif text-white tracking-tight leading-tight">
                    {upcomingDate.title}
                  </h1>
                  <p className="mt-2 text-xs sm:text-sm text-zinc-400 font-light leading-relaxed max-w-xl">
                    {upcomingDate.subtitle}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-300">
                  <div className="flex items-center gap-1.5 bg-black/60 px-3 py-1.5 rounded-xl border border-white/[0.08]">
                    <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                    <span>
                      {formatDateString(upcomingDate.scheduledDate, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  {upcomingDate.scheduledTime && (
                    <div className="flex items-center gap-1.5 bg-black/60 px-3 py-1.5 rounded-xl border border-white/[0.08]">
                      <Clock className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{formatTimeString(upcomingDate.scheduledTime)}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 bg-black/60 px-3 py-1.5 rounded-xl border border-white/[0.08]">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{upcomingDate.locationName}</span>
                  </div>
                </div>

                {/* Pre-Date Checklist Progress Bar */}
                <div className="bg-black/60 p-4 rounded-2xl border border-white/[0.08] space-y-2 max-w-xl">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-300 font-medium flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                      Pre-Date Checklist Readiness
                    </span>
                    <span className="text-white font-mono font-bold">
                      {completedChecklistCount}/{totalChecklistCount} ({checklistPercent}%)
                    </span>
                  </div>
                  <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${checklistPercent}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className="h-full bg-white rounded-full"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    onClick={() => setSelectedDate(upcomingDate)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <span>Open Checklist & Prep</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setIsRouletteModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-zinc-200 border border-white/[0.1] font-medium text-xs transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Spark Idea</span>
                  </button>
                </div>
              </div>

              {/* Right Column: Dynamic Countdown Clock Box */}
              <div className="lg:col-span-5 flex flex-col items-center lg:items-end">
                <div className="w-full max-w-sm rounded-2xl bg-black/80 border border-white/[0.1] p-6 backdrop-blur-xl shadow-2xl">
                  <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 mb-4">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                      Live Countdown
                    </span>
                    <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="bg-zinc-900/80 border border-white/[0.08] rounded-xl p-3">
                      <div className="text-2xl font-bold font-mono text-white">
                        {String(timeLeft.days).padStart(2, '0')}
                      </div>
                      <div className="text-[9px] uppercase tracking-wider text-zinc-500 font-medium mt-1">
                        Days
                      </div>
                    </div>

                    <div className="bg-zinc-900/80 border border-white/[0.08] rounded-xl p-3">
                      <div className="text-2xl font-bold font-mono text-white">
                        {String(timeLeft.hours).padStart(2, '0')}
                      </div>
                      <div className="text-[9px] uppercase tracking-wider text-zinc-500 font-medium mt-1">
                        Hours
                      </div>
                    </div>

                    <div className="bg-zinc-900/80 border border-white/[0.08] rounded-xl p-3">
                      <div className="text-2xl font-bold font-mono text-white">
                        {String(timeLeft.minutes).padStart(2, '0')}
                      </div>
                      <div className="text-[9px] uppercase tracking-wider text-zinc-500 font-medium mt-1">
                        Mins
                      </div>
                    </div>

                    <div className="bg-zinc-900/80 border border-white/[0.08] rounded-xl p-3">
                      <div className="text-2xl font-bold font-mono text-white">
                        {String(timeLeft.seconds).padStart(2, '0')}
                      </div>
                      <div className="text-[9px] uppercase tracking-wider text-zinc-500 font-medium mt-1">
                        Secs
                      </div>
                    </div>
                  </div>

                  {/* Relationship Snapshot Banner */}
                  <div className="mt-4 pt-3.5 border-t border-white/[0.08] flex items-center justify-between text-xs text-zinc-400">
                    <div>
                      <span className="text-white font-bold">{completedDatesTotal}</span> Completed
                    </div>
                    <div className="h-3 w-px bg-white/10" />
                    <div>
                      <span className="text-white font-bold">{wishlistDatesTotal}</span> Wishlist
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        ) : (
          /* Empty State Banner */
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl p-8 sm:p-10 text-center border border-white/[0.08] bg-zinc-950/60 backdrop-blur-xl space-y-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-white text-black p-2.5 mx-auto flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white">
              {coupleProfile.partner1Name} & {coupleProfile.partner2Name}’s Date Checklist
            </h2>
            <p className="text-zinc-400 text-xs max-w-lg mx-auto font-light">
              Add your first romantic date idea, curate bucket lists, and check off adventures together.
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black font-bold text-xs shadow-md transition-all hover:bg-zinc-200"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Plan First Date</span>
              </button>
              <button
                onClick={() => setIsRouletteModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-zinc-200 border border-white/[0.1] font-medium text-xs transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
                <span>Spark Roulette</span>
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
