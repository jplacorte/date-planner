'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Sparkles, 
  MapPin, 
  BookHeart, 
  ListChecks, 
  Volume2, 
  VolumeX, 
  Plus, 
  Trophy, 
  Settings, 
  Download, 
  Upload, 
  RotateCcw,
  Music,
  CircleDot,
  Cloud,
  CloudOff,
  RefreshCw
} from 'lucide-react';
import { useDateContext } from '../context/DateContext';
import { MoodTheme, AmbientSound } from '../types/date';

export default function Header() {
  const {
    coupleProfile,
    moodTheme,
    setMoodTheme,
    ambientSound,
    setAmbientSound,
    activeTab,
    setActiveTab,
    setIsCreateModalOpen,
    setIsRouletteModalOpen,
    setIsStatsModalOpen,
    setIsProfileModalOpen,
    exportDataJSON,
    importDataJSON,
    resetToDefaults,
    syncStatus,
    syncToDrive,
    syncFromDrive,
  } = useDateContext();

  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [isAudioMenuOpen, setIsAudioMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const moodOptions: { id: MoodTheme; label: string; sub: string }[] = [
    { id: 'dusk', label: 'Pure Noir', sub: 'Deepest charcoal & deep black' },
    { id: 'candlelight', label: 'Obsidian Black', sub: 'High-contrast pure monochrome' },
    { id: 'midnight', label: 'Graphite Midnight', sub: 'Subtle slate dark ambiance' },
    { id: 'dawn', label: 'Alabaster Dawn', sub: 'Soft silver noir ambiance' },
  ];

  const soundOptions: { id: AmbientSound; label: string }[] = [
    { id: 'none', label: 'Sound Muted' },
    { id: 'lofi', label: 'Romantic Lo-fi' },
    { id: 'rain', label: 'Gentle Rain' },
    { id: 'fireplace', label: 'Warm Fireplace' },
    { id: 'acoustic', label: 'Acoustic Strings' },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importDataJSON(content);
        if (success) {
          alert('Backup successfully imported.');
        } else {
          alert('Invalid backup format.');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-2xl border-b border-white/[0.08] bg-black/80 transition-colors duration-500 pt-safe">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-20 gap-2 sm:gap-4">
          
          {/* Brand & Couple Profile */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="group flex items-center gap-2 sm:gap-3 text-left p-1 rounded-2xl hover:bg-white/[0.04] transition-all min-w-0"
            >
              <div className="relative shrink-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white border border-white/20 p-[1px] shadow-sm flex items-center justify-center">
                  <div className="w-full h-full rounded-[10px] bg-black flex items-center justify-center">
                    <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white fill-white transition-transform group-hover:scale-110" />
                  </div>
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-white border-2 border-black" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs sm:text-base font-bold font-serif tracking-tight text-white group-hover:text-zinc-300 transition-colors truncate max-w-[120px] xs:max-w-[160px] sm:max-w-none">
                    {coupleProfile.partner1Name} & {coupleProfile.partner2Name}
                  </span>
                  <span className="text-[8px] sm:text-[10px] uppercase font-mono px-1 sm:px-1.5 py-0.5 rounded bg-white/10 text-zinc-300 shrink-0 hidden xs:inline">
                    Dates
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-zinc-400 font-medium truncate hidden sm:block max-w-[180px]">
                  Date Checklist & Romance Archive
                </p>
              </div>
            </button>
          </div>

          {/* Navigation Tabs (Center - Desktop) */}
          <nav className="hidden md:flex items-center p-1 rounded-2xl bg-zinc-950/90 border border-white/[0.08] shrink-0">
            <button
              onClick={() => setActiveTab('checklist')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'checklist'
                  ? 'bg-white text-black shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <ListChecks className="w-3.5 h-3.5 shrink-0" />
              <span>Checklist</span>
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'map'
                  ? 'bg-white text-black shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span>Date Map</span>
            </button>
            <button
              onClick={() => setActiveTab('scrapbook')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'scrapbook'
                  ? 'bg-white text-black shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <BookHeart className="w-3.5 h-3.5 shrink-0" />
              <span>Scrapbook</span>
            </button>
          </nav>

          {/* Right Action Tools */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            
            {/* Roulette Spark Generator (Desktop / Tablet) */}
            <button
              onClick={() => setIsRouletteModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white border border-white/[0.12] text-xs font-medium transition-all group whitespace-nowrap shrink-0"
              title="Date Spark Roulette"
            >
              <Sparkles className="w-3.5 h-3.5 text-zinc-300 group-hover:rotate-12 transition-transform shrink-0" />
              <span className="hidden xl:inline">Spark Roulette</span>
              <span className="inline xl:hidden">Roulette</span>
            </button>

            {/* Plan Custom Date Button */}
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-white text-black hover:bg-zinc-200 text-xs font-bold transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap shrink-0 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />
              <span className="hidden xs:inline">New Date</span>
            </button>

            {/* Achievements Trophy */}
            <button
              onClick={() => setIsStatsModalOpen(true)}
              className="p-1.5 sm:p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/[0.08] transition-all shrink-0"
              title="Milestone Badges & Stats"
            >
              <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            </button>

            {/* Ambient Atmosphere Selector */}
            <div className="relative shrink-0 hidden sm:block">
              <button
                onClick={() => {
                  setIsThemeMenuOpen(!isThemeMenuOpen);
                  setIsAudioMenuOpen(false);
                  setIsSettingsOpen(false);
                }}
                className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/[0.08] transition-all"
                title="Atmosphere Theme"
              >
                <CircleDot className="w-4 h-4 shrink-0" />
              </button>

              <AnimatePresence>
                {isThemeMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-52 rounded-2xl bg-zinc-950 border border-white/15 shadow-2xl p-1.5 z-50 max-w-[calc(100vw-2rem)]"
                  >
                    <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                      Monochrome Theme
                    </div>
                    {moodOptions.map((opt) => {
                      const active = moodTheme === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => {
                            setMoodTheme(opt.id);
                            setIsThemeMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-all ${
                            active
                              ? 'bg-white text-black font-bold'
                              : 'text-zinc-300 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          <div>
                            <div className="font-semibold">{opt.label}</div>
                            <div className={`text-[10px] ${active ? 'text-zinc-700' : 'text-zinc-500'}`}>
                              {opt.sub}
                            </div>
                          </div>
                          {active && <span className="w-1.5 h-1.5 rounded-full bg-black" />}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Ambient Soundscapes Toggle */}
            <div className="relative shrink-0 hidden sm:block">
              <button
                onClick={() => {
                  setIsAudioMenuOpen(!isAudioMenuOpen);
                  setIsThemeMenuOpen(false);
                  setIsSettingsOpen(false);
                }}
                className={`p-2 rounded-xl border transition-all ${
                  ambientSound !== 'none'
                    ? 'bg-white text-black border-white'
                    : 'bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border-white/[0.08]'
                }`}
                title="Ambient Soundscapes"
              >
                {ambientSound === 'none' ? (
                  <VolumeX className="w-4 h-4 shrink-0" />
                ) : (
                  <Volume2 className="w-4 h-4 shrink-0" />
                )}
              </button>

              <AnimatePresence>
                {isAudioMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-48 rounded-2xl bg-zinc-950 border border-white/15 shadow-2xl p-1.5 z-50 max-w-[calc(100vw-2rem)]"
                  >
                    <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-zinc-500 flex items-center justify-between">
                      <span>Soundscape</span>
                      <Music className="w-3 h-3 text-zinc-400" />
                    </div>
                    {soundOptions.map((opt) => {
                      const active = ambientSound === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => {
                            setAmbientSound(opt.id);
                            setIsAudioMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                            active
                              ? 'bg-white text-black font-semibold'
                              : 'text-zinc-300 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          <span>{opt.label}</span>
                          {active && <span className="w-1.5 h-1.5 rounded-full bg-black" />}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Google Drive Cloud Sync Button (Desktop) */}
            <button
              onClick={() => syncToDrive()}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 sm:py-2 rounded-xl text-xs font-medium border transition-all whitespace-nowrap shrink-0 ${
                syncStatus === 'syncing'
                  ? 'bg-white/10 text-white border-white/20'
                  : syncStatus === 'synced'
                  ? 'bg-white/[0.04] text-zinc-300 hover:text-white hover:bg-white/[0.08] border-white/[0.08]'
                  : 'bg-red-500/10 text-red-300 border-red-500/20'
              }`}
              title={
                syncStatus === 'syncing'
                  ? 'Syncing with Google Drive...'
                  : syncStatus === 'synced'
                  ? 'Synced with Google Drive'
                  : 'Sync with Google Drive'
              }
            >
              {syncStatus === 'syncing' ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-white shrink-0" />
              ) : syncStatus === 'error' ? (
                <CloudOff className="w-3.5 h-3.5 text-red-400 shrink-0" />
              ) : (
                <Cloud className="w-3.5 h-3.5 text-white shrink-0" />
              )}
              <span className="hidden xl:inline text-[11px] whitespace-nowrap">
                {syncStatus === 'syncing' ? 'Syncing...' : 'Drive Sync'}
              </span>
            </button>

            {/* Settings & Tools Menu */}
            <div className="relative shrink-0">
              <button
                onClick={() => {
                  setIsSettingsOpen(!isSettingsOpen);
                  setIsThemeMenuOpen(false);
                  setIsAudioMenuOpen(false);
                }}
                className="p-1.5 sm:p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/[0.08] transition-all"
                title="Settings & Data"
              >
                <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              </button>

              <AnimatePresence>
                {isSettingsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-60 rounded-2xl bg-zinc-950 border border-white/15 shadow-2xl p-2 z-50 space-y-1 max-w-[calc(100vw-1.5rem)]"
                  >
                    {/* Mobile Only: Theme & Sound quick toggles */}
                    <div className="sm:hidden pb-1 space-y-1 border-b border-white/10">
                      <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                        Atmosphere & Audio
                      </div>
                      <div className="grid grid-cols-2 gap-1 px-1">
                        <button
                          onClick={() => {
                            const themeKeys: MoodTheme[] = ['dusk', 'candlelight', 'midnight', 'dawn'];
                            const next = themeKeys[(themeKeys.indexOf(moodTheme) + 1) % themeKeys.length];
                            setMoodTheme(next);
                          }}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900 text-[11px] text-zinc-300 border border-white/5"
                        >
                          <CircleDot className="w-3 h-3 text-white" />
                          <span className="capitalize truncate">{moodTheme}</span>
                        </button>

                        <button
                          onClick={() => {
                            const sounds: AmbientSound[] = ['none', 'lofi', 'rain', 'fireplace', 'acoustic'];
                            const next = sounds[(sounds.indexOf(ambientSound) + 1) % sounds.length];
                            setAmbientSound(next);
                          }}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900 text-[11px] text-zinc-300 border border-white/5"
                        >
                          {ambientSound === 'none' ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3 text-white" />}
                          <span className="capitalize truncate">{ambientSound === 'none' ? 'Mute' : ambientSound}</span>
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        syncToDrive();
                        setIsSettingsOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-zinc-200 hover:bg-white/5 hover:text-white transition-all"
                    >
                      <span className="flex items-center gap-2">
                        <Cloud className="w-3.5 h-3.5 text-white" />
                        <span>Sync Now (Google Drive)</span>
                      </span>
                    </button>
                    <button
                      onClick={() => {
                        syncFromDrive();
                        setIsSettingsOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-zinc-200 hover:bg-white/5 hover:text-white transition-all"
                    >
                      <span className="flex items-center gap-2">
                        <RefreshCw className="w-3.5 h-3.5 text-white" />
                        <span>Pull from Google Drive</span>
                      </span>
                    </button>
                    <div className="h-px bg-white/10 my-1" />
                    <button
                      onClick={() => {
                        exportDataJSON();
                        setIsSettingsOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-zinc-300 hover:bg-white/5 hover:text-white transition-all"
                    >
                      <Download className="w-3.5 h-3.5 text-zinc-300" />
                      <span>Export Backup (JSON)</span>
                    </button>
                    <button
                      onClick={() => {
                        fileInputRef.current?.click();
                        setIsSettingsOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-zinc-300 hover:bg-white/5 hover:text-white transition-all"
                    >
                      <Upload className="w-3.5 h-3.5 text-zinc-300" />
                      <span>Import Backup (JSON)</span>
                    </button>
                    <div className="h-px bg-white/10 my-1" />
                    <button
                      onClick={() => {
                        if (confirm('Reset all date checklist items to default?')) {
                          resetToDefaults();
                        }
                        setIsSettingsOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:bg-white/5 hover:text-white transition-all"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset to Curated Defaults</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".json"
              className="hidden"
            />
          </div>
        </div>

      </div>
    </header>
  );
}
