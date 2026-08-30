import { DateIdea, CoupleProfile, MoodTheme } from '../types/date';
import { initialDates, initialCoupleProfile } from '../data/initialDates';

const STORAGE_KEYS = {
  DATES: 'lyca_phillip_dates_v3',
  PROFILE: 'lyca_phillip_profile_v3',
  THEME: 'lyca_phillip_theme_v3',
};

const PREVIOUS_STORAGE_KEYS = [
  'lyca_phillip_dates_v2',
  'lyca_phillip_profile_v2',
  'lyca_phillip_theme_v2',
  'lyca_phillip_dates',
  'lyca_phillip_profile',
  'lyca_phillip_theme',
];

let storeDates: DateIdea[] = initialDates;
let storeProfile: CoupleProfile = initialCoupleProfile;
let storeTheme: MoodTheme = 'dusk';
let initialized = false;

const listeners = new Set<() => void>();

function initFromLocalStorage() {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;
  try {
    // Purge old dummy data versions
    PREVIOUS_STORAGE_KEYS.forEach((oldKey) => {
      try {
        localStorage.removeItem(oldKey);
      } catch {}
    });

    const savedDates = localStorage.getItem(STORAGE_KEYS.DATES);
    if (savedDates) {
      storeDates = JSON.parse(savedDates);
    } else {
      storeDates = initialDates;
    }

    const savedProfile = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      storeProfile = parsed;
    } else {
      storeProfile = initialCoupleProfile;
    }

    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) as MoodTheme;
    if (savedTheme) {
      storeTheme = savedTheme;
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  } catch (e) {
    console.error('Error loading initial storage state:', e);
  }
}

function notify() {
  listeners.forEach((listener) => listener());
}

export const dateStore = {
  subscribe(listener: () => void) {
    initFromLocalStorage();
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  getDates() {
    initFromLocalStorage();
    return storeDates;
  },
  getServerDates() {
    return initialDates;
  },
  setDates(updater: DateIdea[] | ((prev: DateIdea[]) => DateIdea[])) {
    initFromLocalStorage();
    const next = typeof updater === 'function' ? updater(storeDates) : updater;
    storeDates = next;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEYS.DATES, JSON.stringify(next));
      } catch (e) {
        console.error('Failed to save dates:', e);
      }
    }
    notify();
  },
  getProfile() {
    initFromLocalStorage();
    return storeProfile;
  },
  getServerProfile() {
    return initialCoupleProfile;
  },
  setProfile(profile: CoupleProfile) {
    initFromLocalStorage();
    storeProfile = profile;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
      } catch (e) {
        console.error('Failed to save profile:', e);
      }
    }
    notify();
  },
  getTheme() {
    initFromLocalStorage();
    return storeTheme;
  },
  getServerTheme(): MoodTheme {
    return 'dusk';
  },
  setTheme(theme: MoodTheme) {
    initFromLocalStorage();
    storeTheme = theme;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEYS.THEME, theme);
        document.documentElement.setAttribute('data-theme', theme);
      } catch (e) {
        console.error('Failed to save theme:', e);
      }
    }
    notify();
  },
  reset() {
    storeDates = initialDates;
    storeProfile = initialCoupleProfile;
    storeTheme = 'dusk';
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEYS.DATES);
        localStorage.removeItem(STORAGE_KEYS.PROFILE);
        localStorage.removeItem(STORAGE_KEYS.THEME);
        PREVIOUS_STORAGE_KEYS.forEach((oldKey) => localStorage.removeItem(oldKey));
        document.documentElement.setAttribute('data-theme', 'dusk');
      } catch (e) {
        console.error('Failed to clear storage:', e);
      }
    }
    notify();
  },
};
