'use client';

import { useState } from 'react';
import { Globe, DollarSign, Check } from 'lucide-react';
import { StatusDropdown } from './StatusDropdown';

export function SettingsPage() {
  const [language, setLanguage] = useState('English');
  const [timeZone, setTimeZone] = useState('UTC');
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY');
  const [currency, setCurrency] = useState('CHF');
  const [showCurrencySymbol, setShowCurrencySymbol] = useState(true);

  // Language options
  const languageOptions = [
    { value: 'English', label: 'English' },
    { value: 'German', label: 'German' },
    { value: 'French', label: 'French' },
    { value: 'Italian', label: 'Italian' },
  ];

  // Time Zone options
  const timeZoneOptions = [
    { value: 'Europe/Zurich', label: 'Europe/Zurich (GMT+1)' },
    { value: 'Europe/London', label: 'Europe/London (GMT+0)' },
    { value: 'Europe/Paris', label: 'Europe/Paris (GMT+1)' },
  ];

  // Date Format options
  const dateFormatOptions = [
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (e.g., 02/05/2026)' },
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (e.g., 05/02/2026)' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (e.g., 2026-02-05)' },
    { value: 'DD MMM YYYY', label: 'DD MMM YYYY (e.g., 05 Feb 2026)' },
    { value: 'MMM DD, YYYY', label: 'MMM DD, YYYY (e.g., Feb 05, 2026)' },
  ];

  // Currency options
  const currencyOptions = [
    { value: 'CHF', label: 'CHF - Swiss Franc' },
    { value: 'EUR', label: 'EUR - Euro' },
    { value: 'USD', label: 'USD - US Dollar' },
    { value: 'GBP', label: 'GBP - British Pound' },
  ];

  return (
    <div className="min-h-full bg-background px-4 md:px-8 pt-6 pb-1 flex flex-col">
      <div className="w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Language & Region Card */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Globe className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-foreground" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
                Language & Region
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Language Field */}
              <div>
                <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-label)', fontWeight: 'var(--font-weight-medium)' }}>
                  Language
                </label>
                <StatusDropdown
                  options={languageOptions}
                  value={language}
                  onChange={(value) => setLanguage(value)}
                  placeholder="Select language"
                  className="w-full"
                />
              </div>

              {/* Time Zone Field */}
              <div>
                <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-label)', fontWeight: 'var(--font-weight-medium)' }}>
                  Time Zone
                </label>
                <StatusDropdown
                  options={timeZoneOptions}
                  value={timeZone}
                  onChange={(value) => setTimeZone(value)}
                  placeholder="Select time zone"
                  className="w-full"
                />
              </div>

              {/* Date Format Field */}
              <div className="col-span-2">
                <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-label)', fontWeight: 'var(--font-weight-medium)' }}>
                  Date Format
                </label>
                <StatusDropdown
                  options={dateFormatOptions}
                  value={dateFormat}
                  onChange={(value) => setDateFormat(value)}
                  placeholder="Select date format"
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Currency Card */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-foreground" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
                Currency
              </h3>
            </div>

            <div className="space-y-6">
              {/* Currency Field */}
              <div>
                <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-label)', fontWeight: 'var(--font-weight-medium)' }}>
                  Currency
                </label>
                <StatusDropdown
                  options={currencyOptions}
                  value={currency}
                  onChange={(value) => setCurrency(value)}
                  placeholder="Select currency"
                  className="w-full"
                />
              </div>

              {/* Show Currency Symbol Checkbox */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowCurrencySymbol(!showCurrencySymbol)}
                  className="flex items-center justify-center transition-all duration-200"
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: 'var(--radius-xs)',
                    border: showCurrencySymbol ? 'none' : '2px solid var(--color-border)',
                    backgroundColor: showCurrencySymbol ? 'var(--color-primary)' : 'transparent',
                  }}
                >
                  {showCurrencySymbol && (
                    <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                  )}
                </button>
                <label
                  onClick={() => setShowCurrencySymbol(!showCurrencySymbol)}
                  className="text-foreground cursor-pointer"
                  style={{ fontSize: 'var(--text-label)', fontWeight: 'var(--font-weight-medium)' }}
                >
                  Show currency symbol in reports
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Footer */}
      <div className="text-center pt-8 pb-1 mt-auto">
        <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
          © 2026 Restaurant Oliv Restaurant & Bar
        </p>
      </div>
    </div>
  );
}