'use client';

import React from 'react';
import { motion } from 'motion/react';
import { 
  BookHeart, 
  Heart, 
  Utensils, 
  Smile, 
  Music, 
  Camera
} from 'lucide-react';
import { useDateContext } from '../context/DateContext';
import { formatDateString } from '../utils/date';

export default function ScrapbookView() {
  const { dates, setSelectedDate, coupleProfile } = useDateContext();

  const completedDates = dates.filter((d) => d.status === 'completed');

  return (
    <div className="space-y-4 sm:space-y-6">
      
      {/* Scrapbook Header Banner */}
      <div className="relative rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-white/[0.08] bg-zinc-950/70 backdrop-blur-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
        <div className="space-y-1.5 sm:space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-white/10 text-white text-[10px] font-mono uppercase tracking-wider">
            <BookHeart className="w-3.5 h-3.5" />
            <span>Couple Memory Vault</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-bold font-serif text-white tracking-tight">
            {coupleProfile.partner1Name} & {coupleProfile.partner2Name}’s Archive
          </h2>
          <p className="text-xs text-zinc-400 max-w-xl font-light">
            &ldquo;{coupleProfile.relationshipMotto}&rdquo;
          </p>
        </div>

        <div className="flex items-center gap-4 bg-black/60 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl border border-white/[0.08] backdrop-blur-md shrink-0">
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold font-mono text-white">
              {completedDates.length}
            </div>
            <div className="text-[9px] sm:text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">
              Completed
            </div>
          </div>
          <div className="h-5 sm:h-6 w-px bg-white/10" />
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold font-mono text-white">
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
                {/* Polaroid Frame */}
                <div className="bg-zinc-950 border border-white/[0.1] p-3.5 sm:p-4 pb-4 sm:pb-5 rounded-2xl shadow-xl space-y-3 hover:border-white/[0.25] group">
                  
                  {/* Photo Container */}
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-neutral-900 shadow-inner">
                    <img
                      src={date.memoriesPhotos?.[0] || date.coverImage}
                      alt={date.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                    />
                    
                    {/* Top Heart Badge */}
                    <div className="absolute top-2 right-2 p-1.5 rounded-full bg-black/80 backdrop-blur-md">
                      <Heart className="w-3.5 h-3.5 text-white fill-white" />
                    </div>

                    {/* Date Stamp */}
                    {date.scheduledDate && (
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-[10px] font-mono text-zinc-300">
                        {formatDateString(date.scheduledDate, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                    )}
                  </div>

                  {/* Caption Area */}
                  <div className="space-y-1.5 px-0.5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-bold font-serif text-white leading-snug">
                        {date.title}
                      </h3>
                      {date.actualCost && (
                        <span className="text-xs font-mono font-bold text-white shrink-0">
                          ₱{date.actualCost.toLocaleString()}
                        </span>
                      )}
                    </div>

                    {date.bestMoments?.photoCaption ? (
                      <p className="text-xs italic text-zinc-400 font-serif">
                        &ldquo;{date.bestMoments.photoCaption}&rdquo;
                      </p>
                    ) : (
                      <p className="text-xs text-zinc-400 line-clamp-2">
                        {date.memoryNotes || date.subtitle}
                      </p>
                    )}

                    {/* Highlights */}
                    <div className="pt-1.5 flex flex-wrap gap-1">
                      {date.bestMoments?.favoriteDish && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 text-[10px] font-mono border border-white/[0.06]">
                          <Utensils className="w-2.5 h-2.5" />
                          <span className="max-w-[110px] truncate">{date.bestMoments.favoriteDish}</span>
                        </span>
                      )}

                      {date.bestMoments?.funniestMoment && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 text-[10px] font-mono border border-white/[0.06]">
                          <Smile className="w-2.5 h-2.5" />
                          <span className="max-w-[110px] truncate">{date.bestMoments.funniestMoment}</span>
                        </span>
                      )}

                      {date.bestMoments?.favoriteSong && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 text-[10px] font-mono border border-white/[0.06]">
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
          <h3 className="text-base sm:text-lg font-bold font-serif text-white">
            Scrapbook Vault Ready
          </h3>
          <p className="text-xs text-zinc-500 max-w-md mx-auto">
            Completed date checklists will appear here with photos, ratings, and memories.
          </p>
        </div>
      )}

    </div>
  );
}
