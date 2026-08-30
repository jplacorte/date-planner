'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo, useSyncExternalStore, ReactNode } from 'react';
import confetti from 'canvas-confetti';
import { 
  DateIdea, 
  CoupleProfile, 
  DateStatus, 
  FilterState, 
  MoodTheme, 
  AmbientSound,
  AchievementBadge,
  ItineraryStep
} from '../types/date';
import { initialAchievementBadges } from '../data/initialDates';
import { soundEngine } from '../utils/audio';
import { dateStore } from '../utils/dateStore';
import { formatTimeString } from '../utils/date';
import { 
  SyncStatus, 
  subscribeToSyncStatus, 
  pullFromGoogleDrive, 
  pushToGoogleDrive 
} from '../utils/driveSyncClient';

interface DateContextType {
  dates: DateIdea[];
  coupleProfile: CoupleProfile;
  moodTheme: MoodTheme;
  ambientSound: AmbientSound;
  filterState: FilterState;
  activeTab: 'checklist' | 'map' | 'scrapbook';
  selectedDate: DateIdea | null;
  isCreateModalOpen: boolean;
  isRouletteModalOpen: boolean;
  isStatsModalOpen: boolean;
  isProfileModalOpen: boolean;
  badges: AchievementBadge[];

  // Cloud Sync
  syncStatus: SyncStatus;
  lastSyncedAt?: Date;
  syncError?: string;
  syncToDrive: () => Promise<boolean>;
  syncFromDrive: () => Promise<boolean>;

  // Actions
  setActiveTab: (tab: 'checklist' | 'map' | 'scrapbook') => void;
  setSelectedDate: (date: DateIdea | null) => void;
  setIsCreateModalOpen: (open: boolean) => void;
  setIsRouletteModalOpen: (open: boolean) => void;
  setIsStatsModalOpen: (open: boolean) => void;
  setIsProfileModalOpen: (open: boolean) => void;
  setMoodTheme: (theme: MoodTheme) => void;
  setAmbientSound: (sound: AmbientSound) => void;
  setFilterState: React.Dispatch<React.SetStateAction<FilterState>>;

  // Date Manipulation
  toggleChecklistItem: (dateId: string, itemId: string) => void;
  addChecklistItem: (dateId: string, text: string, category?: 'prep' | 'outfit' | 'booking' | 'custom') => void;
  removeChecklistItem: (dateId: string, itemId: string) => void;
  toggleItineraryStep: (dateId: string, stepId: string) => void;
  addItineraryStep: (dateId: string, step: { time: string; activity: string; location?: string; notes?: string }) => void;
  updateItineraryStep: (dateId: string, stepId: string, updated: Partial<Omit<ItineraryStep, 'id'>>) => void;
  removeItineraryStep: (dateId: string, stepId: string) => void;
  updateDateCoverImage: (dateId: string, coverImage: string) => void;
  toggleFavorite: (dateId: string) => void;
  updateDateStatus: (dateId: string, status: DateStatus, scheduledDate?: string, scheduledTime?: string) => void;
  addDate: (date: DateIdea) => void;
  updateDate: (date: DateIdea) => void;
  deleteDate: (dateId: string) => void;
  saveMemory: (
    dateId: string, 
    memoryNotes: string, 
    bestMoments?: DateIdea['bestMoments'], 
    memoriesPhotos?: string[], 
    actualCost?: number
  ) => void;
  updateCoupleProfile: (profile: CoupleProfile) => void;

  // Data utils
  exportDataJSON: () => void;
  importDataJSON: (jsonStr: string) => boolean;
  resetToDefaults: () => void;
  triggerConfetti: () => void;
}

const DateContext = createContext<DateContextType | undefined>(undefined);

const initialFilters: FilterState = {
  searchQuery: '',
  category: 'all',
  status: 'all',
  cost: 'all',
  setting: 'all',
  favoritesOnly: false,
};

export const DateProvider = ({ children }: { children: ReactNode }) => {
  // Sync state cleanly with external local storage store using React standard useSyncExternalStore
  const dates = useSyncExternalStore(dateStore.subscribe, dateStore.getDates, dateStore.getServerDates);
  const coupleProfile = useSyncExternalStore(dateStore.subscribe, dateStore.getProfile, dateStore.getServerProfile);
  const moodTheme = useSyncExternalStore(dateStore.subscribe, dateStore.getTheme, dateStore.getServerTheme);

  const [ambientSound, setAmbientSoundState] = useState<AmbientSound>('none');
  const [filterState, setFilterState] = useState<FilterState>(initialFilters);
  const [activeTab, setActiveTab] = useState<'checklist' | 'map' | 'scrapbook'>('checklist');

  const [selectedDateId, setSelectedDateId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isRouletteModalOpen, setIsRouletteModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Derived selectedDate
  const selectedDate = useMemo(() => {
    if (!selectedDateId) return null;
    return dates.find((d) => d.id === selectedDateId) || null;
  }, [dates, selectedDateId]);

  // Google Drive Cloud Sync State
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | undefined>(undefined);
  const [syncError, setSyncError] = useState<string | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = subscribeToSyncStatus((status, time, err) => {
      setSyncStatus(status);
      if (time) setLastSyncedAt(time);
      setSyncError(err);
    });

    // Initial sync check from Google Drive on app load
    pullFromGoogleDrive();

    return () => {
      unsubscribe();
    };
  }, []);

  // Debounced auto-save to Google Drive on dates or profile changes
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    const timer = setTimeout(() => {
      pushToGoogleDrive(dates, coupleProfile);
    }, 2500);

    return () => clearTimeout(timer);
  }, [dates, coupleProfile]);

  const syncToDrive = useCallback(async () => {
    return await pushToGoogleDrive(dates, coupleProfile);
  }, [dates, coupleProfile]);

  const syncFromDrive = useCallback(async () => {
    return await pullFromGoogleDrive();
  }, []);

  const setSelectedDate = useCallback((date: DateIdea | null) => {
    setSelectedDateId(date ? date.id : null);
  }, []);

  // Derived badges progression
  const badges = useMemo(() => {
    const completedDates = dates.filter((d) => d.status === 'completed');
    const diningCount = completedDates.filter((d) => d.category === 'dining').length;
    const outdoorCount = completedDates.filter((d) => d.category === 'outdoor').length;
    const cozyCount = completedDates.filter((d) => d.category === 'cozy').length;

    return initialAchievementBadges.map((b) => {
      if (b.id === 'first-date') {
        return { ...b, progress: Math.min(1, completedDates.length), unlocked: completedDates.length >= 1 };
      }
      if (b.id === 'five-dates') {
        return { ...b, progress: Math.min(5, completedDates.length), unlocked: completedDates.length >= 5 };
      }
      if (b.id === 'ten-dates') {
        return { ...b, progress: Math.min(10, completedDates.length), unlocked: completedDates.length >= 10 };
      }
      if (b.id === 'foodie-lovers') {
        return { ...b, progress: Math.min(3, diningCount), unlocked: diningCount >= 3 };
      }
      if (b.id === 'outdoor-explorers') {
        return { ...b, progress: Math.min(3, outdoorCount), unlocked: outdoorCount >= 3 };
      }
      if (b.id === 'cozy-masters') {
        return { ...b, progress: Math.min(3, cozyCount), unlocked: cozyCount >= 3 };
      }
      return b;
    });
  }, [dates]);

  const triggerConfetti = useCallback(() => {
    soundEngine.playCelebrationChime();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#F43F5E', '#FB7185', '#F59E0B', '#A855F7', '#38BDF8'],
    });
  }, []);

  const setMoodTheme = (theme: MoodTheme) => {
    dateStore.setTheme(theme);
    soundEngine.playPopSound();
  };

  const setAmbientSound = (sound: AmbientSound) => {
    setAmbientSoundState(sound);
    if (sound === 'none') {
      soundEngine.stopAmbient();
    } else {
      soundEngine.playAmbient(sound);
    }
  };

  const toggleChecklistItem = (dateId: string, itemId: string) => {
    soundEngine.playCheckmarkSound();
    dateStore.setDates((prev) =>
      prev.map((d) => {
        if (d.id !== dateId) return d;
        const newChecklist = d.checklist.map((item) =>
          item.id === itemId ? { ...item, completed: !item.completed } : item
        );
        const allCompleted = newChecklist.length > 0 && newChecklist.every((item) => item.completed);
        if (allCompleted) {
          triggerConfetti();
        }
        return { ...d, checklist: newChecklist };
      })
    );
  };

  const addChecklistItem = (dateId: string, text: string, category: 'prep' | 'outfit' | 'booking' | 'custom' = 'custom') => {
    if (!text.trim()) return;
    soundEngine.playPopSound();
    const newItem = {
      id: `check-${Date.now()}`,
      text: text.trim(),
      completed: false,
      category,
    };
    dateStore.setDates((prev) =>
      prev.map((d) => (d.id === dateId ? { ...d, checklist: [...d.checklist, newItem] } : d))
    );
  };

  const removeChecklistItem = (dateId: string, itemId: string) => {
    soundEngine.playPopSound();
    dateStore.setDates((prev) =>
      prev.map((d) =>
        d.id === dateId ? { ...d, checklist: d.checklist.filter((i) => i.id !== itemId) } : d
      )
    );
  };

  const toggleItineraryStep = (dateId: string, stepId: string) => {
    soundEngine.playCheckmarkSound();
    dateStore.setDates((prev) =>
      prev.map((d) => {
        if (d.id !== dateId) return d;
        return {
          ...d,
          itinerary: (d.itinerary || []).map((step) =>
            step.id === stepId ? { ...step, completed: !step.completed } : step
          ),
        };
      })
    );
  };

  const addItineraryStep = (
    dateId: string,
    step: { time: string; activity: string; location?: string; notes?: string }
  ) => {
    if (!step.activity.trim()) return;
    soundEngine.playPopSound();
    const newStep: ItineraryStep = {
      id: `it-${Date.now()}`,
      time: formatTimeString(step.time) || '6:00 PM',
      activity: step.activity.trim(),
      location: step.location?.trim() || undefined,
      notes: step.notes?.trim() || undefined,
      completed: false,
    };
    dateStore.setDates((prev) =>
      prev.map((d) => {
        if (d.id !== dateId) return d;
        return {
          ...d,
          itinerary: [...(d.itinerary || []), newStep],
        };
      })
    );
  };

  const updateItineraryStep = (
    dateId: string,
    stepId: string,
    updated: Partial<Omit<ItineraryStep, 'id'>>
  ) => {
    soundEngine.playPopSound();
    dateStore.setDates((prev) =>
      prev.map((d) => {
        if (d.id !== dateId) return d;
        return {
          ...d,
          itinerary: (d.itinerary || []).map((step) =>
            step.id === stepId
              ? {
                  ...step,
                  ...updated,
                  time: updated.time !== undefined ? formatTimeString(updated.time) || step.time : step.time,
                }
              : step
          ),
        };
      })
    );
  };

  const removeItineraryStep = (dateId: string, stepId: string) => {
    soundEngine.playPopSound();
    dateStore.setDates((prev) =>
      prev.map((d) => {
        if (d.id !== dateId) return d;
        return {
          ...d,
          itinerary: (d.itinerary || []).filter((step) => step.id !== stepId),
        };
      })
    );
  };

  const updateDateCoverImage = (dateId: string, coverImage: string) => {
    if (!coverImage) return;
    soundEngine.playPopSound();
    dateStore.setDates((prev) =>
      prev.map((d) => (d.id === dateId ? { ...d, coverImage } : d))
    );
  };

  const toggleFavorite = (dateId: string) => {
    soundEngine.playPopSound();
    dateStore.setDates((prev) =>
      prev.map((d) => (d.id === dateId ? { ...d, isFavorite: !d.isFavorite } : d))
    );
  };

  const updateDateStatus = (dateId: string, status: DateStatus, scheduledDate?: string, scheduledTime?: string) => {
    soundEngine.playPopSound();
    if (status === 'completed') {
      triggerConfetti();
    }
    dateStore.setDates((prev) =>
      prev.map((d) => {
        if (d.id !== dateId) return d;
        return {
          ...d,
          status,
          scheduledDate: scheduledDate !== undefined ? scheduledDate : d.scheduledDate,
          scheduledTime: scheduledTime !== undefined ? scheduledTime : d.scheduledTime,
          completedAt: status === 'completed' && !d.completedAt ? new Date().toISOString() : d.completedAt,
        };
      })
    );
  };

  const addDate = (newDate: DateIdea) => {
    soundEngine.playPopSound();
    triggerConfetti();
    dateStore.setDates((prev) => [newDate, ...prev]);
  };

  const updateDate = (updatedDate: DateIdea) => {
    soundEngine.playPopSound();
    dateStore.setDates((prev) => prev.map((d) => (d.id === updatedDate.id ? updatedDate : d)));
  };

  const deleteDate = (dateId: string) => {
    soundEngine.playPopSound();
    dateStore.setDates((prev) => prev.filter((d) => d.id !== dateId));
    if (selectedDateId === dateId) {
      setSelectedDateId(null);
    }
  };

  const saveMemory = (
    dateId: string,
    memoryNotes: string,
    bestMoments?: DateIdea['bestMoments'],
    memoriesPhotos?: string[],
    actualCost?: number
  ) => {
    soundEngine.playPopSound();
    triggerConfetti();
    dateStore.setDates((prev) =>
      prev.map((d) => {
        if (d.id !== dateId) return d;
        return {
          ...d,
          status: 'completed',
          completedAt: d.completedAt || new Date().toISOString(),
          memoryNotes,
          bestMoments: bestMoments || d.bestMoments,
          memoriesPhotos: memoriesPhotos || d.memoriesPhotos,
          actualCost: actualCost !== undefined ? actualCost : d.actualCost,
        };
      })
    );
  };

  const updateCoupleProfile = (profile: CoupleProfile) => {
    soundEngine.playPopSound();
    dateStore.setProfile(profile);
  };

  const exportDataJSON = () => {
    const exportPayload = {
      dates,
      coupleProfile,
      moodTheme,
      exportedAt: new Date().toISOString(),
      version: '1.0',
    };
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `amour-date-checklist-${coupleProfile.partner1Name}-${coupleProfile.partner2Name}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importDataJSON = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.dates && Array.isArray(parsed.dates)) {
        dateStore.setDates(parsed.dates);
      }
      if (parsed.coupleProfile) {
        dateStore.setProfile(parsed.coupleProfile);
      }
      if (parsed.moodTheme) {
        dateStore.setTheme(parsed.moodTheme);
      }
      triggerConfetti();
      return true;
    } catch (e) {
      console.error('Failed to import JSON backup:', e);
      return false;
    }
  };

  const resetToDefaults = () => {
    soundEngine.playPopSound();
    dateStore.reset();
    triggerConfetti();
  };

  return (
    <DateContext.Provider
      value={{
        dates,
        coupleProfile,
        moodTheme,
        ambientSound,
        filterState,
        activeTab,
        selectedDate,
        isCreateModalOpen,
        isRouletteModalOpen,
        isStatsModalOpen,
        isProfileModalOpen,
        badges,
        syncStatus,
        lastSyncedAt,
        syncError,
        syncToDrive,
        syncFromDrive,
        setActiveTab,
        setSelectedDate,
        setIsCreateModalOpen,
        setIsRouletteModalOpen,
        setIsStatsModalOpen,
        setIsProfileModalOpen,
        setMoodTheme,
        setAmbientSound,
        setFilterState,
        toggleChecklistItem,
        addChecklistItem,
        removeChecklistItem,
        toggleItineraryStep,
        addItineraryStep,
        updateItineraryStep,
        removeItineraryStep,
        updateDateCoverImage,
        toggleFavorite,
        updateDateStatus,
        addDate,
        updateDate,
        deleteDate,
        saveMemory,
        updateCoupleProfile,
        exportDataJSON,
        importDataJSON,
        resetToDefaults,
        triggerConfetti,
      }}
    >
      {children}
    </DateContext.Provider>
  );
};

export const useDateContext = () => {
  const context = useContext(DateContext);
  if (!context) {
    throw new Error('useDateContext must be used within a DateProvider');
  }
  return context;
};
