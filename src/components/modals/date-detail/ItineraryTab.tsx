'use client';

import React, { useMemo, useState, useSyncExternalStore } from 'react';
import { CalendarPlus, Check, Clock, Edit3, MapPin, Navigation, Plus, Trash2 } from 'lucide-react';

import { useDateContext } from '@/context/DateContext';
import {
  formatTimeString,
  isToday,
  timeStringToMinutes,
} from '@/lib/date/format';
import type { DateIdea, ItineraryStep } from '@/types/date';

interface ItineraryTabProps {
  selectedDate: DateIdea;
  onSaved: (message: string) => void;
}

interface StepDraft {
  time: string;
  activity: string;
  location: string;
  notes: string;
}

const EMPTY_DRAFT: StepDraft = {
  time: '',
  activity: '',
  location: '',
  notes: '',
};

/** Builds a Google Maps search link for a venue name or address. */
function mapsUrl(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/**
 * Google Calendar's template URL wants a UTC `YYYYMMDDTHHMMSSZ` range. Steps
 * are one hour by default, which is close enough for a reservation reminder.
 */
function calendarUrl(step: ItineraryStep, dateStr?: string) {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: step.activity,
  });
  if (step.location) params.set('location', step.location);
  if (step.notes) params.set('details', step.notes);

  const minutes = timeStringToMinutes(step.time);
  const parts = dateStr?.split('-');
  if (minutes !== null && parts?.length === 3) {
    const start = new Date(
      parseInt(parts[0], 10),
      parseInt(parts[1], 10) - 1,
      parseInt(parts[2], 10),
      Math.floor(minutes / 60),
      minutes % 60
    );
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    const stamp = (d: Date) => d.toISOString().replace(/[-:]|\.\d{3}/g, '');
    params.set('dates', `${stamp(start)}/${stamp(end)}`);
  }

  return `https://www.google.com/calendar/render?${params.toString()}`;
}

/**
 * The wall clock, treated as an external store so the timeline re-renders on
 * its own each half minute without pushing state from an effect.
 */
function subscribeToClock(onChange: () => void) {
  const id = window.setInterval(onChange, 30_000);
  return () => window.clearInterval(id);
}

/** Minutes since midnight. Stable within a minute, so React can compare it. */
function readClock() {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

/** The server has no viewer clock, so nothing is marked active until hydration. */
function readClockOnServer() {
  return -1;
}

/** Hour-by-hour plan for the date: add, edit, reorder-free timeline steps. */
export default function ItineraryTab({
  selectedDate,
  onSaved,
}: ItineraryTabProps) {
  const {
    toggleItineraryStep,
    addItineraryStep,
    updateItineraryStep,
    removeItineraryStep,
  } = useDateContext();

  const [newStepTime, setNewStepTime] = useState('6:00 PM');
  const [newStepActivity, setNewStepActivity] = useState('');
  const [newStepLocation, setNewStepLocation] = useState('');
  const [newStepNotes, setNewStepNotes] = useState('');
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [editStepData, setEditStepData] = useState<StepDraft>(EMPTY_DRAFT);

  const itineraryList = useMemo(
    () => selectedDate.itinerary || [],
    [selectedDate.itinerary]
  );
  const completedItineraryCount = itineraryList.filter(
    (step) => step.completed
  ).length;

  const clockMinutes = useSyncExternalStore(
    subscribeToClock,
    readClock,
    readClockOnServer
  );

  /**
   * Progression only applies while the date is actually happening today. On any
   * other day the timeline stays uniformly lit, so nothing is greyed out before
   * the night arrives.
   */
  const nowMinutes = isToday(selectedDate.scheduledDate) ? clockMinutes : -1;

  /** Index of the stop currently underway: the last one whose time has passed. */
  const activeStepIndex = useMemo(() => {
    if (nowMinutes < 0) return -1;

    let index = -1;
    itineraryList.forEach((step, i) => {
      const minutes = timeStringToMinutes(step.time);
      if (minutes !== null && minutes <= nowMinutes) index = i;
    });
    return index;
  }, [itineraryList, nowMinutes]);

  const handleAddItinerary = (event: React.FormEvent) => {
    event.preventDefault();
    if (!newStepActivity.trim()) return;

    addItineraryStep(selectedDate.id, {
      time: formatTimeString(newStepTime) || '6:00 PM',
      activity: newStepActivity.trim(),
      location: newStepLocation.trim() || undefined,
      notes: newStepNotes.trim() || undefined,
    });

    setNewStepActivity('');
    setNewStepLocation('');
    setNewStepNotes('');
    onSaved('Timeline step added ✓');
  };

  const startEditStep = (step: ItineraryStep) => {
    setEditingStepId(step.id);
    setEditStepData({
      time: formatTimeString(step.time) || step.time,
      activity: step.activity,
      location: step.location || '',
      notes: step.notes || '',
    });
  };

  const handleSaveStepEdit = (stepId: string) => {
    if (!editStepData.activity.trim()) return;

    updateItineraryStep(selectedDate.id, stepId, {
      time: formatTimeString(editStepData.time) || '6:00 PM',
      activity: editStepData.activity.trim(),
      location: editStepData.location.trim() || undefined,
      notes: editStepData.notes.trim() || undefined,
    });

    setEditingStepId(null);
    onSaved('Itinerary step saved ✓');
  };

  /** Seeds a typical evening so an empty timeline is not a blank page. */
  const insertStarterTimeline = () => {
    const defaultSteps = [
      {
        time: '5:30 PM',
        activity: 'Meet up & Pick matching outfits',
        location: 'Home / Meeting Point',
      },
      {
        time: '6:30 PM',
        activity: `Arrive at ${selectedDate.locationName}`,
        location: selectedDate.locationName,
      },
      {
        time: '7:00 PM',
        activity: 'Main Experience & Candlelight moments',
        notes: 'Take romantic Polaroid photos',
      },
      {
        time: '9:00 PM',
        activity: 'Sweet Dessert & Evening Stroll',
        notes: 'Play soundtrack & talk',
      },
    ];

    defaultSteps.forEach((step) => addItineraryStep(selectedDate.id, step));
    onSaved('Starter timeline inserted ✓');
  };

  return (
    <div className="space-y-5">

      {/* Header Summary */}
      <div className="bg-white/[0.03] p-4 rounded-2xl border border-white/[0.07] flex items-center justify-between text-xs">
        <div>
          <span className="text-zinc-400">Timeline </span>
          <span className="text-zinc-100 font-mono">
            {completedItineraryCount} of {itineraryList.length} done
          </span>
        </div>

        {itineraryList.length === 0 && (
          <button onClick={insertStarterTimeline} className="pill-action">
            <Plus className="w-3 h-3" />
            Starter timeline
          </button>
        )}
      </div>

      {/* Add Itinerary Step Form */}
      <form onSubmit={handleAddItinerary} className="bg-white/[0.03] p-4 rounded-2xl border border-white/[0.07] space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-400">
            Add a stop
          </label>
          <div className="flex gap-1">
            {['5:00 PM', '6:30 PM', '8:00 PM', '9:30 PM'].map((presetTime) => (
              <button
                key={presetTime}
                type="button"
                onClick={() => setNewStepTime(presetTime)}
                className="px-2 py-0.5 rounded-full bg-white/[0.05] hover:bg-accent/15 hover:text-accent-soft text-[10px] font-mono text-zinc-400 border border-white/[0.06] transition-colors"
              >
                {presetTime}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
          <div className="sm:col-span-3">
            <input
              type="text"
              placeholder="6:30 PM"
              value={newStepTime}
              onChange={(e) => setNewStepTime(e.target.value)}
              className="w-full bg-black/40 border border-white/[0.09] rounded-xl px-3 py-2 text-xs font-mono text-zinc-100 focus:outline-none focus:border-accent/50"
            />
          </div>
          <div className="sm:col-span-9">
            <input
              type="text"
              required
              placeholder="Activity (e.g. Sunset Champagne Toast & Star Viewing)"
              value={newStepActivity}
              onChange={(e) => setNewStepActivity(e.target.value)}
              className="w-full bg-black/40 border border-white/[0.09] rounded-xl px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-accent/50"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <input
            type="text"
            placeholder="Venue / Specific Location (optional)"
            value={newStepLocation}
            onChange={(e) => setNewStepLocation(e.target.value)}
            className="w-full bg-black/40 border border-white/[0.09] rounded-xl px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-accent/50"
          />
          <input
            type="text"
            placeholder="Special note, tip, outfit note (optional)"
            value={newStepNotes}
            onChange={(e) => setNewStepNotes(e.target.value)}
            className="w-full bg-black/40 border border-white/[0.09] rounded-xl px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-accent/50"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2 rounded-xl bg-accent/90 text-white font-semibold text-xs hover:bg-accent transition-all flex items-center justify-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Step to Timeline</span>
        </button>
      </form>

      {/* Itinerary Timeline List */}
      {itineraryList.length > 0 ? (
        <div className="relative timeline-rail ml-4 space-y-4 py-2">
          {itineraryList.map((step, index) => {
            const isEditing = editingStepId === step.id;
            const isActive = index === activeStepIndex;
            const isPast = activeStepIndex > -1 && index < activeStepIndex;

            return (
              <div
                key={step.id}
                className={`relative pl-6 transition-opacity duration-500 ${isPast ? 'timeline-past' : ''}`}
              >
                {/* Checkpoint node on the rail */}
                <button
                  onClick={() => toggleItineraryStep(selectedDate.id, step.id)}
                  className={`absolute -left-[8px] top-3.5 w-[15px] h-[15px] rounded-full border transition-all flex items-center justify-center ${
                    step.completed
                      ? 'bg-accent border-accent text-white'
                      : isActive
                        ? 'bg-zinc-950 border-accent'
                        : 'bg-zinc-950 border-white/25 hover:border-accent/60'
                  }`}
                  title="Toggle Completed"
                >
                  {step.completed && <Check className="w-2 h-2 stroke-[4]" />}
                </button>

                {/* Step Content / Inline Editor */}
                {isEditing ? (
                  <div className="bg-zinc-900 p-4 rounded-2xl border border-white/[0.14] space-y-2.5 shadow-xl">
                    <div className="flex items-center justify-between text-xs font-semibold text-zinc-100 border-b border-white/10 pb-2">
                      <span>Edit Timeline Step</span>
                      <button
                        type="button"
                        onClick={() => setEditingStepId(null)}
                        className="text-zinc-400 hover:text-zinc-100"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                      <input
                        type="text"
                        placeholder="Time (e.g. 6:30 PM)"
                        value={editStepData.time}
                        onChange={(e) => setEditStepData({ ...editStepData, time: e.target.value })}
                        className="sm:col-span-3 bg-black/50 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-zinc-100 font-mono focus:outline-none focus:border-accent/50"
                      />
                      <input
                        type="text"
                        value={editStepData.activity}
                        onChange={(e) => setEditStepData({ ...editStepData, activity: e.target.value })}
                        placeholder="Activity"
                        className="sm:col-span-9 bg-black/50 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-accent/50"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={editStepData.location}
                        onChange={(e) => setEditStepData({ ...editStepData, location: e.target.value })}
                        placeholder="Location / Venue"
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-accent/50"
                      />
                      <input
                        type="text"
                        value={editStepData.notes}
                        onChange={(e) => setEditStepData({ ...editStepData, notes: e.target.value })}
                        placeholder="Notes & Tips"
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-accent/50"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setEditingStepId(null)}
                        className="pill-action"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveStepEdit(step.id)}
                        className="px-4 py-1 rounded-full bg-accent/90 text-white text-xs font-semibold hover:bg-accent transition-colors"
                      >
                        Save Step
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`group bg-white/[0.025] p-3.5 rounded-2xl border transition-all space-y-2 ${
                      isActive
                        ? 'timeline-active'
                        : 'border-white/[0.07] hover:border-white/[0.16]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`text-xs font-mono ${isActive ? 'text-accent-soft' : 'text-zinc-300'}`}>
                          {formatTimeString(step.time)}
                        </span>
                        {isActive && (
                          <span className="chip chip-accent uppercase tracking-[0.1em]">Now</span>
                        )}
                        {step.location && (
                          <span className="text-[11px] text-zinc-500 flex items-center gap-1 truncate">
                            <MapPin className="w-3 h-3 shrink-0" />
                            <span className="truncate">{step.location}</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity shrink-0">
                        <button
                          onClick={() => startEditStep(step)}
                          className="p-1 rounded-lg hover:bg-white/[0.07] text-zinc-500 hover:text-zinc-100 transition-colors"
                          title="Edit Step"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => removeItineraryStep(selectedDate.id, step.id)}
                          className="p-1 rounded-lg hover:bg-white/[0.07] text-zinc-600 hover:text-accent-soft transition-colors"
                          title="Delete Step"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div
                      onClick={() => toggleItineraryStep(selectedDate.id, step.id)}
                      className="cursor-pointer"
                    >
                      <h4 className={`text-sm font-display transition-colors ${step.completed ? 'line-through text-zinc-600' : 'text-zinc-50'}`}>
                        {step.activity}
                      </h4>
                      {step.notes && (
                        <p className="text-xs text-zinc-500 font-light mt-0.5">{step.notes}</p>
                      )}
                    </div>

                    {/* Icon-first native actions, never a bulky CTA */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      {step.location && (
                        <a
                          href={mapsUrl(step.location)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="pill-action"
                        >
                          <Navigation className="w-3 h-3" />
                          Directions
                        </a>
                      )}
                      <a
                        href={calendarUrl(step, selectedDate.scheduledDate)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="pill-action"
                      >
                        <CalendarPlus className="w-3 h-3" />
                        Add to calendar
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white/[0.03] p-8 rounded-2xl border border-white/[0.07] text-center space-y-2">
          <Clock className="w-6 h-6 text-zinc-600 mx-auto" />
          <h4 className="text-sm font-display text-zinc-100">No stops yet</h4>
          <p className="text-[11px] text-zinc-500 max-w-xs mx-auto leading-relaxed">
            Plan your time together by adding checkpoints, or start from a typical evening.
          </p>
          <button onClick={insertStarterTimeline} className="pill-action mt-2">
            <Plus className="w-3 h-3" />
            Insert starter timeline
          </button>
        </div>
      )}

    </div>
  );
}
