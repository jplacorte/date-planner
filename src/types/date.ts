export type DateCategory = 
  | 'dining' 
  | 'outdoor' 
  | 'creative' 
  | 'nightlife' 
  | 'cozy' 
  | 'adventure';

export type DateStatus = 'wishlist' | 'planned' | 'booked' | 'completed';

export type CostLevel = '₱' | '₱₱' | '₱₱₱' | '₱₱₱₱';

export type TimeOfDay = 'morning' | 'afternoon' | 'sunset' | 'night';

export type DateSetting = 'indoor' | 'outdoor' | 'home';

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  category?: 'prep' | 'outfit' | 'booking' | 'custom';
}

export interface ItineraryStep {
  id: string;
  time: string;
  activity: string;
  location?: string;
  completed: boolean;
  notes?: string;
}

export interface DateRating {
  romance: number;
  fun: number;
  food: number;
  overall: number;
}

export interface DateIdea {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: DateCategory;
  status: DateStatus;
  scheduledDate?: string; // YYYY-MM-DD or ISO
  scheduledTime?: string; // e.g., "19:30"
  coverImage: string;
  galleryImages?: string[];
  locationName: string;
  locationAddress?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  estimatedCost: CostLevel;
  actualCost?: number;
  duration: string;
  vibeTags: string[];
  isFavorite: boolean;
  checklist: ChecklistItem[];
  itinerary: ItineraryStep[];
  memoryNotes?: string;
  bestMoments?: {
    favoriteDish?: string;
    funniestMoment?: string;
    favoriteSong?: string;
    photoCaption?: string;
  };
  memoriesPhotos?: string[];
  completedAt?: string;
  isCustom?: boolean;
  bestTimeOfDay: TimeOfDay;
  setting: DateSetting;
  dressCode?: string;
}

export interface CoupleProfile {
  partner1Name: string;
  partner2Name: string;
  anniversaryDate: string;
  relationshipMotto: string;
  avatar1?: string;
  avatar2?: string;
}

export type MoodTheme = 'dusk' | 'candlelight' | 'midnight' | 'dawn';

export type AmbientSound = 'none' | 'lofi' | 'rain' | 'fireplace' | 'acoustic';

export interface FilterState {
  searchQuery: string;
  category: DateCategory | 'all';
  status: DateStatus | 'all';
  cost: CostLevel | 'all';
  setting: DateSetting | 'all';
  favoritesOnly: boolean;
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
}
