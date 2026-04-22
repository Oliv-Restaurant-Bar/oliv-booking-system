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
import { enUS } from 'date-fns/locale';
import { MenuItem } from './menuItemsData';
import { EventDetails } from '@/lib/types';
import { DietaryIcon } from './DietaryIcon';
import { Edit2 } from 'lucide-react';
import { TermsAndConditionsModal } from './TermsAndConditionsModal';
import { useWizardStore } from '@/lib/store/useWizardStore';
import { useWizardTranslation } from '@/lib/i18n/client';


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
  const {
    cart, removeItem, updateItem,
    menuItems,
    eventDetails,
    categories,
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
  const getFormattedDate = () => {
    if (!eventDetails.eventDate) return t('common.selectDate');
    try {
      const date = parseISO(eventDetails.eventDate);
      if (!isValid(date)) return eventDetails.eventDate;
      return format(date, 'eee, MMM dd, yyyy', { locale: enUS });
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
    <div className={`font-['Hanken_Grotesk',sans-serif] h-full flex flex-col bg-white relative overflow-hidden ${isSubmitting ? 'opacity-50 pointer-events-none select-none' : ''}`}>
      <div className="flex-1 overflow-y-auto min-h-0">
        {/* 1. HEADER (Now scrollable) */}
        <div className="shrink-0 px-8 pt-6 pb-4 flex flex-col items-center text-center border-b border-[#f3f4f6]/50 relative">
          {onCloseDrawer && (
            <button
              onClick={onCloseDrawer}
              className="absolute right-6 top-6 p-2 rounded-full bg-[#f9fafb] text-[#9ca3af] hover:text-[#2c2f34] transition-colors lg:hidden"
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
            <span className="text-[10px] font-bold text-[#9dae91] uppercase tracking-[0.2em]">Offer</span>
            <h2 className="text-[20px] font-bold text-[#2c2f34] tracking-tight leading-tight">{eventDetails.name || "Event Name"}</h2>
            <p className="text-[12px] text-[#9ca3af] font-medium italic">
              {eventDetails.business ? `c/o ${eventDetails.business}` : "Private Event"}
            </p>
          </div>

          {/* Date/Time Info Box */}
          <button
            onClick={onEditDateTime}
            className="w-full bg-[#f9fafb] rounded-[14px] p-4 space-y-1 border border-[#f3f4f6] hover:bg-[#f3f4f6] transition-colors cursor-pointer group"
          >
            <p className="text-[13px] font-bold text-[#2c2f34] flex items-center justify-center gap-2 group-hover:text-[#9dae91] transition-colors">
              <Calendar className="w-3.5 h-3.5 text-[#9dae91]" />
              {getFormattedDate()} — {eventDetails.eventTime || "TBD"}
            </p>
            <div className="space-y-0">
              <p className="text-[11px] text-[#6b7280] font-medium">
                approx. {currentGuestCount} persons
              </p>
              {isEditMode && editBookingData?.guestCount && parseInt(editBookingData.guestCount) !== currentGuestCount && (
                <p className="text-[10px] text-[#9ca3af] font-medium italic">
                  Ursprünglich: {editBookingData.guestCount}
                </p>
              )}
            </div>
            <p className="text-[10px] text-[#9ca3af] uppercase tracking-wider font-bold">
              {eventDetails.room === 'ug1_exklusiv' ? 'UG1 Exklusiv' : 'Private'}
            </p>
          </button>

          <div className="w-full mt-6 flex items-center justify-center gap-4">
            <div className="h-[1px] flex-1 bg-[#e5e7eb]" />
            <span className="text-[10px] font-bold text-[#9dae91] uppercase tracking-[0.2em]">menu</span>
            <div className="h-[1px] flex-1 bg-[#e5e7eb]" />
          </div>
          <div className="mt-1 text-[#9dae91] flex justify-center">
            <Plus className="w-3 h-3" />
          </div>
        </div>

        {/* 2. SCROLLABLE CONTENT */}
        <div className="px-8 py-6">
          {selectedItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="size-[80px] rounded-full bg-[#f9fafb] flex items-center justify-center mb-5 relative ">
                <ShoppingCart className="w-8 h-8 text-[#d1d5db]" />
                <div className="absolute top-0 right-0 size-6 bg-white rounded-full border border-[#f3f4f6] shadow-sm flex items-center justify-center">
                  <Plus className="w-3.5 h-3.5 text-[#9dae91]" />
                </div>
              </div>
              <h3 className="font-bold text-[17px] text-[#2c2f34] mb-1.5">Stellen Sie Ihr Menü zusammen</h3>
              <p className="text-[13px] text-[#9ca3af] leading-relaxed max-w-[200px]">Wählen Sie aus unseren Kategorien auf der linken Seite.</p>
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

                  const isMain = category.toLowerCase().includes('main');

                  if (isMain) {
                    return (
                      <div key={category} className="pt-4 space-y-8">
                        <div className="text-center">
                          <h3 className="text-[12px] font-extrabold text-[#2c2f34] uppercase tracking-[0.25em] mb-2">
                            {category}
                          </h3>
                          <div className="w-full h-px bg-[#9dae91]/20" />
                        </div>

                        <div className="space-y-6">
                          {itemsInCategory.map((item, idx, arr) => {
                            const cartItem = cart[item.id];
                            return (
                              <div key={item.id} className="text-center space-y-2 group relative">
                                <div className="flex items-center justify-center gap-2">
                                  {item.dietaryType !== 'none' && (
                                    <DietaryIcon type={item.dietaryType} size="xs" />
                                  )}
                                  <h4 className="text-[15px] font-bold text-[#2c2f34]">{item.name}</h4>

                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={() => setDetailsModalItem(item)}
                                      className="p-1 hover:text-[#9dae91] text-[#9ca3af]"
                                    >
                                      <Edit2 className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() => removeItem(item.id)}
                                      className="p-1 hover:text-[#ef4444] text-[#9ca3af]"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>

                                {item.description && (
                                  <p className="text-[11px] text-[#9ca3af] italic px-8 leading-snug">
                                    {item.description}
                                  </p>
                                )}

                                {/* Collapsible details for Main Courses */}
                                {((cartItem.variantId && item.variants) || (cartItem.addOnIds && cartItem.addOnIds.length > 0)) && (
                                  <div className="flex flex-col items-center">
                                    <button
                                      onClick={(e) => toggleExpand(item.id, e)}
                                      className="mt-1 flex items-center gap-1 text-[10px] font-bold text-[#9dae91] hover:text-[#2c2f34] transition-colors uppercase tracking-wider"
                                    >
                                      {expandedItems[item.id] ? t('actions.hide') : t('actions.show')}
                                      <ChevronRight className={`w-3 h-3 transition-transform ${expandedItems[item.id] ? 'rotate-90' : ''}`} />
                                    </button>

                                    {expandedItems[item.id] && (
                                      <div className="mt-2 space-y-1 animate-in slide-in-from-top-1 duration-200">
                                        {cartItem.variantId && item.variants && (
                                          <p className="text-[11px] text-[#6b7280]">
                                            {item.variants.find(v => v.id === cartItem.variantId)?.name}
                                          </p>
                                        )}
                                        {item.addonGroups?.map(group => {
                                          const selectedInGroup = group.items.filter(i => cartItem.addOnIds?.includes(i.id));
                                          if (selectedInGroup.length === 0) return null;
                                          return selectedInGroup.map(addon => (
                                            <p key={addon.id} className="text-[11px] text-[#6b7280]">
                                              + {addon.name}
                                            </p>
                                          ));
                                        })}
                                      </div>
                                    )}
                                  </div>
                                )}

                                {idx < arr.length - 1 && (
                                  <p className="text-[11px] text-[#9ca3af] italic mt-4">or</p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }

                  // Standard List Format for other categories
                  return (
                    <div key={category} className="space-y-6">
                      <div className="text-center">
                        <h3 className="text-[12px] font-extrabold text-[#2c2f34] uppercase tracking-[0.25em] mb-2">
                          {category}
                        </h3>
                        <div className="w-full h-px bg-[#9dae91]/20" />
                      </div>

                      <div className="space-y-4">
                        {itemsInCategory.map(item => {
                          const isPP = isPerPerson(item);
                          const cartItem = cart[item.id];
                          const price = getItemPerPersonPrice(item);

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
                                    <span className="text-[14px] font-bold text-[#2c2f34] leading-tight truncate">
                                      {item.name}
                                    </span>
                                  </div>

                                  {/* Collapsible details toggle */}
                                  {((cartItem.variantId && item.variants) || (cartItem.addOnIds && cartItem.addOnIds.length > 0)) && (
                                    <button
                                      onClick={(e) => toggleExpand(item.id, e)}
                                      className="mt-1 flex items-center gap-1 text-[10px] font-bold text-[#9dae91] hover:text-[#2c2f34] transition-colors uppercase tracking-wider"
                                    >
                                      {expandedItems[item.id] ? t('actions.hide') : t('actions.show')}
                                      <ChevronRight className={`w-3 h-3 transition-transform ${expandedItems[item.id] ? 'rotate-90' : ''}`} />
                                    </button>
                                  )}

                                  {/* Expanded Menu Options (Dropdown) */}
                                  {expandedItems[item.id] && ((cartItem.variantId && item.variants) || (cartItem.addOnIds && cartItem.addOnIds.length > 0)) && (
                                    <div className="mt-2 pl-4 border-l border-[#f3f4f6] space-y-1.5 animate-in slide-in-from-top-1 duration-200">
                                      {cartItem.variantId && item.variants && (
                                        <p className="text-[11px] text-[#6b7280]">
                                          {item.variants.find(v => v.id === cartItem.variantId)?.name}
                                        </p>
                                      )}
                                      {item.addonGroups?.map(group => {
                                        const selectedInGroup = group.items.filter(i => cartItem.addOnIds?.includes(i.id));
                                        if (selectedInGroup.length === 0) return null;
                                        return selectedInGroup.map(addon => (
                                          <p key={addon.id} className="text-[11px] text-[#6b7280]">
                                            + {addon.name}
                                          </p>
                                        ));
                                      })}
                                    </div>
                                  )}
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    onClick={() => setDetailsModalItem(item)}
                                    className="p-1.5 hover:bg-[#f9fafb] rounded-full hover:text-[#9dae91] text-[#9ca3af] transition-all"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => removeItem(item.id)}
                                    className="p-1.5 hover:bg-[#f9fafb] rounded-full hover:text-[#ef4444] text-[#9ca3af] transition-all"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      {/* 3. STICKY FOOTER - Only visible when items are selected */}
      {selectedItems.length > 0 && (
        <div className="p-4 border-t border-[#f3f4f6] bg-white shrink-0 space-y-4 sticky bottom-0 z-[20] shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-[14px] text-[#2c2f34]">Bestellübersicht</h3>
              <div className="p-0.5 bg-[#f3f4f6] rounded-lg flex gap-0.5">
                <button
                  onClick={() => setViewMode('per-person')}
                  className={`px-3 py-1.5 text-[11px] font-bold rounded-md transition-all ${viewMode === 'per-person' ? "bg-[#9dae91] text-[#2c2f34] shadow-sm" : "text-[#9ca3af]"}`}
                >
                  Pro Person
                </button>
                <button
                  onClick={() => setViewMode('total')}
                  className={`px-3 py-1.5 text-[11px] font-bold rounded-md transition-all ${viewMode === 'total' ? "bg-[#9dae91] text-[#2c2f34] shadow-sm" : "text-[#9ca3af]"}`}
                >
                  Total + extras
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {viewMode === 'per-person' ? (
                <div className="space-y-4">
                  {/* Veg Track */}
                  <div className="space-y-2">
                    <div
                      className="flex justify-between items-center text-[13px] cursor-pointer group"
                      onClick={() => setExpandedDietary(expandedDietary === 'veg' ? null : 'veg')}
                    >
                      <div className="flex items-center gap-2">
                        <DietaryIcon type="veg" size="xs" />
                        <span className="text-[#6b7280] group-hover:text-[#2c2f34] transition-colors">{t('labels.vegTrackTotal')}</span>
                        {/* <ChevronRight className={`w-3 h-3 text-[#9ca3af] transition-transform ${expandedDietary === 'veg' ? 'rotate-90' : ''}`} /> */}
                      </div>
                      <span className="text-[#2c2f34] font-bold">CHF {dietaryTotals.veg.toFixed(2)}</span>
                    </div>
                    {expandedDietary === 'veg' && (
                      <div className="pl-6 space-y-1.5 animate-in slide-in-from-top-1 duration-200">
                        {cartItems.filter(i => i.dietaryType === 'veg').map(item => (
                          <div key={item.id} className="flex items-center gap-2 text-[11px] text-[#9ca3af]">
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
                      className="flex justify-between items-center text-[13px] cursor-pointer group"
                      onClick={() => setExpandedDietary(expandedDietary === 'non-veg' ? null : 'non-veg')}
                    >
                      <div className="flex items-center gap-2">
                        <DietaryIcon type="non-veg" size="xs" />
                        <span className="text-[#6b7280] group-hover:text-[#2c2f34] transition-colors">{t('labels.nonVegTrackTotal')}</span>
                        {/* <ChevronRight className={`w-3 h-3 text-[#9ca3af] transition-transform ${expandedDietary === 'non-veg' ? 'rotate-90' : ''}`} /> */}
                      </div>
                      <span className="text-[#2c2f34] font-bold">CHF {dietaryTotals.nonVeg.toFixed(2)}</span>
                    </div>
                    {expandedDietary === 'non-veg' && (
                      <div className="pl-6 space-y-1.5 animate-in slide-in-from-top-1 duration-200">
                        {cartItems.filter(i => i.dietaryType === 'non-veg').map(item => (
                          <div key={item.id} className="flex items-center gap-2 text-[11px] text-[#9ca3af]">
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
                  <div className="flex justify-between items-center text-[13px]">
                    <span className="text-[#6b7280]">Food Items</span>
                    <span className="text-[#2c2f34] font-bold">
                      CHF {absoluteFoodTotal.toFixed(2)}
                    </span>
                  </div>
                  {getFlatRateSubtotal() > 0 && (
                    <div className="flex justify-between items-center text-[13px]">
                      <span className="text-[#6b7280]">Add-ons & Extras</span>
                      <span className="text-[#2c2f34] font-bold">
                        CHF {getFlatRateSubtotal().toFixed(2)}
                      </span>
                    </div>
                  )}
                  {getConsumptionSubtotal() > 0 && (
                    <div className="flex justify-between items-center text-[13px]">
                      <div className="flex items-baseline gap-1">
                        <span className="text-[#6b7280]">Beverages</span>
                        <span className="text-[10px] text-[#9ca3af]">(by consumption)</span>
                      </div>
                      <span className={`font-bold ${includeBeveragePrices ? "text-[#2c2f34]" : "text-[#9ca3af] line-through decoration-2"}`}>
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
                          className="peer appearance-none size-4 border border-[#9ca3af] rounded-md bg-white checked:bg-[#2c2f34] checked:border-[#2c2f34] transition-all cursor-pointer"
                        />
                        <Check className="absolute size-3 text-white opacity-0 peer-checked:opacity-100 left-0.5 pointer-events-none transition-opacity" />
                      </div>
                      <span className="text-[11px] text-[#2c2f34] font-medium">Getränkekosten in Kostenvoranschlag einschliessen</span>
                    </label>
                  )}
                </>
              )}
            </div>
          </div>

          <div className={`pt-3 ${viewMode === 'total' ? 'border-t border-[#f3f4f6]' : ''}`}>
            {viewMode === 'total' && (
              <div className="flex justify-between items-center mb-4">
                <span className="text-[13px] font-bold text-[#2c2f34]">Total</span>
                <span className="text-[18px] font-extrabold text-[#2c2f34] tracking-tight">
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
                    className="peer appearance-none size-3.5 border border-[#9ca3af] rounded-md bg-white checked:bg-[#9dae91] checked:border-[#9dae91] transition-all cursor-pointer"
                  />
                  <Check className="absolute size-2.5 text-white opacity-0 peer-checked:opacity-100 left-0.5 pointer-events-none transition-opacity" />
                </div>
                <span className="text-[11px] text-[#2c2f34] font-medium">
                  Ich stimme den <span
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsTermsModalOpen(true);
                    }}
                    className="text-[#8da081] underline font-bold cursor-pointer hover:text-[#7a8d6f] transition-colors"
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
                className={`w-full h-[46px] rounded-xl flex items-center justify-center font-bold text-[14px] transition-all shadow-sm ${termsAccepted && selectedItems.length > 0 && !isSubmitting && !showMinSpendWarning
                  ? "bg-[#9dae91] text-[#2c2f34] hover:bg-[#8da081] active:translate-y-[1px]"
                  : "bg-[#f3f4f6] text-[#9ca3af] cursor-not-allowed"
                  }`}
              >
                {isSubmitting ? 'Wird gesendet...' : (isEditMode ? 'Aktualisieren' : continueButtonText)}
              </button>

              <p className="text-[10px] text-[#9ca3af] text-center">
                Gästezahl mindestens 4 Tage vor dem Event bestätigen
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Deposit Requirement Modal */}
      {isDepositModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[24px] w-full max-w-[480px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center px-6 py-4 border-b border-[#f3f4f6]">
              <h3 className="font-bold text-[18px] text-[#2c2f34]">Vorauszahlung erforderlich</h3>
              <button
                onClick={() => setIsDepositModalOpen(false)}
                className="size-8 rounded-full bg-[#f9fafb] flex items-center justify-center hover:bg-[#f3f4f6] transition-colors"
                title="Schliessen"
              >
                <X className="w-4 h-4 text-[#6b7280]" />
              </button>
            </div>

            <div className="p-6">
              <div className="flex gap-4 items-start mb-6">
                <div className="size-12 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-6 h-6 text-amber-500" />
                </div>
                <div className="space-y-4">
                  <p className="text-[15px] text-[#6b7280] leading-relaxed">
                    Bei Bestellungen über <span className="font-bold text-[#2c2f34]">CHF 5'000.00</span> ist eine Vorauszahlung erforderlich. Diese wird von der Schlussrechnung abgezogen.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3 text-[14px] text-[#6b7280]">
                      <div className="size-1.5 rounded-full bg-[#9dae91] mt-1.5 shrink-0" />
                      Unser Team wird Sie kontaktieren, sobald die Bestellung fixiert und bestätigt ist.
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsDepositModalOpen(false)}
                  className="flex-1 h-[48px] rounded-[12px] border border-[#e5e7eb] font-semibold text-[14px] text-[#6b7280] hover:bg-[#f9fafb] transition-all"
                >
                  Abbrechen
                </button>
                <button
                  onClick={() => {
                    setIsDepositModalOpen(false);
                    onContinue?.();
                  }}
                  className="flex-1 h-[48px] rounded-[12px] bg-[#9dae91] font-bold text-[14px] text-[#2c2f34] shadow-lg shadow-[#9dae91]/20 hover:opacity-95 transition-all"
                >
                  Bestätigen & Absenden
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
