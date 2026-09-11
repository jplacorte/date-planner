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
      
      {/* Scrapbook Header Banner */}
      <div className="relative rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-white/[0.08] bg-zinc-950/70 backdrop-blur-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
        <div className="space-y-1.5 sm:space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-accent/12 text-accent-soft text-[10px] uppercase tracking-[0.16em] font-semibold">
            <BookHeart className="w-3.5 h-3.5" />
            <span>Memory Vault</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-display font-medium text-zinc-50 tracking-tight">
            {coupleProfile.partner1Name} & {coupleProfile.partner2Name}’s Archive
          </h2>
          <p className="text-sm text-zinc-400 max-w-xl font-display italic">
            &ldquo;{coupleProfile.relationshipMotto}&rdquo;
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white/[0.03] px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl border border-white/[0.07] backdrop-blur-md shrink-0">
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-display text-zinc-50">
              {completedDates.length}
            </div>
            <div className="text-[9px] sm:text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">
              Completed
            </div>
          </div>
          <div className="h-5 sm:h-6 w-px bg-white/10" />
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-display text-zinc-50">
              {completedDates.reduce((acc, d) => acc + (d.memoriesPhotos?.length || 1), 0)}
            </div>
            <div className="text-[9px] sm:text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">
              Photos Saved
            </div>
          </div>
        </div>
      </div>

      {/* Polaroid Gallery Grid */}
      {completedDates.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 pt-2">
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
                {/* Polaroid Frame — a cream print pasted onto the dark page */}
                <div className="bg-linen p-3 sm:p-3.5 pb-4 sm:pb-5 rounded-xl shadow-[0_10px_30px_-8px_rgba(0,0,0,0.65)] space-y-3 group">
                  
                  {/* Photo Container */}
                  <div 
                    className="relative aspect-[4/3] rounded-md overflow-hidden bg-zinc-800 group/photo cursor-pointer"
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
                    <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                      {date.memoriesPhotos && date.memoriesPhotos.length > 1 ? (
                        <div className="px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-mono text-zinc-100 flex items-center gap-1 border border-white/10 shadow">
                          <Camera className="w-2.5 h-2.5" />
                          <span>{date.memoriesPhotos.length} photos</span>
                        </div>
                      ) : (
                        <span />
                      )}

                      <div className="p-1.5 rounded-full bg-black/70 backdrop-blur-md shadow">
                        <Heart className="w-3.5 h-3.5 text-accent fill-accent" />
                      </div>
                    </div>

                    {/* Date Stamp */}
                    {date.scheduledDate && (
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-mono text-zinc-300">
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
                    <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-0.5">
                      {date.memoriesPhotos.map((p, pIdx) => (
                        <button
                          key={pIdx}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenPhotoLightbox(date.memoriesPhotos || [date.coverImage], pIdx, date.title, date.bestMoments?.photoCaption);
                          }}
                          className={`relative w-8 h-8 rounded-lg overflow-hidden shrink-0 border transition-all ${
                            pIdx === 0 ? 'border-accent ring-1 ring-accent/40' : 'border-ink/15 opacity-70 hover:opacity-100 hover:scale-105'
                          }`}
                        >
                          <img src={p} alt={`Thumb ${pIdx + 1}`} className="w-full h-full object-cover" />
                          {pIdx === 0 && (
                            <div className="absolute inset-0 bg-accent/10" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Caption Area */}
                  <div className="space-y-1.5 px-0.5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-[15px] font-display font-medium text-ink leading-snug">
                        {date.title}
                      </h3>
                      {date.actualCost && (
                        <span className="text-xs font-mono text-stone shrink-0">
                          ₱{date.actualCost.toLocaleString()}
                        </span>
                      )}
                    </div>

                    {date.bestMoments?.photoCaption ? (
                      <p className="text-[13px] italic text-ink/70 font-display leading-relaxed">
                        &ldquo;{date.bestMoments.photoCaption}&rdquo;
                      </p>
                    ) : (
                      <p className="text-xs text-stone font-light line-clamp-2">
                        {date.memoryNotes || date.subtitle}
                      </p>
                    )}

                    {/* Highlights Row */}
                    <div className="flex items-center gap-2 flex-wrap pt-1">
                      {date.bestMoments?.favoriteDish && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-ink/[0.06] text-stone text-[10px]">
                          <Utensils className="w-2.5 h-2.5" />
                          <span className="max-w-[110px] truncate">{date.bestMoments.favoriteDish}</span>
                        </span>
                      )}

                      {date.bestMoments?.funniestMoment && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-ink/[0.06] text-stone text-[10px]">
                          <Smile className="w-2.5 h-2.5" />
                          <span className="max-w-[110px] truncate">{date.bestMoments.funniestMoment}</span>
                        </span>
                      )}

                      {date.bestMoments?.favoriteSong && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-ink/[0.06] text-stone text-[10px]">
                          <Music className="w-2.5 h-2.5" />
                          <span className="max-w-[110px] truncate">{date.bestMoments.favoriteSong}</span>
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
        <div className="rounded-3xl p-8 sm:p-10 text-center border border-white/[0.08] bg-zinc-950/40 backdrop-blur-xl space-y-3">
          <div className="w-12 h-12 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center mx-auto text-zinc-400">
            <Camera className="w-6 h-6" />
          </div>
          <h3 className="text-lg sm:text-xl font-display text-zinc-50">
            Nothing pasted in yet
          </h3>
          <p className="text-xs text-zinc-500 max-w-md mx-auto leading-relaxed">
            Once a date is marked as lived, it lands here with its photos, notes and the small things worth keeping.
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
