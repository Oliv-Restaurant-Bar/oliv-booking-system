import React, { useMemo } from 'react';
import Image from 'next/image';
import { Eye, Lock, Check, Clock, Edit2, User, MapPin, Calendar, ClipboardList, ShoppingCart, Users, ChevronDown, ChevronUp, AlertTriangle, LayoutList, Wine, Package } from 'lucide-react';
import { MenuItem } from './menuItemsData';
import { EventDetails } from '@/lib/types';
import { DietaryIcon } from './DietaryIcon';
import { NativeCheckbox } from '@/components/ui/NativeCheckbox';
import { useWizardTranslation } from '@/lib/i18n/client';
import { useLocale } from 'next-intl';
import { useWizardStore } from '@/lib/store/useWizardStore';


interface CustomerSummaryProps {
  handleRequestUnlock: () => void;
}


export function CustomerSummary({
  handleRequestUnlock,
}: CustomerSummaryProps) {
  const t = useWizardTranslation();
  const locale = useLocale();
  
  const {
    eventDetails, isLocked, isUnlockRequested, isRequestingUnlock,
    isEditMode, setCurrentStep, setActiveTab,
    cart, menuItems, getVisibleCategories,
    collapsedCategories, setCollapsedCategory,
    getItemPerPersonPrice, getItemTotalPrice, getDietaryPerPersonTotals, getPerPersonSubtotal,
    summaryViewMode, setSummaryViewMode,
    includeBeveragePrices, setIncludeBeveragePrices,
    isConsumption, isPerPerson, isFlatFee,
    getFlatRateSubtotal, getConsumptionSubtotal,
    termsAccepted, setTermsAccepted,
    isAdminEdit
  } = useWizardStore();

  const selectedItems = Object.keys(cart);
  const itemQuantities = useMemo(() => {
    const quantities: Record<string, number> = {};
    Object.entries(cart).forEach(([id, item]) => {
      quantities[id] = item.quantity;
    });
    return quantities;
  }, [cart]);
  const categories = getVisibleCategories();

  
  // Use a derived guest count that prioritizes per-item overrides from the cart/modal
  const guestCountValue = React.useMemo(() => {
    const ppItems = selectedItems
      .map(id => menuItems.find(i => i.id === id))
      .filter((i): i is MenuItem => !!i && isPerPerson(i));
    
    if (ppItems.length === 0) return parseInt(eventDetails.guestCount) || 0;
    
    // Take the max guest count among per-person items
    return Math.max(...ppItems.map(item => cart[item.id].guestCount || parseInt(eventDetails.guestCount) || 1), parseInt(eventDetails.guestCount) || 0);
  }, [selectedItems, menuItems, cart, eventDetails.guestCount, isPerPerson]);

  const dietaryTotals = getDietaryPerPersonTotals();
  const perPersonTotalValue = getPerPersonSubtotal();
  const absoluteFoodTotal = useMemo(() => {
    return Object.entries(cart).reduce((total, [itemId, cartItem]) => {
      const item = menuItems.find(i => i.id === itemId);
      if (!item || !isPerPerson(item)) return total;
      return total + (getItemPerPersonPrice(item) * (cartItem.guestCount || parseInt(eventDetails.guestCount) || 1));
    }, 0);
  }, [cart, menuItems, eventDetails.guestCount, isPerPerson, getItemPerPersonPrice]);

  const flatRateTotalValue = getFlatRateSubtotal();
  const consumptionTotalValue = includeBeveragePrices ? getConsumptionSubtotal() : 0;
  const grandTotalValue = absoluteFoodTotal + flatRateTotalValue + consumptionTotalValue;


  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0" style={{ borderRadius: 'var(--radius)' }}>
            <Eye className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-foreground" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
              {t('sections.reviewRequest')}
            </h3>
            {isEditMode && (
              <p className="text-primary text-sm">{t('status.editMode')}</p>
            )}
          </div>
        </div>
        <p className="text-muted-foreground" style={{ fontSize: 'var(--text-base)' }}>
          {t('sections.reviewSubtitle')}
        </p>

        {isLocked && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg flex flex-col sm:flex-row items-start gap-4" style={{ borderRadius: 'var(--radius-card)' }}>
            <div className="flex items-start gap-3 flex-1">
              <Lock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-amber-800 font-semibold" style={{ fontSize: 'var(--text-base)' }}>
                  {t('status.bookingLocked')}
                </p>
                <p className="text-amber-700 text-sm" style={{ fontSize: 'var(--text-small)' }}>
                  {t('status.lockedDescription')}
                </p>
              </div>
            </div>
            <div className="w-full sm:w-auto flex-shrink-0">
              {isUnlockRequested ? (
                <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg border border-green-200" style={{ borderRadius: 'var(--radius)' }}>
                  <Check className="w-4 h-4" />
                  <span className="text-sm font-medium">{t('status.requestSent')}</span>
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
                      {t('status.processing')}
                    </>
                  ) : (
                    <>
                      <Edit2 className="w-4 h-4" />
                      {t('actions.requestEdit')}
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
                {t('labels.billingDetails')}
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
                {t('actions.edit')}
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-muted-foreground mb-1" style={{ fontSize: 'var(--text-small)' }}>{t('labels.name')}</p>
              <p className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                {eventDetails.name || '-'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1" style={{ fontSize: 'var(--text-small)' }}>{t('labels.business')}</p>
              <p className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                {eventDetails.business || '-'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1" style={{ fontSize: 'var(--text-small)' }}>{t('labels.email')}</p>
              <p className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                {eventDetails.email || '-'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1" style={{ fontSize: 'var(--text-small)' }}>{t('labels.telephone')}</p>
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
                {t('labels.address')}
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
                {t('actions.edit')}
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-3">
              <p className="text-muted-foreground mb-1" style={{ fontSize: 'var(--text-small)' }}>{t('labels.street')}</p>
              <p className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                {eventDetails.street || '-'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1" style={{ fontSize: 'var(--text-small)' }}>{t('labels.plz')}</p>
              <p className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                {eventDetails.plz || '-'}
              </p>
            </div>
            <div className="md:col-span-2">
              <p className="text-muted-foreground mb-1" style={{ fontSize: 'var(--text-small)' }}>{t('labels.location')}</p>
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
                {t('labels.eventDetails')}
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
                {t('actions.edit')}
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-muted-foreground mb-1" style={{ fontSize: 'var(--text-small)' }}>{t('labels.date')}</p>
              <p className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                {eventDetails.eventDate ? (() => {
                  const [y, m, d] = eventDetails.eventDate.split('-').map(Number);
                  const dObj = new Date(y, m - 1, d);
                  return dObj.toLocaleDateString(locale === 'de' ? 'de-CH' : 'en-CH', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  });
                })() : '-'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1" style={{ fontSize: 'var(--text-small)' }}>{t('labels.time')}</p>
              <p className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                {eventDetails.eventTime || '-'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1" style={{ fontSize: 'var(--text-small)' }}>{t('labels.guests')}</p>
              <p className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                {guestCountValue || '-'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1" style={{ fontSize: 'var(--text-small)' }}>{t('labels.occasion')}</p>
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
                  {t('sections.specialRequests')}
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
                  {t('actions.edit')}
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
                  {t('labels.selectedMenu', { count: selectedItems.length })}
                </h4>
                <p className="text-muted-foreground mt-0.5" style={{ fontSize: 'var(--text-small)' }}>
                  {t('labels.perPersonQuantities')}
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
                {t('actions.edit')}
              </button>
            )}
          </div>

          {selectedItems.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
              <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                {t('status.noChanges')}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {categories.map((category) => {
                const categoryItems = selectedItems
                  .map((itemId) => menuItems.find((i) => i.id === itemId))
                  .filter((item): item is MenuItem => item !== undefined && item.category === category)
                  .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

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
                        setCollapsedCategory(category, !collapsedCategories[category])

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
                        {isCollapsed ? t('actions.show') : t('actions.hide')}
                      </span>
                    </button>

                    {/* Items in this category - collapsible */}
                    {!isCollapsed && (
                      <div className="p-4 pt-2 space-y-2">
                        {categoryItems.map((item) => {
                          const itemId = item.id;
                          const quantity = cart[itemId].quantity;


                          return (
                            <div
                              key={itemId}
                              className="flex items-center gap-3 p-2 rounded-lg bg-muted/20"
                            >
                              {/* Thumbnail */}
                              <div className="w-12 h-12 flex-shrink-0 rounded overflow-hidden bg-muted relative">
                                <Image
                                  src={item.image}
                                  alt={item.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>

                              {/* Item Details */}
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-col gap-1">
                                  <div className="flex items-center gap-2">
                                    {item.dietaryType !== 'none' && (
                                      <DietaryIcon type={item.dietaryType} size="sm" />
                                    )}
                                    <h6 className="text-foreground font-medium text-sm line-clamp-2 max-w-125 leading-tight flex items-center gap-1">
                                      {isPerPerson(item) && <Users className="w-3.5 h-3.5 text-muted-foreground" />}
                                      {isConsumption(item) && <Wine className="w-3.5 h-3.5 text-muted-foreground" />}
                                      {isFlatFee(item) && <Package className="w-3.5 h-3.5 text-muted-foreground" />}
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
                                        {t('status.billedByConsumption')}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {/* Variants, Add-ons, Comments */}
                                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
                                  {cart[itemId].variantId && item.variants && (() => {
                                    const variant = item.variants.find((v) => v.id === cart[itemId].variantId);
                                    return variant ? (
                                      <span>{t('labels.variant')}: {variant.name}</span>
                                    ) : null;
                                  })()}

                                  {cart[itemId].addOnIds && cart[itemId].addOnIds.length > 0 && (
                                    <span>
                                      {t('labels.addons')}:{' '}
                                      {cart[itemId].addOnIds

                                        .map((addOnId) => {
                                          const addOn = item.addOns?.find((ao) => ao.id === addOnId);
                                          return addOn ? addOn.name : null;
                                        })
                                        .filter(Boolean)
                                        .join(', ')}
                                    </span>
                                  )}
                                  {cart[itemId].comment && (
                                    <span className="italic truncate max-w-125">{t('labels.itemNote')}: {cart[itemId].comment}</span>
                                  )}

                                </div>
                              </div>

                              {/* Price */}
                              <div className="flex-shrink-0 text-right">
                                <p className="text-primary font-semibold text-sm">
                                  {isConsumption(item)
                                    ? `CHF ${item.price.toFixed(2)}/unit`
                                    : `CHF ${(getItemPerPersonPrice(item) * (isPerPerson(item) ? (cart[itemId].guestCount || parseInt(eventDetails.guestCount) || 1) : quantity)).toFixed(2)}`}

                                </p>
                                {isAdminEdit && (
                                  <p className="text-muted-foreground text-xs">
                                    {isConsumption(item)
                                      ? t('status.billedByConsumption')
                                      : (isPerPerson(item) && !isFlatFee(item) && item.category !== 'Beverages')
                                        ? t('status.guestsCalculation', { count: cart[itemId].guestCount || parseInt(eventDetails.guestCount) || 1, price: getItemPerPersonPrice(item).toFixed(2) })
                                        : t('status.qtyCalculation', { qty: quantity, price: getItemPerPersonPrice(item).toFixed(2) })}
                                  </p>
                                )}
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
              <div className="border-t border-border pt-6 mt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <DietaryIcon type="veg" size="sm" />
                    <div>
                      <p className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>
                        {t('labels.vegTrackTotal')}
                      </p>
                      <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                        {t('status.perPerson')}
                      </p>
                    </div>
                  </div>
                  <p className="text-foreground" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
                    CHF {dietaryTotals.veg.toFixed(2)}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <DietaryIcon type="non-veg" size="sm" />
                    <div>
                      <p className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>
                        {t('labels.nonVegTrackTotal')}
                      </p>
                      <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                        {t('status.perPerson')}
                      </p>
                    </div>
                  </div>
                  <p className="text-foreground" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
                    CHF {dietaryTotals.nonVeg.toFixed(2)}
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-2 text-muted-foreground bg-muted/20 p-2 rounded" style={{ fontSize: 'var(--text-small)' }}>
                  <ShoppingCart className="w-4 h-4" />
                  <span>
                    {t('labels.selectedMenu', { count: selectedItems.length })} {t('status.forEvent')} {guestCountValue || '0'}{' '}
                    {guestCountValue === 1 ? t('labels.guest') : t('labels.guests_plural')}
                  </span>
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
                {t('labels.dietaryBreakdown')}
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Meat/Fish Summary */}
              <div className="bg-card border border-border rounded-lg p-4" style={{ borderRadius: 'var(--radius)' }}>
                <p className="text-muted-foreground mb-2" style={{ fontSize: 'var(--text-small)' }}>
                  {t('labels.meatFish')}
                </p>
                <p className="text-primary mb-1" style={{ fontSize: 'var(--text-h2)', fontWeight: 'var(--font-weight-semibold)' }}>
                  {selectedItems.filter((itemId) => {
                    const item = menuItems.find((i) => i.id === itemId);
                    return item?.dietaryType === 'non-veg';
                  }).length}{' '}
                  {t('labels.items')}
                </p>
                {eventDetails.guestCount && isAdminEdit && (
                  <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                    {t('labels.portionsCalculation', {
                      count: selectedItems
                        .filter((itemId) => {
                          const item = menuItems.find((i) => i.id === itemId);
                          return (item?.dietaryType === 'non-veg' && item?.pricingType === 'per-person') || (item?.dietaryType === 'non-veg' && item?.pricingType === 'flat_fee');
                        })
                        .reduce((total, itemId) => total + (cart[itemId].quantity), 0) * guestCountValue

                    })}
                  </p>
                )}
              </div>

              {/* Veggie Summary */}
              <div className="bg-card border border-border rounded-lg p-4" style={{ borderRadius: 'var(--radius)' }}>
                <p className="text-muted-foreground mb-2" style={{ fontSize: 'var(--text-small)' }}>
                  {t('labels.veggieVegan')}
                </p>
                <p className="text-primary mb-1" style={{ fontSize: 'var(--text-h2)', fontWeight: 'var(--font-weight-semibold)' }}>
                  {selectedItems.filter((itemId) => {
                    const item = menuItems.find((i) => i.id === itemId);
                    return item?.dietaryType === 'veg' || item?.dietaryType === 'vegan';
                  }).length}{' '}
                  {t('labels.items')}
                </p>
                {eventDetails.guestCount && isAdminEdit && (
                  <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                    {t('labels.portionsCalculation', {
                      count: selectedItems
                        .filter((itemId) => {
                          const item = menuItems.find((i) => i.id === itemId);
                          return ((item?.dietaryType === 'veg' || item?.dietaryType === 'vegan') && item?.pricingType === 'per-person') || ((item?.dietaryType === 'veg' || item?.dietaryType === 'vegan') && item?.pricingType === 'flat_fee');
                        })
                        .reduce((total, itemId) => total + (cart[itemId].quantity), 0) * guestCountValue

                    })}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary Card with Toggle View */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm" style={{ borderRadius: 'var(--radius-card)' }}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0" style={{ borderRadius: 'var(--radius)' }}>
                  <LayoutList className="w-4 h-4 text-primary" />
                </div>
                <h4 className="text-foreground" style={{ fontSize: 'var(--text-h4)', fontWeight: 'var(--font-weight-semibold)' }}>
                  {t('labels.orderOverview')}
                </h4>
              </div>
              <div className="flex bg-muted p-1 rounded-lg" style={{ borderRadius: 'var(--radius)' }}>
                <button
                  onClick={() => setSummaryViewMode('per-person')}
                  className={`px-3 py-1 text-xs font-medium transition-all ${summaryViewMode === 'per-person' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                  style={{ borderRadius: 'calc(var(--radius) - 4px)' }}
                >
                  {t('labels.proPerson')}
                </button>
                <button
                  onClick={() => setSummaryViewMode('total')}
                  className={`px-3 py-1 text-xs font-medium transition-all ${summaryViewMode === 'total' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                  style={{ borderRadius: 'calc(var(--radius) - 4px)' }}
                >
                  {t('labels.totalExtras')}
                </button>
              </div>
            </div>

            {summaryViewMode === 'per-person' ? (
              // Per-Person View
              <div className="space-y-4">
                <div className="bg-card border border-border rounded-lg p-4" style={{ borderRadius: 'var(--radius)' }}>
                  <p className="text-foreground font-semibold mb-3" style={{ fontSize: 'var(--text-base)' }}>
                    {t('labels.perPersonBreakdown')}
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
                        })
                        .sort((a, b) => {
                          const itemA = a as MenuItem;
                          const itemB = b as MenuItem;
                          return (itemA.sortOrder || 0) - (itemB.sortOrder || 0);
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
                                  <span className="text-muted-foreground line-clamp-2 max-w-125 leading-tight flex items-center gap-1" style={{ fontSize: 'var(--text-small)' }}>
                                    <Users className="w-3 h-3" />
                                    {item.name}
                                  </span>
                                  <span className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                                    ×{cart[itemId].quantity}
                                  </span>

                                </div>
                                <span className="text-foreground font-medium">
                                  CHF {(getItemPerPersonPrice(item) * cart[itemId].quantity).toFixed(2)}
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
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b border-primary/10">
                      <div>
                        <p className="text-foreground font-semibold" style={{ fontSize: 'var(--text-small)' }}>
                          {t('labels.vegTrackTotal')}
                        </p>
                        <p className="text-muted-foreground text-xs">{t('status.perPerson')}</p>
                      </div>
                      <p className="text-emerald-600 font-bold">CHF {dietaryTotals.veg.toFixed(2)}</p>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-primary/10">
                      <div>
                        <p className="text-foreground font-semibold" style={{ fontSize: 'var(--text-small)' }}>
                          {t('labels.nonVegTrackTotal')}
                        </p>
                        <p className="text-muted-foreground text-xs">{t('status.perPerson')}</p>
                      </div>
                      <p className="text-rose-600 font-bold">CHF {dietaryTotals.nonVeg.toFixed(2)}</p>
                    </div>
                    <div className="flex justify-between items-center pt-1">
                      <p className="text-muted-foreground text-xs">
                        {t('labels.guestCount')}: {guestCountValue || '0'}
                      </p>
                      <p className="text-primary font-bold">
                        ~ CHF {(Math.max(dietaryTotals.veg, dietaryTotals.nonVeg) * guestCountValue).toFixed(2)}
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
                      🍽️ {t('labels.menu')}
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
                            return item && item.category === cat && !isConsumption(item) && !isFlatFee(item);
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

                      const mealsSubtotal = selectedItems
                        .filter((itemId) => {
                          const item = menuItems.find((i) => i.id === itemId);
                          return item && foodCategories.includes(item.category);
                        })
                        .reduce((sum, itemId) => {
                          const item = menuItems.find((i) => i.id === itemId);
                          return sum + (item ? getItemTotalPrice(item) : 0);
                        }, 0);

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
                          <div className="pt-3 mt-3 border-t border-primary/30 flex justify-between items-baseline gap-4">
                            <span className="text-foreground font-bold min-w-0">
                              {t('labels.mealsSubtotal')}
                            </span>
                            <span className="text-foreground font-bold flex-shrink-0 whitespace-nowrap">
                              CHF {mealsSubtotal.toFixed(2)}
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
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-4 shadow-sm" style={{ borderRadius: 'var(--radius)' }}>
                      <div className="bg-gray-50/50 px-4 py-3 border-b border-gray-200">
                        <p className="text-[#374151] font-semibold" style={{ fontSize: 'var(--text-base)' }}>
                          {t('status.billedByConsumption')}
                        </p>
                        {!includeBeveragePrices && (
                          <p className="text-gray-500 text-xs mt-1">
                            {t('labels.drinksExcludedWarning')}
                          </p>
                        )}
                      </div>
                      <div className="p-4 space-y-2">
                        {consumptionItems.map((itemId) => {
                          const item = menuItems.find((i) => i.id === itemId);
                          if (!item) return null;
                          const itemTotal = getItemTotalPrice(item);
                          const variant = cart[itemId].variantId && item.variants
                            ? item.variants.find((v: any) => v.id === cart[itemId].variantId)
                            : null;
                          const quantity = cart[itemId].quantity;


                          return (
                            <div key={itemId} className="flex justify-between items-center py-1.5 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 px-1 rounded transition-colors group">
                              <div className="flex items-center gap-2 flex-wrap min-w-0 pr-4">
                                <div className="flex flex-col">
                                  <span className="text-gray-700 font-medium truncate" style={{ fontSize: 'var(--text-small)' }}>
                                    {item.name}
                                  </span>
                                  <div className="flex items-center gap-2 text-[10px] text-gray-500">
                                    {variant && (
                                      <span className="bg-gray-100 px-1.5 py-0.5 rounded">{variant.name}</span>
                                    )}
                                    <span className="flex items-center gap-1">
                                      <Wine className="w-3 h-3" />
                                      {quantity} × CHF {getItemPerPersonPrice(item).toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <span className={`font-semibold flex-shrink-0 ${!includeBeveragePrices ? 'text-gray-300 line-through' : 'text-primary'}`}>
                                CHF {itemTotal.toFixed(2)}
                              </span>
                            </div>
                          );
                        })}
                        <div className="pt-3 mt-3 border-t border-gray-100 flex justify-between items-baseline gap-4">
                          <span className="text-[#374151] font-bold min-w-0">
                            {t('labels.consumptionSubtotal')}
                          </span>
                          <span className="text-[#374151] font-bold flex-shrink-0 whitespace-nowrap">
                            CHF {includeBeveragePrices ? getConsumptionSubtotal().toFixed(2) : '0.00'}

                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Technology, Decoration, Furniture, Miscellaneous Sections */}
                {['Add-ons', 'Technology', 'Decoration', 'Furniture', 'Miscellaneous', 'Beverages'].map((category) => {
                  const categoryItems = selectedItems.filter((itemId) => {
                    const item = menuItems.find((i) => i.id === itemId);
                    if (!item) return false;
                    // Include if category matches OR if it's a flat fee item that doesn't fit elsewhere (and is not beverage/food)
                    if (category === 'Add-ons') {
                      return (item.category === 'Add-ons' || (isFlatFee(item) && !['Technology', 'Decoration', 'Furniture', 'Miscellaneous', 'Beverages'].includes(item.category || '')));
                    }
                    return item.category === category && !isConsumption(item);
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
                          const quantity = cart[itemId].quantity;

                          return (
                            <div key={itemId} className="flex justify-between items-center py-1">
                              <span className="text-muted-foreground flex items-center gap-1" style={{ fontSize: 'var(--text-small)' }}>
                                {isFlatFee(item) && <Package className="w-3 h-3" />}
                                {item.name} {quantity > 1 ? `(×${quantity})` : ''}
                              </span>
                              <span className="text-foreground font-medium">
                                CHF {(getItemTotalPrice(item)).toFixed(2)}
                              </span>
                            </div>
                          );
                        })}
                        <div className="pt-2 mt-2 border-t border-primary/30 flex justify-between items-baseline gap-4">
                          <span className="text-foreground font-semibold min-w-0">
                            {t('labels.subtotal')} {category}:
                          </span>
                          <span className="text-foreground font-semibold flex-shrink-0 whitespace-nowrap">
                            CHF {categorySubtotal.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Drink Inclusion Checkbox Card */}
                {selectedItems.some(itemId => {
                  const item = menuItems.find(i => i.id === itemId);
                  return item && isConsumption(item);
                }) && (
                  <div className="p-4 mb-6 shadow-sm flex items-start gap-3"
                    style={{
                      backgroundColor: 'var(--consumption-alert-bg)',
                      borderColor: 'var(--consumption-alert-border)',
                      borderRadius: 'var(--radius)'
                    }}>
                    <NativeCheckbox
                      id="include-drinks-summary"
                      checked={includeBeveragePrices}
                      onChange={(e) => setIncludeBeveragePrices(e.target.checked)}
                      className="mt-1"
                    />
                    <label htmlFor="include-drinks-summary" className="cursor-pointer">
                      <span className="block text-gray-800 font-medium mb-1">{t('labels.includeDrinksEstimate')}</span>
                      {!includeBeveragePrices && (
                        <span className="block text-sm" style={{ color: 'var(--consumption-alert-text)' }}>{t('labels.drinksExcludedWarning')}</span>
                      )}
                    </label>
                  </div>
                )}

              </div>
            )}

            {/* Grand Total & Final Actions */}
            <div className="mt-8 space-y-6">
              {/* Grand Total Section */}
              <div className="bg-white border-2 border-[#1e293b] rounded-lg p-6 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6" style={{ borderRadius: 'var(--radius)' }}>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[#1e293b] font-bold uppercase tracking-wider mb-1 break-words" style={{ fontSize: 'var(--text-h4)' }}>
                    {t('labels.totalEstimate')}
                  </h3>
                  <p className="text-muted-foreground font-medium" style={{ fontSize: 'var(--text-small)' }}>
                    {t('labels.guestsCountCalculation', { count: guestCountValue })}
                  </p>
                </div>
                <div className="flex flex-col items-end flex-shrink-0 text-right">
                  <span className="text-xs font-bold text-muted-foreground mb-[-4px] uppercase tracking-widest">CHF</span>
                  <div className="font-bold leading-none" style={{ fontSize: 'var(--text-h2)', color: '#8da78d' }}>
                    {grandTotalValue.toFixed(2)}

                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {grandTotalValue > 5000 && !isEditMode && (

          <div className="bg-[#1e293b] text-white p-6 rounded-lg flex gap-4 items-start shadow-md" style={{ borderRadius: 'var(--radius)' }}>
            <AlertTriangle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-bold mb-2" style={{ fontSize: 'var(--text-base)' }}>{t('labels.depositRequirement')}</h4>
              <p className="text-gray-300 text-sm mb-3">
                {t('labels.depositRequirementText')}
              </p>
              <p className="text-gray-400 text-xs flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                {t('labels.contactAfterLocked')}
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
            {t('labels.agreeTerms')}
          </label>
        </div>
      </div>
    </div>
  );
}
