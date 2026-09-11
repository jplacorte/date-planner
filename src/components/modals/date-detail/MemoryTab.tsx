'use client';

import {
  BookHeart,
  Camera,
  ChevronLeft,
  ChevronRight,
  Eye,
  GripVertical,
  Music,
  Smile,
  Star,
  Trash2,
  Upload,
  Utensils,
} from 'lucide-react';

import { useDateContext } from '@/context/DateContext';
import GoogleDrivePicker from '@/components/ui/GoogleDrivePicker';
import type { MemoryEditor } from '@/hooks/use-memory-editor';
import type { DateIdea } from '@/types/date';

interface MemoryTabProps {
  selectedDate: DateIdea;
  memory: MemoryEditor;
  onSaved: (message: string) => void;
  onOpenLightbox: (
    photos: string[],
    startIndex?: number,
    title?: string,
    caption?: string
  ) => void;
}

/** Post-date scrapbook: notes, best moments, cost and arranged photos. */
export default function MemoryTab({
  selectedDate,
  memory,
  onSaved,
  onOpenLightbox,
}: MemoryTabProps) {
  const { updateDateCoverImage } = useDateContext();

  const {
    memoryNotes,
    setMemoryNotes,
    favoriteDish,
    setFavoriteDish,
    funniestMoment,
    setFunniestMoment,
    favoriteSong,
    setFavoriteSong,
    photoCaption,
    setPhotoCaption,
    actualCost,
    setActualCost,
    newPhotoUrl,
    setNewPhotoUrl,
    isUploadingMemoryPhoto,
    memoryFileInputRef,
    draggedPhotoIdx,
    dragOverPhotoIdx,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
    handleReorderPhoto,
    handleSetFeaturedPhoto,
    handleRemoveMemoryPhoto,
    handleMemoryFileUpload,
    addPhotoUrl,
    handleAutoSaveMemory,
    handleSaveMemory,
  } = memory;

  const handleOpenLightbox = onOpenLightbox;
  const showSavedFeedback = onSaved;

  return (
    <form onSubmit={handleSaveMemory} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
          <BookHeart className="w-3.5 h-3.5 text-zinc-400" />
          Memory Journal Notes
        </label>
        <textarea
          rows={3}
          placeholder="Write a sweet reflection about this date, how you felt, and funny moments..."
          value={memoryNotes}
          onChange={(e) => setMemoryNotes(e.target.value)}
          onBlur={handleAutoSaveMemory}
          className="w-full bg-black border border-white/[0.1] rounded-xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
            <Utensils className="w-3.5 h-3.5 text-zinc-400" />
            Favorite Food
          </label>
          <input
            type="text"
            placeholder="e.g., Tagliatelle al Tartufo"
            value={favoriteDish}
            onChange={(e) => setFavoriteDish(e.target.value)}
            onBlur={handleAutoSaveMemory}
            className="w-full bg-black border border-white/[0.1] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-white"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
            <Smile className="w-3.5 h-3.5 text-zinc-400" />
            Funniest Moment
          </label>
          <input
            type="text"
            placeholder="e.g., The fort collapsed!"
            value={funniestMoment}
            onChange={(e) => setFunniestMoment(e.target.value)}
            onBlur={handleAutoSaveMemory}
            className="w-full bg-black border border-white/[0.1] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-white"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
            <Music className="w-3.5 h-3.5 text-zinc-400" />
            Soundtrack Song
          </label>
          <input
            type="text"
            placeholder="e.g., La Vie En Rose"
            value={favoriteSong}
            onChange={(e) => setFavoriteSong(e.target.value)}
            onBlur={handleAutoSaveMemory}
            className="w-full bg-black border border-white/[0.1] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-white"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
            <span className="text-xs font-mono font-bold text-zinc-400">₱</span>
            Amount Spent (₱ PHP)
          </label>
          <input
            type="number"
            placeholder="e.g., 2500"
            value={actualCost !== undefined ? actualCost : ''}
            onChange={(e) => setActualCost(e.target.value ? Number(e.target.value) : undefined)}
            onBlur={handleAutoSaveMemory}
            className="w-full bg-black border border-white/[0.1] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-white"
          />
        </div>
      </div>

      {/* Photo Gallery & Upload Section */}
      {/* Photo Gallery & Upload Section */}
      <div className="bg-black p-4 rounded-2xl border border-white/[0.08] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-zinc-400" />
              Scrapbook Photo Gallery ({selectedDate.memoriesPhotos?.length || 0})
            </label>
            <p className="text-[11px] text-zinc-500 font-light mt-0.5">
              Drag photos or use the ◀ ▶ buttons to arrange. The <span className="text-white font-medium">#1 photo</span> is featured in your Polaroid Scrapbook!
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => memoryFileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white text-white hover:text-black text-xs font-medium border border-white/15 transition-all shadow-sm"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isUploadingMemoryPhoto ? 'Uploading...' : 'Upload Photo'}</span>
            </button>
            <input
              ref={memoryFileInputRef}
              type="file"
              accept="image/*"
              onChange={handleMemoryFileUpload}
              className="hidden"
            />
          </div>
        </div>

        {/* Photo Arranger Grid */}
        {selectedDate.memoriesPhotos && selectedDate.memoriesPhotos.length > 0 ? (
          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-3 pt-1">
            {selectedDate.memoriesPhotos.map((photo, idx, arr) => {
              const isFirst = idx === 0;
              const isLast = idx === arr.length - 1;
              const isDragging = draggedPhotoIdx === idx;
              const isDragOver = dragOverPhotoIdx === idx;

              return (
                <div
                  key={`${photo}-${idx}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDragEnd={handleDragEnd}
                  onDrop={(e) => handleDrop(e, idx)}
                  className={`group relative rounded-2xl overflow-hidden border transition-all duration-200 cursor-grab active:cursor-grabbing bg-zinc-950 flex flex-col ${
                    isDragOver
                      ? 'border-rose-400 ring-2 ring-rose-400/50 scale-[1.03]'
                      : isDragging
                      ? 'opacity-40 border-dashed border-white/40'
                      : isFirst
                      ? 'border-white/40 ring-1 ring-white/20'
                      : 'border-white/[0.12] hover:border-white/30'
                  }`}
                >
                  {/* Photo Aspect Frame */}
                  <div 
                    className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-900 cursor-pointer"
                    onClick={() => handleOpenLightbox(selectedDate.memoriesPhotos || [], idx, selectedDate.title, selectedDate.bestMoments?.photoCaption)}
                  >
                    <img
                      src={photo}
                      alt={`Memory photo ${idx + 1}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />

                    {/* Order Badge */}
                    <div className="absolute top-1.5 left-1.5 flex items-center gap-1 z-10 pointer-events-none">
                      {isFirst ? (
                        <span className="px-2 py-0.5 rounded-md bg-white text-black font-bold text-[9px] uppercase tracking-wider flex items-center gap-0.5 shadow-md">
                          <Star className="w-2.5 h-2.5 fill-black" />
                          <span>#1 Featured</span>
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-zinc-300 font-mono text-[10px] font-bold border border-white/10 shadow">
                          #{idx + 1}
                        </span>
                      )}
                    </div>

                    {/* Drag Handle & Preview Icon */}
                    <div className="absolute top-1.5 right-1.5 flex items-center gap-1 z-10 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenLightbox(selectedDate.memoriesPhotos || [], idx, selectedDate.title, selectedDate.bestMoments?.photoCaption);
                        }}
                        className="p-1 rounded-md bg-black/80 hover:bg-white text-zinc-300 hover:text-black border border-white/10 transition-all shadow"
                        title="Enlarge preview"
                      >
                        <Eye className="w-3 h-3" />
                      </button>
                      <div 
                        className="p-1 rounded-md bg-black/80 text-zinc-400 border border-white/10"
                        title="Drag to rearrange"
                      >
                        <GripVertical className="w-3 h-3" />
                      </div>
                    </div>

                    {/* Hover Quick Actions Overlay */}
                    <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2 z-20">
                      <div className="flex items-center gap-1">
                        {!isFirst && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSetFeaturedPhoto(idx);
                            }}
                            className="px-2 py-1 rounded-lg bg-white hover:bg-zinc-200 text-black text-[10px] font-bold flex items-center gap-1 shadow"
                            title="Set as #1 Scrapbook Hero"
                          >
                            <Star className="w-3 h-3 fill-black" />
                            <span>Make #1</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateDateCoverImage(selectedDate.id, photo);
                            showSavedFeedback('Set as main cover image ✓');
                          }}
                          className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] font-semibold border border-white/20 shadow"
                          title="Set as date cover banner"
                        >
                          Cover
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveMemoryPhoto(idx);
                        }}
                        className="px-2.5 py-0.5 rounded-md bg-rose-600/90 hover:bg-rose-600 text-white text-[10px] font-semibold flex items-center gap-1 transition-colors mt-0.5"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>

                  {/* Position Controls Bar (Tactile Left/Right Arrows for Mobile & Touch) */}
                  <div className="px-2 py-1.5 bg-black/90 border-t border-white/[0.08] flex items-center justify-between gap-1">
                    <button
                      type="button"
                      disabled={isFirst}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReorderPhoto(idx, idx - 1);
                      }}
                      className="p-1 rounded-md bg-zinc-900 hover:bg-white text-zinc-300 hover:text-black disabled:opacity-30 disabled:pointer-events-none border border-white/10 transition-all text-[10px] flex items-center justify-center flex-1"
                      title="Move left"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>

                    <span className="text-[10px] font-mono text-zinc-500 font-semibold px-1">
                      {idx + 1}/{arr.length}
                    </span>

                    <button
                      type="button"
                      disabled={isLast}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReorderPhoto(idx, idx + 1);
                      }}
                      className="p-1 rounded-md bg-zinc-900 hover:bg-white text-zinc-300 hover:text-black disabled:opacity-30 disabled:pointer-events-none border border-white/10 transition-all text-[10px] flex items-center justify-center flex-1"
                      title="Move right"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-6 text-center border border-dashed border-white/10 rounded-xl bg-zinc-950/50 space-y-1.5">
            <Camera className="w-5 h-5 text-zinc-500 mx-auto" />
            <p className="text-xs text-zinc-400 font-medium">No scrapbook photos added yet</p>
            <p className="text-[11px] text-zinc-600">Upload photos above or select from Google Drive below.</p>
          </div>
        )}

        {/* Google Drive Folder Gallery */}
        <div className="pt-1">
          <GoogleDrivePicker
            onSelectPhoto={(url) =>
              addPhotoUrl(url, 'Photo added from Google Drive ✓')
            }
          />
        </div>

        {/* Caption & URL input */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-white/[0.06]">
          <input
            type="text"
            placeholder="Polaroid Caption / Quote (e.g. Lost in laughter)"
            value={photoCaption}
            onChange={(e) => setPhotoCaption(e.target.value)}
            onBlur={handleAutoSaveMemory}
            className="w-full bg-zinc-900 border border-white/[0.08] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
          />
          <input
            type="url"
            placeholder="Or paste photo URL..."
            value={newPhotoUrl}
            onChange={(e) => setNewPhotoUrl(e.target.value)}
            className="w-full bg-zinc-900 border border-white/[0.08] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full py-3 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs transition-all shadow-md"
      >
        Save Memories & Update Scrapbook
      </button>
    </form>
  );
}
