/**
 * Locale storage utilities for i18n
 * Handles cookie-based locale persistence and retrieval
 */

export const DEFAULT_LOCALE = 'en' as const;
export const SUPPORTED_LOCALES = ['en', 'de'] as const;
export type Locale = typeof SUPPORTED_LOCALES[number];

export const LOCALE_COOKIE_NAME = 'NEXT_LOCALE';
export const LOCALE_COOKIE_MAX_AGE = 31536000; // 1 year in seconds

/**
 * Get the current locale from cookies
 * Falls back to DEFAULT_LOCALE if no cookie is set
 */
export function getLocale(cookieStore: any): Locale {
  if (!cookieStore) {
    return DEFAULT_LOCALE;
  }

  const cookieValue = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
  if (cookieValue && SUPPORTED_LOCALES.includes(cookieValue as Locale)) {
    return cookieValue as Locale;
  }

  return DEFAULT_LOCALE;
}

/**
 * Set the locale cookie
 * @param locale - The locale to set
 * @param cookieStore - RequestCookies object to set the cookie on
 */
export function setLocaleCookie(
  locale: Locale,
  cookieStore: any
): void {
  if (!cookieStore) {
    return;
  }

  cookieStore.set(LOCALE_COOKIE_NAME, locale, {
    maxAge: LOCALE_COOKIE_MAX_AGE,
    path: '/',
    sameSite: 'lax'
  });
}

/**
 * Check if a locale is supported
 */
export function isSupportedLocale(locale: string): locale is Locale {
  return SUPPORTED_LOCALES.includes(locale as Locale);
}

/**
 * Get locale info for display
 */
export interface LocaleInfo {
  code: Locale;
  name: string;
  flag: string;
}

export const LOCALE_INFO: Record<Locale, LocaleInfo> = {
  en: { code: 'en', name: 'English', flag: '🇬🇧' },
  de: { code: 'de', name: 'Deutsch', flag: '🇩🇪' }
};

/**
 * Get all available locales with their info
 */
export function getAvailableLocales(): LocaleInfo[] {
  return SUPPORTED_LOCALES.map((code) => LOCALE_INFO[code]);
}
