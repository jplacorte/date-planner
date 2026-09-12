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
  wishlist: { bg: 'bg-white/[0.04]', text: 'text-neutral-400', border: 'border-white/10' },
  planned: { bg: 'bg-white/[0.08]', text: 'text-white', border: 'border-white/20' },
  booked: { bg: 'bg-white', text: 'text-black font-semibold', border: 'border-white' },
  completed: { bg: 'bg-white/15', text: 'text-white font-medium', border: 'border-white/30' },
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
      className="group relative rounded-2xl overflow-hidden border border-white/[0.1] hover:border-white/[0.28] bg-black/85 backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all flex flex-col justify-between"
    >
      {/* Cover Image — High-Contrast Monograph Frame */}
      <div
        className="relative h-48 sm:h-52 w-full overflow-hidden cursor-pointer"
        onClick={() => setSelectedDate(date)}
      >
        <img
          src={date.coverImage}
          alt={date.title}
          className="w-full h-full object-cover grayscale-[0.35] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/15 text-white font-mono text-[9px] uppercase tracking-[0.18em]">
            <CategoryIcon className="w-3 h-3 text-neutral-400" />
            <span>{categoryLabels[date.category]}</span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleFavorite();
            }}
            className="p-1.5 rounded-full bg-black/80 backdrop-blur-md border border-white/15 transition-colors hover:border-white/40"
            title="Save to Favorites"
          >
            <Heart
              className={`w-3.5 h-3.5 transition-colors ${stamping ? 'stamp-press' : ''} ${
                date.isFavorite ? 'text-white fill-white' : 'text-neutral-400 hover:text-white'
              }`}
            />
          </button>
        </div>

        {/* Bottom Image Info */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-neutral-300 font-mono">
          <span className="font-medium flex items-center gap-1.5 text-[10px]">
            <MapPin className="w-3 h-3 text-neutral-400 shrink-0" />
            <span className="truncate max-w-[140px] xs:max-w-[170px] uppercase tracking-wider">{date.locationName}</span>
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-black/80 text-white font-semibold border border-white/15 text-[10px] tracking-wider">
            {date.estimatedCost}
          </span>
        </div>

        {/* Completed Stamp */}
        {isCompleted && (
          <span className="absolute bottom-10 right-3 flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-white/30 bg-white/20 backdrop-blur-md text-[9px] font-mono font-semibold uppercase tracking-[0.16em] text-white">
            <Check className="w-2.5 h-2.5 stroke-[3]" />
            Lived
          </span>
        )}
      </div>

      {/* Card Body — Editorial Typography & Generous Whitespace */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">

        {/* Title & Status */}
        <div>
          <div className="flex items-start justify-between gap-3">
            <h3
              onClick={() => setSelectedDate(date)}
              className="text-lg sm:text-xl font-serif text-white group-hover:text-neutral-100 transition-colors cursor-pointer leading-snug tracking-tight"
            >
              {date.title}
            </h3>

            {/* Status Selector */}
            <select
              value={date.status}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => updateDateStatus(date.id, e.target.value as DateStatus)}
              className={`text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full border cursor-pointer focus:outline-none transition-colors shrink-0 ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}
            >
              <option value="wishlist" className="bg-black text-white">Wishlist</option>
              <option value="planned" className="bg-black text-white">Planned</option>
              <option value="booked" className="bg-black text-white">Booked</option>
              <option value="completed" className="bg-black text-white">Completed</option>
            </select>
          </div>

          <p className="mt-2 text-xs text-neutral-400 line-clamp-2 leading-relaxed font-serif italic">
            &ldquo;{date.subtitle || date.description}&rdquo;
          </p>
        </div>

        {/* Vibe Chips — Utilitarian Monochrome Tags */}
        {date.vibeTags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 font-mono">
            {date.vibeTags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.08] text-neutral-400">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Scheduled Date Pill */}
        {date.scheduledDate && (
          <div className="flex items-center gap-1.5 text-[10px] text-neutral-300 font-mono bg-white/[0.04] px-3 py-1 rounded-full border border-white/[0.08] uppercase tracking-wider">
            <Calendar className="w-3 h-3 text-neutral-400 shrink-0" />
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
          <div className="space-y-2 pt-2 border-t border-white/[0.08] font-mono">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-neutral-400 uppercase tracking-[0.16em]">
                Dossier Prep
              </span>
              <span className="text-white">
                {completedChecklist}/{totalChecklist}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-white/[0.08] h-[2px] rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* First 2 Checklist Items */}
            <div className="space-y-1 pt-1 font-sans">
              {date.checklist.slice(0, 2).map((item) => (
                <div
                  key={item.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleChecklistItem(date.id, item.id);
                  }}
                  className="flex items-start gap-2 text-xs text-neutral-300 hover:text-white cursor-pointer group/item py-0.5"
                >
                  <span
                    className={`w-3.5 h-3.5 shrink-0 mt-0.5 rounded-full border flex items-center justify-center transition-colors ${
                      item.completed
                        ? 'bg-white border-white text-black'
                        : 'border-white/25 group-hover/item:border-white'
                    }`}
                  >
                    {item.completed && <Check className="w-2 h-2 stroke-[3.5]" />}
                  </span>
                  <span className={`line-clamp-1 text-xs ${item.completed ? 'line-through text-neutral-600' : ''}`}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between font-mono">
          <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 uppercase tracking-wider">
            <Clock className="w-3 h-3" />
            <span>{date.duration}</span>
          </div>

          <button
            onClick={() => setSelectedDate(date)}
            className="flex items-center gap-1 text-[11px] uppercase tracking-wider text-white hover:text-neutral-300 transition-colors"
          >
            <span>Dossier</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </motion.div>
  );
}
