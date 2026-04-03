'use client';

import { useState, useEffect } from 'react';
import { Globe, DollarSign, Check, MapPin, Plus, X, Edit2, Trash2, Save } from 'lucide-react';
import { SkeletonGrid, SkeletonKPI } from '@/components/ui/skeleton-loaders';
import { StatusDropdown } from './StatusDropdown';
import { VenueModal } from './VenueModal';
import { Permission, hasPermission } from '@/lib/auth/rbac';
import { VenueService } from '@/services/venue.service';
import { SettingsService } from '@/services/settings.service';
import type { Venue } from '@/services/venue.service';
import { toast } from 'sonner';
import { useSettingsTranslation, useCommonTranslation, useMessageTranslation } from '@/lib/i18n/client';
import { useSystemSettings } from '@/lib/contexts/SystemSettingsContext';

interface SettingsPageProps {
  user?: any;
  initialSettings?: any;
  initialVenues?: Venue[];
}

export function SettingsPage({ user, initialSettings, initialVenues }: SettingsPageProps) {
  const t = useSettingsTranslation();
  const commonT = useCommonTranslation();
  const messageT = useMessageTranslation();
  const userRole = user?.role;
  const canUpdateSettings = hasPermission(userRole, Permission.UPDATE_SETTINGS);
  const { refreshSettings } = useSystemSettings();

  const [language, setLanguage] = useState(initialSettings?.language || 'English');
  const [timeZone, setTimeZone] = useState(initialSettings?.timeZone || 'Europe/Zurich');
  const [dateFormat, setDateFormat] = useState(initialSettings?.dateFormat || 'DD/MM/YYYY');
  const [currency, setCurrency] = useState(initialSettings?.currency || 'CHF');
  const [showCurrencySymbol, setShowCurrencySymbol] = useState(initialSettings?.showCurrencySymbol ?? true);
  const [isLoadingSettings, setIsLoadingSettings] = useState(!initialSettings);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Venue Management State
  const [venues, setVenues] = useState<Venue[]>(initialVenues || []);
  const [showVenueModal, setShowVenueModal] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [isLoadingVenues, setIsLoadingVenues] = useState(!initialVenues);
  const [isSavingVenue, setIsSavingVenue] = useState(false);

  // Load settings on mount (only if not provided by SSR)
  useEffect(() => {
    if (!initialSettings) {
      loadSettings();
    }
    if (!initialVenues) {
      loadVenues();
    }
  }, []);

  const loadSettings = async () => {
    setIsLoadingSettings(true);
    try {
      const settings = await SettingsService.getAll();
      if (settings) {
        setLanguage(settings.language);
        setTimeZone(settings.timeZone);
        setDateFormat(settings.dateFormat);
        setCurrency(settings.currency);
        setShowCurrencySymbol(settings.showCurrencySymbol);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error(t('toast.loadFailed'));
    } finally {
      setIsLoadingSettings(false);
    }
  };

  const loadVenues = async () => {
    setIsLoadingVenues(true);
    const venueList = await VenueService.getAll();
    setVenues(venueList);
    setIsLoadingVenues(false);
  };

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      const result = await SettingsService.update({
        language,
        timeZone,
        dateFormat,
        currency,
        showCurrencySymbol,
        updatedBy: user?.user?.id || user?.id,
      });

      if (result) {
        // Immediately refresh settings across the entire app
        await refreshSettings();
        toast.success(t('toast.saveSuccess'));
        setHasChanges(false);
      } else {
        toast.error(t('toast.saveFailed'));
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error(t('toast.saveFailed'));
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Track changes
  useEffect(() => {
    if (!isLoadingSettings) {
      setHasChanges(true);
    }
  }, [language, timeZone, dateFormat, currency, showCurrencySymbol]);
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
          toast.error(t('toast.venueUpdateFailed'));
        }
      } else {
        // Add new venue
        const result = await VenueService.addLocation(name, description);
        if (result) {
          await loadVenues();
          setShowVenueModal(false);
        } else {
          toast.error(t('toast.venueAddFailed'));
        }
      }
    } finally {
      setIsSavingVenue(false);
    }
  };

  const handleDeleteVenue = async (venue: Venue) => {
    if (!confirm(messageT('deleteConfirm'))) {
      return;
    }

    const success = await VenueService.deleteLocation(venue.id);
    if (success) {
      await loadVenues();
      toast.success(t('toast.venueDeleteSuccess'));
    } else {
      toast.error(t('toast.venueDeleteFailed'));
    }
  };

  return (
    <div className="min-h-full bg-background flex flex-col">
      <div className="w-full flex-1">

        {/* Header with Save Button */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-foreground" style={{ fontSize: 'var(--text-h2)', fontWeight: 'var(--font-weight-semibold)' }}>
              {t('title')}
            </h1>
            <p className="text-muted-foreground mt-1" style={{ fontSize: 'var(--text-base)' }}>
              {t('description')}
            </p>
          </div>
          {hasChanges && canUpdateSettings && (
            <button
              onClick={handleSaveSettings}
              disabled={isSavingSettings || !canUpdateSettings}
              className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {isSavingSettings ? commonT('saving') : commonT('saveChanges')}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Venue Management Card */}
          {/* <div className="bg-card border border-border rounded-xl p-6 lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div className="flex justify-between w-full">
                <div>
                  <h3 className="text-foreground" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
                    {t('venueLocations')}
                  </h3>
                  <p className="text-muted-foreground text-sm mt-0.5">
                    {t('venueDesc')}
                  </p>
                </div>
                <button
                  onClick={handleAddVenue}
                  disabled={!canUpdateSettings}
                  className="px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                  {t('addVenue')}
                </button>
              </div>
            </div>
            Venues List
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {isLoadingVenues ? (
                <div className="col-span-full">
                  <SkeletonGrid items={3} cols={3} skeleton={() => (
                    <div className="bg-background border border-border rounded-xl p-4 space-y-3">
                      <div className="flex justify-between">
                        <SkeletonKPI variant="compact" />
                      </div>
                    </div>
                  )} />
                </div>
              ) : venues.length === 0 ? (
                <div className="col-span-full text-center py-12 border-2 border-dashed border-border rounded-2xl bg-muted/5">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <MapPin className="w-6 h-6 text-primary/40" />
                  </div>
                  <p className="text-muted-foreground font-medium">{t('noVenues')}</p>
                  <p className="text-sm text-muted-foreground/60 mt-1">{t('noVenuesDesc')}</p>
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
                          <h4 className="text-foreground font-semibold truncate" style={{ fontSize: 'var(--text-base)' }} title={venue.name}>
                            {venue.name}
                          </h4>
                        </div>
                        {venue.description && (
                          <p className="text-muted-foreground text-sm line-clamp-2" style={{ fontSize: 'var(--text-small)' }}>
                            {venue.description}
                          </p>
                        )}
                        <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-2 opacity-60 block">
                          {t('venueLocation')}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200">
                        <button
                          onClick={() => handleEditVenue(venue)}
                          className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors cursor-pointer"
                          disabled={!canUpdateSettings}
                          title={t('editVenue')}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteVenue(venue)}
                          className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          disabled={!canUpdateSettings}
                          title={t('deleteVenue')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div> */}

          {/* Language & Region Card */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Globe className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-foreground" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
                {t('languageRegion')}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Language Field */}
              <div>
                <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-label)', fontWeight: 'var(--font-weight-medium)' }}>
                  {t('language')}
                </label>
                <StatusDropdown
                  options={languageOptions}
                  value={language}
                  onChange={(value) => setLanguage(value)}
                  placeholder={t('selectLanguage')}
                  className="w-full"
                  disabled={!canUpdateSettings}
                />
              </div>

              {/* Time Zone Field */}
              <div>
                <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-label)', fontWeight: 'var(--font-weight-medium)' }}>
                  {t('timeZone')}
                </label>
                <StatusDropdown
                  options={timeZoneOptions}
                  value={timeZone}
                  onChange={(value) => setTimeZone(value)}
                  placeholder={t('selectTimeZone')}
                  className="w-full"
                  disabled={!canUpdateSettings}
                />
              </div>

              {/* Date Format Field */}
              <div className="col-span-2">
                <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-label)', fontWeight: 'var(--font-weight-medium)' }}>
                  {t('dateFormat')}
                </label>
                <StatusDropdown
                  options={dateFormatOptions}
                  value={dateFormat}
                  onChange={(value) => setDateFormat(value)}
                  placeholder={t('selectDateFormat')}
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
                {t('currency')}
              </h3>
            </div>

            <div className="space-y-6">
              {/* Currency Field */}
              <div>
                <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-label)', fontWeight: 'var(--font-weight-medium)' }}>
                  {t('currency')}
                </label>
                <StatusDropdown
                  options={currencyOptions}
                  value={currency}
                  onChange={(value) => setCurrency(value)}
                  placeholder={t('selectCurrency')}
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
                  {t('showCurrencySymbol')}
                </label>
              </div>
            </div>
          </div>
        </div>
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