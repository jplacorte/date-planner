'use client';

import React, { useState } from 'react';
import { Check, Plus, Trash2 } from 'lucide-react';

import { useDateContext } from '@/context/DateContext';
import type { ChecklistItem, DateIdea } from '@/types/date';

interface ChecklistTabProps {
  selectedDate: DateIdea;
  onSaved: (message: string) => void;
}

/** Pre-date preparation checklist: add, tick off and remove items. */
export default function ChecklistTab({
  selectedDate,
  onSaved,
}: ChecklistTabProps) {
  const { toggleChecklistItem, addChecklistItem, removeChecklistItem } =
    useDateContext();

  const [newChecklistText, setNewChecklistText] = useState('');
  const [newChecklistCategory, setNewChecklistCategory] =
    useState<NonNullable<ChecklistItem['category']>>('custom');

  const items = selectedDate.checklist || [];
  const completedChecklist = items.filter((item) => item.completed).length;
  const totalChecklist = items.length;
  const progressPercent =
    totalChecklist > 0
      ? Math.round((completedChecklist / totalChecklist) * 100)
      : 0;

  const handleAddChecklist = (event: React.FormEvent) => {
    event.preventDefault();
    if (!newChecklistText.trim()) return;
    addChecklistItem(selectedDate.id, newChecklistText, newChecklistCategory);
    setNewChecklistText('');
    onSaved('Checklist item added ✓');
  };

  return (
    <div className="space-y-5">

      {/* Progress Header */}
      <div className="bg-white/[0.03] p-4 rounded-2xl border border-white/[0.07] space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-400 uppercase tracking-[0.12em] text-[10px] font-semibold">
            Getting ready
          </span>
          <span className="text-zinc-300 font-mono">
            {completedChecklist}/{totalChecklist}
          </span>
        </div>
        <div className="w-full bg-white/[0.07] h-[3px] rounded-full overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Add New Checklist Item Form */}
      <form onSubmit={handleAddChecklist} className="flex gap-2">
        <input
          type="text"
          placeholder="Outfit detail, reservation task, something to pack..."
          value={newChecklistText}
          onChange={(e) => setNewChecklistText(e.target.value)}
          className="flex-1 bg-white/[0.03] border border-white/[0.09] rounded-full px-4 py-2 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-white/40 transition-colors"
        />
        <select
          value={newChecklistCategory}
          onChange={(e) => setNewChecklistCategory(e.target.value as 'prep' | 'outfit' | 'booking' | 'custom')}
          className="bg-white/[0.03] border border-white/[0.09] rounded-full px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-white/40"
        >
          <option value="custom" className="bg-zinc-950">Custom</option>
          <option value="prep" className="bg-zinc-950">Prep</option>
          <option value="outfit" className="bg-zinc-950">Outfit</option>
          <option value="booking" className="bg-zinc-950">Booking</option>
        </select>
        <button
          type="submit"
          className="px-4 py-2 rounded-full bg-white text-zinc-950 text-xs font-semibold hover:bg-zinc-200 transition-colors flex items-center gap-1 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add</span>
        </button>
      </form>

      {/* Checklist Items List */}
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => toggleChecklistItem(selectedDate.id, item.id)}
            className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer group ${
              item.completed
                ? 'bg-transparent border-white/[0.05] text-zinc-500'
                : 'bg-white/[0.03] border-white/[0.07] hover:border-accent/30 text-zinc-200'
            }`}
          >
            <div className="flex items-center gap-3">
              {/* A soft marker, not a task checkbox */}
              <span
                className={`w-4 h-4 shrink-0 rounded-full border flex items-center justify-center transition-colors ${
                  item.completed
                    ? 'bg-accent/20 border-accent/60 text-accent-soft'
                    : 'border-white/20 group-hover:border-accent/50'
                }`}
              >
                {item.completed && <Check className="w-2.5 h-2.5 stroke-[3.5]" />}
              </span>
              <span className={`text-xs sm:text-sm ${item.completed ? 'line-through text-zinc-600' : 'font-medium'}`}>
                {item.text}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {item.category && (
                <span className="chip uppercase tracking-[0.1em]">
                  {item.category}
                </span>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeChecklistItem(selectedDate.id, item.id);
                }}
                className="p-1 text-zinc-600 hover:text-accent-soft transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
