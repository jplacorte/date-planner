'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Heart, 
  Sparkles, 
  Plus, 
  Utensils, 
  Trees, 
  Palette, 
  Moon, 
  Home, 
  Compass, 
  X
} from 'lucide-react';
import { useDateContext } from '../context/DateContext';
import { DateCategory, DateStatus, CostLevel, DateSetting } from '../types/date';
import DateCard from './DateCard';

const categories: { id: DateCategory | 'all'; label: string; icon: React.ElementType }[] = [
  { id: 'all', label: 'All Categories', icon: Sparkles },
  { id: 'dining', label: 'Fine Dining', icon: Utensils },
  { id: 'outdoor', label: 'Outdoor Scenic', icon: Trees },
  { id: 'creative', label: 'Art & Workshops', icon: Palette },
  { id: 'nightlife', label: 'Nightlife & Drinks', icon: Moon },
  { id: 'cozy', label: 'Cozy At Home', icon: Home },
  { id: 'adventure', label: 'Thrill Adventure', icon: Compass },
];

const statuses: { id: DateStatus | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'wishlist', label: 'Wishlist' },
  { id: 'planned', label: 'Planned' },
  { id: 'booked', label: 'Booked' },
  { id: 'completed', label: 'Completed' },
];

export default function ChecklistHub() {
  const { dates, filterState, setFilterState, setIsCreateModalOpen, setIsRouletteModalOpen } = useDateContext();

  const filteredDates = dates.filter((d) => {
    // Search query
    if (filterState.searchQuery.trim()) {
      const q = filterState.searchQuery.toLowerCase();
      const matchTitle = d.title.toLowerCase().includes(q);
      const matchSub = d.subtitle?.toLowerCase().includes(q);
      const matchLoc = d.locationName.toLowerCase().includes(q);
      const matchTag = d.vibeTags.some((t) => t.toLowerCase().includes(q));
      const matchChecklist = d.checklist.some((c) => c.text.toLowerCase().includes(q));
      if (!matchTitle && !matchSub && !matchLoc && !matchTag && !matchChecklist) return false;
    }

    // Category
    if (filterState.category !== 'all' && d.category !== filterState.category) return false;

    // Status
    if (filterState.status !== 'all' && d.status !== filterState.status) return false;

    // Cost
    if (filterState.cost !== 'all' && d.estimatedCost !== filterState.cost) return false;

    // Setting
    if (filterState.setting !== 'all' && d.setting !== filterState.setting) return false;

    // Favorites only
    if (filterState.favoritesOnly && !d.isFavorite) return false;

    return true;
  });

  const getStatusCount = (st: DateStatus | 'all') => {
    if (st === 'all') return dates.length;
    return dates.filter((d) => d.status === st).length;
  };

  return (
    <div className="space-y-6">
      
      {/* Search & Filter Control Bar */}
      <div className="space-y-3.5 sm:space-y-4 bg-zinc-950/70 p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-white/[0.08] backdrop-blur-2xl shadow-xl">
        
        {/* Top Search Input Row */}
        <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search dates, vibes, spots, or tasks..."
              value={filterState.searchQuery}
              onChange={(e) => setFilterState((prev) => ({ ...prev, searchQuery: e.target.value }))}
              className="w-full bg-black/70 border border-white/[0.1] rounded-xl sm:rounded-2xl pl-10 pr-9 py-2 sm:py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white transition-colors"
            />
            {filterState.searchQuery && (
              <button
                onClick={() => setFilterState((prev) => ({ ...prev, searchQuery: '' }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Favorites Toggle */}
            <button
              onClick={() => setFilterState((prev) => ({ ...prev, favoritesOnly: !prev.favoritesOnly }))}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl border text-xs font-semibold transition-all ${
                filterState.favoritesOnly
                  ? 'bg-white text-black border-white'
                  : 'bg-white/[0.04] text-zinc-400 border-white/[0.08] hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${filterState.favoritesOnly ? 'fill-black text-black' : ''}`} />
              <span>Favorites</span>
            </button>

            {/* Plan Date CTA */}
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-white hover:bg-zinc-200 text-black text-xs font-bold transition-all shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Idea</span>
            </button>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none touch-scroll -mx-1 px-1">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const active = filterState.category === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setFilterState((prev) => ({ ...prev, category: cat.id }))}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                  active
                    ? 'bg-white text-black font-bold shadow-sm'
                    : 'bg-zinc-900/80 text-zinc-400 border border-white/[0.06] hover:bg-zinc-800 hover:text-white'
                }`}
              >
                <Icon className={`w-3 h-3 ${active ? 'text-black' : 'text-zinc-400'}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Status Tab Filter Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 pt-3 border-t border-white/[0.06]">
          <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none touch-scroll">
            {statuses.map((st) => {
              const active = filterState.status === st.id;
              const count = getStatusCount(st.id);
              return (
                <button
                  key={st.id}
                  onClick={() => setFilterState((prev) => ({ ...prev, status: st.id }))}
                  className={`px-2.5 sm:px-3 py-1 rounded-xl text-xs font-medium transition-all flex items-center gap-1 sm:gap-1.5 whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-white text-black font-bold'
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <span>{st.label}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${active ? 'bg-black/10 text-black' : 'bg-zinc-900 text-zinc-500'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Secondary Filters */}
          <div className="grid grid-cols-2 sm:flex items-center gap-2">
            <select
              value={filterState.cost}
              onChange={(e) => setFilterState((prev) => ({ ...prev, cost: e.target.value as CostLevel | 'all' }))}
              className="bg-black/80 border border-white/[0.08] rounded-xl px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none w-full sm:w-auto"
            >
              <option value="all">Budget: All</option>
              <option value="₱">₱ Budget</option>
              <option value="₱₱">₱₱ Moderate</option>
              <option value="₱₱₱">₱₱₱ Upscale</option>
              <option value="₱₱₱₱">₱₱₱₱ Luxury</option>
            </select>

            <select
              value={filterState.setting}
              onChange={(e) => setFilterState((prev) => ({ ...prev, setting: e.target.value as DateSetting | 'all' }))}
              className="bg-black/80 border border-white/[0.08] rounded-xl px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none w-full sm:w-auto"
            >
              <option value="all">Setting: All</option>
              <option value="indoor">Indoor</option>
              <option value="outdoor">Outdoor</option>
              <option value="home">At Home</option>
            </select>
          </div>
        </div>

      </div>

      {/* Results Header Count */}
      <div className="flex items-center justify-between px-2 text-xs">
        <span className="font-mono uppercase text-zinc-500 tracking-wider text-[11px] sm:text-xs">
          Showing {filteredDates.length} of {dates.length} Dates
        </span>

        {filteredDates.length === 0 && (
          <button
            onClick={() =>
              setFilterState({
                searchQuery: '',
                category: 'all',
                status: 'all',
                cost: 'all',
                setting: 'all',
                favoritesOnly: false,
              })
            }
            className="text-white hover:underline font-semibold text-[11px] sm:text-xs"
          >
            Reset All Filters
          </button>
        )}
      </div>

      {/* Dates Cards Grid */}
      {filteredDates.length > 0 ? (
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <AnimatePresence>
            {filteredDates.map((date) => (
              <DateCard key={date.id} date={date} />
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        /* Empty State */
        <div className="rounded-3xl p-12 text-center border border-white/[0.08] bg-zinc-950/40 backdrop-blur-xl space-y-3">
          <div className="w-12 h-12 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center mx-auto text-zinc-400">
            {dates.length === 0 ? <Sparkles className="w-6 h-6" /> : <Search className="w-6 h-6" />}
          </div>
          <h3 className="text-lg font-bold font-serif text-white">
            {dates.length === 0 ? 'Your Date Checklist is Empty' : 'No matching dates found'}
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            {dates.length === 0
              ? 'Start building your personal date checklist. Add fine dining spots, cozy nights, and romantic adventures.'
              : 'Try adjusting your search query or active category filters.'}
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-white text-black text-xs font-bold shadow-md hover:bg-zinc-200 transition-all"
            >
              + Plan New Date
            </button>
            {dates.length > 0 && (
              <button
                onClick={() => setIsRouletteModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-white/[0.05] text-white border border-white/[0.1] text-xs font-semibold hover:bg-white/[0.1] transition-all"
              >
                Spin Roulette
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
