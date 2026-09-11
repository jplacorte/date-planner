'use client';

import { useDateContext } from '@/context/DateContext';
import {
  AestheticDatePicker,
  AestheticTimePicker,
} from '@/components/ui/AestheticDateTimePicker';
import { formatDateString, formatTimeString } from '@/lib/date/format';
import type { DateIdea, DateStatus } from '@/types/date';

const STATUSES: DateStatus[] = ['wishlist', 'planned', 'booked', 'completed'];

interface ScheduleBarProps {
  selectedDate: DateIdea;
  onSaved: (message: string) => void;
}

/** Status pills plus the scheduled date and time pickers. */
export default function ScheduleBar({
  selectedDate,
  onSaved,
}: ScheduleBarProps) {
  const { updateDateStatus } = useDateContext();

  const handleStatusChange = (status: DateStatus) => {
    updateDateStatus(
      selectedDate.id,
      status,
      selectedDate.scheduledDate,
      selectedDate.scheduledTime
    );
    onSaved(`Status set to ${status} ✓`);
  };

  /** Scheduling something still on the wishlist promotes it to planned. */
  const promotedStatus =
    selectedDate.status === 'wishlist' ? 'planned' : selectedDate.status;

  const handleDateChange = (dateVal: string) => {
    updateDateStatus(
      selectedDate.id,
      promotedStatus,
      dateVal,
      selectedDate.scheduledTime
    );
    onSaved(
      `Scheduled date saved for ${formatDateString(dateVal, {
        month: 'short',
        day: 'numeric',
        weekday: 'short',
      })} ✓`
    );
  };

  const handleClearDate = () => {
    updateDateStatus(
      selectedDate.id,
      selectedDate.status,
      '',
      selectedDate.scheduledTime
    );
    onSaved('Scheduled date cleared ✓');
  };

  const handleTimeChange = (timeVal: string) => {
    updateDateStatus(
      selectedDate.id,
      promotedStatus,
      selectedDate.scheduledDate,
      timeVal
    );
    onSaved(`Scheduled time set to ${formatTimeString(timeVal)} ✓`);
  };

  const handleClearTime = () => {
    updateDateStatus(
      selectedDate.id,
      selectedDate.status,
      selectedDate.scheduledDate,
      ''
    );
    onSaved('Scheduled time cleared ✓');
  };

  return (
<div className="bg-black px-3.5 sm:px-6 py-2.5 sm:py-3.5 border-b border-white/[0.08] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 shrink-0">
  <div className="flex items-center justify-between sm:justify-start gap-2">
    <span className="text-xs font-medium text-zinc-500 shrink-0">Status:</span>
    <div className="flex gap-1 bg-zinc-900 p-0.5 sm:p-1 rounded-xl border border-white/[0.06] overflow-x-auto scrollbar-none">
      {STATUSES.map((st) => (
        <button
          key={st}
          onClick={() => handleStatusChange(st)}
          className={`px-2 sm:px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-semibold capitalize transition-all whitespace-nowrap ${
            selectedDate.status === st
              ? 'bg-white text-black font-bold shadow-sm'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          {st}
        </button>
      ))}
    </div>
  </div>

  {/* Aesthetic Date & Time Pickers */}
  <div className="flex items-center justify-end gap-2 flex-wrap sm:flex-nowrap">
    <AestheticDatePicker
      value={selectedDate.scheduledDate}
      onChange={handleDateChange}
      onClear={handleClearDate}
      label="Pick Date"
      align="right"
    />

    <AestheticTimePicker
      value={selectedDate.scheduledTime}
      onChange={handleTimeChange}
      onClear={handleClearTime}
      label="Set Time"
      align="right"
    />
  </div>
</div>
  );
}
