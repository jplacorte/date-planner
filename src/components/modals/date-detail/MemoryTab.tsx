'use client';

import { useState } from 'react';
import {
  BookHeart,
  Camera,
  ChevronLeft,
  ChevronRight,
  Eye,
  Folder,
  FolderCheck,
  FolderPlus,
  GripVertical,
  Loader2,
  Music,
  Pencil,
  Smile,
  Star,
  Trash2,
  Upload,
  Utensils,
} from 'lucide-react';

import { useDateContext } from '@/context/DateContext';
import { createCloudinaryDateFolder } from '@/lib/media/upload-client';
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
  const { updateDateCoverImage, updateDate } = useDateContext();

  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [folderSuccess, setFolderSuccess] = useState(false);
  const [isEditingFolder, setIsEditingFolder] = useState(false);
  const [customFolderName, setCustomFolderName] = useState(
    selectedDate.cloudinaryFolder || selectedDate.title || ''
  );

  const activeFolderName =
    selectedDate.cloudinaryFolder || selectedDate.title || 'General';

  const handleCreateFolder = async () => {
    setIsCreatingFolder(true);
    try {
      const res = await createCloudinaryDateFolder(
        activeFolderName,
        selectedDate.title
      );
      setFolderSuccess(true);
      showSavedFeedback(`Folder "${res.folder}" verified in Cloudinary ✓`);
    } catch (error) {
      const msg =
        error instanceof Error
          ? error.message
          : 'Could not create Cloudinary folder.';
      showSavedFeedback(msg);
    } finally {
      setIsCreatingFolder(false);
    }
  };

  const handleSaveCustomFolder = () => {
    const trimmed = customFolderName.trim();
    if (trimmed) {
      updateDate({
        ...selectedDate,
        cloudinaryFolder: trimmed,
      });
      setIsEditingFolder(false);
      showSavedFeedback(`Date album folder set to "${trimmed}" ✓`);
    }
  };

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
      {/* The "Afterglow" prompt: a frictionless invitation, not a task */}
      <div className="space-y-2">
        <label className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400 flex items-center gap-1.5">
          <BookHeart className="w-3.5 h-3.5 text-accent-soft" />
          How was the night?
        </label>
        <textarea
          rows={4}
          placeholder="What you want to remember about this one..."
          value={memoryNotes}
          onChange={(e) => setMemoryNotes(e.target.value)}
          onBlur={handleAutoSaveMemory}
          className="w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 text-sm font-display italic leading-relaxed text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-accent/45 transition-colors"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-400 flex items-center gap-1.5">
            <Utensils className="w-3.5 h-3.5 text-accent-soft" />
            Best thing we ate
          </label>
          <input
            type="text"
            placeholder="e.g., Tagliatelle al Tartufo"
            value={favoriteDish}
            onChange={(e) => setFavoriteDish(e.target.value)}
            onBlur={handleAutoSaveMemory}
            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-accent/45 transition-colors"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-400 flex items-center gap-1.5">
            <Smile className="w-3.5 h-3.5 text-accent-soft" />
            Funniest moment
          </label>
          <input
            type="text"
            placeholder="e.g., The fort collapsed!"
            value={funniestMoment}
            onChange={(e) => setFunniestMoment(e.target.value)}
            onBlur={handleAutoSaveMemory}
            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-accent/45 transition-colors"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-400 flex items-center gap-1.5">
            <Music className="w-3.5 h-3.5 text-accent-soft" />
            Song of the night
          </label>
          <input
            type="text"
            placeholder="e.g., La Vie En Rose"
            value={favoriteSong}
            onChange={(e) => setFavoriteSong(e.target.value)}
            onBlur={handleAutoSaveMemory}
            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-accent/45 transition-colors"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-400 flex items-center gap-1.5">
            <span className="text-xs font-mono font-bold text-zinc-400">₱</span>
            What it cost
          </label>
          <input
            type="number"
            placeholder="e.g., 2500"
            value={actualCost !== undefined ? actualCost : ''}
            onChange={(e) => setActualCost(e.target.value ? Number(e.target.value) : undefined)}
            onBlur={handleAutoSaveMemory}
            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-accent/45 transition-colors"
          />
        </div>
      </div>

      {/* Photo Gallery & Upload Section */}
      {/* Photo Gallery & Upload Section */}
      <div className="bg-white/[0.03] p-4 rounded-2xl border border-white/[0.07] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-400 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-accent-soft" />
              Photos ({selectedDate.memoriesPhotos?.length || 0})
            </label>
            <p className="text-[11px] text-zinc-500 font-light mt-0.5">
              Drag photos or use the ◀ ▶ buttons to arrange. The <span className="text-white font-medium">#1 photo</span> is featured in your Polaroid Scrapbook!
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => memoryFileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-accent/20 text-zinc-200 hover:text-accent-soft text-xs font-medium border border-white/15 transition-all shadow-sm"
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

        {/* Cloudinary Organized Album Folder Bar */}
        <div className="p-3 rounded-xl bg-black/60 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-start sm:items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-zinc-300 shrink-0">
              {folderSuccess ? (
                <FolderCheck className="w-4 h-4 text-white" />
              ) : (
                <Folder className="w-4 h-4 text-zinc-400" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-semibold text-zinc-300">Cloudinary Album:</span>
                {!isEditingFolder ? (
                  <div className="flex items-center gap-1">
                    <code className="px-1.5 py-0.5 rounded bg-white/5 font-mono text-[11px] text-white border border-white/10 truncate max-w-[200px] sm:max-w-[260px]">
                      Date-planner/{activeFolderName}
                    </code>
                    <button
                      type="button"
                      onClick={() => setIsEditingFolder(true)}
                      className="p-1 text-zinc-500 hover:text-zinc-200 transition-colors"
                      title="Rename folder for this date"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 mt-1 sm:mt-0">
                    <span className="font-mono text-[11px] text-zinc-500">Date-planner/</span>
                    <input
                      type="text"
                      value={customFolderName}
                      onChange={(e) => setCustomFolderName(e.target.value)}
                      className="px-2 py-0.5 rounded bg-zinc-900 border border-white/20 text-white font-mono text-[11px] focus:outline-none focus:border-white"
                      placeholder="folder-name"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleSaveCustomFolder}
                      className="px-2 py-0.5 rounded bg-white text-zinc-950 font-semibold text-[10px] hover:bg-zinc-200"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingFolder(false)}
                      className="px-1.5 py-0.5 rounded bg-transparent text-zinc-400 text-[10px] hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
              <p className="text-[10px] text-zinc-500 mt-0.5">
                Photos for this date are organized into this Cloudinary subfolder automatically.
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <button
              type="button"
              onClick={handleCreateFolder}
              disabled={isCreatingFolder}
              className={`w-full sm:w-auto px-3 py-1.5 rounded-lg font-medium text-[11px] border transition-all flex items-center justify-center gap-1.5 shadow-sm ${
                folderSuccess
                  ? 'bg-white/15 text-white border-white/30 cursor-default'
                  : 'bg-white/5 hover:bg-white/10 text-zinc-200 border-white/10 active:scale-95'
              }`}
            >
              {isCreatingFolder ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : folderSuccess ? (
                <>
                  <FolderCheck className="w-3.5 h-3.5 text-white" />
                  <span>Folder Verified</span>
                </>
              ) : (
                <>
                  <FolderPlus className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Create Cloudinary Folder</span>
                </>
              )}
            </button>
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
                      ? 'border-accent ring-2 ring-accent/50 scale-[1.03]'
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
                        <span className="px-2 py-0.5 rounded-md bg-accent/15 text-accent-soft font-semibold text-[9px] uppercase tracking-wider flex items-center gap-0.5 shadow-md">
                          <Star className="w-2.5 h-2.5 fill-current" />
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
                        className="p-1 rounded-md bg-black/80 hover:bg-accent/20 text-zinc-300 hover:text-accent-soft border border-white/10 transition-all shadow"
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
                            className="px-2 py-1 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 text-[10px] font-bold flex items-center gap-1 shadow"
                            title="Set as #1 Scrapbook Hero"
                          >
                            <Star className="w-3 h-3 fill-current" />
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
                        className="px-2.5 py-0.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-semibold flex items-center gap-1 transition-colors mt-0.5 border border-white/10"
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
                      className="p-1 rounded-md bg-zinc-900 hover:bg-accent/20 text-zinc-300 hover:text-accent-soft disabled:opacity-30 disabled:pointer-events-none border border-white/10 transition-all text-[10px] flex items-center justify-center flex-1"
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
                      className="p-1 rounded-md bg-zinc-900 hover:bg-accent/20 text-zinc-300 hover:text-accent-soft disabled:opacity-30 disabled:pointer-events-none border border-white/10 transition-all text-[10px] flex items-center justify-center flex-1"
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
        className="w-full py-3 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs transition-all shadow-md"
      >
        Save Memories & Update Scrapbook
      </button>
    </form>
  );
}
