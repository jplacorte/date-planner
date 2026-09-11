'use client';

import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Camera,
  Edit3,
  Eye,
  Heart,
  Image as ImageIcon,
  Upload,
  X,
} from 'lucide-react';

import { useDateContext } from '@/context/DateContext';
import CloudPhotoPicker from '@/components/ui/CloudPhotoPicker';
import { PRESET_COVER_IMAGES } from '@/lib/media/preset-images';
import { normalizeGoogleDriveImageUrl } from '@/lib/media/image';
import { uploadImageFile } from '@/lib/media/upload-client';
import type { DateDetailsEditor } from '@/hooks/use-date-details-editor';
import type { DateIdea } from '@/types/date';

interface CoverBannerProps {
  selectedDate: DateIdea;
  editor: DateDetailsEditor;
  onClose: () => void;
  onSaved: (message: string) => void;
  onOpenLightbox: (
    photos: string[],
    startIndex?: number,
    title?: string,
    caption?: string
  ) => void;
}

/** Cover image, title editor and the top action row of the detail modal. */
export default function CoverBanner({
  selectedDate,
  editor,
  onClose,
  onSaved,
  onOpenLightbox,
}: CoverBannerProps) {
  const { toggleFavorite, updateDateCoverImage } = useDateContext();

  const {
    isEditingTitle,
    setIsEditingTitle,
    editedTitle,
    setEditedTitle,
    editedSubtitle,
    setEditedSubtitle,
    handleOpenEditTitle,
    handleSaveTitle,
  } = editor;

  const [isChangingCover, setIsChangingCover] = useState(false);
  const [customCoverUrl, setCustomCoverUrl] = useState('');
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  const presetImages = PRESET_COVER_IMAGES;
  const handleOpenLightbox = onOpenLightbox;

  const handleCoverFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingCover(true);
    try {
      const folder = selectedDate.cloudinaryFolder || selectedDate.title;
      const uploaded = await uploadImageFile(file, {
        folder,
        dateTitle: selectedDate.title,
      });
      updateDateCoverImage(selectedDate.id, uploaded.url);
      setIsChangingCover(false);
      onSaved('Cover photo updated ✓');
    } catch (error) {
      console.error('Failed to upload cover photo:', error);
      onSaved('Could not upload that image. Try another one.');
    } finally {
      setIsUploadingCover(false);
      // Allow re-selecting the same file after a failure.
      event.target.value = '';
    }
  };

  const handleApplyCoverUrl = (url: string) => {
    if (!url.trim()) return;
    updateDateCoverImage(
      selectedDate.id,
      normalizeGoogleDriveImageUrl(url.trim())
    );
    setCustomCoverUrl('');
    setIsChangingCover(false);
    onSaved('Cover photo updated ✓');
  };

  return (
<div className="relative h-48 sm:h-64 w-full shrink-0">
  <img
    src={selectedDate.coverImage}
    alt={selectedDate.title}
    className="w-full h-full object-cover"
  />
  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-black/40" />

  {/* Mobile Sheet Drag Indicator Bar */}
  <div className="absolute top-2 inset-x-0 sm:hidden flex justify-center z-20">
    <div className="w-10 h-1 bg-white/30 rounded-full" />
  </div>

  {/* Top Close, Favorite & Cover Change Actions */}
  <div className="absolute top-3 sm:top-4 left-3 sm:left-4 right-3 sm:right-4 flex items-center justify-between z-10">
    <button
      onClick={() => toggleFavorite(selectedDate.id)}
      className="p-1.5 sm:p-2 rounded-full bg-black/80 backdrop-blur-md border border-white/[0.1] text-white hover:text-zinc-300 transition-colors"
      title="Favorite Date"
    >
      <Heart
        className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
          selectedDate.isFavorite ? 'text-white fill-white' : 'text-white'
        }`}
      />
    </button>

    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => handleOpenLightbox([selectedDate.coverImage, ...(selectedDate.memoriesPhotos || [])], 0, selectedDate.title, selectedDate.subtitle)}
        className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-white/[0.15] text-white text-[11px] sm:text-xs font-medium hover:bg-accent/20 hover:text-accent-soft transition-all shadow-md"
        title="View Full Cover Photo"
      >
        <Eye className="w-3.5 h-3.5" />
        <span>View Photo</span>
      </button>

      <button
        onClick={() => setIsChangingCover(!isChangingCover)}
        className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-white/[0.15] text-white text-[11px] sm:text-xs font-medium hover:bg-accent/20 hover:text-accent-soft transition-all shadow-md"
      >
        <Camera className="w-3.5 h-3.5" />
        <span>Change Photo</span>
      </button>

      <button
        onClick={onClose}
        className="p-1.5 sm:p-2 rounded-full bg-black/80 backdrop-blur-md border border-white/[0.1] text-zinc-400 hover:text-white transition-colors"
      >
        <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </button>
    </div>
  </div>

  {/* Change Cover Photo Dropdown Popover */}
  <AnimatePresence>
    {isChangingCover && (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="absolute top-12 inset-x-2 sm:inset-x-auto sm:right-4 z-30 sm:w-80 rounded-2xl bg-zinc-950/95 border border-white/20 p-3.5 sm:p-4 backdrop-blur-2xl shadow-2xl space-y-3 max-w-[calc(100vw-1rem)] sm:max-w-none"
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5" />
            Update Cover Photo
          </span>
          <button
            onClick={() => setIsChangingCover(false)}
            className="text-zinc-400 hover:text-white text-xs"
          >
            ✕
          </button>
        </div>

        {/* Upload button */}
        <div>
          <button
            type="button"
            onClick={() => coverFileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-semibold shadow-md transition-all"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{isUploadingCover ? 'Uploading...' : 'Upload from Device'}</span>
          </button>
          <input
            ref={coverFileInputRef}
            type="file"
            accept="image/*"
            onChange={handleCoverFileUpload}
            className="hidden"
          />
        </div>

        {/* Preset Aesthetics */}
        <div className="space-y-1">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">
            Aesthetic Presets
          </span>
          <div className="grid grid-cols-6 gap-1.5">
            {presetImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => handleApplyCoverUrl(img)}
                className="relative h-9 sm:h-10 rounded-lg overflow-hidden border border-white/15 hover:border-white transition-all hover:scale-105"
              >
                <img src={img} alt="Preset" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Cloud Photo Picker (Cloudinary & Google Drive) */}
        <CloudPhotoPicker
          folder={selectedDate.cloudinaryFolder || selectedDate.title}
          onSelectPhoto={(url) => handleApplyCoverUrl(url)}
        />

        {/* URL Input */}
        <div className="flex gap-1.5 pt-1">
          <input
            type="url"
            placeholder="Paste image, Cloudinary, or Drive link..."
            value={customCoverUrl}
            onChange={(e) => setCustomCoverUrl(e.target.value)}
            className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-xl px-2.5 py-1 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-accent/45"
          />
          <button
            type="button"
            onClick={() => handleApplyCoverUrl(customCoverUrl)}
            className="px-3 py-1 rounded-xl bg-white/10 hover:bg-accent/20 text-zinc-200 hover:text-accent-soft text-xs font-bold transition-all border border-white/15"
          >
            Save
          </button>
        </div>
      </motion.div>
    )}
  </AnimatePresence>

  {/* Title & Info on Cover */}
  <div className="absolute bottom-3 sm:bottom-4 left-3.5 sm:left-6 right-3.5 sm:right-6 z-10 space-y-1.5">
    {isEditingTitle ? (
      <form
        onSubmit={handleSaveTitle}
        onClick={(e) => e.stopPropagation()}
        className="space-y-2 bg-black/90 p-3 sm:p-3.5 rounded-2xl border border-white/20 backdrop-blur-xl shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold flex items-center gap-1.5">
            <Edit3 className="w-3 h-3 text-white" />
            Edit Title & Tagline
          </span>
          <button
            type="button"
            onClick={() => {
              setEditedTitle(selectedDate.title);
              setEditedSubtitle(selectedDate.subtitle || '');
              setIsEditingTitle(false);
            }}
            className="text-zinc-400 hover:text-white text-xs p-1"
          >
            ✕
          </button>
        </div>
        <input
          type="text"
          required
          value={editedTitle}
          onChange={(e) => setEditedTitle(e.target.value)}
          placeholder="Date Title *"
          className="w-full bg-zinc-900 border border-white/20 rounded-xl px-3 py-1.5 text-sm font-serif font-bold text-white focus:outline-none focus:border-accent/45"
          autoFocus
        />
        <input
          type="text"
          value={editedSubtitle}
          onChange={(e) => setEditedSubtitle(e.target.value)}
          placeholder="Tagline / Subtitle (optional)"
          className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-1 text-xs text-zinc-200 focus:outline-none focus:border-accent/45"
        />
        <div className="flex justify-end gap-2 pt-0.5">
          <button
            type="button"
            onClick={() => {
              setEditedTitle(selectedDate.title);
              setEditedSubtitle(selectedDate.subtitle || '');
              setIsEditingTitle(false);
            }}
            className="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-zinc-300 text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-1 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-semibold"
          >
            Save
          </button>
        </div>
      </form>
    ) : (
      <>
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="px-2 py-0.5 rounded-full bg-white text-zinc-950 text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.12em]">
            {selectedDate.category}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-black/80 border border-white/[0.1] text-white font-mono text-[10px] sm:text-xs font-bold">
            {selectedDate.estimatedCost}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-black/80 border border-white/[0.1] text-zinc-300 text-[10px] sm:text-xs">
            {selectedDate.duration}
          </span>
        </div>

        <div className="flex items-start justify-between gap-2 group/title">
          <div className="space-y-0.5 flex-1 min-w-0">
            <h2 className="text-lg xs:text-xl sm:text-3xl font-bold font-serif text-white leading-snug break-words">
              {selectedDate.title}
            </h2>
            <p className="text-xs text-zinc-400 font-light line-clamp-1">
              {selectedDate.subtitle}
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenEditTitle}
            className="p-1.5 px-2.5 rounded-xl bg-black/80 hover:bg-accent/20 text-zinc-300 hover:text-accent-soft border border-white/15 transition-all shadow-md shrink-0 flex items-center gap-1 text-[11px] font-semibold"
            title="Edit Date Title"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span className="text-[10px] font-medium">Edit Title</span>
          </button>
        </div>
      </>
    )}
  </div>
</div>
  );
}
