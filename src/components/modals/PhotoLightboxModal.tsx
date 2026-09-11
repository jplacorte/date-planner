'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Star, 
  Image as ImageIcon, 
  ExternalLink 
} from 'lucide-react';

interface PhotoLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  photos: string[];
  initialIndex?: number;
  title?: string;
  subtitle?: string;
  caption?: string;
  onSetFeatured?: (index: number) => void;
  onSetCover?: (photoUrl: string) => void;
}

function PhotoLightboxModalContent({
  onClose,
  photos,
  initialIndex = 0,
  title,
  subtitle,
  caption,
  onSetFeatured,
  onSetCover,
}: Omit<PhotoLightboxModalProps, 'isOpen'>) {
  const [currentIndex, setCurrentIndex] = useState(
    Math.max(0, Math.min(initialIndex, photos.length - 1))
  );
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const handlePrev = useCallback(() => {
    if (photos.length <= 1) return;
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
  }, [photos.length]);

  const handleNext = useCallback(() => {
    if (photos.length <= 1) return;
    setCurrentIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
  }, [photos.length]);

  // Keyboard navigation (ArrowLeft, ArrowRight, Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrev, handleNext, onClose]);

  // Mobile Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchStartX - touchEndX;

    // Minimum swipe distance of 40px
    if (Math.abs(diffX) > 40) {
      if (diffX > 0) {
        handleNext(); // Swiped left -> next
      } else {
        handlePrev(); // Swiped right -> prev
      }
    }
    setTouchStartX(null);
  };

  const currentPhoto = photos[currentIndex] || photos[0];
  const isFirst = currentIndex === 0;

  return (
    <div 
      className="fixed inset-0 z-[100] flex flex-col items-center justify-between bg-black/95 backdrop-blur-2xl select-none overscroll-contain"
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Floating Control Bar */}
      <div 
        className="w-full px-4 sm:px-6 py-3.5 flex items-center justify-between z-20 bg-gradient-to-b from-black/80 via-black/40 to-transparent"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title & Index Counter */}
        <div className="space-y-0.5 min-w-0 pr-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/15 text-[10px] sm:text-xs font-mono font-bold text-white">
              {currentIndex + 1} / {photos.length}
            </span>
            {isFirst && (
              <span className="px-2 py-0.5 rounded-full bg-white text-black text-[9px] sm:text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow">
                <Star className="w-2.5 h-2.5 fill-black" />
                <span>Featured Hero</span>
              </span>
            )}
          </div>
          {title && (
            <h3 className="text-xs sm:text-sm font-serif font-bold text-white truncate max-w-xs sm:max-w-md">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-[11px] text-zinc-400 font-light truncate max-w-xs sm:max-w-md">
              {subtitle}
            </p>
          )}
        </div>

        {/* Quick Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {onSetFeatured && !isFirst && (
            <button
              type="button"
              onClick={() => {
                onSetFeatured(currentIndex);
                setCurrentIndex(0);
              }}
              className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white text-zinc-300 hover:text-black border border-white/20 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
              title="Promote to #1 Featured Scrapbook Photo"
            >
              <Star className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Make #1</span>
            </button>
          )}

          {onSetCover && (
            <button
              type="button"
              onClick={() => onSetCover(currentPhoto)}
              className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white text-zinc-300 hover:text-black border border-white/20 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
              title="Set as Date Cover Image"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Set Cover</span>
            </button>
          )}

          <a
            href={currentPhoto}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-white/10 hover:bg-white text-zinc-300 hover:text-black border border-white/20 transition-all shadow-sm"
            title="Open full resolution"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="w-4 h-4" />
          </a>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/15 hover:bg-white text-white hover:text-black border border-white/25 transition-all shadow-lg ml-1"
            title="Close viewer (Esc)"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* Main Photo Center Container */}
      <div 
        className="relative flex-1 w-full flex items-center justify-center p-2 sm:p-6 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Previous Arrow Button */}
        {photos.length > 1 && (
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-2 sm:left-6 z-30 p-3 sm:p-4 rounded-full bg-black/60 hover:bg-white text-white hover:text-black border border-white/20 backdrop-blur-md transition-all shadow-2xl group focus:outline-none"
            title="Previous photo (◀)"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:-translate-x-0.5" />
          </button>
        )}

        {/* Current Animated Image */}
        <motion.div
          key={currentPhoto}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="relative max-w-full max-h-full flex items-center justify-center"
        >
          <img
            src={currentPhoto}
            alt={title || `Photo ${currentIndex + 1}`}
            className="max-h-[72vh] sm:max-h-[78vh] max-w-[96vw] sm:max-w-[85vw] object-contain rounded-xl sm:rounded-2xl shadow-2xl border border-white/10 select-none"
          />
        </motion.div>

        {/* Next Arrow Button */}
        {photos.length > 1 && (
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-2 sm:right-6 z-30 p-3 sm:p-4 rounded-full bg-black/60 hover:bg-white text-white hover:text-black border border-white/20 backdrop-blur-md transition-all shadow-2xl group focus:outline-none"
            title="Next photo (▶)"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:translate-x-0.5" />
          </button>
        )}
      </div>

      {/* Bottom Bar: Caption & Miniature Thumbnail Strip */}
      <div 
        className="w-full px-4 sm:px-6 py-3 pb-safe z-20 bg-gradient-to-t from-black via-black/80 to-transparent flex flex-col items-center gap-2.5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Optional Caption Display */}
        {caption && (
          <div className="px-4 py-1.5 rounded-full bg-zinc-900/90 border border-white/15 text-xs text-zinc-200 font-serif italic text-center max-w-xl shadow-lg truncate">
            &ldquo;{caption}&rdquo;
          </div>
        )}

        {/* Miniature Thumbnail Navigation Strip */}
        {photos.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full py-1 px-2 scrollbar-none touch-scroll">
            {photos.map((p, idx) => {
              const isSelected = idx === currentIndex;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden shrink-0 border transition-all ${
                    isSelected
                      ? 'border-white ring-2 ring-white scale-110 shadow-lg'
                      : 'border-white/20 opacity-50 hover:opacity-100 hover:scale-105'
                  }`}
                >
                  <img src={p} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  {idx === 0 && (
                    <div className="absolute top-0.5 left-0.5 bg-black/80 rounded p-0.5">
                      <Star className="w-2 h-2 text-white fill-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function PhotoLightboxModal(props: PhotoLightboxModalProps) {
  if (!props.isOpen || props.photos.length === 0) return null;
  return (
    <AnimatePresence>
      <PhotoLightboxModalContent 
        key={`${props.photos.join(',')}-${props.initialIndex}`} 
        {...props} 
      />
    </AnimatePresence>
  );
}
