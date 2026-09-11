/**
 * Small hand-rolled validation helpers.
 *
 * Kept dependency-free on purpose: the shapes here are fixed and narrow, and
 * the data crosses a trust boundary, so fewer third-party packages in the path
 * is the safer trade.
 *
 * Every helper is *coercing and clamping* rather than throwing, because the
 * sync payload is a whole user database. Rejecting the entire upload over one
 * malformed field would be worse than storing a sanitised version of it.
 */

/** Truncates to `maxLength` and strips control characters. */
export function safeString(value: unknown, maxLength: number): string {
  if (typeof value !== 'string') return '';
  return stripControlCharacters(value).slice(0, maxLength);
}

export function optionalString(
  value: unknown,
  maxLength: number
): string | undefined {
  if (typeof value !== 'string') return undefined;
  const cleaned = stripControlCharacters(value).slice(0, maxLength);
  return cleaned.length > 0 ? cleaned : undefined;
}

/**
 * Removes C0/C1 control characters, keeping tab, newline and carriage return so
 * multi-line note fields survive intact.
 */
function stripControlCharacters(value: string): string {
  return value.replace(
    /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g,
    ''
  );
}

export function boundedNumber(
  value: unknown,
  min: number,
  max: number
): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined;
  return Math.min(max, Math.max(min, value));
}

export function asBoolean(value: unknown): boolean {
  return value === true;
}

/** Narrows an arbitrary value to one of `allowed`, falling back to `fallback`. */
export function oneOf<T extends string>(
  value: unknown,
  allowed: readonly T[],
  fallback: T
): T {
  return typeof value === 'string' &&
    (allowed as readonly string[]).includes(value)
    ? (value as T)
    : fallback;
}

export function optionalOneOf<T extends string>(
  value: unknown,
  allowed: readonly T[]
): T | undefined {
  return typeof value === 'string' &&
    (allowed as readonly string[]).includes(value)
    ? (value as T)
    : undefined;
}

/** Maps an array through `mapper`, capping length and dropping non-arrays. */
export function boundedArray<T>(
  value: unknown,
  maxLength: number,
  mapper: (item: unknown, index: number) => T | null
): T[] {
  if (!Array.isArray(value)) return [];
  const result: T[] = [];
  for (const item of value.slice(0, maxLength)) {
    const mapped = mapper(item, result.length);
    if (mapped !== null) result.push(mapped);
  }
  return result;
}

/** Schemes safe to place in an `<img src>` or an anchor `href`. */
const SAFE_URL_SCHEMES = new Set(['http:', 'https:']);

/**
 * Accepts https/http URLs and inline image data URLs, rejecting everything
 * else. This is what keeps `javascript:`, `vbscript:` and `data:text/html`
 * payloads out of stored records that later end up in DOM attributes.
 */
export function safeImageUrl(value: unknown, maxLength = 5_000_000): string {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > maxLength) return '';

  if (trimmed.startsWith('data:')) {
    return /^data:image\/(png|jpeg|jpg|webp|gif|avif);base64,[A-Za-z0-9+/=]+$/i.test(
      trimmed
    )
      ? trimmed
      : '';
  }

  try {
    const parsed = new URL(trimmed);
    return SAFE_URL_SCHEMES.has(parsed.protocol) ? trimmed : '';
  } catch {
    return '';
  }
}

/** `YYYY-MM-DD`, or undefined when absent/malformed. */
export function optionalDateString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return undefined;
  return Number.isNaN(Date.parse(trimmed)) ? undefined : trimmed;
}

/** ISO-8601 timestamp, or undefined. */
export function optionalIsoString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim().slice(0, 40);
  if (trimmed.length === 0) return undefined;
  return Number.isNaN(Date.parse(trimmed)) ? undefined : trimmed;
}

/** `HH:mm`, `H:mm`, or a 12-hour variant such as `6:30 PM`. */
export function optionalTimeString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return /^\d{1,2}:\d{2}(:\d{2})?(\s*[AaPp][Mm])?$/.test(trimmed)
    ? trimmed
    : undefined;
}

/** Treats a value as a plain object, or an empty one. */
export function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}
