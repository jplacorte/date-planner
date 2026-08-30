/**
 * Safe date formatting helper to avoid timezone offset shifts and hydration discrepancies.
 */
export function formatDateString(
  dateString?: string,
  options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    weekday: 'short',
  }
): string {
  if (!dateString) return '';
  // If it's YYYY-MM-DD
  const parts = dateString.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      const d = new Date(year, month - 1, day);
      return d.toLocaleDateString('en-US', options);
    }
  }
  
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  return d.toLocaleDateString('en-US', options);
}

/**
 * Formats a 24-hour time string (e.g. "18:30", "09:00") or any time string into a 12-hour format ("6:30 PM", "9:00 AM").
 */
export function formatTimeString(timeStr?: string): string {
  if (!timeStr) return '';
  const trimmed = timeStr.trim();
  if (!trimmed) return '';

  // If already in 12-hour format with AM/PM
  if (/am|pm/i.test(trimmed)) {
    // Normalize format like "6:30pm" -> "6:30 PM"
    const m = trimmed.match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/i);
    if (m) {
      return `${parseInt(m[1], 10)}:${m[2]} ${m[3].toUpperCase()}`;
    }
    return trimmed;
  }

  // Parse HH:mm or HH:mm:ss
  const match = trimmed.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!match) return trimmed;

  let hours = parseInt(match[1], 10);
  const minutes = match[2];

  if (isNaN(hours)) return trimmed;

  const period = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;

  return `${hours}:${minutes} ${period}`;
}

/**
 * Safely parses a date string ("2026-09-01") and any time string ("18:30" or "6:30 PM") into an accurate epoch timestamp.
 */
export function parseDateAndTimeToTimestamp(dateStr?: string, timeStr?: string): number {
  if (!dateStr) return 0;

  let year = new Date().getFullYear();
  let month = 1;
  let day = 1;

  const dateParts = dateStr.split('-');
  if (dateParts.length === 3) {
    year = parseInt(dateParts[0], 10);
    month = parseInt(dateParts[1], 10);
    day = parseInt(dateParts[2], 10);
  } else {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      year = d.getFullYear();
      month = d.getMonth() + 1;
      day = d.getDate();
    }
  }

  let hours = 18; // default 6 PM
  let minutes = 0;

  if (timeStr) {
    const trimmed = timeStr.trim();
    const ampmMatch = trimmed.match(/^(\d{1,2}):(\d{2})\s*(am|pm)?$/i);
    if (ampmMatch) {
      let h = parseInt(ampmMatch[1], 10);
      const m = parseInt(ampmMatch[2], 10);
      const period = ampmMatch[3]?.toLowerCase();

      if (!isNaN(h) && !isNaN(m)) {
        if (period === 'pm' && h < 12) h += 12;
        if (period === 'am' && h === 12) h = 0;
        hours = h;
        minutes = m;
      }
    }
  }

  return new Date(year, month - 1, day, hours, minutes).getTime();
}
