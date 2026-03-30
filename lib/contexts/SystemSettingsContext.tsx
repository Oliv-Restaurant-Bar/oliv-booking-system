'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface SystemSettings {
  dateFormat: string;
  timeZone: string;
  language: string;
  currency: string;
  showCurrencySymbol: boolean;
}

interface SystemSettingsContextType {
  settings: SystemSettings | null;
  loading: boolean;
  refreshSettings: () => Promise<void>;
  formatDate: (date: Date | string) => string;
}

const SystemSettingsContext = createContext<SystemSettingsContextType | undefined>(undefined);

// Default settings to use while loading
const DEFAULT_SETTINGS: SystemSettings = {
  dateFormat: 'MM/DD/YYYY',
  timeZone: 'Europe/Zurich',
  language: 'English',
  currency: 'CHF',
  showCurrencySymbol: true,
};

// Global cache that persists across component unmounts
let globalSettingsCache: SystemSettings | null = null;
let cachePromise: Promise<SystemSettings | null> | null = null;

/**
 * Fetch settings with global caching
 */
async function fetchSettingsWithCache(): Promise<SystemSettings | null> {
  // Return cached value if available
  if (globalSettingsCache) {
    return globalSettingsCache;
  }

  // Return existing promise if request is in flight
  if (cachePromise) {
    return cachePromise;
  }

  // Create new fetch promise
  cachePromise = (async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        globalSettingsCache = {
          dateFormat: data.dateFormat || DEFAULT_SETTINGS.dateFormat,
          timeZone: data.timeZone || DEFAULT_SETTINGS.timeZone,
          language: data.language || DEFAULT_SETTINGS.language,
          currency: data.currency || DEFAULT_SETTINGS.currency,
          showCurrencySymbol: data.showCurrencySymbol ?? DEFAULT_SETTINGS.showCurrencySymbol,
        };
        return globalSettingsCache;
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
    return null;
  })();

  return cachePromise;
}

/**
 * Clear the global cache (call this after updating settings)
 */
export function clearSettingsCache() {
  globalSettingsCache = null;
  cachePromise = null;
}

/**
 * Format date according to system settings
 */
export function formatDateString(date: Date | string, dateFormat: string): string {
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

interface SystemSettingsProviderProps {
  children: React.ReactNode;
}

export function SystemSettingsProvider({ children }: SystemSettingsProviderProps) {
  const [settings, setSettings] = useState<SystemSettings | null>(globalSettingsCache);
  const [loading, setLoading] = useState(!globalSettingsCache);

  const refreshSettings = useCallback(async () => {
    setLoading(true);
    clearSettingsCache();
    const freshSettings = await fetchSettingsWithCache();
    setSettings(freshSettings);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!globalSettingsCache) {
      fetchSettingsWithCache().then((fetchedSettings) => {
        setSettings(fetchedSettings);
        setLoading(false);
      });
    }
  }, []);

  const formatDate = useCallback((date: Date | string) => {
    const format = settings?.dateFormat || DEFAULT_SETTINGS.dateFormat;
    return formatDateString(date, format);
  }, [settings?.dateFormat]);

  const value: SystemSettingsContextType = {
    settings,
    loading,
    refreshSettings,
    formatDate,
  };

  return (
    <SystemSettingsContext.Provider value={value}>
      {children}
    </SystemSettingsContext.Provider>
  );
}

/**
 * Hook to access system settings
 * Uses global cache for instant access after first load
 */
export function useSystemSettings() {
  const context = useContext(SystemSettingsContext);
  if (!context) {
    throw new Error('useSystemSettings must be used within SystemSettingsProvider');
  }
  return context;
}

/**
 * Hook that only provides the formatDate function
 * More lightweight for components that only need date formatting
 */
export function useDateFormat() {
  const { formatDate, settings } = useSystemSettings();
  return { formatDate, dateFormat: settings?.dateFormat || DEFAULT_SETTINGS.dateFormat };
}
