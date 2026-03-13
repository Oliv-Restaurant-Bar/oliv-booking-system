/**
 * React hook for using system timezone
 */

import { useState, useEffect } from 'react';
import { getSystemTimezone, initTimezoneCache, getSystemTimezoneSync } from '@/lib/utils/date';

/**
 * Hook that provides the system timezone from settings
 * Initializes the timezone cache on mount
 */
export function useSystemTimezone() {
  const [timezone, setTimezone] = useState<string>(getSystemTimezoneSync());
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadTimezone() {
      try {
        const tz = await getSystemTimezone();
        setTimezone(tz);
      } catch (error) {
        console.error('Failed to load system timezone:', error);
      } finally {
        setLoading(false);
      }
    }

    loadTimezone();
  }, []);

  return { timezone, loading };
}

/**
 * Hook that initializes the timezone cache (call in root layout)
 */
export function useTimezoneInit() {
  useEffect(() => {
    initTimezoneCache();
  }, []);
}
