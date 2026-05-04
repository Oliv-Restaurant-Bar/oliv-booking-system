import * as React from 'react';
import {
  ShoppingCart,
  X,
  Check,
  Calendar,
  Minus,
  Plus,
  AlertTriangle,
  Users,
  Wine,
  ChevronRight,
  Package,
  Circle
} from 'lucide-react';
import Image from 'next/image';
import { format, parseISO, isValid } from 'date-fns';
import { enUS, de } from 'date-fns/locale';
import { useLocale } from 'next-intl';
import { MenuItem } from './menuItemsData';
import { EventDetails } from '@/lib/types';
import { DietaryIcon } from './DietaryIcon';
import { Edit2 } from 'lucide-react';
import { TermsAndConditionsModal } from './TermsAndConditionsModal';
import { useWizardStore } from '@/lib/store/useWizardStore';
import { useWizardTranslation, useCommonTranslation } from '@/lib/i18n/client';


interface MenuCartProps {
  isCartCollapsed?: boolean;
  setIsCartCollapsed?: (value: boolean) => void;
  onContinue?: () => void;
  continueButtonText?: string;
  onEditDateTime?: () => void;
  isDrawer?: boolean;
  onCloseDrawer?: () => void;
}

export function MenuCart({
  onContinue,
  onEditDateTime,
  continueButtonText = 'Fortfahren',
  isDrawer = false,
  onCloseDrawer,
}: MenuCartProps) {
  const t = useWizardTranslation();
  const ct = useCommonTranslation();
  const {
    cart, removeItem, updateItem,
    menuItems,
    eventDetails,
    categories,
    categoryData,
    isSubmitting,
    isEditMode,
    editBookingData,
    includeBeveragePrices, setIncludeBeveragePrices,
    getItemPerPersonPrice, getItemTotalPrice, getDietaryPerPersonTotals,
    getPerPersonSubtotal, getFlatRateSubtotal, getConsumptionSubtotal,
    isPerPerson, isFlatFee, isConsumption,
    setEventDetails, isAdminEdit, setDetailsModalItem
  } = useWizardStore();

  const selectedItems = React.useMemo(() => Object.keys(cart), [cart]);

  const [viewMode, setViewMode] = React.useState<'per-person' | 'total'>('per-person');
  const [termsAccepted, setTermsAccepted] = React.useState(isEditMode);

  // Map store cart to legacy prop format for internal logic compatibility
  const itemVariants = React.useMemo(() =>
    Object.fromEntries(Object.entries(cart).map(([id, item]) => [id, item.variantId || ''])),
    [cart]
  );
  const itemAddOns = React.useMemo(() =>
    Object.fromEntries(Object.entries(cart).map(([id, item]) => [id, item.addOnIds || []])),
    [cart]
  );
  const itemQuantities = React.useMemo(() =>
    Object.fromEntries(Object.entries(cart).map(([id, item]) => [id, item.quantity])),
    [cart]
  );
  const itemGuestCounts = React.useMemo(() =>
    Object.fromEntries(Object.entries(cart).map(([id, item]) => [id, item.guestCount || 0])),
    [cart]
  );

  // Also sync when isEditMode changes
  React.useEffect(() => {
    if (isEditMode) {
      setTermsAccepted(true);
    }
  }, [isEditMode]);

  const [isDepositModalOpen, setIsDepositModalOpen] = React.useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = React.useState(false);
  const [expandedItems, setExpandedItems] = React.useState<Record<string, boolean>>({});
  const [expandedDietary, setExpandedDietary] = React.useState<'veg' | 'non-veg' | null>(null);

  const toggleExpand = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedItems(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  // Removed redundant local guest count sync - store handles this

  // Helper for formatting date: "Thu, Mar 12, 2026"
  const locale = useLocale();
  const getFormattedDate = () => {
    if (!eventDetails.eventDate) return t('common.selectDate');
    try {
      const date = parseISO(eventDetails.eventDate);
      if (!isValid(date)) return eventDetails.eventDate;
      const dateLocale = locale === 'de' ? de : enUS;
      const dateFormat = locale === 'de' ? 'eee, dd. MMM yyyy' : 'eee, MMM dd, yyyy';
      return format(date, dateFormat, { locale: dateLocale });
    } catch (e) {
      return eventDetails.eventDate;
    }
  };


  const cartItems = React.useMemo(() => selectedItems.map(id => menuItems.find(item => item.id === id)).filter(Boolean) as MenuItem[], [selectedItems, menuItems]);
  const foodItems = React.useMemo(() => cartItems.filter(item => item.category !== 'Beverages' && item.category !== 'Add-ons' && !isFlatFee(item)), [cartItems]);
  const beverages = React.useMemo(() => cartItems.filter(item => item.category === 'Beverages'), [cartItems]);
  const addons = React.useMemo(() => cartItems.filter(item => item.category === 'Add-ons' || (isFlatFee(item) && item.category !== 'Beverages')), [cartItems]);

  const dietaryTotals = getDietaryPerPersonTotals();
  const perPersonTotalValue = getPerPersonSubtotal();

  const guestCountValue = React.useMemo(() => {
    return parseInt(eventDetails.guestCount) || 0;
  }, [eventDetails.guestCount]);

  const absoluteFoodTotal = React.useMemo(() => {
    return perPersonTotalValue * guestCountValue;
  }, [perPersonTotalValue, guestCountValue]);

  const currentGuestCount = React.useMemo(() => {
    return parseInt(eventDetails.guestCount) || 1;
  }, [eventDetails.guestCount]);

  const perPersonTotal = perPersonTotalValue;

  const totalAbsoluteAmount = absoluteFoodTotal +
    getFlatRateSubtotal() +
    (includeBeveragePrices ? getConsumptionSubtotal() : 0);

  const totalAmount = totalAbsoluteAmount;

  const isUg1Exklusiv = eventDetails.room === 'ug1_exklusiv';
  const showMinSpendWarning = !isEditMode && isUg1Exklusiv && totalAbsoluteAmount < 1000;



  return (
    <div className={`font-sans h-full flex flex-col bg-background relative overflow-hidden ${isSubmitting ? 'opacity-50 pointer-events-none select-none' : ''}`}>
      <div className="flex-1 overflow-y-auto min-h-0">
        {/* 1. HEADER (Now scrollable) */}
        <div className="shrink-0 px-8 pt-6 pb-4 flex flex-col items-center text-center border-b border-muted/50 relative">
          {onCloseDrawer && (
            <button
              onClick={onCloseDrawer}
              className="absolute right-6 top-6 p-2 rounded-full bg-muted/50 text-muted-foreground hover:text-foreground transition-colors lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          <div className="mb-4">
            <Image
              src="/assets/oliv-logo.png"
              alt="Oliv Restaurant & Bar"
              width={110}
              height={44}
              className="h-11 w-auto object-contain"
              style={{ height: 'auto' }}
            />
          </div>

          <div className="space-y-0.5 mb-4">
            <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">{t('labels.offer') || 'Offer'}</span>
            <h2 className="text-xl font-bold text-foreground tracking-tight leading-tight">{eventDetails.name || "Event Name"}</h2>
            <p className="text-xs text-muted-foreground font-medium italic">
              {eventDetails.business ? `c/o ${eventDetails.business}` : t('labels.privateEvent') || "Private Event"}
            </p>
          </div>

          {/* Date/Time Info Box */}
          <button
            onClick={onEditDateTime}
            className="w-full bg-muted/50 rounded-card p-4 space-y-1 border border-muted hover:bg-muted transition-colors cursor-pointer group"
          >
            <p className="text-sm font-bold text-foreground flex items-center justify-center gap-2 group-hover:text-primary transition-colors">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              {getFormattedDate()} — {eventDetails.eventTime || "TBD"}
            </p>
            <div className="space-y-0">
              <p className="text-xs text-muted-foreground font-medium">
                {t('labels.approx') || 'approx.'} {currentGuestCount} {currentGuestCount === 1 ? t('labels.guest') : t('labels.guests_plural')}
              </p>
              {isEditMode && editBookingData?.guestCount && parseInt(editBookingData.guestCount) !== currentGuestCount && (
                <p className="text-[10px] text-muted-foreground font-medium italic">
                  Ursprünglich: {editBookingData.guestCount}
                </p>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
              {eventDetails.room === 'ug1_exklusiv' ? t('labels.rooms.ug1_exklusiv') : (eventDetails.room === 'eg' ? t('labels.rooms.eg') : t('labels.rooms.ug1') || 'Private')}
            </p>
          </button>

          <div className="w-full mt-6 flex items-center justify-center gap-4">
            <div className="h-[1px] flex-1 bg-border" />
            <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">{t('labels.menu')}</span>
            <div className="h-[1px] flex-1 bg-border" />
          </div>
          <div className="mt-1 text-primary flex justify-center">
            <Plus className="w-3 h-3" />
          </div>
        </div>

        {/* 2. SCROLLABLE CONTENT */}
        <div className="px-8 py-6">
          {selectedItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="size-[80px] rounded-full bg-muted/50 flex items-center justify-center mb-5 relative ">
                <ShoppingCart className="w-8 h-8 text-muted-foreground/40" />
                <div className="absolute top-0 right-0 size-6 bg-background rounded-full border border-muted shadow-sm flex items-center justify-center">
                  <Plus className="w-3.5 h-3.5 text-primary" />
                </div>
              </div>
              <h3 className="font-bold text-lg text-foreground mb-1.5">{t('status.cartEmptyTitle') || 'Stellen Sie Ihr Menü zusammen'}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-[200px]">{t('status.cartEmptySubtitle') || 'Wählen Sie aus unseren Kategorien auf der linken Seite.'}</p>
            </div>
          ) : (
            <div className="space-y-10">
              {/* Grouped by categories following the defined order */}
              {categories
                .filter(cat => cartItems.some(i => i.category === cat))
                .map(category => {
                  const itemsInCategory = cartItems
                    .filter(i => i.category === category)
                    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

                  const isGuestCountEnabled = !!categoryData[category]?.guestCount;
                  const perPersonItems = isGuestCountEnabled ? [] : itemsInCategory.filter(i => isPerPerson(i));
                  const listItems = isGuestCountEnabled ? itemsInCategory : itemsInCategory.filter(i => isFlatFee(i) || isConsumption(i));
                  const isSpecial = categoryData[category]?.useSpecialCalculation;

                  return (
                    <div key={category} className="space-y-6 pt-4">
                      {/* Category Header */}
                      <div className="text-center">
                        <h3 className="text-base font-bold text-foreground mb-2">
                          {category}
                        </h3>
                        <div className="w-full h-px bg-primary/20" />
                      </div>

                      {/* 1. Per-Person Items (Card Layout) */}
                      {perPersonItems.length > 0 && (
                        <div className="space-y-6">
                          {perPersonItems.map((item, idx, arr) => {
                            const cartItem = cart[item.id];
                            return (
                              <div key={item.id} className="text-center space-y-2 group relative">
                                <div className="flex items-center justify-center gap-2">
                                  {item.dietaryType !== 'none' && (
                                    <DietaryIcon type={item.dietaryType} size="xs" />
                                  )}
                                  <h4 className="text-base font-semibold text-foreground line-clamp-2 max-w-[320px] leading-tight">{item.name}</h4>

                                  <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={() => setDetailsModalItem(item)}
                                      className="p-1 hover:text-primary text-muted-foreground"
                                    >
                                      <Edit2 className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() => removeItem(item.id)}
                                      className="p-1 hover:text-destructive text-muted-foreground"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>

                                {item.description && (
                                  <p className="text-xs text-muted-foreground italic px-4 leading-snug">
                                    {item.description}
                                  </p>
                                )}



                                {/* Collapsible details */}
                                {((cartItem.variantId && item.variants) || (cartItem.addOnIds && cartItem.addOnIds.length > 0)) && (
                                  <div className="flex flex-col items-center">
                                    <button
                                      onClick={(e) => toggleExpand(item.id, e)}
                                      className="mt-1 flex items-center gap-1 text-[10px] font-bold text-primary hover:text-foreground transition-colors uppercase tracking-wider"
                                    >
                                      {expandedItems[item.id] ? t('actions.hide') : t('actions.show')}
                                      <ChevronRight className={`w-3 h-3 transition-transform ${expandedItems[item.id] ? 'rotate-90' : ''}`} />
                                    </button>

                                    {expandedItems[item.id] && (
                                      <div className="mt-2 space-y-1 animate-in slide-in-from-top-1 duration-200">
                                        {cartItem.variantId && item.variants && (
                                          <p className="text-xs text-muted-foreground">
                                            {item.variants.find(v => v.id === cartItem.variantId)?.name}
                                          </p>
                                        )}
                                        {item.addonGroups?.map(group => {
                                          const selectedInGroup = group.items.filter(i => cartItem.addOnIds?.includes(i.id));
                                          if (selectedInGroup.length === 0) return null;
                                          return selectedInGroup.map(addon => (
                                            <p key={addon.id} className="text-xs text-muted-foreground">
                                              + {addon.name}
                                            </p>
                                          ));
                                        })}
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* "OR" separator only if category is special */}
                                {isSpecial && idx < arr.length - 1 && (
                                  <p className="text-xs text-muted-foreground italic mt-4 uppercase tracking-widest">{ct('or')}</p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* 2. List Items (Standard List Layout) */}
                      {listItems.length > 0 && (
                        <div className="space-y-4">
                          {listItems.map((item, idx, arr) => {
                            const cartItem = cart[item.id];
                            return (
                              <div key={item.id} className="group">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 min-w-0">
                                      {item.dietaryType !== 'none' && (
                                        <div className="shrink-0">
                                          <DietaryIcon type={item.dietaryType} size="xs" />
                                        </div>
                                      )}
                                      <span className="text-sm font-semibold text-foreground leading-tight line-clamp-2">
                                        {(isGuestCountEnabled || isConsumption(item) || isFlatFee(item)) && (
                                          <span className="text-sm mr-0.5 inline-flex items-center gap-1">
                                            {isPerPerson(item) && <Users className="w-3 h-3 text-muted-foreground" />}
                                            {isConsumption(item) && <Wine className="w-3 h-3 text-muted-foreground" />}
                                            {isFlatFee(item) && <Package className="w-3 h-3 text-muted-foreground" />}
                                            {isPerPerson(item) ? (cartItem.guestCount ?? guestCountValue) : cartItem.quantity}
                                            <span className="text-xs text-muted-foreground font-normal">×</span>
                                          </span>
                                        )}
                                        {item.name}
                                      </span>
                                    </div>

                                    {/* Collapsible details toggle */}
                                    {((cartItem.variantId && item.variants) || (cartItem.addOnIds && cartItem.addOnIds.length > 0)) && (
                                      <button
                                        onClick={(e) => toggleExpand(item.id, e)}
                                        className="mt-1 flex items-center gap-1 text-[10px] font-bold text-primary hover:text-foreground transition-colors uppercase tracking-wider"
                                      >
                                        {expandedItems[item.id] ? t('actions.hide') : t('actions.show')}
                                        <ChevronRight className={`w-3 h-3 transition-transform ${expandedItems[item.id] ? 'rotate-90' : ''}`} />
                                      </button>
                                    )}

                                    {/* Expanded Menu Options */}
                                    {expandedItems[item.id] && ((cartItem.variantId && item.variants) || (cartItem.addOnIds && cartItem.addOnIds.length > 0)) && (
                                      <div className="mt-2 pl-4 border-l border-muted space-y-1.5 animate-in slide-in-from-top-1 duration-200">
                                        {cartItem.variantId && item.variants && (
                                          <p className="text-xs text-muted-foreground">
                                            {item.variants.find(v => v.id === cartItem.variantId)?.name}
                                          </p>
                                        )}
                                        {item.addonGroups?.map(group => {
                                          const selectedInGroup = group.items.filter(i => cartItem.addOnIds?.includes(i.id));
                                          if (selectedInGroup.length === 0) return null;
                                          return selectedInGroup.map(addon => (
                                            <p key={addon.id} className="text-xs text-muted-foreground">
                                              + {addon.name}
                                            </p>
                                          ));
                                        })}
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-3 shrink-0">
                                    <span className="text-sm font-semibold text-foreground">
                                      CHF {getItemPerPersonPrice(item).toFixed(2)}
                                    </span>
                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={() => setDetailsModalItem(item)}
                                        className="p-1.5 hover:bg-muted/50 rounded-full hover:text-primary text-muted-foreground transition-all"
                                      >
                                        <Edit2 className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => removeItem(item.id)}
                                        className="p-1.5 hover:bg-muted/50 rounded-full hover:text-destructive text-muted-foreground transition-all"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                {/* "OR" separator for list layout if category is special */}
                                {isSpecial && idx < arr.length - 1 && (
                                  <div className="flex items-center gap-4 py-1">
                                    <div className="h-px flex-1 bg-border/40" />
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest italic">{ct('or')}</span>
                                    <div className="h-px flex-1 bg-border/40" />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      {/* 3. STICKY FOOTER - Only visible when items are selected */}
      {selectedItems.length > 0 && (
        <div className="p-4 border-t border-muted bg-background shrink-0 space-y-4 sticky bottom-0 z-[20] shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-foreground">{t('sections.orderOverview') || 'Bestellübersicht'}</h3>
              <div className="p-0.5 bg-muted rounded-lg flex gap-0.5">
                <button
                  onClick={() => setViewMode('per-person')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === 'per-person' ? "bg-primary text-foreground shadow-sm" : "text-muted-foreground"}`}
                >
                  {t('labels.proPerson') || 'Pro Person'}
                </button>
                <button
                  onClick={() => setViewMode('total')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === 'total' ? "bg-primary text-foreground shadow-sm" : "text-muted-foreground"}`}
                >
                  {t('labels.totalExtras') || 'Total + extras'}
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {viewMode === 'per-person' ? (
                <div className="space-y-4">
                  {/* Veg Track */}
                  <div className="space-y-2">
                    <div
                      className="flex justify-between items-center text-sm cursor-pointer group"
                      onClick={() => setExpandedDietary(expandedDietary === 'veg' ? null : 'veg')}
                    >
                      <div className="flex items-center gap-2">
                        <DietaryIcon type="veg" size="xs" />
                        <span className="text-muted-foreground font-medium group-hover:text-foreground transition-colors">{t('labels.vegTrackTotal')}</span>
                      </div>
                      <span className="text-foreground font-semibold">CHF {dietaryTotals.veg.toFixed(2)}</span>
                    </div>
                    {expandedDietary === 'veg' && (
                      <div className="pl-6 space-y-1.5 animate-in slide-in-from-top-1 duration-200">
                        {cartItems.filter(i => i.dietaryType === 'veg').map(item => (
                          <div key={item.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                            <DietaryIcon type="veg" size="xs" className="scale-75 origin-left" />
                            <span className="truncate">{item.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Non-Veg Track */}
                  <div className="space-y-2">
                    <div
                      className="flex justify-between items-center text-sm cursor-pointer group"
                      onClick={() => setExpandedDietary(expandedDietary === 'non-veg' ? null : 'non-veg')}
                    >
                      <div className="flex items-center gap-2">
                        <DietaryIcon type="non-veg" size="xs" />
                        <span className="text-muted-foreground font-medium group-hover:text-foreground transition-colors">{t('labels.nonVegTrackTotal')}</span>
                      </div>
                      <span className="text-foreground font-semibold">CHF {dietaryTotals.nonVeg.toFixed(2)}</span>
                    </div>
                    {expandedDietary === 'non-veg' && (
                      <div className="pl-6 space-y-1.5 animate-in slide-in-from-top-1 duration-200">
                        {cartItems.filter(i => i.dietaryType === 'non-veg').map(item => (
                          <div key={item.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                            <DietaryIcon type="non-veg" size="xs" className="scale-75 origin-left" />
                            <span className="truncate">{item.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">{t('labels.foodItems') || 'Food Items'}</span>
                    <span className="text-foreground font-semibold">
                      CHF {absoluteFoodTotal.toFixed(2)}
                    </span>
                  </div>
                  {getFlatRateSubtotal() > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">{t('labels.addons') || 'Add-ons & Extras'}</span>
                      <span className="text-foreground font-semibold">
                        CHF {getFlatRateSubtotal().toFixed(2)}
                      </span>
                    </div>
                  )}
                  {getConsumptionSubtotal() > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-baseline gap-1">
                        <span className="text-muted-foreground">{t('categories.Beverages') || 'Beverages'}</span>
                        <span className="text-[10px] text-muted-foreground">(by consumption)</span>
                      </div>
                      <span className={`font-semibold ${includeBeveragePrices ? "text-foreground" : "text-muted-foreground line-through decoration-2"}`}>
                        CHF {getConsumptionSubtotal().toFixed(2)}
                      </span>
                    </div>
                  )}

                  {getConsumptionSubtotal() > 0 && (
                    <label className="flex items-center gap-2.5 cursor-pointer pt-1">
                      <div className="relative flex items-center shrink-0">
                        <input
                          type="checkbox"
                          checked={includeBeveragePrices}
                          onChange={(e) => setIncludeBeveragePrices(e.target.checked)}
                          className="peer appearance-none size-4 border border-muted-foreground rounded-md bg-background checked:bg-foreground checked:border-foreground transition-all cursor-pointer"
                        />
                        <Check className="absolute size-3 text-background opacity-0 peer-checked:opacity-100 left-0.5 pointer-events-none transition-opacity" />
                      </div>
                      <span className="text-xs text-foreground font-medium">{t('labels.includeDrinksEstimate') || 'Getränkekosten in Kostenvoranschlag einschliessen'}</span>
                    </label>
                  )}
                </>
              )}
            </div>
          </div>

          <div className={`pt-3 ${viewMode === 'total' ? 'border-t border-muted' : ''}`}>
            {viewMode === 'total' && (
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-bold text-foreground">Total</span>
                <span className="text-lg font-bold text-foreground">
                  CHF {totalAmount.toFixed(2)}
                </span>
              </div>
            )}

            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative flex items-center shrink-0">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="peer appearance-none size-3.5 border border-muted-foreground rounded-md bg-background checked:bg-primary checked:border-primary transition-all cursor-pointer"
                  />
                  <Check className="absolute size-2.5 text-background opacity-0 peer-checked:opacity-100 left-0.5 pointer-events-none transition-opacity" />
                </div>
                <span className="text-xs text-foreground font-medium">
                  Ich stimme den <span
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsTermsModalOpen(true);
                    }}
                    className="text-primary underline font-bold cursor-pointer hover:opacity-80 transition-colors"
                  >
                    Allgemeinen Geschäftsbedingungen
                  </span>
                </span>
              </label>

              {showMinSpendWarning && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-amber-800 animate-in fade-in slide-in-from-top-1 duration-200">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  <p className="text-[11px] leading-relaxed font-medium">
                    Mindestbestellwert von <span className="font-bold">CHF 1'000.00</span> erforderlich.
                  </p>
                </div>
              )}

              <button
                onClick={() => {
                  if (totalAbsoluteAmount > 5000 && !isEditMode) {
                    setIsDepositModalOpen(true);
                  } else {
                    onContinue?.();
                  }
                }}
                disabled={!termsAccepted || selectedItems.length === 0 || isSubmitting || showMinSpendWarning}
                className={`w-full h-[46px] rounded-xl flex items-center justify-center font-bold text-sm transition-all shadow-sm ${termsAccepted && selectedItems.length > 0 && !isSubmitting && !showMinSpendWarning
                  ? "bg-primary text-foreground hover:opacity-90 active:translate-y-[1px]"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
                  }`}
              >
                {isSubmitting ? 'Wird gesendet...' : (isEditMode ? 'Aktualisieren' : continueButtonText)}
              </button>

              <p className="text-[10px] text-muted-foreground text-center">
                Gästezahl mindestens 4 Tage vor dem Event bestätigen
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Deposit Requirement Modal */}
      {isDepositModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-background rounded-[24px] w-full max-w-[480px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center px-6 py-4 border-b border-muted">
              <h3 className="font-bold text-lg text-foreground">{t('labels.depositRequirement') || 'Vorauszahlung erforderlich'}</h3>
              <button
                onClick={() => setIsDepositModalOpen(false)}
                className="size-8 rounded-full bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors"
                title="Schliessen"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div className="p-6">
              <div className="flex gap-4 items-start mb-6">
                <div className="size-12 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-6 h-6 text-amber-500" />
                </div>
                <div className="space-y-4">
                  <p className="text-base text-muted-foreground leading-relaxed">
                    {t('labels.depositRequirementText') || "Bei Bestellungen über CHF 5'000.00 ist eine Vorauszahlung erforderlich. Diese wird von der Schlussrechnung abgezogen."}
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3 text-sm text-muted-foreground">
                      <div className="size-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      {t('labels.contactAfterLocked') || 'Unser Team wird sich mit Ihnen in Verbindung setzen, sobald die Bestellung gesperrt und bestätigt ist.'}
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsDepositModalOpen(false)}
                  className="flex-1 h-[48px] rounded-lg border border-border font-semibold text-sm text-muted-foreground hover:bg-muted/50 transition-all"
                >
                  {ct('cancel')}
                </button>
                <button
                  onClick={() => {
                    setIsDepositModalOpen(false);
                    onContinue?.();
                  }}
                  className="flex-1 h-[48px] rounded-lg bg-primary font-bold text-sm text-foreground shadow-lg shadow-primary/20 hover:opacity-95 transition-all"
                >
                  {t('actions.confirmSend') || 'Bestätigen & Absenden'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Terms and Conditions Modal */}
      <TermsAndConditionsModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
      />
    </div>
  );
}
