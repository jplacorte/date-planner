'use client';

import React from 'react';
import { motion } from 'motion/react';
import { 
  Heart, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Circle, 
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
import { useDateContext } from '../context/DateContext';
import { DateIdea, DateCategory, DateStatus } from '../types/date';
import { formatDateString, formatTimeString } from '../utils/date';

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

const statusStyles: Record<DateStatus, { bg: string; text: string; border: string; label: string }> = {
  wishlist: { bg: 'bg-zinc-900', text: 'text-zinc-400', border: 'border-zinc-800', label: 'Wishlist' },
  planned: { bg: 'bg-zinc-900', text: 'text-zinc-200', border: 'border-zinc-700', label: 'Planned' },
  booked: { bg: 'bg-white', text: 'text-black font-bold', border: 'border-white', label: 'Booked' },
  completed: { bg: 'bg-zinc-950', text: 'text-white', border: 'border-zinc-600', label: 'Completed ✓' },
};

export default function DateCard({ date }: { date: DateIdea }) {
  const { setSelectedDate, toggleFavorite, toggleChecklistItem, updateDateStatus } = useDateContext();

  const completedChecklist = date.checklist.filter((i) => i.completed).length;
  const totalChecklist = date.checklist.length;
  const progressPercent = totalChecklist > 0 ? Math.round((completedChecklist / totalChecklist) * 100) : 0;

  const CategoryIcon = categoryIcons[date.category] || Sparkles;
  const statusInfo = statusStyles[date.status];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.25 }}
      className="group relative rounded-3xl overflow-hidden border border-white/[0.08] hover:border-white/[0.2] bg-zinc-950/80 backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all flex flex-col justify-between"
    >
      {/* Cover Image */}
      <div 
        className="relative h-48 w-full overflow-hidden cursor-pointer"
        onClick={() => setSelectedDate(date)}
      >
        <img
          src={date.coverImage}
          alt={date.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-white/[0.1] text-white text-[11px] font-medium">
            <CategoryIcon className="w-3 h-3 text-zinc-400" />
            <span>{categoryLabels[date.category]}</span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(date.id);
            }}
            className="p-1.5 rounded-lg bg-black/80 backdrop-blur-md border border-white/[0.1] text-zinc-400 hover:text-white transition-colors"
            title="Save to Favorites"
          >
            <Heart
              className={`w-3.5 h-3.5 transition-transform active:scale-125 ${
                date.isFavorite ? 'text-white fill-white' : 'text-zinc-400'
              }`}
            />
          </button>
        </div>

        {/* Bottom Image Info */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] text-zinc-300">
          <span className="font-medium flex items-center gap-1">
            <MapPin className="w-3 h-3 text-zinc-400" />
            <span className="truncate max-w-[170px]">{date.locationName}</span>
          </span>
          <span className="px-1.5 py-0.5 rounded bg-black/80 font-mono text-white font-semibold border border-white/[0.08]">
            {date.estimatedCost}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3.5">
        
        {/* Title & Status */}
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 
              onClick={() => setSelectedDate(date)}
              className="text-base font-bold font-serif text-white group-hover:text-zinc-200 transition-colors cursor-pointer leading-snug"
            >
              {date.title}
            </h3>

            {/* Status Selector */}
            <select
              value={date.status}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => updateDateStatus(date.id, e.target.value as DateStatus)}
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md border cursor-pointer focus:outline-none transition-colors ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}
            >
              <option value="wishlist" className="bg-zinc-950 text-white">Wishlist</option>
              <option value="planned" className="bg-zinc-950 text-white">Planned</option>
              <option value="booked" className="bg-zinc-950 text-white">Booked</option>
              <option value="completed" className="bg-zinc-950 text-white">Completed</option>
            </select>
          </div>

          <p className="mt-1 text-xs text-zinc-400 line-clamp-2 leading-relaxed font-light">
            {date.subtitle || date.description}
          </p>
        </div>

        {/* Scheduled Date Pill */}
        {date.scheduledDate && (
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-300 font-mono bg-zinc-900 px-2.5 py-1 rounded-lg border border-white/[0.06]">
            <Calendar className="w-3 h-3 text-zinc-400" />
            <span>
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
              <span className="text-zinc-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-white" />
                Checklist
              </span>
              <span className="text-zinc-400 font-mono text-[10px]">
                {completedChecklist}/{totalChecklist} ({progressPercent}%)
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white rounded-full transition-all duration-300"
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
                  className="flex items-start gap-2 text-xs text-zinc-300 hover:text-white cursor-pointer group/item py-0.5"
                >
                  {item.completed ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="w-3.5 h-3.5 text-zinc-600 group-hover/item:text-zinc-300 shrink-0 mt-0.5" />
                  )}
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
          <div className="flex items-center gap-1 text-[11px] text-zinc-500">
            <Clock className="w-3 h-3" />
            <span>{date.duration}</span>
          </div>

          <button
            onClick={() => setSelectedDate(date)}
            className="flex items-center gap-0.5 text-xs font-semibold text-white hover:text-zinc-300 transition-colors"
          >
            <span>Details</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </motion.div>
  );
}
