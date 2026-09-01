'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Sparkles,
  Check
} from 'lucide-react';
import { formatDateString, formatTimeString } from '../utils/date';

interface AestheticDatePickerProps {
  value?: string; // YYYY-MM-DD
  onChange: (dateString: string) => void;
  onClear?: () => void;
  label?: string;
  className?: string;
  align?: 'left' | 'right';
}

export function AestheticDatePicker({
  value,
  onChange,
  onClear,
  label = 'Pick Date',
  className = '',
  align = 'left'
}: AestheticDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse initial year and month from value or today
  const initialDate = value ? new Date(value + 'T00:00:00') : new Date();
  const [viewYear, setViewYear] = useState(
    isNaN(initialDate.getFullYear()) ? new Date().getFullYear() : initialDate.getFullYear()
  );
  const [viewMonth, setViewMonth] = useState(
    isNaN(initialDate.getMonth()) ? new Date().getMonth() : initialDate.getMonth()
  );

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const prevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  // Generate days in month
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const handleSelectDay = (day: number) => {
    const mm = String(viewMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    const dateStr = `${viewYear}-${mm}-${dd}`;
    onChange(dateStr);
    setIsOpen(false);
  };

  const handlePreset = (offsetDays: number) => {
    const target = new Date();
    target.setDate(target.getDate() + offsetDays);
    const yyyy = target.getFullYear();
    const mm = String(target.getMonth() + 1).padStart(2, '0');
    const dd = String(target.getDate()).padStart(2, '0');
    onChange(`${yyyy}-${mm}-${dd}`);
    setViewYear(yyyy);
    setViewMonth(target.getMonth());
    setIsOpen(false);
  };

  const handleSelectThisWeekend = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 is Sunday, 6 is Saturday
    const daysUntilSaturday = (6 - dayOfWeek + 7) % 7 || 7;
    handlePreset(daysUntilSaturday);
  };

  const todayStr = (() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  })();

  const isDaySelected = (day: number) => {
    if (!value) return false;
    const mm = String(viewMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return value === `${viewYear}-${mm}-${dd}`;
  };

  const isDayToday = (day: number) => {
    const mm = String(viewMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return todayStr === `${viewYear}-${mm}-${dd}`;
  };

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      {/* Trigger Button */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-medium transition-all shadow-sm ${
            value
              ? 'bg-zinc-900/90 hover:bg-zinc-800 text-white border-white/20 hover:border-white/40'
              : 'bg-zinc-900/60 hover:bg-zinc-900 text-zinc-400 hover:text-white border-white/10 hover:border-white/20'
          }`}
          title="Pick Scheduled Date"
        >
          <CalendarIcon className={`w-3.5 h-3.5 ${value ? 'text-rose-300' : 'text-zinc-400'}`} />
          <span className="whitespace-nowrap font-sans">
            {value ? formatDateString(value, { month: 'short', day: 'numeric', weekday: 'short' }) : label}
          </span>
        </button>

        {value && onClear && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            className="p-1 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Clear date"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Aesthetic Calendar Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-50 mt-2 w-72 sm:w-80 rounded-2xl bg-zinc-950/95 border border-white/20 p-3.5 shadow-2xl backdrop-blur-2xl ${
              align === 'right' ? 'right-0' : 'left-0'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header: Month & Year Navigator */}
            <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-white/[0.08]">
              <button
                type="button"
                onClick={prevMonth}
                className="p-1.5 rounded-xl bg-zinc-900 hover:bg-white text-zinc-300 hover:text-black border border-white/10 transition-all"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <div className="text-xs font-serif font-bold text-white tracking-wide">
                {monthNames[viewMonth]} {viewYear}
              </div>

              <button
                type="button"
                onClick={nextMonth}
                className="p-1.5 rounded-xl bg-zinc-900 hover:bg-white text-zinc-300 hover:text-black border border-white/10 transition-all"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Weekday Labels */}
            <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d, i) => (
                <div key={i} className="text-[10px] font-mono font-semibold text-zinc-500 uppercase">
                  {d}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Prev Month Days */}
              {Array.from({ length: firstDayOfWeek }).map((_, idx) => {
                const dayNum = daysInPrevMonth - firstDayOfWeek + idx + 1;
                return (
                  <div
                    key={`prev-${idx}`}
                    className="h-8 flex items-center justify-center text-[11px] font-mono text-zinc-700 select-none"
                  >
                    {dayNum}
                  </div>
                );
              })}

              {/* Current Month Days */}
              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const dayNum = idx + 1;
                const isSelected = isDaySelected(dayNum);
                const isToday = isDayToday(dayNum);

                return (
                  <button
                    key={`curr-${dayNum}`}
                    type="button"
                    onClick={() => handleSelectDay(dayNum)}
                    className={`h-8 rounded-xl text-[11px] font-mono font-medium flex items-center justify-center transition-all relative ${
                      isSelected
                        ? 'bg-white text-black font-bold shadow-lg scale-105 z-10 ring-2 ring-white/50'
                        : isToday
                        ? 'border border-rose-400 text-rose-200 bg-rose-500/10 hover:bg-rose-500/20'
                        : 'text-zinc-300 hover:bg-white/15 hover:text-white'
                    }`}
                  >
                    {dayNum}
                    {isToday && !isSelected && (
                      <span className="absolute bottom-1 w-1 h-1 rounded-full bg-rose-400" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Quick Date Presets */}
            <div className="mt-3 pt-2.5 border-t border-white/[0.08] flex items-center justify-between gap-1 flex-wrap">
              <button
                type="button"
                onClick={() => handlePreset(0)}
                className="px-2 py-1 rounded-lg bg-zinc-900 hover:bg-white/15 text-[10px] font-medium text-zinc-300 hover:text-white transition-colors"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => handlePreset(1)}
                className="px-2 py-1 rounded-lg bg-zinc-900 hover:bg-white/15 text-[10px] font-medium text-zinc-300 hover:text-white transition-colors"
              >
                Tomorrow
              </button>
              <button
                type="button"
                onClick={handleSelectThisWeekend}
                className="px-2 py-1 rounded-lg bg-zinc-900 hover:bg-white/15 text-[10px] font-medium text-zinc-300 hover:text-white transition-colors"
              >
                This Sat
              </button>
              {value && onClear && (
                <button
                  type="button"
                  onClick={() => {
                    onClear();
                    setIsOpen(false);
                  }}
                  className="px-2 py-1 rounded-lg text-rose-400 hover:text-rose-300 text-[10px] font-medium transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface AestheticTimePickerProps {
  value?: string; // e.g. "19:30" or "7:30 PM"
  onChange: (timeString: string) => void;
  onClear?: () => void;
  label?: string;
  className?: string;
  align?: 'left' | 'right';
}

export function AestheticTimePicker({
  value,
  onChange,
  onClear,
  label = 'Set Time',
  className = '',
  align = 'left'
}: AestheticTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Romantic Vibe Time Presets
  const presets = [
    { label: 'Morning Brunch', time: '10:00 AM', icon: '☕' },
    { label: 'Afternoon Date', time: '2:30 PM', icon: '☀️' },
    { label: 'Golden Hour / Sunset', time: '5:30 PM', icon: '🌇' },
    { label: 'Romantic Dinner', time: '7:00 PM', icon: '🍷' },
    { label: 'Evening Lounge', time: '8:30 PM', icon: '🍸' },
    { label: 'Stargazing / Nightcap', time: '10:00 PM', icon: '✨' },
  ];

  // Custom Hour & Minute Selector State
  const [selectedHour, setSelectedHour] = useState('7');
  const [selectedMinute, setSelectedMinute] = useState('00');
  const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>('PM');

  const handleApplyCustomTime = () => {
    const formatted = `${selectedHour}:${selectedMinute} ${selectedPeriod}`;
    onChange(formatted);
    setIsOpen(false);
  };

  const handleSelectPreset = (timeStr: string) => {
    onChange(timeStr);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      {/* Trigger Button */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-medium transition-all shadow-sm ${
            value
              ? 'bg-zinc-900/90 hover:bg-zinc-800 text-white border-white/20 hover:border-white/40'
              : 'bg-zinc-900/60 hover:bg-zinc-900 text-zinc-400 hover:text-white border-white/10 hover:border-white/20'
          }`}
          title="Pick Scheduled Time"
        >
          <Clock className={`w-3.5 h-3.5 ${value ? 'text-amber-300' : 'text-zinc-400'}`} />
          <span className="whitespace-nowrap font-sans">
            {value ? formatTimeString(value) : label}
          </span>
        </button>

        {value && onClear && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            className="p-1 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Clear time"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Aesthetic Time Picker Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-50 mt-2 w-72 sm:w-80 rounded-2xl bg-zinc-950/95 border border-white/20 p-3.5 shadow-2xl backdrop-blur-2xl space-y-3 ${
              align === 'right' ? 'right-0' : 'left-0'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-300" />
                Vibe Time Presets
              </span>
              {value && (
                <span className="text-xs font-mono font-bold text-white bg-zinc-900 px-2 py-0.5 rounded-md border border-white/10">
                  {formatTimeString(value)}
                </span>
              )}
            </div>

            {/* Romantic Presets Grid */}
            <div className="grid grid-cols-2 gap-1.5">
              {presets.map((p, idx) => {
                const isSelected = value && formatTimeString(value) === p.time;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPreset(p.time)}
                    className={`p-2 rounded-xl text-left border transition-all flex items-center justify-between group ${
                      isSelected
                        ? 'bg-white text-black border-white font-bold shadow-md'
                        : 'bg-zinc-900/70 hover:bg-zinc-900 border-white/[0.08] hover:border-white/25 text-white'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-[10px] font-semibold truncate flex items-center gap-1">
                        <span>{p.icon}</span>
                        <span className={isSelected ? 'text-black' : 'text-zinc-300'}>{p.label}</span>
                      </div>
                      <div className={`text-xs font-mono font-bold mt-0.5 ${isSelected ? 'text-black' : 'text-white'}`}>
                        {p.time}
                      </div>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-black shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Custom Hour / Minute / Period Row */}
            <div className="pt-2 border-t border-white/[0.08] space-y-2">
              <div className="text-[10px] font-mono uppercase text-zinc-500 font-semibold">
                Or Pick Custom Time:
              </div>

              <div className="flex items-center gap-1.5">
                {/* Hour */}
                <select
                  value={selectedHour}
                  onChange={(e) => setSelectedHour(e.target.value)}
                  className="bg-zinc-900 border border-white/15 rounded-xl px-2 py-1.5 text-xs text-white focus:outline-none flex-1 font-mono font-bold"
                >
                  {Array.from({ length: 12 }).map((_, i) => (
                    <option key={i + 1} value={String(i + 1)}>
                      {String(i + 1)}
                    </option>
                  ))}
                </select>

                <span className="text-zinc-500 font-mono font-bold">:</span>

                {/* Minute */}
                <select
                  value={selectedMinute}
                  onChange={(e) => setSelectedMinute(e.target.value)}
                  className="bg-zinc-900 border border-white/15 rounded-xl px-2 py-1.5 text-xs text-white focus:outline-none flex-1 font-mono font-bold"
                >
                  {['00', '15', '30', '45'].map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>

                {/* Period */}
                <div className="flex rounded-xl bg-zinc-900 p-0.5 border border-white/15">
                  <button
                    type="button"
                    onClick={() => setSelectedPeriod('AM')}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold font-mono transition-all ${
                      selectedPeriod === 'AM' ? 'bg-white text-black shadow' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    AM
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPeriod('PM')}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold font-mono transition-all ${
                      selectedPeriod === 'PM' ? 'bg-white text-black shadow' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    PM
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleApplyCustomTime}
                  className="px-3 py-1.5 rounded-xl bg-white text-black text-xs font-bold hover:bg-zinc-200 transition-all shadow shrink-0"
                >
                  Set
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
