'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar, Clock, MapPin, Sparkles, ArrowRight, Flame, Plus } from 'lucide-react';
import { useDateContext } from '@/context/DateContext';
import { DateIdea } from '@/types/date';
import { formatDateString, formatTimeString, parseDateAndTimeToTimestamp } from '@/lib/date/format';

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
    <section className="relative overflow-hidden py-4 sm:py-8 sm:py-10">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
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
              <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/92 to-zinc-950/60" />
            </div>

            <div className="relative z-10 p-4 sm:p-8 lg:p-12 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
              
              {/* Left Column: Date Details & Countdown */}
              <div className="lg:col-span-7 space-y-4 sm:space-y-5">
                <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-accent/12 text-accent-soft text-[10px] sm:text-[11px] uppercase tracking-[0.16em] font-semibold">
                  <Flame className="w-3.5 h-3.5" />
                  <span>Up next</span>
                </div>

                <div>
                  <h1 className="text-2xl xs:text-3xl sm:text-5xl lg:text-6xl font-display font-medium text-zinc-50 tracking-tight leading-[1.1]">
                    {upcomingDate.title}
                  </h1>
                  <p className="mt-2 sm:mt-3 text-sm text-zinc-400 font-light leading-relaxed max-w-xl">
                    {upcomingDate.subtitle}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-zinc-300">
                  <div className="flex items-center gap-1.5 bg-white/[0.04] px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-white/[0.07] text-[11px] sm:text-xs">
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
                    <div className="flex items-center gap-1.5 bg-white/[0.04] px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-white/[0.07] text-[11px] sm:text-xs">
                      <Clock className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{formatTimeString(upcomingDate.scheduledTime)}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 bg-white/[0.04] px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-white/[0.07] text-[11px] sm:text-xs">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <span className="truncate max-w-[150px] xs:max-w-[200px]">{upcomingDate.locationName}</span>
                  </div>
                </div>

                {/* Pre-Date Checklist Progress Bar */}
                <div className="bg-white/[0.03] p-3.5 sm:p-4 rounded-2xl border border-white/[0.07] space-y-2.5 max-w-xl">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400 uppercase tracking-[0.12em] text-[10px] font-semibold">
                      Getting ready
                    </span>
                    <span className="text-zinc-300 font-mono text-[11px] sm:text-xs">
                      {completedChecklistCount}/{totalChecklistCount}
                    </span>
                  </div>
                  <div className="w-full bg-white/[0.07] h-[3px] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${checklistPercent}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className="h-full bg-accent rounded-full"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2.5 sm:gap-3 pt-1">
                  <button
                    onClick={() => setSelectedDate(upcomingDate)}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <span>Open the plan</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setIsRouletteModalOpen(true)}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 border border-white/[0.09] font-medium text-xs transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Spark Idea</span>
                  </button>
                </div>
              </div>

              {/* Right Column: Dynamic Countdown Clock Box */}
              <div className="lg:col-span-5 flex flex-col items-center lg:items-end w-full">
                <div className="w-full max-w-sm rounded-2xl bg-zinc-950/85 border border-white/[0.09] p-4 sm:p-6 backdrop-blur-xl shadow-2xl">
                  <div className="flex items-center justify-between border-b border-white/[0.07] pb-2.5 sm:pb-3 mb-3 sm:mb-4">
                    <span className="text-[10px] uppercase tracking-[0.16em] font-semibold text-zinc-500">
                      Counting down
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
                  </div>

                  <div className="grid grid-cols-4 gap-1.5 sm:gap-2 text-center">
                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-2 sm:p-3">
                      <div className="text-2xl sm:text-3xl font-display text-zinc-50">
                        {String(timeLeft.days).padStart(2, '0')}
                      </div>
                      <div className="text-[8px] sm:text-[9px] uppercase tracking-wider text-zinc-500 font-medium mt-0.5 sm:mt-1">
                        Days
                      </div>
                    </div>

                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-2 sm:p-3">
                      <div className="text-2xl sm:text-3xl font-display text-zinc-50">
                        {String(timeLeft.hours).padStart(2, '0')}
                      </div>
                      <div className="text-[8px] sm:text-[9px] uppercase tracking-wider text-zinc-500 font-medium mt-0.5 sm:mt-1">
                        Hours
                      </div>
                    </div>

                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-2 sm:p-3">
                      <div className="text-2xl sm:text-3xl font-display text-zinc-50">
                        {String(timeLeft.minutes).padStart(2, '0')}
                      </div>
                      <div className="text-[8px] sm:text-[9px] uppercase tracking-wider text-zinc-500 font-medium mt-0.5 sm:mt-1">
                        Mins
                      </div>
                    </div>

                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-2 sm:p-3">
                      <div className="text-2xl sm:text-3xl font-display text-zinc-50">
                        {String(timeLeft.seconds).padStart(2, '0')}
                      </div>
                      <div className="text-[8px] sm:text-[9px] uppercase tracking-wider text-zinc-500 font-medium mt-0.5 sm:mt-1">
                        Secs
                      </div>
                    </div>
                  </div>

                  {/* Relationship Snapshot Banner */}
                  <div className="mt-3 sm:mt-4 pt-3 sm:pt-3.5 border-t border-white/[0.08] flex items-center justify-between text-xs text-zinc-400">
                    <div>
                      <span className="text-zinc-100 font-display text-sm">{completedDatesTotal}</span> Lived
                    </div>
                    <div className="h-3 w-px bg-white/10" />
                    <div>
                      <span className="text-zinc-100 font-display text-sm">{wishlistDatesTotal}</span> Wishlist
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
            className="rounded-3xl p-6 sm:p-10 text-center border border-white/[0.08] bg-zinc-950/60 backdrop-blur-xl space-y-4"
          >
            <div className="w-12 h-12 rounded-full bg-accent/12 text-accent-soft p-2.5 mx-auto flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h1 className="text-2xl sm:text-4xl font-display font-medium text-zinc-50">
              {coupleProfile.partner1Name} & {coupleProfile.partner2Name}’s Date Checklist
            </h1>
            <p className="text-zinc-400 text-xs max-w-lg mx-auto font-light">
              Add your first romantic date idea, curate bucket lists, and check off adventures together.
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs shadow-md transition-all"
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
