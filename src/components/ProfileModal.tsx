'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Heart, Calendar, Sparkles, Cloud, RefreshCw, ExternalLink, CheckCircle2, AlertCircle } from 'lucide-react';
import { useDateContext } from '../context/DateContext';

export default function ProfileModal() {
  const { 
    isProfileModalOpen, 
    setIsProfileModalOpen, 
    coupleProfile, 
    updateCoupleProfile,
    syncStatus,
    lastSyncedAt,
    syncError,
    syncToDrive,
    syncFromDrive,
  } = useDateContext();

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

          {/* Google Drive Cloud Sync Manager */}
          <div className="bg-black/70 p-4 rounded-2xl border border-white/[0.08] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cloud className="w-4 h-4 text-white" />
                <span className="text-xs font-bold text-white">Google Drive Cloud Sync</span>
              </div>
              
              <div className="flex items-center gap-1 text-[11px]">
                {syncStatus === 'syncing' ? (
                  <span className="flex items-center gap-1 text-zinc-300">
                    <RefreshCw className="w-3 h-3 animate-spin text-white" />
                    Syncing...
                  </span>
                ) : syncStatus === 'error' ? (
                  <span className="flex items-center gap-1 text-red-400">
                    <AlertCircle className="w-3 h-3 text-red-400" />
                    Sync Error
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-zinc-400">
                    <CheckCircle2 className="w-3 h-3 text-white" />
                    Cloud Active
                  </span>
                )}
              </div>
            </div>

            <p className="text-[11px] text-zinc-400 font-light leading-relaxed">
              All your dates, checklists, itineraries, and memories are stored as <code className="text-zinc-200 font-mono bg-zinc-900 px-1 py-0.5 rounded">dates_database.json</code> directly inside your shared Google Drive folder.
            </p>

            {lastSyncedAt && (
              <div className="text-[10px] text-zinc-500 font-mono">
                Last Synced: {lastSyncedAt.toLocaleTimeString()}
              </div>
            )}

            {syncError && (
              <div className="text-[10px] text-red-400 font-mono bg-red-950/40 p-2 rounded-lg border border-red-900/40">
                {syncError}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => syncToDrive()}
                disabled={syncStatus === 'syncing'}
                className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/15 transition-all flex items-center justify-center gap-1.5"
              >
                <Cloud className="w-3.5 h-3.5" />
                <span>Sync to Drive</span>
              </button>

              <button
                type="button"
                onClick={() => syncFromDrive()}
                disabled={syncStatus === 'syncing'}
                className="py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold border border-white/10 transition-all flex items-center justify-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                <span>Pull from Drive</span>
              </button>
            </div>

            <div className="pt-1 text-center">
              <a
                href="https://drive.google.com/drive/folders/1x_0YasZi3VXMBd3baL74LA6dhyDbiC78"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[10px] text-zinc-400 hover:text-white transition-colors"
              >
                <span>Open Google Drive Database Folder</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
