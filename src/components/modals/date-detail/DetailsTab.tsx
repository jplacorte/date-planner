'use client';

import { Compass, Edit3, ExternalLink, MapPin, Shirt, Sparkles } from 'lucide-react';

import type { DateDetailsEditor } from '@/hooks/use-date-details-editor';
import type {
  CostLevel,
  DateCategory,
  DateIdea,
  DateSetting,
  TimeOfDay,
} from '@/types/date';

interface DetailsTabProps {
  selectedDate: DateIdea;
  editor: DateDetailsEditor;
}

/** Read and edit view for the date's specification fields. */
export default function DetailsTab({ selectedDate, editor }: DetailsTabProps) {
  const {
    isEditingDetails,
    setIsEditingDetails,
    editedTitle,
    setEditedTitle,
    editedSubtitle,
    setEditedSubtitle,
    editedDescription,
    setEditedDescription,
    editedCategory,
    setEditedCategory,
    editedEstimatedCost,
    setEditedEstimatedCost,
    editedDressCode,
    setEditedDressCode,
    editedLocationName,
    setEditedLocationName,
    editedLocationAddress,
    setEditedLocationAddress,
    editedSetting,
    setEditedSetting,
    editedBestTimeOfDay,
    setEditedBestTimeOfDay,
    editedVibeTags,
    setEditedVibeTags,
    handleToggleEditDetails,
    handleSaveDetails,
  } = editor;

  const mapSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    selectedDate.locationAddress || selectedDate.locationName
  )}`;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono uppercase tracking-wider text-zinc-500 font-bold">
          {isEditingDetails ? 'Edit Date Information' : 'Date Specifications & Vibe'}
        </span>
        <button
          type="button"
          onClick={handleToggleEditDetails}
          className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/[0.08] hover:bg-white text-zinc-200 hover:text-black border border-white/10 text-xs font-semibold transition-all shadow-sm"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>{isEditingDetails ? 'Cancel Edit' : 'Edit Information'}</span>
        </button>
      </div>

      {isEditingDetails ? (
        <form onSubmit={handleSaveDetails} className="space-y-4 bg-black p-4 sm:p-5 rounded-2xl border border-white/15 shadow-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Date Title *</label>
              <input
                type="text"
                required
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                placeholder="Date Title"
                className="w-full bg-zinc-900 border border-white/15 rounded-xl px-3 py-2 text-xs font-serif font-bold text-white focus:outline-none focus:border-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Tagline / Subtitle</label>
              <input
                type="text"
                value={editedSubtitle}
                onChange={(e) => setEditedSubtitle(e.target.value)}
                placeholder="Tagline / Subtitle"
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300">Description</label>
            <textarea
              rows={3}
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              placeholder="Detailed overview and what makes this date special..."
              className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-white leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-zinc-400">Category</label>
              <select
                value={editedCategory}
                onChange={(e) => setEditedCategory(e.target.value as DateCategory)}
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
              >
                <option value="dining">Fine Dining</option>
                <option value="outdoor">Outdoor Scenic</option>
                <option value="creative">Art & Craft</option>
                <option value="nightlife">Nightlife</option>
                <option value="cozy">Cozy At Home</option>
                <option value="adventure">Thrill Adventure</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-zinc-400">Budget Level</label>
              <select
                value={editedEstimatedCost}
                onChange={(e) => setEditedEstimatedCost(e.target.value as CostLevel)}
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
              >
                <option value="₱">₱ (Budget)</option>
                <option value="₱₱">₱₱ (Moderate)</option>
                <option value="₱₱₱">₱₱₱ (Elevated)</option>
                <option value="₱₱₱₱">₱₱₱₱ (Splurge)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-zinc-400">Setting</label>
              <select
                value={editedSetting}
                onChange={(e) => setEditedSetting(e.target.value as DateSetting)}
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none capitalize"
              >
                <option value="indoor">Indoor</option>
                <option value="outdoor">Outdoor</option>
                <option value="home">Home</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-zinc-400">Time of Day</label>
              <select
                value={editedBestTimeOfDay}
                onChange={(e) => setEditedBestTimeOfDay(e.target.value as TimeOfDay)}
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none capitalize"
              >
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="sunset">Sunset</option>
                <option value="night">Night</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Location / Venue Name</label>
              <input
                type="text"
                value={editedLocationName}
                onChange={(e) => setEditedLocationName(e.target.value)}
                placeholder="e.g. Spiral at Sofitel"
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Location Address / Area</label>
              <input
                type="text"
                value={editedLocationAddress}
                onChange={(e) => setEditedLocationAddress(e.target.value)}
                placeholder="e.g. CCP Complex, Roxas Blvd, Pasay"
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Dress Code</label>
              <input
                type="text"
                value={editedDressCode}
                onChange={(e) => setEditedDressCode(e.target.value)}
                placeholder="e.g. Cocktail Attire"
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Vibe Tags (comma separated)</label>
              <input
                type="text"
                value={editedVibeTags}
                onChange={(e) => setEditedVibeTags(e.target.value)}
                placeholder="Romantic, Candlelight, Live Jazz"
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={() => setIsEditingDetails(false)}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-zinc-300 text-xs font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-white text-black text-xs font-bold hover:bg-zinc-200 transition-all shadow-md"
            >
              Save Changes
            </button>
          </div>
        </form>
      ) : (
        <>
          <div>
            <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-500 mb-2">
              Overview
            </h4>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-light bg-black p-4 rounded-2xl border border-white/[0.08]">
              {selectedDate.description}
            </p>
          </div>

          {/* Location Box */}
          <div className="bg-black p-4 rounded-2xl border border-white/[0.08] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-zinc-400" />
                  {selectedDate.locationName}
                </h4>
                {selectedDate.locationAddress && (
                  <p className="text-xs text-zinc-400 mt-1">{selectedDate.locationAddress}</p>
                )}
              </div>

              <a
                href={mapSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white text-black text-xs font-bold transition-colors"
              >
                <span>Directions</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-black p-3.5 rounded-2xl border border-white/[0.08] space-y-1">
              <span className="text-[11px] font-medium text-zinc-400 flex items-center gap-1.5">
                <Shirt className="w-3.5 h-3.5 text-zinc-500" />
                Dress Code
              </span>
              <p className="text-xs text-zinc-200">
                {selectedDate.dressCode || 'Smart Casual'}
              </p>
            </div>

            <div className="bg-black p-3.5 rounded-2xl border border-white/[0.08] space-y-1">
              <span className="text-[11px] font-medium text-zinc-400 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-zinc-500" />
                Setting
              </span>
              <p className="text-xs text-zinc-200 capitalize">
                {selectedDate.setting} • {selectedDate.bestTimeOfDay}
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-500 mb-2">
              Vibe Tags
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {selectedDate.vibeTags?.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-xl bg-zinc-900 border border-white/[0.06] text-zinc-300 text-xs flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-zinc-500" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
