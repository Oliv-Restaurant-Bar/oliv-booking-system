/**
 * React hook for using system date format from settings
 */

import { useState, useEffect, useCallback } from 'react';
import { SettingsService } from '@/services/settings.service';

/**
 * Hook that provides date formatting based on system settings
 * Returns a formatDate function and the current settings
 */
export function useSystemDateFormatter() {
  const [settings, setSettings] = useState<{
    dateFormat: string;
    timeZone: string;
    language: string;
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadSettings() {
      try {
        const systemSettings = await SettingsService.getAll();
        if (systemSettings) {
          setSettings({
            dateFormat: systemSettings.dateFormat,
            timeZone: systemSettings.timeZone,
            language: systemSettings.language,
          });
        }
      } catch (error) {
        console.error('Failed to load system settings:', error);
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  /**
   * Format a date according to system settings
   */
  const formatDate = useCallback((date: Date | string): string => {
    if (!settings) {
      // Fallback while loading
      return new Date(date).toLocaleDateString();
    }

    const dateObj = typeof date === 'string' ? new Date(date) : date;

    // Format according to the selected date format
    switch (settings.dateFormat) {
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
  }, [settings]);

  return { formatDate, settings, loading };
}

/**
 * Hook that provides a synchronous formatDate function
 * Uses default settings until async settings are loaded
 */
export function useSystemDateFormatterSync() {
  const [dateFormat, setDateFormat] = useState<string>('MM/DD/YYYY');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadSettings() {
      try {
        const systemSettings = await SettingsService.getAll();
        if (systemSettings?.dateFormat) {
          setDateFormat(systemSettings.dateFormat);
        }
      } catch (error) {
        console.error('Failed to load date format:', error);
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  /**
   * Format a date according to system date format
   */
  const formatDate = useCallback((date: Date | string): string => {
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
  }, [dateFormat]);

  return { formatDate, dateFormat, loading };
}
