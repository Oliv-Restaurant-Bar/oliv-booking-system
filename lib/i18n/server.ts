import { getTranslations } from 'next-intl/server';
import { cookies } from 'next/headers';
import { getLocale, type Locale } from './locale-storage';

/**
 * Get translations for a specific namespace on the server
 * @param namespace - The translation namespace (e.g., 'common', 'booking', 'nav')
 * @returns Translation function
 *
 * @example
 * const t = await getTranslation('booking');
 * t('title') // "Bookings"
 * t('customerName') // "Customer Name"
 */
export async function getTranslation(namespace: string) {
  return await getTranslations(namespace);
}

/**
 * Get common translations on the server
 * Pre-configured for the 'common' namespace
 *
 * @example
 * const t = await getCommonTranslation();
 * t('save') // "Save"
 * t('cancel') // "Cancel"
 */
export async function getCommonTranslation() {
  return await getTranslations('common');
}

/**
 * Get nav translations on the server
 * Pre-configured for the 'nav' namespace
 *
 * @example
 * const t = await getNavTranslation();
 * t('dashboard') // "Dashboard"
 * t('bookings') // "Bookings"
 */
export async function getNavTranslation() {
  return await getTranslations('nav');
}

/**
 * Get booking translations on the server
 * Pre-configured for the 'booking' namespace
 *
 * @example
 * const t = await getBookingTranslation();
 * t('title') // "Bookings"
 * t('customerName') // "Customer Name"
 */
export async function getBookingTranslation() {
  return await getTranslations('booking');
}

/**
 * Get auth translations on the server
 * Pre-configured for the 'auth' namespace
 *
 * @example
 * const t = await getAuthTranslation();
 * t('signIn') // "Sign In"
 * t('email') // "Email"
 */
export async function getAuthTranslation() {
  return await getTranslations('auth');
}

/**
 * Get validation translations on the server
 * Pre-configured for the 'validation' namespace
 *
 * @example
 * const t = await getValidationTranslation();
 * t('required') // "This field is required"
 * t('invalidEmail') // "Invalid email address"
 */
export async function getValidationTranslation() {
  return await getTranslations('validation');
}

/**
 * Get email translations on the server
 * Pre-configured for the 'email' namespace
 *
 * @example
 * const t = await getEmailTranslation();
 * t('bookingConfirmed') // "Booking Confirmed"
 * t('bookingCancelled') // "Booking Cancelled"
 */
export async function getEmailTranslation() {
  return await getTranslations('email');
}

/**
 * Get the current locale on the server side
 */
export async function getServerLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  return getLocale(cookieStore);
}

/**
 * Get messages for a locale on the server side
 */
export async function getServerMessages(locale: Locale) {
  return (await import(`../../messages/${locale}.json`)).default;
}