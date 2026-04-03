'use server';

import { db } from '@/lib/db';
import { systemSettings } from '@/lib/db/schema';

export async function getSystemSettings() {
  try {
    const settings = await db.query.systemSettings.findFirst();
    
    if (!settings) {
      return {
        id: 'default',
        language: 'English',
        timeZone: 'Europe/Zurich',
        dateFormat: 'DD/MM/YYYY',
        currency: 'CHF',
        showCurrencySymbol: true,
      };
    }
    
    return settings;
  } catch (error) {
    console.error('Error fetching system settings from server:', error);
    return {
      id: 'default',
      language: 'English',
      timeZone: 'Europe/Zurich',
      dateFormat: 'DD/MM/YYYY',
      currency: 'CHF',
      showCurrencySymbol: true,
    };
  }
}
