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

/**
 * Hook to get profile translations
 * Pre-configured for the 'profile' namespace
 *
 * @example
 * const t = useProfileTranslation();
 * <h1>{t('title')}</h1> // "Profile"
 * <button>{t('editProfile')}</button> // "Edit Profile"
 */
export function useProfileTranslation() {
  return useTranslations('profile');
}

/**
 * Hook to get admin translations
 * Pre-configured for the 'admin' namespace
 *
 * @example
 * const t = useAdminTranslation();
 * <h1>{t('dashboard.title')}</h1> // "Dashboard"
 * <button>{t('bookings.export')}</button> // "Export"
 */
export function useAdminTranslation() {
  return useTranslations('admin');
}

/**
 * Hook to get booking translations (admin namespace)
 * Pre-configured for the 'admin.bookings' namespace
 *
 * @example
 * const t = useBookingTranslation();
 * <h1>{t('title')}</h1> // "Bookings"
 * <input placeholder={t('search')} /> // "Search by name, email, or phone..."
 */
export function useBookingTranslation() {
  return useTranslations('admin.bookings');
}

/**
 * Hook to get settings translations
 * Pre-configured for the 'admin.settings' namespace
 *
 * @example
 * const t = useSettingsTranslation();
 * <h1>{t('title')}</h1> // "Settings"
 * <button>{t('addVenue')}</button> // "Add New Venue"
 */
export function useSettingsTranslation() {
  return useTranslations('admin.settings');
}

/**
 * Hook to get landing page translations
 * Pre-configured for the 'landing' namespace
 *
 * @example
 * const t = useLandingTranslation();
 * <h1>{t('hero.title')}</h1> // "Build Unforgettable Dining Moments"
 */
export function useLandingTranslation() {
  return useTranslations('landing');
}

/**
 * Hook to get wizard translations
 * Pre-configured for the 'wizard' namespace
 *
 * @example
 * const t = useWizardTranslation();
 * <label>{t('form.email')}</label> // "Email"
 * <button>{t('actions.next')}</button> // "Next"
 */
export function useWizardTranslation() {
  return useTranslations('wizard');
}

/**
 * Hook to get menu config translations
 * Pre-configured for the 'admin.menuConfig' namespace
 *
 * @example
 * const t = useMenuConfigTranslation();
 * <h1>{t('title')}</h1> // "Menu Config"
 */
export function useMenuConfigTranslation() {
  return useTranslations('admin.menuConfig');
}

/**
 * Hook to get sidebar translations
 * Pre-configured for the 'admin.sidebar' namespace
 *
 * @example
 * const t = useSidebarTranslation();
 * <a>{t('dashboard')}</a> // "Dashboard"
 */
export function useSidebarTranslation() {
  return useTranslations('admin.sidebar');
}