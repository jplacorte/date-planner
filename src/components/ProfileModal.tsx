'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Heart, Calendar, Sparkles } from 'lucide-react';
import { useDateContext } from '../context/DateContext';

export default function ProfileModal() {
  const { isProfileModalOpen, setIsProfileModalOpen, coupleProfile, updateCoupleProfile } = useDateContext();

  const [partner1Name, setPartner1Name] = useState(coupleProfile.partner1Name);
  const [partner2Name, setPartner2Name] = useState(coupleProfile.partner2Name);
  const [anniversaryDate, setAnniversaryDate] = useState(coupleProfile.anniversaryDate);
  const [relationshipMotto, setRelationshipMotto] = useState(coupleProfile.relationshipMotto);

  if (!isProfileModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCoupleProfile({
      ...coupleProfile,
      partner1Name: partner1Name.trim() || 'Partner 1',
      partner2Name: partner2Name.trim() || 'Partner 2',
      anniversaryDate: anniversaryDate || '2023-04-15',
      relationshipMotto: relationshipMotto.trim() || 'Every day with you is my favorite adventure.',
    });
    setIsProfileModalOpen(false);
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-lg overscroll-contain"
        data-lenis-prevent
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          className="relative w-full max-w-md rounded-3xl overflow-hidden bg-zinc-950 border border-white/[0.1] shadow-2xl p-6 sm:p-7 space-y-5 max-h-[88vh] overflow-y-auto overscroll-contain my-auto"
          data-lenis-prevent
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-white text-black">
                <Heart className="w-4 h-4 fill-black" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-serif text-white">
                  Couple Profile
                </h3>
                <p className="text-xs text-zinc-400">
                  Personalize names, anniversary, and story.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsProfileModalOpen(false)}
              className="p-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            
            {/* Names */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Partner 1</label>
                <input
                  type="text"
                  required
                  value={partner1Name}
                  onChange={(e) => setPartner1Name(e.target.value)}
                  className="w-full bg-black border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Partner 2</label>
                <input
                  type="text"
                  required
                  value={partner2Name}
                  onChange={(e) => setPartner2Name(e.target.value)}
                  className="w-full bg-black border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white"
                />
              </div>
            </div>

            {/* Anniversary Date */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                Anniversary Date
              </label>
              <input
                type="date"
                value={anniversaryDate}
                onChange={(e) => setAnniversaryDate(e.target.value)}
                className="w-full bg-black border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white"
              />
            </div>

            {/* Relationship Motto */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
                Relationship Motto
              </label>
              <textarea
                rows={2}
                value={relationshipMotto}
                onChange={(e) => setRelationshipMotto(e.target.value)}
                className="w-full bg-black border border-white/[0.1] rounded-xl p-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs shadow-lg transition-all"
            >
              Save Profile
            </button>
          </form>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
