'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Heart,
  MapPin,
  Clock,
  Check,
  Calendar,
  Sparkles,
  ChevronRight,
  Utensils,
  Trees,
  Palette,
  Moon,
  Home,
  Compass
} from 'lucide-react';
import { useDateContext } from '@/context/DateContext';
import { DateIdea, DateCategory, DateStatus } from '@/types/date';
import { formatDateString, formatTimeString } from '@/lib/date/format';

const categoryIcons: Record<DateCategory, React.ElementType> = {
  dining: Utensils,
  outdoor: Trees,
  creative: Palette,
  nightlife: Moon,
  cozy: Home,
  adventure: Compass,
};

const categoryLabels: Record<DateCategory, string> = {
  dining: 'Fine Dining',
  outdoor: 'Outdoor Scenic',
  creative: 'Art & Workshop',
  nightlife: 'Nightlife & Drinks',
  cozy: 'Cozy At Home',
  adventure: 'Thrill Adventure',
};

/**
 * Status reads as editorial metadata, not a workflow badge. Only `booked`
 * carries the accent, so a card grid stays calm until something is confirmed.
 */
const statusStyles: Record<DateStatus, { bg: string; text: string; border: string }> = {
  wishlist: { bg: 'bg-zinc-100/[0.04]', text: 'text-zinc-400', border: 'border-white/[0.07]' },
  planned: { bg: 'bg-zinc-100/[0.07]', text: 'text-zinc-200', border: 'border-white/[0.12]' },
  booked: { bg: 'bg-accent/15', text: 'text-accent-soft font-semibold', border: 'border-accent/40' },
  completed: { bg: 'bg-sage/15', text: 'text-zinc-200', border: 'border-sage/35' },
};

export default function DateCard({ date }: { date: DateIdea }) {
  const { setSelectedDate, toggleFavorite, toggleChecklistItem, updateDateStatus } = useDateContext();
  const [stamping, setStamping] = useState(false);

  const completedChecklist = date.checklist.filter((i) => i.completed).length;
  const totalChecklist = date.checklist.length;
  const progressPercent = totalChecklist > 0 ? Math.round((completedChecklist / totalChecklist) * 100) : 0;

  const CategoryIcon = categoryIcons[date.category] || Sparkles;
  const statusInfo = statusStyles[date.status];
  const isCompleted = date.status === 'completed';

  /** Favouriting is a keepsake gesture, so the heart presses like a stamp. */
  const handleFavorite = () => {
    toggleFavorite(date.id);
    setStamping(true);
    window.setTimeout(() => setStamping(false), 400);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.25 }}
      className="group relative rounded-2xl sm:rounded-3xl overflow-hidden border border-white/[0.08] hover:border-white/[0.18] bg-zinc-950/80 backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all flex flex-col justify-between"
    >
      {/* Cover Image */}
      <div
        className="relative h-44 sm:h-48 w-full overflow-hidden cursor-pointer"
        onClick={() => setSelectedDate(date)}
      >
        <img
          src={date.coverImage}
          alt={date.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-2.5 sm:top-3 left-2.5 sm:left-3 right-2.5 sm:right-3 flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/[0.1] text-zinc-200 text-[10px] sm:text-[11px] font-medium">
            <CategoryIcon className="w-3 h-3 text-zinc-400" />
            <span>{categoryLabels[date.category]}</span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleFavorite();
            }}
            className="p-1.5 rounded-full bg-black/70 backdrop-blur-md border border-white/[0.1] transition-colors"
            title="Save to Favorites"
          >
            <Heart
              className={`w-3.5 h-3.5 transition-colors ${stamping ? 'stamp-press' : ''} ${
                date.isFavorite ? 'text-accent fill-accent' : 'text-zinc-400 hover:text-accent-soft'
              }`}
            />
          </button>
        </div>

        {/* Bottom Image Info */}
        <div className="absolute bottom-2 sm:bottom-2.5 left-2.5 sm:left-3 right-2.5 sm:right-3 flex items-center justify-between text-[11px] text-zinc-300">
          <span className="font-medium flex items-center gap-1 text-[10px] sm:text-[11px]">
            <MapPin className="w-3 h-3 text-zinc-400 shrink-0" />
            <span className="truncate max-w-[140px] xs:max-w-[170px]">{date.locationName}</span>
          </span>
          <span className="px-2 py-0.5 rounded-full bg-black/70 font-mono text-zinc-100 font-semibold border border-white/[0.08] text-[10px] sm:text-[11px]">
            {date.estimatedCost}
          </span>
        </div>

        {/* Completed dates carry a quiet stamp rather than a ticked box */}
        {isCompleted && (
          <span className="absolute bottom-9 right-2.5 sm:right-3 flex items-center gap-1 px-2 py-0.5 rounded-full border border-sage/50 bg-sage/20 backdrop-blur-md text-[9.5px] font-semibold uppercase tracking-[0.12em] text-zinc-100">
            <Check className="w-2.5 h-2.5 stroke-[3]" />
            Lived
          </span>
        )}
      </div>

      {/* Card Body */}
      <div className="p-3.5 sm:p-5 flex-1 flex flex-col justify-between space-y-3 sm:space-y-3.5">

        {/* Title & Status */}
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3
              onClick={() => setSelectedDate(date)}
              className="text-[15px] sm:text-[17px] font-semibold font-display text-zinc-50 group-hover:text-white transition-colors cursor-pointer leading-snug"
            >
              {date.title}
            </h3>

            {/* Status Selector */}
            <select
              value={date.status}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => updateDateStatus(date.id, e.target.value as DateStatus)}
              className={`text-[10px] sm:text-[11px] font-medium px-2 py-0.5 rounded-full border cursor-pointer focus:outline-none transition-colors shrink-0 ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}
            >
              <option value="wishlist" className="bg-zinc-950 text-zinc-100">Wishlist</option>
              <option value="planned" className="bg-zinc-950 text-zinc-100">Planned</option>
              <option value="booked" className="bg-zinc-950 text-zinc-100">Booked</option>
              <option value="completed" className="bg-zinc-950 text-zinc-100">Completed</option>
            </select>
          </div>

          <p className="mt-1 text-xs text-zinc-400 line-clamp-2 leading-relaxed font-light">
            {date.subtitle || date.description}
          </p>
        </div>

        {/* Vibe Chips — mood and energy, softly tinted and borderless */}
        {date.vibeTags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {date.vibeTags.slice(0, 3).map((tag) => (
              <span key={tag} className="chip">{tag}</span>
            ))}
          </div>
        )}

        {/* Scheduled Date Pill */}
        {date.scheduledDate && (
          <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-zinc-300 font-mono bg-white/[0.04] px-2.5 py-1 rounded-full border border-white/[0.06]">
            <Calendar className="w-3 h-3 text-zinc-400 shrink-0" />
            <span className="truncate">
              {formatDateString(date.scheduledDate, {
                month: 'short',
                day: 'numeric',
                weekday: 'short',
              })}
              {date.scheduledTime && ` • ${formatTimeString(date.scheduledTime)}`}
            </span>
          </div>
        )}

        {/* Checklist Progress */}
        {totalChecklist > 0 && (
          <div className="space-y-1.5 pt-2 border-t border-white/[0.06]">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-400 font-medium text-[10px] sm:text-[11px] uppercase tracking-[0.1em]">
                Prep
              </span>
              <span className="text-zinc-500 font-mono text-[9px] sm:text-[10px]">
                {completedChecklist}/{totalChecklist}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-white/[0.07] h-[3px] rounded-full overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* First 2 Checklist Items */}
            <div className="space-y-1 pt-1">
              {date.checklist.slice(0, 2).map((item) => (
                <div
                  key={item.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleChecklistItem(date.id, item.id);
                  }}
                  className="flex items-start gap-2 text-xs text-zinc-300 hover:text-zinc-100 cursor-pointer group/item py-1"
                >
                  <span
                    className={`w-3.5 h-3.5 shrink-0 mt-0.5 rounded-full border flex items-center justify-center transition-colors ${
                      item.completed
                        ? 'bg-accent/20 border-accent/60 text-accent-soft'
                        : 'border-white/20 group-hover/item:border-accent/50'
                    }`}
                  >
                    {item.completed && <Check className="w-2 h-2 stroke-[3.5]" />}
                  </span>
                  <span className={`line-clamp-1 ${item.completed ? 'line-through text-zinc-600' : ''}`}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2.5 border-t border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-zinc-500">
            <Clock className="w-3 h-3" />
            <span>{date.duration}</span>
          </div>

          <button
            onClick={() => setSelectedDate(date)}
            className="flex items-center gap-0.5 text-xs font-semibold text-zinc-200 hover:text-accent-soft transition-colors"
          >
            <span>Details</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </motion.div>
  );
}
