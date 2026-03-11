import { getRequestConfig } from 'next-intl/server';
import { getLocale } from './lib/i18n/locale-storage';

export default getRequestConfig(async ({ requestLocale }) => {
  // Read locale from cookies, fallback to 'en'
  const cookies = await import('next/headers').then(m => m.cookies());
  const locale = getLocale(cookies);

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default
  };
});
