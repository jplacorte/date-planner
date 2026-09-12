'use client';

import { BookHeart, CheckCircle2, Clock, MapPin } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type DetailTab = 'checklist' | 'itinerary' | 'details' | 'memory';

interface TabDefinition {
  id: DetailTab;
  icon: LucideIcon;
  label: string;
}

const TABS: TabDefinition[] = [
  { id: 'checklist', icon: CheckCircle2, label: 'Checklist' },
  { id: 'itinerary', icon: Clock, label: 'Itinerary' },
  { id: 'details', icon: MapPin, label: 'Location & Vibe' },
  { id: 'memory', icon: BookHeart, label: 'Memories & Photos' },
];

interface TabNavProps {
  activeTab: DetailTab;
  onChange: (tab: DetailTab) => void;
  /** Counts appended to the tab label, keyed by tab id. */
  counts: Partial<Record<DetailTab, string>>;
}

export default function TabNav({ activeTab, onChange, counts }: TabNavProps) {
  return (
    <div
      role="tablist"
      aria-label="Date details"
      className="flex items-center overflow-x-auto scrollbar-none touch-scroll border-b border-white/[0.08] bg-black px-3 sm:px-6 shrink-0 font-mono text-xs uppercase tracking-wider"
    >
      {TABS.map(({ id, icon: Icon, label }) => {
        const isActive = activeTab === id;
        const count = counts[id];

        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(id)}
            className={`py-3 px-3 sm:px-4 text-xs border-b-2 transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${
              isActive
                ? 'border-white text-white font-semibold'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>
              {label}
              {count ? ` [${count}]` : ''}
            </span>
          </button>
        );
      })}
    </div>
  );
}
