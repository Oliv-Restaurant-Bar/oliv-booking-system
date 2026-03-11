'use client';

import { Globe, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { cn } from '@/lib/utils';
import {
  LOCALE_COOKIE_NAME,
  LOCALE_COOKIE_MAX_AGE,
  LOCALE_INFO,
  getAvailableLocales,
  type Locale
} from '@/lib/i18n/locale-storage';

interface LanguageSwitcherProps {
  className?: string;
}

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [currentLocale, setCurrentLocale] = useState<Locale>(locale);

  const availableLocales = getAvailableLocales();

  useEffect(() => {
    setCurrentLocale(locale);
  }, [locale]);

  const changeLocale = (newLocale: Locale) => {
    // Set cookie
    document.cookie = `${LOCALE_COOKIE_NAME}=${newLocale};path=/;max-age=${LOCALE_COOKIE_MAX_AGE};SameSite=Lax`;

    // Update local state
    setCurrentLocale(newLocale);

    // Refresh to apply new locale
    router.refresh();
    setIsOpen(false);
  };

  return (
    <div className={cn('relative', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent transition-colors"
        aria-label="Change language"
      >
        <Globe className="w-4 h-4" />
        <span className="text-lg">{LOCALE_INFO[currentLocale].flag}</span>
        <span className="hidden sm:inline text-sm font-medium">
          {LOCALE_INFO[currentLocale].name}
        </span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 z-50 bg-card border border-border rounded-lg shadow-lg min-w-[200px]">
            {availableLocales.map((loc) => (
              <button
                key={loc.code}
                onClick={() => changeLocale(loc.code)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-accent transition-colors first:rounded-t-lg last:rounded-b-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{loc.flag}</span>
                  <span className="font-medium">{loc.name}</span>
                </div>
                {currentLocale === loc.code && (
                  <Check className="w-4 h-4 text-primary" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
