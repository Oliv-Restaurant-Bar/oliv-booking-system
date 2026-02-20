import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async () => {
  // Provide a static locale, read from cookies/headers, or detect from user preferences
  const locale = 'en';

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default
  };
});
