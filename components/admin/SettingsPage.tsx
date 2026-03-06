'use client';

import { useState, useEffect } from 'react';
import { Globe, DollarSign, Check, MapPin, Plus, X, Edit2, Trash2, Loader2 } from 'lucide-react';
import { StatusDropdown } from './StatusDropdown';
import { VenueModal } from './VenueModal';
import { Permission, hasPermission } from '@/lib/auth/rbac';
import { VenueService } from '@/services/venue.service';
import type { Venue } from '@/services/venue.service';

export function SettingsPage({ user }: { user?: any }) {
  const userRole = user?.role;
  const canUpdateSettings = hasPermission(userRole, Permission.UPDATE_SETTINGS);

  const [language, setLanguage] = useState('English');
  const [timeZone, setTimeZone] = useState('UTC');
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY');
  const [currency, setCurrency] = useState('CHF');
  const [showCurrencySymbol, setShowCurrencySymbol] = useState(true);

  // Venue Management State
  const [venues, setVenues] = useState<Venue[]>([]);
  const [showVenueModal, setShowVenueModal] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [isLoadingVenues, setIsLoadingVenues] = useState(false);
  const [isSavingVenue, setIsSavingVenue] = useState(false);

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

  // Load venues on mount
  useEffect(() => {
    loadVenues();
  }, []);

  const loadVenues = async () => {
    setIsLoadingVenues(true);
    const venueList = await VenueService.getAll();
    setVenues(venueList);
    setIsLoadingVenues(false);
  };

  // Venue Management Handlers
  const handleAddVenue = () => {
    setEditingVenue(null);
    setShowVenueModal(true);
  };

  const handleEditVenue = (venue: Venue) => {
    setEditingVenue(venue);
    setShowVenueModal(true);
  };

  const handleSaveVenue = async ({ name, description }: { name: string; description: string }) => {
    setIsSavingVenue(true);
    try {
      if (editingVenue) {
        // Update existing venue
        const result = await VenueService.updateLocation(editingVenue.id, name, description);
        if (result) {
          await loadVenues();
          setShowVenueModal(false);
        } else {
          alert('Failed to update venue. A venue with this name may already exist.');
        }
      } else {
        // Add new venue
        const result = await VenueService.addLocation(name, description);
        if (result) {
          await loadVenues();
          setShowVenueModal(false);
        } else {
          alert('Failed to add venue. A venue with this name may already exist.');
        }
      }
    } finally {
      setIsSavingVenue(false);
    }
  };

  const handleDeleteVenue = async (venue: Venue) => {
    if (!confirm(`Are you sure you want to delete "${venue.name}"?`)) {
      return;
    }

    const success = await VenueService.deleteLocation(venue.id);
    if (success) {
      await loadVenues();
    } else {
      alert('Failed to delete venue');
    }
  };

  return (
    <div className="min-h-full bg-background px-4 md:px-8 pt-6 pb-1 flex flex-col">
      <div className="w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Venue Management Card */}
          <div className="bg-card border border-border rounded-xl p-6 lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div className="flex justify-between w-full">
                <div>
                  <h3 className="text-foreground" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
                    Venue Locations
                  </h3>
                  <p className="text-muted-foreground text-sm mt-0.5">
                    Manage restaurant locations for bookings
                  </p>
                </div>
                <button
                  onClick={handleAddVenue}
                  disabled={!canUpdateSettings}
                  className="px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                  Add New Venue
                </button>
              </div>
            </div>
             {/* Venues List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {isLoadingVenues ? (
                <div className="col-span-full flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : venues.length === 0 ? (
                <div className="col-span-full text-center py-12 border-2 border-dashed border-border rounded-2xl bg-muted/5">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <MapPin className="w-6 h-6 text-primary/40" />
                  </div>
                  <p className="text-muted-foreground font-medium">No venues defined yet.</p>
                  <p className="text-sm text-muted-foreground/60 mt-1">Click "Add New Venue" to create your first venue.</p>
                </div>
              ) : (
                venues.map((venue) => (
                  <div
                    key={venue.id}
                    className="group bg-background border border-border rounded-xl p-4 hover:border-primary/50 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-foreground font-semibold truncate" style={{ fontSize: 'var(--text-base)' }}>
                            {venue.name}
                          </h4>
                        </div>
                        {venue.description && (
                          <p className="text-muted-foreground text-sm line-clamp-2" style={{ fontSize: 'var(--text-small)' }}>
                            {venue.description}
                          </p>
                        )}
                        <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-2 opacity-60 block">
                          Venue Location
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200">
                        <button
                          onClick={() => handleEditVenue(venue)}
                          className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors cursor-pointer"
                          disabled={!canUpdateSettings}
                          title="Edit Venue"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteVenue(venue)}
                          className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          disabled={!canUpdateSettings}
                          title="Delete Venue"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

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
                  disabled={!canUpdateSettings}
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
                  disabled={!canUpdateSettings}
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
                  disabled={!canUpdateSettings}
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
                  disabled={!canUpdateSettings}
                />
              </div>

              {/* Show Currency Symbol Checkbox */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => canUpdateSettings && setShowCurrencySymbol(!showCurrencySymbol)}
                  disabled={!canUpdateSettings}
                  className={`flex items-center justify-center transition-all duration-200 ${!canUpdateSettings ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                  onClick={() => canUpdateSettings && setShowCurrencySymbol(!showCurrencySymbol)}
                  className={`text-foreground ${canUpdateSettings ? 'cursor-pointer' : 'cursor-default'}`}
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

      {/* Venue Modal */}
      <VenueModal
        isOpen={showVenueModal}
        onClose={() => {
          setShowVenueModal(false);
          setEditingVenue(null);
        }}
        onSave={handleSaveVenue}
        venue={editingVenue}
        isLoading={isSavingVenue}
      />
    </div>
  );
}