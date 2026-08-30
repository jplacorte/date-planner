import { DateIdea, CoupleProfile, AchievementBadge } from '../types/date';

export const initialCoupleProfile: CoupleProfile = {
  partner1Name: 'Lyca',
  partner2Name: 'Phillip',
  anniversaryDate: '',
  relationshipMotto: 'Collecting moments, discovering places, and loving every step together.',
  avatar1: '',
  avatar2: '',
};

export const initialAchievementBadges: AchievementBadge[] = [
  {
    id: 'first-date',
    title: 'First Spark',
    description: 'Check off your very first date together',
    icon: '✨',
    unlocked: false,
    progress: 0,
    maxProgress: 1,
  },
  {
    id: 'five-dates',
    title: 'Romantic Connoisseurs',
    description: 'Complete 5 memorable date experiences',
    icon: '💖',
    unlocked: false,
    progress: 0,
    maxProgress: 5,
  },
  {
    id: 'ten-dates',
    title: 'Chapter of Milestones',
    description: 'Complete 10 dream dates on your checklist',
    icon: '👑',
    unlocked: false,
    progress: 0,
    maxProgress: 10,
  },
  {
    id: 'foodie-lovers',
    title: 'Michelin Duo',
    description: 'Complete 3 exquisite dining dates',
    icon: '🍷',
    unlocked: false,
    progress: 0,
    maxProgress: 3,
  },
  {
    id: 'outdoor-explorers',
    title: 'Sunset Chasers',
    description: 'Complete 3 outdoor and scenic adventures',
    icon: '🌅',
    unlocked: false,
    progress: 0,
    maxProgress: 3,
  },
  {
    id: 'cozy-masters',
    title: 'Snuggle Champions',
    description: 'Complete 3 cozy at-home romantic dates',
    icon: '🕯️',
    unlocked: false,
    progress: 0,
    maxProgress: 3,
  },
];

export const initialDates: DateIdea[] = [];
