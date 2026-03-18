import React from 'react';
import { Eye, Lock, Check, Clock, Edit2, User, MapPin, Calendar, ClipboardList, ShoppingCart, Users, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { MenuItem } from './menuItemsData';
import { EventDetails } from '@/lib/types';
import { DietaryIcon } from './DietaryIcon';
import { NativeCheckbox } from '@/components/ui/NativeCheckbox';

interface CustomerSummaryProps {
  eventDetails: EventDetails;
  isLocked: boolean;
  isUnlockRequested: boolean;
  isRequestingUnlock: boolean;
  handleRequestUnlock: () => void;
  isEditMode: boolean;
  setCurrentStep: (step: number) => void;
  setActiveTab: (tab: string) => void;
  selectedItems: string[];
  menuItems: MenuItem[];
  categories: string[];
  collapsedCategories: Record<string, boolean>;
  setCollapsedCategories: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  itemQuantities: Record<string, number>;
  itemGuestCounts: Record<string, number>;
  itemVariants: Record<string, string>;
  itemAddOns: Record<string, string[]>;
  itemComments: Record<string, string>;
  getItemPerPersonPrice: (item: MenuItem) => number;
  getItemTotalPrice: (item: MenuItem) => number;
  getPerPersonSubtotal: () => number;
  summaryViewMode: 'per-person' | 'total';
  setSummaryViewMode: (mode: 'per-person' | 'total') => void;
  includeBeveragePrices: boolean;
  setIncludeBeveragePrices: (value: boolean) => void;
  isConsumption: (item: MenuItem) => boolean;
  isPerPerson: (item: MenuItem) => boolean;
  getFlatRateSubtotal: () => number;
  getConsumptionSubtotal: () => number;
  termsAccepted: boolean;
  setTermsAccepted: (value: boolean) => void;
}

export function CustomerSummary({
  eventDetails,
  isLocked,
  isUnlockRequested,
  isRequestingUnlock,
  handleRequestUnlock,
  isEditMode,
  setCurrentStep,
  setActiveTab,
  selectedItems,
  menuItems,
  categories,
  collapsedCategories,
  setCollapsedCategories,
  itemQuantities,
  itemGuestCounts,
  itemVariants,
  itemAddOns,
  itemComments,
  getItemPerPersonPrice,
  getItemTotalPrice,
  getPerPersonSubtotal,
  summaryViewMode,
  setSummaryViewMode,
  includeBeveragePrices,
  setIncludeBeveragePrices,
  isConsumption,
  isPerPerson,
  getFlatRateSubtotal,
  getConsumptionSubtotal,
  termsAccepted,
  setTermsAccepted,
}: CustomerSummaryProps) {
  const perPersonTotal = getPerPersonSubtotal();
  const guestCountValue = parseInt(eventDetails.guestCount) || 0;
  const flatRateTotal = getFlatRateSubtotal();
  const consumptionTotal = includeBeveragePrices ? getConsumptionSubtotal() : 0;
  const grandTotal = (perPersonTotal * (guestCountValue || 1)) + flatRateTotal + consumptionTotal;

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0" style={{ borderRadius: 'var(--radius)' }}>
            <Eye className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-foreground" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
              Review your request
            </h3>
            {isEditMode && (
              <p className="text-primary text-sm">Edit Mode - Make changes below</p>
            )}
          </div>
        </div>
        <p className="text-muted-foreground" style={{ fontSize: 'var(--text-base)' }}>
          Check all details before submitting
        </p>

        {isLocked && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg flex flex-col sm:flex-row items-start gap-4" style={{ borderRadius: 'var(--radius-card)' }}>
            <div className="flex items-start gap-3 flex-1">
              <Lock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-amber-800 font-semibold" style={{ fontSize: 'var(--text-base)' }}>
                  This booking is locked
                </p>
                <p className="text-amber-700 text-sm" style={{ fontSize: 'var(--text-small)' }}>
                  Your inquiry is currently being processed by our team and can no longer be edited online. Please contact us directly or click the button if you need to make urgent changes.
                </p>
              </div>
            </div>
            <div className="w-full sm:w-auto flex-shrink-0">
              {isUnlockRequested ? (
                <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg border border-green-200" style={{ borderRadius: 'var(--radius)' }}>
                  <Check className="w-4 h-4" />
                  <span className="text-sm font-medium">Request Sent</span>
                </div>
              ) : (
                <button
                  onClick={handleRequestUnlock}
                  disabled={isRequestingUnlock}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 transition-colors shadow-sm"
                  style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}
                >
                  {isRequestingUnlock ? (
                    <>
                      <Clock className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Edit2 className="w-4 h-4" />
                      Request Edit
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-5">
        {/* Contact Information */}
        <div className="bg-muted/30 border border-border rounded-lg p-5" style={{ borderRadius: 'var(--radius-card)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0" style={{ borderRadius: 'var(--radius)' }}>
                <User className="w-4 h-4 text-primary" />
              </div>
              <h4 className="text-foreground" style={{ fontSize: 'var(--text-h4)', fontWeight: 'var(--font-weight-semibold)' }}>
                Contact Information
              </h4>
            </div>
            {!isLocked && (
              <button
                onClick={() => {
                  setCurrentStep(1);
                  setActiveTab('contact');
                }}
                className="flex items-center gap-2 px-3 py-1.5 bg-card border border-border rounded-lg hover:bg-muted transition-colors"
                style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}
              >
                <Edit2 className="w-3.5 h-3.5" />
                Edit
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-muted-foreground mb-1" style={{ fontSize: 'var(--text-small)' }}>Name</p>
              <p className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                {eventDetails.name || '-'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1" style={{ fontSize: 'var(--text-small)' }}>Business</p>
              <p className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                {eventDetails.business || '-'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1" style={{ fontSize: 'var(--text-small)' }}>Email</p>
              <p className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                {eventDetails.email || '-'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1" style={{ fontSize: 'var(--text-small)' }}>Telephone</p>
              <p className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                {eventDetails.telephone || '-'}
              </p>
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="bg-muted/30 border border-border rounded-lg p-5" style={{ borderRadius: 'var(--radius-card)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0" style={{ borderRadius: 'var(--radius)' }}>
                <MapPin className="w-4 h-4 text-primary" />
              </div>
              <h4 className="text-foreground" style={{ fontSize: 'var(--text-h4)', fontWeight: 'var(--font-weight-semibold)' }}>
                Address
              </h4>
            </div>
            {!isLocked && (
              <button
                onClick={() => {
                  setCurrentStep(1);
                  setActiveTab('address');
                }}
                className="flex items-center gap-2 px-3 py-1.5 bg-card border border-border rounded-lg hover:bg-muted transition-colors"
                style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}
              >
                <Edit2 className="w-3.5 h-3.5" />
                Edit
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-3">
              <p className="text-muted-foreground mb-1" style={{ fontSize: 'var(--text-small)' }}>Street & Nr.</p>
              <p className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                {eventDetails.street || '-'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1" style={{ fontSize: 'var(--text-small)' }}>PLZ</p>
              <p className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                {eventDetails.plz || '-'}
              </p>
            </div>
            <div className="md:col-span-2">
              <p className="text-muted-foreground mb-1" style={{ fontSize: 'var(--text-small)' }}>Location</p>
              <p className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                {eventDetails.location || '-'}
              </p>
            </div>
          </div>
        </div>

        {/* Event Details */}
        <div className="bg-muted/30 border border-border rounded-lg p-5" style={{ borderRadius: 'var(--radius-card)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0" style={{ borderRadius: 'var(--radius)' }}>
                <Calendar className="w-4 h-4 text-primary" />
              </div>
              <h4 className="text-foreground" style={{ fontSize: 'var(--text-h4)', fontWeight: 'var(--font-weight-semibold)' }}>
                Event Details
              </h4>
            </div>
            {!isLocked && (
              <button
                onClick={() => {
                  setCurrentStep(1);
                  setActiveTab('event');
                }}
                className="flex items-center gap-2 px-3 py-1.5 bg-card border border-border rounded-lg hover:bg-muted transition-colors"
                style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}
              >
                <Edit2 className="w-3.5 h-3.5" />
                Edit
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-muted-foreground mb-1" style={{ fontSize: 'var(--text-small)' }}>Date</p>
              <p className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                {eventDetails.eventDate ? new Date(eventDetails.eventDate).toLocaleDateString('de-CH', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                }) : '-'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1" style={{ fontSize: 'var(--text-small)' }}>Time</p>
              <p className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                {eventDetails.eventTime || '-'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1" style={{ fontSize: 'var(--text-small)' }}>Number of Guests</p>
              <p className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                {eventDetails.guestCount || '-'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1" style={{ fontSize: 'var(--text-small)' }}>Occasion</p>
              <p className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                {eventDetails.occasion || '-'}
              </p>
            </div>
          </div>
        </div>

        {/* Special Requests */}
        {eventDetails.specialRequests && (
          <div className="bg-muted/30 border border-border rounded-lg p-5" style={{ borderRadius: 'var(--radius-card)' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0" style={{ borderRadius: 'var(--radius)' }}>
                  <ClipboardList className="w-4 h-4 text-primary" />
                </div>
                <h4 className="text-foreground" style={{ fontSize: 'var(--text-h4)', fontWeight: 'var(--font-weight-semibold)' }}>
                  Special Requests
                </h4>
              </div>
              {!isLocked && (
                <button
                  onClick={() => {
                    setCurrentStep(1);
                    setActiveTab('requests');
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-card border border-border rounded-lg hover:bg-muted transition-colors"
                  style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit
                </button>
              )}
            </div>
            <p className="text-foreground" style={{ fontSize: 'var(--text-base)' }}>
              {eventDetails.specialRequests}
            </p>
          </div>
        )}

        {/* Selected Menu Items - Grouped by Category */}
        <div className="bg-muted/30 border border-border rounded-lg p-5" style={{ borderRadius: 'var(--radius-card)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0" style={{ borderRadius: 'var(--radius)' }}>
                <ShoppingCart className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h4 className="text-foreground" style={{ fontSize: 'var(--text-h4)', fontWeight: 'var(--font-weight-semibold)' }}>
                  Selected Menu ({selectedItems.length} {selectedItems.length === 1 ? 'item' : 'items'})
                </h4>
                <p className="text-muted-foreground mt-0.5" style={{ fontSize: 'var(--text-small)' }}>
                  Per person quantities
                </p>
              </div>
            </div>
            {!isLocked && (
              <button
                onClick={() => setCurrentStep(2)}
                className="flex items-center gap-2 px-3 py-1.5 bg-card border border-border rounded-lg hover:bg-muted transition-colors"
                style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}
              >
                <Edit2 className="w-3.5 h-3.5" />
                Edit
              </button>
            )}
          </div>

          {selectedItems.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
              <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                No items selected
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {categories.map((category) => {
                const categoryItems = selectedItems
                  .map((itemId) => menuItems.find((i) => i.id === itemId))
                  .filter((item): item is MenuItem => item !== undefined && item.category === category);

                if (categoryItems.length === 0) return null;

                const isCollapsed = collapsedCategories[category];

                return (
                  <div
                    key={category}
                    className="bg-card border border-border rounded-lg overflow-hidden"
                    style={{ borderRadius: 'var(--radius)' }}
                  >
                    {/* Collapsible Category Header */}
                    <button
                      onClick={() =>
                        setCollapsedCategories((prev) => ({
                          ...prev,
                          [category]: !prev[category],
                        }))
                      }
                      className="w-full flex items-center justify-between gap-2 p-2 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        {isCollapsed ? (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        )}
                        <h5 className="text-foreground font-semibold truncate max-w-125" style={{ fontSize: 'var(--text-base)' }}>
                          {category}
                        </h5>
                        <span className="px-2 py-0.5 bg-muted rounded-full text-xs text-muted-foreground">
                          {categoryItems.length}
                        </span>
                      </div>
                      <span className="text-muted-foreground text-xs">
                        {isCollapsed ? 'Show' : 'Hide'}
                      </span>
                    </button>

                    {/* Items in this category - collapsible */}
                    {!isCollapsed && (
                      <div className="p-4 pt-2 space-y-2">
                        {categoryItems.map((item) => {
                          const itemId = item.id;
                          const quantity = itemQuantities[itemId] || 1;

                          return (
                            <div
                              key={itemId}
                              className="flex items-center gap-3 p-2 rounded-lg bg-muted/20"
                            >
                              {/* Thumbnail */}
                              <div className="w-12 h-12 flex-shrink-0 rounded overflow-hidden bg-muted">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>

                              {/* Item Details */}
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-col gap-1">
                                  <div className="flex items-center gap-2">
                                    {item.dietaryType !== 'none' && (
                                      <DietaryIcon type={item.dietaryType} size="sm" />
                                    )}
                                    <h6 className="text-foreground font-medium text-sm truncate max-w-125">
                                      {item.name}
                                    </h6>
                                  </div>
                                  {isConsumption(item) && (
                                    <div className="flex">
                                      <span
                                        className="px-2 py-0.5 rounded text-[10px] font-medium"
                                        style={{
                                          backgroundColor: 'var(--consumption-badge-bg)',
                                          color: 'var(--consumption-badge-text)'
                                        }}
                                      >
                                        Pay by consumption
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {/* Variants, Add-ons, Comments */}
                                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
                                  {itemVariants[itemId] && item.variants && (() => {
                                    const variant = item.variants.find((v) => v.id === itemVariants[itemId]);
                                    return variant ? (
                                      <span>Variant: {variant.name}</span>
                                    ) : null;
                                  })()}
                                  {itemAddOns[itemId] && itemAddOns[itemId].length > 0 && (
                                    <span>
                                      Add-ons:{' '}
                                      {itemAddOns[itemId]
                                        .map((addOnId) => {
                                          const addOn = item.addOns?.find((ao) => ao.id === addOnId);
                                          return addOn ? addOn.name : null;
                                        })
                                        .filter(Boolean)
                                        .join(', ')}
                                    </span>
                                  )}
                                  {itemComments[itemId] && (
                                    <span className="italic truncate max-w-125">Note: {itemComments[itemId]}</span>
                                  )}
                                </div>
                              </div>

                              {/* Price */}
                              <div className="flex-shrink-0 text-right">
                                <p className="text-primary font-semibold text-sm">
                                  {isConsumption(item)
                                    ? `CHF ${item.price.toFixed(2)}/unit`
                                    : `CHF ${(getItemPerPersonPrice(item) * (isPerPerson(item) ? (itemGuestCounts[itemId] || parseInt(eventDetails.guestCount) || 1) : quantity)).toFixed(2)}`}
                                </p>
                                <p className="text-muted-foreground text-xs">
                                  {isConsumption(item)
                                    ? 'billed by consumption'
                                    : isPerPerson(item)
                                      ? `${itemGuestCounts[itemId] || parseInt(eventDetails.guestCount) || 1} guests × CHF ${getItemPerPersonPrice(item).toFixed(2)}`
                                      : `Qty: ${quantity} × CHF ${getItemPerPersonPrice(item).toFixed(2)}`}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Per-Person Total */}
              <div className="border-t border-border pt-4 mt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-foreground mb-1" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>
                      Per Person Total
                    </p>
                    <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                      {selectedItems.length} {selectedItems.length === 1 ? 'item' : 'items'} selected for {eventDetails.guestCount || '0'}{' '}
                      {parseInt(eventDetails.guestCount) === 1 ? 'guest' : 'guests'}
                    </p>
                  </div>
                  <p className="text-primary" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
                    CHF {getPerPersonSubtotal().toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Dietary Breakdown & Order Summary - Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Dietary Breakdown Card */}
          <div className="bg-muted/30 border border-border rounded-lg p-5" style={{ borderRadius: 'var(--radius-card)' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0" style={{ borderRadius: 'var(--radius)' }}>
                <Users className="w-4 h-4 text-primary" />
              </div>
              <h4 className="text-foreground" style={{ fontSize: 'var(--text-h4)', fontWeight: 'var(--font-weight-semibold)' }}>
                Dietary Breakdown
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Meat/Fish Summary */}
              <div className="bg-card border border-border rounded-lg p-4" style={{ borderRadius: 'var(--radius)' }}>
                <p className="text-muted-foreground mb-2" style={{ fontSize: 'var(--text-small)' }}>
                  🍖 Meat/Fish Selections
                </p>
                <p className="text-primary mb-1" style={{ fontSize: 'var(--text-h2)', fontWeight: 'var(--font-weight-semibold)' }}>
                  {selectedItems.filter((itemId) => {
                    const item = menuItems.find((i) => i.id === itemId);
                    return item?.dietaryType === 'non-veg';
                  }).length}{' '}
                  items
                </p>
                {eventDetails.guestCount && (
                  <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                    Total:{' '}
                    {selectedItems
                      .filter((itemId) => {
                        const item = menuItems.find((i) => i.id === itemId);
                        return (item?.dietaryType === 'non-veg' && item?.pricingType === 'per-person') || (item?.dietaryType === 'non-veg' && item?.pricingType === 'flat_fee');
                      })
                      .reduce((total, itemId) => total + (itemQuantities[itemId] || 1), 0) * parseInt(eventDetails.guestCount)}{' '}
                    portions
                  </p>
                )}
              </div>

              {/* Veggie/Vegan Summary */}
              <div className="bg-card border border-border rounded-lg p-4" style={{ borderRadius: 'var(--radius)' }}>
                <p className="text-muted-foreground mb-2" style={{ fontSize: 'var(--text-small)' }}>
                  🥗 Veggie/Vegan Selections
                </p>
                <p className="text-primary mb-1" style={{ fontSize: 'var(--text-h2)', fontWeight: 'var(--font-weight-semibold)' }}>
                  {selectedItems.filter((itemId) => {
                    const item = menuItems.find((i) => i.id === itemId);
                    return item?.dietaryType === 'veg' || item?.dietaryType === 'vegan';
                  }).length}{' '}
                  items
                </p>
                {eventDetails.guestCount && (
                  <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                    Total:{' '}
                    {selectedItems
                      .filter((itemId) => {
                        const item = menuItems.find((i) => i.id === itemId);
                        return ((item?.dietaryType === 'veg' || item?.dietaryType === 'vegan') && item?.pricingType === 'per-person') || ((item?.dietaryType === 'veg' || item?.dietaryType === 'vegan') && item?.pricingType === 'flat_fee');
                      })
                      .reduce((total, itemId) => total + (itemQuantities[itemId] || 1), 0) * parseInt(eventDetails.guestCount)}{' '}
                    portions
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary Card with Toggle View */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm" style={{ borderRadius: 'var(--radius-card)' }}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0" style={{ borderRadius: 'var(--radius)' }}>
                  <ShoppingCart className="w-4 h-4 text-gray-500" />
                </div>
                <h4 className="text-gray-800" style={{ fontSize: 'var(--text-h4)', fontWeight: 'var(--font-weight-semibold)' }}>
                  Order overview
                </h4>
              </div>
              {/* View Toggle */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-md border border-gray-200 shadow-sm">
                <button
                  onClick={() => setSummaryViewMode('per-person')}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${summaryViewMode === 'per-person'
                    ? 'bg-[#8da78d] text-white'
                    : 'text-gray-500 hover:text-gray-700 bg-transparent'
                    }`}
                >
                  Pro Person
                </button>
                <button
                  onClick={() => setSummaryViewMode('total')}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${summaryViewMode === 'total'
                    ? 'bg-[#8da78d] text-white'
                    : 'text-gray-500 hover:text-gray-700 bg-transparent'
                    }`}
                >
                  Total + extras
                </button>
              </div>
            </div>

            {summaryViewMode === 'per-person' ? (
              // Per-Person View
              <div className="space-y-4">
                <div className="bg-card border border-border rounded-lg p-4" style={{ borderRadius: 'var(--radius)' }}>
                  <p className="text-foreground font-semibold mb-3" style={{ fontSize: 'var(--text-base)' }}>
                    Per-Person Breakdown
                  </p>

                  {/* Menu Items by Category - Per Person */}
                  <div key="food-categories" className="space-y-3">
                    {categories.filter(cat =>
                      !['Technology', 'Decoration', 'Furniture', 'Miscellaneous', 'Beverages'].includes(cat)
                    ).map((category) => {
                      const categoryItems = selectedItems
                        .map((itemId) => menuItems.find((i) => i.id === itemId))
                        .filter((item) => {
                          return item &&
                            item.category === category &&
                            isPerPerson(item);
                        });

                      if (categoryItems.length === 0) return null;

                      return (
                        <div key={category} className="space-y-1">
                          {/* Category Header */}
                          <div className="font-semibold text-foreground text-sm mb-1">
                            {category}
                          </div>
                          {/* Items in this category */}
                          {categoryItems.map((item) => {
                            if (!item) return null;
                            const itemId = item.id;
                            const quantity = itemQuantities[itemId] || 1;

                            return (
                              <div
                                key={itemId}
                                className="flex justify-between items-center py-1 pl-3 border-b border-border/50 last:border-0"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-muted-foreground truncate max-w-125" style={{ fontSize: 'var(--text-small)' }}>
                                    {item.name}
                                  </span>
                                  <span className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                                    ×{quantity}
                                  </span>
                                </div>
                                <span className="text-foreground font-medium">
                                  CHF {(getItemPerPersonPrice(item) * quantity).toFixed(2)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Per-Person Total */}
                <div className="bg-primary/5 border border-primary/30 rounded-lg p-4" style={{ borderRadius: 'var(--radius)' }}>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-foreground font-semibold" style={{ fontSize: 'var(--text-base)' }}>
                        Per Person Total
                      </p>
                      <p className="text-muted-foreground text-sm mt-1">
                        × {eventDetails.guestCount || '0'} guests
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-primary" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-bold)' }}>
                        CHF {getPerPersonSubtotal().toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Total + Extras View
              <div className="space-y-4">
                {/* Food Menu Items Section */}
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-4 shadow-sm" style={{ borderRadius: 'var(--radius)' }}>
                  <div className="bg-gray-50/50 px-4 py-3 border-b border-gray-200">
                    <p className="text-[#374151] font-semibold" style={{ fontSize: 'var(--text-base)' }}>
                      🍽️ Menu
                    </p>
                  </div>
                  <div className="p-4 space-y-2">
                    {(() => {
                      const foodCategories = categories.filter(cat =>
                        !['Technology', 'Decoration', 'Furniture', 'Miscellaneous'].includes(cat)
                      );
                      const breakdown = foodCategories
                        .map((cat) => {
                          const items = selectedItems.filter((itemId) => {
                            const item = menuItems.find((i) => i.id === itemId);
                            return item?.category === cat && !isConsumption(item);
                          });
                          const subtotal = items.reduce((sum, itemId) => {
                            const item = menuItems.find((i) => i.id === itemId);
                            return sum + (item ? getItemTotalPrice(item) : 0);
                          }, 0);
                          return {
                            name: cat,
                            count: items.length,
                            subtotal,
                          };
                        })
                        .filter((cat) => cat.count > 0);

                      return (
                        <div key="food-categories" className="space-y-1">
                          {breakdown.map((cat) => (
                            <div
                              key={cat.name}
                              className="flex justify-between items-center py-1.5"
                            >
                              <span className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                                {cat.name} ({cat.count})
                              </span>
                              <span className="text-foreground font-medium">
                                CHF {cat.subtotal.toFixed(2)}
                              </span>
                            </div>
                          ))}
                          <div className="pt-3 mt-3 border-t border-[#8da78d] flex justify-between">
                            <span className="text-[#374151] font-bold">
                              Subtotal for meals:
                            </span>
                            <span className="text-[#374151] font-bold">
                              CHF{' '}
                              {selectedItems
                                .filter((itemId) => {
                                  const item = menuItems.find((i) => i.id === itemId);
                                  return item && foodCategories.includes(item.category);
                                })
                                .reduce((sum, itemId) => {
                                  const item = menuItems.find((i) => i.id === itemId);
                                  return sum + (item ? getItemTotalPrice(item) : 0);
                                }, 0)
                                .toFixed(2)}
                            </span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Billed by Consumption Section */}
                {(() => {
                  const consumptionItems = selectedItems.filter((itemId) => {
                    const item = menuItems.find((i) => i.id === itemId);
                    return item && isConsumption(item);
                  });

                  if (consumptionItems.length === 0) return null;

                  const consumptionSubtotal = consumptionItems.reduce((sum, itemId) => {
                    const item = menuItems.find((i) => i.id === itemId);
                    return sum + (item ? getItemTotalPrice(item) : 0);
                  }, 0);

                  return (
                    <>
                      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-4 shadow-sm" style={{ borderRadius: 'var(--radius)' }}>
                        <div className="bg-gray-50/50 px-4 py-3 border-b border-gray-200">
                          <p className="text-[#374151] font-semibold" style={{ fontSize: 'var(--text-base)' }}>
                            🍷 Billed by Consumption
                          </p>
                          {!includeBeveragePrices && (
                            <p className="text-gray-500 text-xs mt-1">
                              Prices are displayed, but not included in the total price.
                            </p>
                          )}
                        </div>
                        <div className="p-4 space-y-2">
                          {consumptionItems.map((itemId) => {
                            const item = menuItems.find((i) => i.id === itemId);
                            if (!item) return null;
                            const itemTotal = getItemTotalPrice(item);
                            return (
                              <div key={itemId} className="flex justify-between items-center py-1.5">
                                <div className="flex items-center gap-2 flex-wrap min-w-0 pr-4">
                                  <span className="text-gray-500 truncate" style={{ fontSize: 'var(--text-small)' }}>
                                    {item.name}
                                  </span>
                                </div>
                                <span className={`font-medium flex-shrink-0 ${!includeBeveragePrices ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                                  CHF {itemTotal.toFixed(2)}
                                </span>
                              </div>
                            );
                          })}
                          <div className="pt-3 mt-3 border-t border-gray-100 flex justify-between">
                            <span className="text-[#374151] font-bold">
                              Subtotal (consumption):
                            </span>
                            <span className="text-[#374151] font-bold">
                              CHF {includeBeveragePrices ? consumptionSubtotal.toFixed(2) : '0.00'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Drink Inclusion Checkbox Card */}
                      <div className="p-4 mb-6 shadow-sm flex items-start gap-3"
                        style={{
                          backgroundColor: 'var(--consumption-alert-bg)',
                          borderColor: 'var(--consumption-alert-border)',
                          borderRadius: 'var(--radius)'
                        }}>
                        <NativeCheckbox
                          id="include-drinks"
                          checked={includeBeveragePrices}
                          onChange={(e) => setIncludeBeveragePrices(e.target.checked)}
                          className="mt-1"
                        />
                        <label htmlFor="include-drinks" className="cursor-pointer">
                          <span className="block text-gray-800 font-medium mb-1">Include consumption-based prices in the estimate</span>
                          {!includeBeveragePrices && (
                            <span className="block text-sm" style={{ color: 'var(--consumption-alert-text)' }}>⚠️ Consumption-based prices are currently excluded from the overall estimate.</span>
                          )}
                        </label>
                      </div>
                    </>
                  );
                })()}

                {/* Technology, Decoration, Furniture, Miscellaneous Sections */}
                {['Technology', 'Decoration', 'Furniture', 'Miscellaneous'].map((category) => {
                  const categoryItems = selectedItems.filter((itemId) => {
                    const item = menuItems.find((i) => i.id === itemId);
                    return item?.category === category && !isConsumption(item);
                  });

                  if (categoryItems.length === 0) return null;

                  const categorySubtotal = categoryItems.reduce((sum, itemId) => {
                    const item = menuItems.find((i) => i.id === itemId);
                    return sum + (item ? getItemTotalPrice(item) : 0);
                  }, 0);

                  const icon = category === 'Technology' ? '🔌' : category === 'Decoration' ? '🎀' : category === 'Furniture' ? '🪑' : '📦';

                  return (
                    <div key={category} className="bg-card border border-border rounded-lg overflow-hidden mb-4" style={{ borderRadius: 'var(--radius)' }}>
                      <div className="bg-primary/5 px-4 py-2 border-b border-border">
                        <p className="text-foreground font-semibold" style={{ fontSize: 'var(--text-base)' }}>
                          {icon} {category}
                        </p>
                      </div>
                      <div className="p-4 space-y-1">
                        {categoryItems.map((itemId) => {
                          const item = menuItems.find((i) => i.id === itemId);
                          if (!item) return null;
                          const quantity = itemQuantities[itemId] || 1;
                          return (
                            <div key={itemId} className="flex justify-between items-center py-1">
                              <span className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                                {item.name} {quantity > 1 ? `(×${quantity})` : ''}
                              </span>
                              <span className="text-foreground font-medium">
                                CHF {(getItemTotalPrice(item)).toFixed(2)}
                              </span>
                            </div>
                          );
                        })}
                        <div className="pt-2 mt-2 border-t border-primary/30 flex justify-between">
                          <span className="text-foreground font-semibold">
                            Subtotal {category}:
                          </span>
                          <span className="text-foreground font-semibold">
                            CHF {categorySubtotal.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Grand Total & Final Actions */}
            <div className="mt-8 space-y-6">
              {/* Grand Total Section */}
              <div className="bg-white border-2 border-[#1e293b] rounded-lg p-6 shadow-sm flex flex-col md:flex-row justify-between items-center" style={{ borderRadius: 'var(--radius)' }}>
                <div>
                  <h3 className="text-[#1e293b] font-bold uppercase tracking-wider mb-1" style={{ fontSize: 'var(--text-h4)' }}>
                    TOTAL ESTIMATE
                  </h3>
                  <p className="text-muted-foreground font-medium" style={{ fontSize: 'var(--text-small)' }}>
                    For {guestCountValue} {guestCountValue === 1 ? 'guest' : 'guests'}
                  </p>
                </div>
                <div className="font-bold mt-4 md:mt-0" style={{ fontSize: 'var(--text-h2)', color: '#8da78d' }}>
                  CHF {grandTotal.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>
        {grandTotal > 5000 && (
          <div className="bg-[#1e293b] text-white p-6 rounded-lg flex gap-4 items-start shadow-md" style={{ borderRadius: 'var(--radius)' }}>
            <AlertTriangle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-bold mb-2" style={{ fontSize: 'var(--text-base)' }}>Deposit Requirement</h4>
              <p className="text-gray-300 text-sm mb-3">
                A deposit is required for orders above CHF 5,000.00. This deposit will be deducted from the final invoice.
              </p>
              <p className="text-gray-400 text-xs flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                Our team will connect you once order is locked and confirmed.
              </p>
            </div>
          </div>
        )}

        <div className="bg-white border border-border p-5 rounded-lg flex items-center gap-4 shadow-sm" style={{ borderRadius: 'var(--radius)' }}>
          <NativeCheckbox
            id="terms-checkbox"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="w-5 h-5 flex-shrink-0"
          />
          <label htmlFor="terms-checkbox" className="text-foreground cursor-pointer select-none leading-relaxed" style={{ fontSize: 'var(--text-small)' }}>
            I agree to the <span className="text-[#8da78d] underline font-medium">Terms and Conditions</span> and confirm that all information is correct.
          </label>
        </div>
      </div>
    </div>
  );
}
