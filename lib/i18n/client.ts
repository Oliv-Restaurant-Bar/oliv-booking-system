import { useTranslations } from 'next-intl';

/**
 * Hook to get translations for a specific namespace
 * @param namespace - The translation namespace (e.g., 'common', 'booking', 'nav')
 * @returns Translation function
 *
 * @example
 * const t = useTranslation('booking');
 * <h1>{t('title')}</h1> // "Bookings"
 * <p>{t('customerName')}</p> // "Customer Name"
 */
export function useTranslation(namespace: string) {
  return useTranslations(namespace);
}

/**
 * Hook to get common translations
 * Pre-configured for the 'common' namespace
 *
 * @example
 * const t = useCommonTranslation();
 * <button>{t('save')}</button> // "Save"
 * <button>{t('cancel')}</button> // "Cancel"
 */
export function useCommonTranslation() {
  return useTranslations('common');
}

/**
 * Hook to get nav translations
 * Pre-configured for the 'nav' namespace
 *
 * @example
 * const t = useNavTranslation();
 * <a>{t('dashboard')}</a> // "Dashboard"
 * <a>{t('bookings')}</a> // "Bookings"
 */
export function useNavTranslation() {
  return useTranslations('nav');
}

/**
 * Hook to get booking translations
 * Pre-configured for the 'booking' namespace
 *
 * @example
 * const t = useBookingTranslation();
 * <h1>{t('title')}</h1> // "Bookings"
 * <label>{t('customerName')}</label> // "Customer Name"
 */
export function useBookingTranslation() {
  return useTranslations('booking');
}

/**
 * Hook to get auth translations
 * Pre-configured for the 'auth' namespace
 *
 * @example
 * const t = useAuthTranslation();
 * <button>{t('signIn')}</button> // "Sign In"
 * <input placeholder={t('email')} /> // "Email"
 */
export function useAuthTranslation() {
  return useTranslations('auth');
}

/**
 * Hook to get validation translations
 * Pre-configured for the 'validation' namespace
 *
 * @example
 * const t = useValidationTranslation();
 * <span>{t('required')}</span> // "This field is required"
 * <span>{t('invalidEmail')}</span> // "Invalid email address"
 */
export function useValidationTranslation() {
  return useTranslations('validation');
}

/**
 * Hook to get button translations
 * Pre-configured for the 'button' namespace
 *
 * @example
 * const t = useButtonTranslation();
 * <button>{t('submit')}</button> // "Submit"
 * <button>{t('cancel')}</button> // "Cancel"
 */
export function useButtonTranslation() {
  return useTranslations('button');
}

/**
 * Hook to get message translations
 * Pre-configured for the 'message' namespace
 *
 * @example
 * const t = useMessageTranslation();
 * <p>{t('noDataFound')}</p> // "No data found"
 * <p>{t('loadingData')}</p> // "Loading data..."
 */
export function useMessageTranslation() {
  return useTranslations('message');
}