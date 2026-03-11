/**
 * Settings Service
 * Manages system-wide settings (language, timezone, currency, etc.)
 */

export interface SystemSettings {
  id: string;
  language: string;
  timeZone: string;
  dateFormat: string;
  currency: string;
  showCurrencySymbol: boolean;
  updatedAt: string;
  updatedBy?: string;
}

export const SettingsService = {
  /**
   * Get all system settings
   */
  async getAll(): Promise<SystemSettings | null> {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
    return null;
  },

  /**
   * Update system settings
   */
  async update(settings: Partial<SystemSettings> & { updatedBy?: string }): Promise<SystemSettings | null> {
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        return await response.json();
      } else {
        const error = await response.json();
        console.error('Error updating settings:', error.error);
        return null;
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      return null;
    }
  },

  /**
   * Get currency symbol
   */
  async getCurrencySymbol(): Promise<string> {
    const settings = await this.getAll();
    if (!settings || !settings.showCurrencySymbol) {
      return '';
    }

    const symbols: Record<string, string> = {
      'CHF': 'CHF',
      'EUR': '€',
      'USD': '$',
      'GBP': '£',
    };

    return symbols[settings.currency] || settings.currency;
  },

  /**
   * Format date according to system settings
   */
  async formatDate(date: Date | string): Promise<string> {
    const settings = await this.getAll();
    if (!settings) {
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
  },

  /**
   * Format currency according to system settings
   */
  async formatCurrency(amount: number): Promise<string> {
    const settings = await this.getAll();
    if (!settings) {
      return `${amount.toFixed(2)}`;
    }

    const currency = settings.currency;
    const symbol = settings.showCurrencySymbol ? await this.getCurrencySymbol() : '';

    // Format based on currency
    const formatted = amount.toLocaleString('en-CH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return settings.showCurrencySymbol ? `${symbol} ${formatted}` : formatted;
  }
};
