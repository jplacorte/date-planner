'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  BookHeart, 
  Heart, 
  Utensils, 
  Smile, 
  Music, 
  Camera
} from 'lucide-react';
import { useDateContext } from '@/context/DateContext';
import { formatDateString } from '@/lib/date/format';
import PhotoLightboxModal from '@/components/modals/PhotoLightboxModal';

export default function ScrapbookView() {
  const { dates, setSelectedDate, coupleProfile } = useDateContext();

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxPhotos, setLightboxPhotos] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxTitle, setLightboxTitle] = useState('');
  const [lightboxCaption, setLightboxCaption] = useState<string | undefined>();

  const handleOpenPhotoLightbox = (photos: string[], startIndex: number = 0, title?: string, caption?: string) => {
    setLightboxPhotos(photos);
    setLightboxIndex(startIndex);
    setLightboxTitle(title || '');
    setLightboxCaption(caption);
    setLightboxOpen(true);
  };

  const completedDates = dates.filter((d) => d.status === 'completed');

  return (
    <div className="space-y-4 sm:space-y-6">
      
      {/* Scrapbook Header Banner — Editorial Exhibition Plate */}
      <div className="relative rounded-2xl sm:rounded-3xl p-5 sm:p-10 border border-white/[0.1] bg-black/80 backdrop-blur-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/15 text-white font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.25em]">
            <BookHeart className="w-3.5 h-3.5" />
            <span>ARCHIVE // CONTACT SHEETS</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-normal text-white tracking-tight">
            {coupleProfile.partner1Name} <span className="italic font-light opacity-80">&</span> {coupleProfile.partner2Name}
          </h2>
          <p className="text-sm text-neutral-300 max-w-xl font-serif italic">
            &ldquo;{coupleProfile.relationshipMotto}&rdquo;
          </p>
        </div>

        <div className="flex items-center gap-4 bg-neutral-950/90 px-5 py-3 rounded-2xl border border-white/[0.12] backdrop-blur-md shrink-0 font-mono">
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-serif text-white">
              {completedDates.length}
            </div>
            <div className="text-[9px] uppercase tracking-[0.2em] text-neutral-400 mt-0.5">
              Lived
            </div>
          </div>
          <div className="h-6 w-px bg-white/15" />
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-serif text-white">
              {completedDates.reduce((acc, d) => acc + (d.memoriesPhotos?.length || 1), 0)}
            </div>
            <div className="text-[9px] uppercase tracking-[0.2em] text-neutral-400 mt-0.5">
              Prints
            </div>
          </div>
        </div>
      </div>

      {/* Art Monograph Photo Plates Grid */}
      {completedDates.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 pt-4">
          {completedDates.map((date, idx) => {
            const rotations = ['rotate-1', '-rotate-1', 'rotate-0'];
            const rot = rotations[idx % rotations.length];

            return (
              <motion.div
                key={date.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ scale: 1.02, rotate: 0 }}
                onClick={() => setSelectedDate(date)}
                className={`cursor-pointer transition-all duration-300 ${rot}`}
              >
                {/* Monograph Plate Mount — Bright Ivory print plate set on deep dark ground */}
                <div className="bg-[#faf8f5] text-[#08080a] p-4 sm:p-5 pb-6 sm:pb-7 rounded-2xl shadow-[0_16px_40px_-12px_rgba(0,0,0,0.85)] border border-white/10 space-y-3.5 group">
                  
                  {/* Photo Container */}
                  <div 
                    className="relative aspect-[4/3] rounded-lg overflow-hidden bg-neutral-900 border border-black/10 group/photo cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      const allPhotos = date.memoriesPhotos && date.memoriesPhotos.length > 0 ? date.memoriesPhotos : [date.coverImage];
                      handleOpenPhotoLightbox(allPhotos, 0, date.title, date.bestMoments?.photoCaption);
                    }}
                  >
                    <img
                      src={date.memoriesPhotos?.[0] || date.coverImage}
                      alt={date.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                    />
                    
                    {/* Top Badges */}
                    <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                      {date.memoriesPhotos && date.memoriesPhotos.length > 1 ? (
                        <div className="px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md text-[9px] font-mono uppercase tracking-wider text-white flex items-center gap-1.5 border border-white/15 shadow">
                          <Camera className="w-3 h-3" />
                          <span>{date.memoriesPhotos.length} prints</span>
                        </div>
                      ) : (
                        <span />
                      )}

                      <div className="p-1.5 rounded-full bg-black/80 backdrop-blur-md shadow">
                        <Heart className="w-3.5 h-3.5 text-white fill-white" />
                      </div>
                    </div>

                    {/* Date Stamp */}
                    {date.scheduledDate && (
                      <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded bg-black/80 backdrop-blur-md text-[9px] font-mono uppercase tracking-wider text-neutral-200">
                        {formatDateString(date.scheduledDate, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                    )}
                  </div>

                  {/* Multi-Photo Preview Strip */}
                  {date.memoriesPhotos && date.memoriesPhotos.length > 1 && (
                    <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pt-0.5">
                      {date.memoriesPhotos.map((p, pIdx) => (
                        <button
                          key={pIdx}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenPhotoLightbox(date.memoriesPhotos || [date.coverImage], pIdx, date.title, date.bestMoments?.photoCaption);
                          }}
                          className={`relative w-9 h-9 rounded-md overflow-hidden shrink-0 border transition-all ${
                            pIdx === 0 ? 'border-black ring-1 ring-black/40' : 'border-black/15 opacity-70 hover:opacity-100 hover:scale-105'
                          }`}
                        >
                          <img src={p} alt={`Thumb ${pIdx + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Caption & Monograph Metadata */}
                  <div className="space-y-2 px-0.5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-base sm:text-lg font-serif font-semibold text-[#08080a] leading-tight">
                        {date.title}
                      </h3>
                      {date.actualCost && (
                        <span className="text-xs font-mono text-neutral-600 shrink-0 font-medium">
                          ₱{date.actualCost.toLocaleString()}
                        </span>
                      )}
                    </div>

                    {date.bestMoments?.photoCaption ? (
                      <p className="text-xs sm:text-[13px] italic text-neutral-800 font-serif leading-relaxed">
                        &ldquo;{date.bestMoments.photoCaption}&rdquo;
                      </p>
                    ) : (
                      <p className="text-xs text-neutral-600 font-sans line-clamp-2 leading-relaxed">
                        {date.memoryNotes || date.subtitle}
                      </p>
                    )}

                    {/* Highlights Row */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-1 font-mono text-[9px] uppercase tracking-wider">
                      {date.bestMoments?.favoriteDish && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-black/[0.06] text-neutral-800">
                          <Utensils className="w-2.5 h-2.5" />
                          <span className="max-w-[120px] truncate">{date.bestMoments.favoriteDish}</span>
                        </span>
                      )}

                      {date.bestMoments?.funniestMoment && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-black/[0.06] text-neutral-800">
                          <Smile className="w-2.5 h-2.5" />
                          <span className="max-w-[120px] truncate">{date.bestMoments.funniestMoment}</span>
                        </span>
                      )}

                      {date.bestMoments?.favoriteSong && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-black/[0.06] text-neutral-800">
                          <Music className="w-2.5 h-2.5" />
                          <span className="max-w-[120px] truncate">{date.bestMoments.favoriteSong}</span>
                        </span>
                      )}
                    </div>

                  </div>

                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="rounded-3xl p-10 sm:p-16 text-center border border-white/[0.1] bg-black/80 backdrop-blur-xl space-y-4">
          <div className="w-12 h-12 rounded-full bg-white/[0.05] border border-white/[0.12] flex items-center justify-center mx-auto text-neutral-400">
            <Camera className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl sm:text-2xl font-serif text-white">
            Archive Blank // No Prints Inscribed
          </h3>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-md mx-auto leading-relaxed font-serif italic">
            &ldquo;Once a rendezvous is marked as lived, it will be mounted here as a physical gallery contact plate with its prints, memories, and moments.&rdquo;
          </p>
        </div>
      )}

      {/* Universal Photo Lightbox Modal */}
      <PhotoLightboxModal
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        photos={lightboxPhotos}
        initialIndex={lightboxIndex}
        title={lightboxTitle}
        caption={lightboxCaption}
      />

    </div>
  );
}
