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
    <section className="relative overflow-hidden py-6 sm:py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {upcomingDate ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-white/[0.1] bg-black/80 backdrop-blur-2xl shadow-2xl"
          >
            {/* Background Cover Image with High-Contrast Dark Gradient */}
            <div className="absolute inset-0 z-0">
              <img
                src={upcomingDate.coverImage}
                alt={upcomingDate.title}
                className="w-full h-full object-cover object-center opacity-30 grayscale contrast-125 scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-black/60" />
            </div>

            <div className="relative z-10 p-5 sm:p-10 lg:p-14 grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center">
              
              {/* Left Column: Date Details & Editorial Typography */}
              <div className="lg:col-span-7 space-y-5 sm:space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/15 text-white font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.25em]">
                  <Flame className="w-3 h-3 text-white" />
                  <span>CHAPTER I // UPCOMING RENDEZVOUS</span>
                </div>

                <div>
                  <h1 className="text-3xl xs:text-4xl sm:text-6xl lg:text-7xl font-serif font-normal text-white tracking-tight leading-[1.05]">
                    {upcomingDate.title}
                  </h1>
                  <p className="mt-3 text-sm sm:text-base text-neutral-300 font-serif italic max-w-xl leading-relaxed">
                    &ldquo;{upcomingDate.subtitle}&rdquo;
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-neutral-300 font-mono">
                  <div className="flex items-center gap-1.5 bg-white/[0.04] px-3 py-1.5 rounded-full border border-white/[0.08] text-[10px] sm:text-[11px] uppercase tracking-wider">
                    <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                    <span>
                      {formatDateString(upcomingDate.scheduledDate, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  {upcomingDate.scheduledTime && (
                    <div className="flex items-center gap-1.5 bg-white/[0.04] px-3 py-1.5 rounded-full border border-white/[0.08] text-[10px] sm:text-[11px] uppercase tracking-wider">
                      <Clock className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{formatTimeString(upcomingDate.scheduledTime)}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 bg-white/[0.04] px-3 py-1.5 rounded-full border border-white/[0.08] text-[10px] sm:text-[11px] uppercase tracking-wider">
                    <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span className="truncate max-w-[150px] xs:max-w-[200px]">{upcomingDate.locationName}</span>
                  </div>
                </div>

                {/* Pre-Date Checklist Progress Bar */}
                <div className="bg-white/[0.03] p-4 rounded-2xl border border-white/[0.08] space-y-2.5 max-w-xl">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-400 uppercase tracking-[0.2em] font-mono text-[9px] sm:text-[10px]">
                      Dossier Prep
                    </span>
                    <span className="text-white font-mono text-xs">
                      {completedChecklistCount}/{totalChecklistCount}
                    </span>
                  </div>
                  <div className="w-full bg-white/[0.08] h-[3px] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${checklistPercent}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className="h-full bg-white rounded-full"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-3 pt-1">
                  <button
                    onClick={() => setSelectedDate(upcomingDate)}
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white hover:bg-neutral-200 text-black font-mono text-xs font-semibold uppercase tracking-wider shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <span>Open Dossier</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setIsRouletteModalOpen(true)}
                    className="flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/[0.12] font-mono text-xs uppercase tracking-wider transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Spark Idea</span>
                  </button>
                </div>
              </div>

              {/* Right Column: Architectural Countdown Clock */}
              <div className="lg:col-span-5 flex flex-col items-center lg:items-end w-full">
                <div className="w-full max-w-sm rounded-2xl bg-black/90 border border-white/[0.12] p-5 sm:p-7 backdrop-blur-2xl shadow-2xl">
                  <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 mb-4">
                    <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.22em] text-neutral-400">
                      T-MINUS // COUNTDOWN
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-2.5 sm:p-3.5">
                      <div className="text-2xl sm:text-3xl font-serif text-white">
                        {String(timeLeft.days).padStart(2, '0')}
                      </div>
                      <div className="font-mono text-[8px] sm:text-[9px] uppercase tracking-[0.2em] text-neutral-400 mt-1">
                        Days
                      </div>
                    </div>

                    <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-2.5 sm:p-3.5">
                      <div className="text-2xl sm:text-3xl font-serif text-white">
                        {String(timeLeft.hours).padStart(2, '0')}
                      </div>
                      <div className="font-mono text-[8px] sm:text-[9px] uppercase tracking-[0.2em] text-neutral-400 mt-1">
                        Hours
                      </div>
                    </div>

                    <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-2.5 sm:p-3.5">
                      <div className="text-2xl sm:text-3xl font-serif text-white">
                        {String(timeLeft.minutes).padStart(2, '0')}
                      </div>
                      <div className="font-mono text-[8px] sm:text-[9px] uppercase tracking-[0.2em] text-neutral-400 mt-1">
                        Mins
                      </div>
                    </div>

                    <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-2.5 sm:p-3.5">
                      <div className="text-2xl sm:text-3xl font-serif text-white">
                        {String(timeLeft.seconds).padStart(2, '0')}
                      </div>
                      <div className="font-mono text-[8px] sm:text-[9px] uppercase tracking-[0.2em] text-neutral-400 mt-1">
                        Secs
                      </div>
                    </div>
                  </div>

                  {/* Monograph Snapshot */}
                  <div className="mt-4 pt-3.5 border-t border-white/[0.08] flex items-center justify-between text-xs font-mono text-neutral-400">
                    <div>
                      <span className="text-white font-serif text-sm mr-1">{completedDatesTotal}</span> Lived
                    </div>
                    <div className="h-3 w-px bg-white/15" />
                    <div>
                      <span className="text-white font-serif text-sm mr-1">{wishlistDatesTotal}</span> In Wishlist
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        ) : (
          /* Empty State: Unwritten Chapter */
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl p-8 sm:p-14 text-center border border-white/[0.1] bg-black/80 backdrop-blur-xl space-y-5"
          >
            <div className="inline-block px-3 py-1 rounded-full border border-white/15 bg-white/[0.04] font-mono text-[9px] uppercase tracking-[0.25em] text-neutral-400">
              PREFACE // VOLUME 01
            </div>
            <h1 className="text-3xl sm:text-5xl font-serif font-normal text-white">
              {coupleProfile.partner1Name} <span className="italic font-light opacity-80">&</span> {coupleProfile.partner2Name}
            </h1>
            <p className="text-neutral-400 text-xs sm:text-sm max-w-lg mx-auto font-serif italic leading-relaxed">
              &ldquo;The pages are open. Inscribe your first romantic rendezvous, curate private bucket lists, and preserve memories together.&rdquo;
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-3 font-mono text-xs uppercase tracking-wider">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-white hover:bg-neutral-200 text-black font-semibold shadow-md transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Inscribe Date</span>
              </button>
              <button
                onClick={() => setIsRouletteModalOpen(true)}
                className="flex items-center gap-2 px-5 py-3 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/[0.12] transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-neutral-400" />
                <span>Spark Roulette</span>
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
