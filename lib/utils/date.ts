/**
 * Date utility functions with system timezone support
 */

import { format, formatDistanceToNow, type Locale } from 'date-fns';
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';
import { enUS, de } from 'date-fns/locale';

// Default timezone (fallback)
const DEFAULT_TIMEZONE = 'Europe/Zurich';

// Cached settings
let cachedTimezone: string = DEFAULT_TIMEZONE;
let cachedDateFormat: string = 'DD/MM/YYYY';

// Map locale strings to date-fns locales
const localeMap: Record<string, Locale> = {
  en: enUS,
  de: de,
};

/**
 * Get date-fns locale object from locale string
 */
function getDateFnsLocale(locale: string): Locale {
  return localeMap[locale] || enUS;
}

/**
 * Fetch the system timezone from settings
 * Caches the result for performance
 */
export async function getSystemTimezone(): Promise<string> {
  if (cachedTimezone && cachedTimezone !== DEFAULT_TIMEZONE) {
    return cachedTimezone;
  }

  try {
    let settings;
    if (typeof window === 'undefined') {
      // Server-side: Use the server action directly
      const { getSystemSettings } = await import('@/lib/actions/settings');
      settings = await getSystemSettings();
    } else {
      // Client-side: Fetch from the API
      const response = await fetch('/api/settings');
      if (response.ok) {
        settings = await response.json();
      }
    }

    if (settings) {
      cachedTimezone = settings.timeZone || DEFAULT_TIMEZONE;
      cachedDateFormat = settings.dateFormat || 'DD/MM/YYYY';
      return cachedTimezone;
    }
  } catch (error) {
    console.warn('Failed to fetch system settings, using default:', error);
  }

  return DEFAULT_TIMEZONE;
}

/**
 * Get the system date format from settings
 * Caches the result for performance
 */
export async function getSystemDateFormat(): Promise<string> {
  if (cachedDateFormat && cachedDateFormat !== 'DD/MM/YYYY') {
    return cachedDateFormat;
  }

  await getSystemTimezone(); // This fetches both
  return cachedDateFormat;
}

/**
 * Get the system timezone synchronously (returns cached value or default)
 */
export function getSystemTimezoneSync(): string {
  return cachedTimezone || DEFAULT_TIMEZONE;
}

/**
 * Initialize the timezone cache (call this on app startup)
 */
export async function initTimezoneCache(): Promise<void> {
  await getSystemTimezone();
}

/**
 * Format a date in system timezone
 */
export function formatDateInTimezone(
  date: Date | string | number,
  formatStr: string,
  timezone?: string
): string {
  const tz = timezone || getSystemTimezoneSync();
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  return formatInTimeZone(dateObj, tz, formatStr);
}

/**
 * Format a date to readable string in system timezone
 */
export function toReadableDate(date: Date | string | number, timezone?: string): string {
  return formatDateInTimezone(date, 'PPp', timezone); // e.g., "Jan 1, 2024, 12:00 PM"
}

/**
 * Format a date to short date string in system timezone with locale support
 */
export function toShortDate(
  date: Date | string | number,
  locale: string = 'en',
  timezone?: string
): string {
  const tz = timezone || getSystemTimezoneSync();
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  const dateFnsLocale = getDateFnsLocale(locale);
  return formatInTimeZone(dateObj, tz, 'PPP', { locale: dateFnsLocale });
}

/**
 * Format a date to time string in system timezone
 */
export function toTime(date: Date | string | number, timezone?: string): string {
  return formatDateInTimezone(date, 'p', timezone); // e.g., "12:00 PM"
}

/**
 * Format relative time (e.g., "2 hours ago") with system timezone and locale support
 */
export function formatRelativeTime(
  date: Date | string | number,
  timezone?: string,
  locale: string = 'en'
): string {
  const tz = timezone || getSystemTimezoneSync();
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  const zonedDate = toZonedTime(dateObj, tz);
  const nowInTimezone = toZonedTime(new Date(), tz);
  const dateFnsLocale = getDateFnsLocale(locale);
  
  return formatDistanceToNow(zonedDate, { 
    addSuffix: true,
    locale: dateFnsLocale
  });
}

/**
 * Format a date with locale support in system timezone
 */
export function formatDateWithLocale(
  date: Date | string | number,
  locale: string,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  },
  timezone?: string
): string {
  const tz = timezone || getSystemTimezoneSync();
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  const zonedDate = toZonedTime(dateObj, tz);
  return zonedDate.toLocaleDateString(locale, options);
}

/**
 * Get current date/time in system timezone
 */
export function nowInTimezone(timezone?: string): Date {
  const tz = timezone || getSystemTimezoneSync();
  return toZonedTime(new Date(), tz);
}

/**
 * Check if a date is today in system timezone
 */
export function isTodayInTimezone(date: Date | string | number, timezone?: string): boolean {
  const tz = timezone || getSystemTimezoneSync();
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  const zonedDate = toZonedTime(dateObj, tz);
  const zonedNow = nowInTimezone(tz);

  return (
    zonedDate.getFullYear() === zonedNow.getFullYear() &&
    zonedDate.getMonth() === zonedNow.getMonth() &&
    zonedDate.getDate() === zonedNow.getDate()
  );
}

// Backwards compatibility aliases (deprecated - use timezone versions above)
export function formatDateInZurich(date: Date | string | number, formatStr: string): string {
  return formatDateInTimezone(date, formatStr);
}

export function formatRelativeTimeZurich(date: Date | string | number): string {
  return formatRelativeTime(date);
}

export function nowInZurich(): Date {
  return nowInTimezone();
}

export function isTodayInZurich(date: Date | string | number): boolean {
  return isTodayInTimezone(date);
}

/**
 * Format date according to system settings
 */
export function formatWithSystemFormat(date: Date | string, dateFormat: string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  switch (dateFormat) {
    case 'MM/DD/YYYY':
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    case 'DD/MM/YYYY':
      return dateObj.toLocaleDateString('en-GB', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    case 'YYYY-MM-DD':
      return dateObj.toISOString().split('T')[0];
    case 'DD MMM YYYY':
      return dateObj.toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'short',
        day: '2-digit'
      });
    case 'MMM DD, YYYY':
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit'
      });
    default:
      return dateObj.toLocaleDateString();
  }
}
