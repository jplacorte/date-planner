'use client';

import React, { useState } from 'react';
import { CheckCircle2, Circle, Plus, Trash2 } from 'lucide-react';

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
      <div className="bg-black p-4 rounded-2xl border border-white/[0.08] space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-400 font-medium">Checklist Progress</span>
          <span className="text-white font-mono font-bold">
            {completedChecklist}/{totalChecklist} ({progressPercent}%)
          </span>
        </div>
        <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
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
          placeholder="Add preparation item, outfit detail, or reservation task..."
          value={newChecklistText}
          onChange={(e) => setNewChecklistText(e.target.value)}
          className="flex-1 bg-black border border-white/[0.1] rounded-2xl px-4 py-2 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white"
        />
        <select
          value={newChecklistCategory}
          onChange={(e) => setNewChecklistCategory(e.target.value as 'prep' | 'outfit' | 'booking' | 'custom')}
          className="bg-black border border-white/[0.1] rounded-2xl px-3 py-2 text-xs text-zinc-300 focus:outline-none"
        >
          <option value="custom">Custom</option>
          <option value="prep">Prep</option>
          <option value="outfit">Outfit</option>
          <option value="booking">Booking</option>
        </select>
        <button
          type="submit"
          className="px-4 py-2 rounded-2xl bg-white text-black text-xs font-bold hover:bg-zinc-200 transition-colors flex items-center gap-1 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add</span>
        </button>
      </form>

      {/* Checklist Items List */}
      <div className="space-y-2">
        {selectedDate.checklist?.map((item) => (
          <div
            key={item.id}
            onClick={() => toggleChecklistItem(selectedDate.id, item.id)}
            className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
              item.completed
                ? 'bg-zinc-950/60 border-zinc-800 text-zinc-500'
                : 'bg-black border-white/[0.08] hover:border-white/[0.2] text-zinc-200'
            }`}
          >
            <div className="flex items-center gap-3">
              {item.completed ? (
                <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-zinc-600 shrink-0" />
              )}
              <span className={`text-xs sm:text-sm ${item.completed ? 'line-through text-zinc-600' : 'font-medium'}`}>
                {item.text}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {item.category && (
                <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono bg-zinc-900 border border-white/[0.04] text-zinc-400">
                  {item.category}
                </span>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeChecklistItem(selectedDate.id, item.id);
                }}
                className="p-1 text-zinc-600 hover:text-white transition-colors"
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
