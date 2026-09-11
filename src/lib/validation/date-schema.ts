import type {
  ChecklistItem,
  CostLevel,
  CoupleProfile,
  DateCategory,
  DateIdea,
  DateSetting,
  DateStatus,
  ItineraryStep,
  TimeOfDay,
} from '@/types/date';
import {
  asBoolean,
  asRecord,
  boundedArray,
  boundedNumber,
  oneOf,
  optionalDateString,
  optionalIsoString,
  optionalString,
  optionalTimeString,
  safeImageUrl,
  safeString,
} from '@/lib/validation/primitives';

/**
 * Sanitises the client-supplied sync payload before it is persisted.
 *
 * Anything not named here is dropped, so a caller cannot smuggle extra fields
 * into the stored database file, and every string and array is bounded so a
 * single request cannot inflate the file without limit.
 */

export const LIMITS = {
  maxDates: 500,
  maxChecklistItems: 200,
  maxItinerarySteps: 100,
  maxVibeTags: 30,
  maxGalleryImages: 60,
  maxMemoryPhotos: 120,
  shortText: 200,
  mediumText: 1_000,
  longText: 10_000,
  /** Rejected outright above this, before any parsing happens. */
  maxPayloadBytes: 8 * 1024 * 1024,
} as const;

const CATEGORIES: readonly DateCategory[] = [
  'dining',
  'outdoor',
  'creative',
  'nightlife',
  'cozy',
  'adventure',
];
const STATUSES: readonly DateStatus[] = [
  'wishlist',
  'planned',
  'booked',
  'completed',
];
const COST_LEVELS: readonly CostLevel[] = ['₱', '₱₱', '₱₱₱', '₱₱₱₱'];
const TIMES_OF_DAY: readonly TimeOfDay[] = [
  'morning',
  'afternoon',
  'sunset',
  'night',
];
const SETTINGS: readonly DateSetting[] = ['indoor', 'outdoor', 'home'];
const CHECKLIST_CATEGORIES = [
  'prep',
  'outfit',
  'booking',
  'custom',
] as const;

/** IDs are echoed back to clients, so restrict them to an inert character set. */
function safeId(value: unknown, fallbackIndex: number): string {
  if (typeof value !== 'string') return `generated-${fallbackIndex}`;
  const cleaned = value.trim().replace(/[^A-Za-z0-9_-]/g, '').slice(0, 64);
  return cleaned.length > 0 ? cleaned : `generated-${fallbackIndex}`;
}

function parseChecklistItem(raw: unknown, index: number): ChecklistItem | null {
  const item = asRecord(raw);
  const text = safeString(item.text, LIMITS.mediumText);
  if (text.length === 0) return null;

  const category = item.category;
  return {
    id: safeId(item.id, index),
    text,
    completed: asBoolean(item.completed),
    ...(typeof category === 'string' &&
    (CHECKLIST_CATEGORIES as readonly string[]).includes(category)
      ? { category: category as ChecklistItem['category'] }
      : {}),
  };
}

function parseItineraryStep(raw: unknown, index: number): ItineraryStep | null {
  const step = asRecord(raw);
  const activity = safeString(step.activity, LIMITS.mediumText);
  if (activity.length === 0) return null;

  return {
    id: safeId(step.id, index),
    time: safeString(step.time, 40),
    activity,
    location: optionalString(step.location, LIMITS.shortText),
    completed: asBoolean(step.completed),
    notes: optionalString(step.notes, LIMITS.mediumText),
  };
}

function parseCoordinates(raw: unknown): DateIdea['coordinates'] {
  const coords = asRecord(raw);
  const lat = boundedNumber(coords.lat, -90, 90);
  const lng = boundedNumber(coords.lng, -180, 180);
  return lat !== undefined && lng !== undefined ? { lat, lng } : undefined;
}

function parseBestMoments(raw: unknown): DateIdea['bestMoments'] {
  const moments = asRecord(raw);
  const parsed = {
    favoriteDish: optionalString(moments.favoriteDish, LIMITS.mediumText),
    funniestMoment: optionalString(moments.funniestMoment, LIMITS.longText),
    favoriteSong: optionalString(moments.favoriteSong, LIMITS.mediumText),
    photoCaption: optionalString(moments.photoCaption, LIMITS.mediumText),
  };

  return Object.values(parsed).some((value) => value !== undefined)
    ? parsed
    : undefined;
}

function parseImageList(raw: unknown, maxLength: number): string[] {
  return boundedArray(raw, maxLength, (item) => {
    const url = safeImageUrl(item);
    return url.length > 0 ? url : null;
  });
}

export function parseDateIdea(raw: unknown, index: number): DateIdea | null {
  const date = asRecord(raw);
  const title = safeString(date.title, LIMITS.shortText);
  if (title.length === 0) return null;

  return {
    id: safeId(date.id, index),
    title,
    subtitle: safeString(date.subtitle, LIMITS.shortText),
    description: safeString(date.description, LIMITS.longText),
    category: oneOf(date.category, CATEGORIES, 'dining'),
    status: oneOf(date.status, STATUSES, 'wishlist'),
    scheduledDate: optionalDateString(date.scheduledDate),
    scheduledTime: optionalTimeString(date.scheduledTime),
    coverImage: safeImageUrl(date.coverImage),
    galleryImages: parseImageList(date.galleryImages, LIMITS.maxGalleryImages),
    locationName: safeString(date.locationName, LIMITS.shortText),
    locationAddress: optionalString(date.locationAddress, LIMITS.mediumText),
    coordinates: parseCoordinates(date.coordinates),
    estimatedCost: oneOf(date.estimatedCost, COST_LEVELS, '₱₱'),
    actualCost: boundedNumber(date.actualCost, 0, 100_000_000),
    duration: safeString(date.duration, 80),
    vibeTags: boundedArray(date.vibeTags, LIMITS.maxVibeTags, (tag) => {
      const cleaned = safeString(tag, 40);
      return cleaned.length > 0 ? cleaned : null;
    }),
    isFavorite: asBoolean(date.isFavorite),
    checklist: boundedArray(
      date.checklist,
      LIMITS.maxChecklistItems,
      parseChecklistItem
    ),
    itinerary: boundedArray(
      date.itinerary,
      LIMITS.maxItinerarySteps,
      parseItineraryStep
    ),
    memoryNotes: optionalString(date.memoryNotes, LIMITS.longText),
    bestMoments: parseBestMoments(date.bestMoments),
    memoriesPhotos: parseImageList(
      date.memoriesPhotos,
      LIMITS.maxMemoryPhotos
    ),
    completedAt: optionalIsoString(date.completedAt),
    isCustom: asBoolean(date.isCustom),
    bestTimeOfDay: oneOf(date.bestTimeOfDay, TIMES_OF_DAY, 'sunset'),
    setting: oneOf(date.setting, SETTINGS, 'indoor'),
    dressCode: optionalString(date.dressCode, LIMITS.shortText),
  };
}

export function parseCoupleProfile(raw: unknown): CoupleProfile | null {
  if (raw === null || raw === undefined) return null;
  const profile = asRecord(raw);

  return {
    partner1Name: safeString(profile.partner1Name, 80),
    partner2Name: safeString(profile.partner2Name, 80),
    anniversaryDate: optionalDateString(profile.anniversaryDate) ?? '',
    relationshipMotto: safeString(profile.relationshipMotto, LIMITS.mediumText),
    avatar1: safeImageUrl(profile.avatar1) || undefined,
    avatar2: safeImageUrl(profile.avatar2) || undefined,
  };
}

export interface SyncPayload {
  dates: DateIdea[];
  coupleProfile: CoupleProfile | null;
}

/** Validates and sanitises a full `POST /api/drive/sync` body. */
export function parseSyncPayload(raw: unknown): SyncPayload {
  const body = asRecord(raw);
  return {
    dates: boundedArray(body.dates, LIMITS.maxDates, parseDateIdea),
    coupleProfile: parseCoupleProfile(body.coupleProfile),
  };
}
