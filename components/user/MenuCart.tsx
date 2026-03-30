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
  ChevronRight
} from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { MenuItem } from './menuItemsData';
import { EventDetails } from '@/lib/types';
import { DietaryIcon } from './DietaryIcon';
import { Edit2 } from 'lucide-react';

interface MenuCartProps {
  selectedItems: string[];
  menuItems: MenuItem[];
  itemQuantities: Record<string, number>;
  itemVariants: Record<string, string>;
  itemAddOns: Record<string, string[]>;
  itemComments: Record<string, string>;
  isCartCollapsed: boolean;
  setIsCartCollapsed: (value: boolean) => void;
  eventDetails: EventDetails;
  itemGuestCounts: Record<string, number>;
  getItemPerPersonPrice: (item: MenuItem) => number;
  getPerPersonSubtotal: () => number;
  getFlatRateSubtotal: () => number;
  getConsumptionSubtotal: () => number;
  calculateRecommendedQuantity: (item: MenuItem, itemId?: string) => number | null;
  openDetailsModal: (item: MenuItem) => void;
  removeFromCart: (itemId: string) => void;
  setItemQuantities: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  isConsumption: (item: MenuItem) => boolean;
  isFlatFee: (item: MenuItem) => boolean;
  isPerPerson: (item: MenuItem) => boolean;
  onContinue?: () => void;
  continueButtonText?: string;
  onEditDateTime?: () => void;
  isDrawer?: boolean;
  isSubmitting?: boolean;
  includeBeveragePrices: boolean;
  setIncludeBeveragePrices: (value: boolean) => void;
  setItemGuestCounts: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  categories: string[];
  onCloseDrawer?: () => void;
  isEditMode?: boolean;
  originalGuestCount?: string;
}

export function MenuCart({
  selectedItems,
  menuItems,
  itemQuantities,
  itemVariants,
  itemAddOns,
  itemComments,
  isCartCollapsed,
  setIsCartCollapsed,
  eventDetails,
  itemGuestCounts,
  getItemPerPersonPrice,
  getPerPersonSubtotal,
  getFlatRateSubtotal,
  getConsumptionSubtotal,
  calculateRecommendedQuantity,
  openDetailsModal,
  removeFromCart,
  setItemQuantities,
  isConsumption,
  isFlatFee,
  isPerPerson,
  onContinue,
  onEditDateTime,
  includeBeveragePrices,
  setIncludeBeveragePrices,
  continueButtonText = 'Submit Request',
  isDrawer = false,
  isSubmitting = false,
  setItemGuestCounts,
  categories,
  onCloseDrawer,
  isEditMode = false,
  originalGuestCount = '',
}: MenuCartProps) {
  const [viewMode, setViewMode] = React.useState<'per-person' | 'total'>('per-person');
  const [termsAccepted, setTermsAccepted] = React.useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = React.useState(false);
  const [expandedItems, setExpandedItems] = React.useState<Record<string, boolean>>({});

  const toggleExpand = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedItems(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  // Helper for formatting date: "Thu, Mar 12, 2026"
  const getFormattedDate = () => {
    if (!eventDetails.eventDate) return 'Select date';
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

  const ppFoodItems = React.useMemo(() => foodItems.filter(item => isPerPerson(item)), [foodItems, isPerPerson]);
  const pureVegItems = React.useMemo(() => ppFoodItems.filter(item => item.dietaryType === 'veg'), [ppFoodItems]);
  const veganItems = React.useMemo(() => ppFoodItems.filter(item => item.dietaryType === 'vegan'), [ppFoodItems]);
  const nonVegItems = React.useMemo(() => ppFoodItems.filter(item => item.dietaryType === 'non-veg'), [ppFoodItems]);
  const otherFoodItems = React.useMemo(() => ppFoodItems.filter(item => item.dietaryType !== 'veg' && item.dietaryType !== 'vegan' && item.dietaryType !== 'non-veg'), [ppFoodItems]);

  const pureVegPerPersonSubtotal = pureVegItems.length > 0 ? Math.max(...pureVegItems.map(item => getItemPerPersonPrice(item))) : 0;
  const veganPerPersonSubtotal = veganItems.length > 0 ? Math.max(...veganItems.map(item => getItemPerPersonPrice(item))) : 0;
  const nonVegPerPersonSubtotal = nonVegItems.length > 0 ? Math.max(...nonVegItems.map(item => getItemPerPersonPrice(item))) : 0;
  const otherPerPersonSubtotal = otherFoodItems.length > 0 ? Math.max(...otherFoodItems.map(item => getItemPerPersonPrice(item))) : 0;

  const updateQuantity = (itemId: string, delta: number) => {
    setItemQuantities(prev => {
      const current = prev[itemId] || 1;
      const next = Math.max(1, current + delta);
      return { ...prev, [itemId]: next };
    });
  };

  const updateGuestCount = (itemId: string, delta: number) => {
    setItemGuestCounts(prev => {
      const current = prev[itemId] || parseInt(eventDetails.guestCount) || 1;
      const next = Math.max(1, current + delta);

      // Removed global sync to allow individual item guest counts
      return { ...prev, [itemId]: next };
    });
  };

  const currentGuestCount = React.useMemo(() => {
    return parseInt(eventDetails.guestCount) || 1;
  }, [eventDetails.guestCount]);

  const perPersonTotal = React.useMemo(() => {
    return ppFoodItems.reduce((sum, item) => {
      // In Edit Mode, we always want to respect the manual count if it exists
      // This fixes the issue where changing item counts didn't reflect in the total
      const guestCount = itemGuestCounts[item.id] || parseInt(eventDetails.guestCount) || 1;
      return sum + (getItemPerPersonPrice(item) * guestCount);
    }, 0);
  }, [ppFoodItems, itemGuestCounts, eventDetails.guestCount, getItemPerPersonPrice]);

  const totalAmount = React.useMemo(() => {
    return perPersonTotal + getFlatRateSubtotal() + (includeBeveragePrices ? getConsumptionSubtotal() : 0);
  }, [perPersonTotal, getFlatRateSubtotal, includeBeveragePrices, getConsumptionSubtotal]);
  const isUg1Exklusiv = eventDetails.room === 'ug1_exklusiv';

  const renderItemRow = (item: MenuItem, sectionColor: string) => {
    const isPP = isPerPerson(item);
    const useQtyLabel = item.category === 'Beverages' || isFlatFee(item) || isConsumption(item);
    const quantity = itemQuantities[item.id] || 1;
    const guestCount = itemGuestCounts[item.id] || parseInt(eventDetails.guestCount) || 1;
    const price = getItemPerPersonPrice(item);
    const total = price * (isPP && !useQtyLabel ? guestCount : quantity);

    return (
      <div key={item.id} className="py-1 space-y-0.5">
        {/* Item Main Row */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {item.dietaryType !== 'none' ? (
              <DietaryIcon type={item.dietaryType} size="xs" />
            ) : (
              <div className={`size-2 rounded-full shrink-0 ${sectionColor}`} />
            )}
            <div className="flex items-baseline gap-1.5 min-w-0">
              {!useQtyLabel && <Users className="w-3 h-3" />}
              <span className="text-xs font-bold text-secondary shrink-0">
                {useQtyLabel ? `${quantity}X` : (isPP ? `${guestCount}X` : `${quantity}X`)}
              </span>
              <span className={`text-xs font-bold text-secondary uppercase truncate ${isConsumption(item) ? 'line-clamp-1' : 'line-clamp-2'} flex items-center gap-1.5`}>
                {item.name}
              </span>
            </div>
          </div>
          {/* <span className="text-xs font-bold text-secondary shrink-0">
            CHF {price.toFixed(2)} {isConsumption(item) ? ' (consumption)' : isFlatFee(item) ? ' (flat fee)' : '/ person'}
          </span> */}
        </div>

        {/* Selected Variant & Add-ons */}
        {((itemVariants[item.id] && item.variants) || (itemAddOns[item.id] && itemAddOns[item.id].length > 0)) && (
          <div className="pl-4 mt-1">
            <button
              onClick={(e) => toggleExpand(item.id, e)}
              className="flex items-center gap-1 text-[10px] font-bold text-[#9dae91] uppercase tracking-wider hover:opacity-80 transition-opacity mb-2"
            >
              <ChevronRight className={`w-3 h-3 transition-transform ${expandedItems[item.id] ? 'rotate-90' : ''}`} />
              VIEW MENU
            </button>

            {expandedItems[item.id] && (
              <div className="mt-2 flex flex-col gap-3 pb-2 border-l-2 border-primary/40 pl-3 ml-[5px]">
                {/* Variant (if any) */}
                {itemVariants[item.id] && item.variants && (
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-[#9dae91] uppercase tracking-wider mb-0.5">Variant</span>
                    <span className="text-[11px] text-[#2c2f34]">
                      {item.variants.find(v => v.id === itemVariants[item.id])?.name}
                    </span>
                  </div>
                )}

                {/* Grouped Addons */}
                {item.addonGroups?.map(group => {
                  const selectedInGroup = group.items.filter(i => itemAddOns[item.id]?.includes(i.id));
                  if (selectedInGroup.length === 0) return null;

                  return (
                    <div key={group.id} className="flex flex-col">
                      <span className="text-[10px] font-bold text-[#9dae91] uppercase tracking-wider mb-1">
                        {group.name}
                      </span>
                      {selectedInGroup.map(addon => (
                        <div key={addon.id} className="flex flex-col mb-1.5 last:mb-0">
                          <div className="flex items-center gap-1.5">
                            {(addon as any).dietaryType && (addon as any).dietaryType !== 'none' && (
                              <DietaryIcon type={(addon as any).dietaryType} size="xs" />
                            )}
                            <span className="text-[11px] font-medium text-[#2c2f34]">{addon.name}</span>
                          </div>
                          {(addon as any).description && (
                            <span className="text-[10px] text-[#9ca3af] leading-snug mt-0.5">{(addon as any).description}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })}

                {/* Legacy Addons (if not in a group) */}
                {(() => {
                  const legacyAddonIds = itemAddOns[item.id]?.filter(addonId => {
                    return !item.addonGroups?.some(g => g.items.some(i => i.id === addonId));
                  });
                  return legacyAddonIds && legacyAddonIds.length > 0 ? (
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-[#9dae91] uppercase tracking-wider mb-1">Extras</span>
                      {legacyAddonIds.map(addonId => {
                        const ao = item.addOns?.find(a => a.id === addonId);
                        if (!ao) return null;
                        return (
                          <div key={addonId} className="flex flex-col mb-1.5 last:mb-0">
                            <div className="flex items-center gap-1.5">
                              {ao.dietaryType && ao.dietaryType !== 'none' && (
                                <DietaryIcon type={ao.dietaryType} size="xs" />
                              )}
                              <span className="text-[11px] font-medium text-[#2c2f34]">{ao.name}</span>
                            </div>
                            {(ao as any).description && (
                              <span className="text-[10px] text-[#9ca3af] leading-snug mt-0.5">{(ao as any).description}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : null;
                })()}
              </div>
            )}
          </div>
        )}

        {/* Action Row */}
        <div className="flex items-center justify-between pl-2">
          <div className="flex items-center gap-4">
            <button
              onClick={() => removeFromCart(item.id)}
              className="text-[#9ca3af] hover:text-[#ef4444] transition-colors"
              title="Remove"
            >
              <X className="w-4.5 h-4.5" />
            </button>
            <button
              onClick={() => {
                // Close the drawer first (on mobile), then open the modal
                onCloseDrawer?.();
                // Small delay to allow drawer to close before modal opens
                setTimeout(() => openDetailsModal(item), 100);
              }}
              className="text-[#9ca3af] hover:text-[#2c2f34] transition-colors"
              title="Edit"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-wider">
              {item.category === 'Beverages' || isFlatFee(item) ? 'Qty' : 'Guests'}
            </span>
            <div className="flex items-center bg-[#f9fafb] border border-[#e5e7eb] rounded-lg p-0.5">
              <button
                onClick={() => isPP ? updateGuestCount(item.id, -1) : updateQuantity(item.id, -1)}
                className="size-[24px] flex items-center justify-center hover:bg-white hover:shadow-sm rounded-md transition-all"
              >
                <Minus className="w-2.5 h-2.5 text-[#6b7280]" />
              </button>
              <span className="min-w-[28px] text-center font-bold text-[11px] text-[#2c2f34]">
                {isPP ? guestCount : quantity}
              </span>
              <button
                onClick={() => isPP ? updateGuestCount(item.id, 1) : updateQuantity(item.id, 1)}
                className="size-[24px] flex items-center justify-center hover:bg-white hover:shadow-sm rounded-md transition-all"
              >
                <Plus className="w-2.5 h-2.5 text-[#6b7280]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`font-['Hanken_Grotesk',sans-serif] transition-all duration-300 ${isDrawer ? "h-full" : "sticky top-[100px]"} ${isSubmitting ? 'opacity-50 pointer-events-none select-none' : ''}`}>
      <div className={`bg-white flex flex-col ${isDrawer
        ? "h-full"
        : "border border-[#e5e7eb] rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden max-h-[calc(100vh-140px)]"
        }`}>
        {/* Cart Header Restructured */}
        <div className="px-6 py-3.5 border-b border-[#f3f4f6] space-y-2.5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-4.5 h-4.5 text-[#2c2f34]" />
              <h2 className="font-bold text-[17px] text-[#2c2f34]">Your Menu</h2>
            </div>
            <div className="flex flex-col items-end">
              <div className="text-[#9dae91] font-bold text-[12px]">
                {currentGuestCount} Guests
              </div>
              {isEditMode && originalGuestCount && parseInt(originalGuestCount) !== currentGuestCount && (
                <div className="text-[9px] text-[#9ca3af] font-medium tracking-tight mt-[-2px]">
                  Originally: {originalGuestCount}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="text-[12px] text-[#2c2f34] font-semibold truncate">
              {eventDetails.name || "Customer Name"}
            </div>
            <button
              onClick={onEditDateTime}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#f9fafb] border border-[#f3f4f6] rounded-full text-[11px] text-[#6b7280] font-semibold whitespace-nowrap shadow-sm hover:bg-white hover:border-[#9dae91] hover:text-[#2c2f34] active:translate-y-[0.5px] transition-all group/edit"
              title="Edit date and time"
            >
              <Calendar className="w-3.5 h-3.5 text-[#9ca3af] group-hover/edit:text-[#9dae91]" />
              <span>{getFormattedDate()}</span>
              {eventDetails.eventTime && (
                <>
                  <span className="text-[#e5e7eb] font-normal">—</span>
                  <span>{eventDetails.eventTime}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Categories / Scroll Area */}
        <div className="flex-1 overflow-auto p-6 no-scrollbar relative min-h-[220px]">
          {selectedItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center ">
              <div className="size-[80px] rounded-full bg-[#f9fafb] flex items-center justify-center mb-5 relative ">
                <ShoppingCart className="w-8 h-8 text-[#d1d5db]" />
                <div className="absolute top-0 right-0 size-6 bg-white rounded-full border border-[#f3f4f6] shadow-sm flex items-center justify-center">
                  <Plus className="w-3.5 h-3.5 text-[#9dae91]" />
                </div>
              </div>
              <h3 className="font-bold text-[17px] text-[#2c2f34] mb-1.5 ">Build your menu</h3>
              <p className="text-[13px] text-[#9ca3af] leading-relaxed max-w-[180px] ">Start adding items to your menu</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Food Items Section */}
              {foodItems.length > 0 && (
                <div>
                  <div className="pb-1 border-b border-[#f3f4f6] mb-1.5">
                    <h3 className="text-[11px] font-extrabold text-[#2c2f34] uppercase tracking-[0.05em]">Food Items</h3>
                  </div>
                  <div className="space-y-2">
                    {/* Use the provided categories list to maintain sequence */}
                    {categories.filter(cat => foodItems.some(i => i.category === cat)).map(category => (
                      <div key={category}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10.5px] text-[#9dae91] font-medium">—</span>
                          <h4 className="text-[10.5px] text-[#9dae91] font-bold">{category}</h4>
                        </div>
                        <div className="divide-y divide-[#f3f4f6]">
                          {foodItems
                            .filter(i => i.category === category)
                            .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
                            .map(i => renderItemRow(i, "bg-[#22c55e]"))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Beverages Section */}
              {beverages.length > 0 && (
                <div className="mt-3">
                  <div className="pb-1 border-b border-[#f3f4f6] mb-1.5">
                    <h3 className="text-[11px] font-extrabold text-[#2c2f34] uppercase tracking-[0.05em]">Beverages <span className='text-[10.5px] text-[#9dae91] font-normal'>(billed by consumption)</span></h3>
                  </div>
                  <div className="space-y-2">
                    {categories.filter(cat => beverages.some(i => i.category === cat)).map(category => (
                      <div key={category}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10.5px] text-[#9dae91] font-medium">—</span>
                          <h4 className="text-[10.5px] text-[#9dae91] font-bold">{category}</h4>
                        </div>
                        <div className="divide-y divide-[#f3f4f6]">
                          {beverages
                            .filter(i => i.category === category)
                            .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
                            .map(i => renderItemRow(i, "bg-[#ef4444]"))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add-ons Section */}
              {addons.length > 0 && (
                <div className="mt-3">
                  <div className="pb-1 border-b border-[#f3f4f6] mb-1.5">
                    <h3 className="text-[11px] font-extrabold text-[#2c2f34] uppercase tracking-[0.05em]">Add-ons</h3>
                  </div>
                  <div className="space-y-2">
                    {categories.filter(cat => addons.some(i => i.category === cat)).map(category => (
                      <div key={category}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10.5px] text-[#9dae91] font-medium">—</span>
                          <h4 className="text-[10.5px] text-[#9dae91] font-bold">{category}</h4>
                        </div>
                        <div className="divide-y divide-[#f3f4f6]">
                          {addons
                            .filter(i => i.category === category)
                            .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
                            .map(i => renderItemRow(i, "bg-[#9dae91]"))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer - Only visible when items are selected */}
        {selectedItems.length > 0 && (
          <div className="p-4 border-t border-[#f3f4f6] bg-white shrink-0 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-[14px] text-[#2c2f34]">Order overview</h3>
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
                  <div className="space-y-3">
                    {pureVegItems.length > 0 && (
                      <div className="flex justify-between items-center text-[13px]">
                        <div className="flex items-center gap-2">
                          <DietaryIcon type="veg" size="xs" />
                          <span className="text-[#6b7280]">Veg Selection ({pureVegItems.length})</span>
                        </div>
                        <span className="text-[#2c2f34] font-bold">CHF {pureVegPerPersonSubtotal.toFixed(2)}</span>
                      </div>
                    )}
                    {veganItems.length > 0 && (
                      <div className="flex justify-between items-center text-[13px]">
                        <div className="flex items-center gap-2">
                          <DietaryIcon type="vegan" size="xs" />
                          <span className="text-[#6b7280]">Vegan Selection ({veganItems.length})</span>
                        </div>
                        <span className="text-[#2c2f34] font-bold">CHF {veganPerPersonSubtotal.toFixed(2)}</span>
                      </div>
                    )}
                    {nonVegItems.length > 0 && (
                      <div className="flex justify-between items-center text-[13px]">
                        <div className="flex items-center gap-2">
                          <DietaryIcon type="non-veg" size="xs" />
                          <span className="text-[#6b7280]">Non-Veg Selection ({nonVegItems.length})</span>
                        </div>
                        <span className="text-[#2c2f34] font-bold">CHF {nonVegPerPersonSubtotal.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center text-[13px]">
                      <span className="text-[#6b7280]">Food Items</span>
                      <span className="text-[#2c2f34] font-bold">
                        CHF {perPersonTotal.toFixed(2)}
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
                    {getConsumptionSubtotal() > 0 && (<div className="flex justify-between items-center text-[13px]">
                      <div className="flex items-baseline gap-1">
                        <span className="text-[#6b7280]">Beverages</span>
                        <span className="text-[10px] text-[#9ca3af]">(by consumption)</span>
                      </div>
                      <span className={`font-bold ${includeBeveragePrices ? "text-[#2c2f34]" : "text-[#9ca3af] line-through decoration-2"}`}>
                        CHF {getConsumptionSubtotal().toFixed(2)}
                      </span>
                    </div>)}

                    {getConsumptionSubtotal() > 0 && (<label className="flex items-center gap-2.5 cursor-pointer pt-1">
                      <div className="relative flex items-center shrink-0">
                        <input
                          type="checkbox"
                          checked={includeBeveragePrices}
                          onChange={(e) => setIncludeBeveragePrices(e.target.checked)}
                          className="peer appearance-none size-4 border border-[#9ca3af] rounded-md bg-white checked:bg-[#2c2f34] checked:border-[#2c2f34] transition-all cursor-pointer"
                        />
                        <Check className="absolute size-3 text-white opacity-0 peer-checked:opacity-100 left-0.5 pointer-events-none transition-opacity" />
                      </div>
                      <span className="text-[11px] text-[#2c2f34] font-medium">Include Beverages costs in estimate</span>
                    </label>)}
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
                    I agree to the <span className="text-[#8da081] underline font-bold cursor-pointer">Terms & Conditions</span>
                  </span>
                </label>

                {isUg1Exklusiv && totalAmount < 1000 && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-amber-800 animate-in fade-in slide-in-from-top-1 duration-200">
                    <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                    <p className="text-[11px] leading-relaxed font-medium">
                      Minimum amount to spend <span className="font-bold">CHF 1,000.00</span> required for <span className="font-bold">UG1 Exclusive</span>. Please add more items.
                    </p>
                  </div>
                )}

                <button
                  onClick={() => {
                    if (totalAmount > 5000) {
                      setIsDepositModalOpen(true);
                    } else {
                      onContinue?.();
                    }
                  }}
                  disabled={!termsAccepted || selectedItems.length === 0 || isSubmitting || (isUg1Exklusiv && totalAmount < 1000)}
                  className={`w-full h-[46px] rounded-xl flex items-center justify-center font-bold text-[14px] transition-all shadow-sm ${termsAccepted && selectedItems.length > 0 && !isSubmitting && !(isUg1Exklusiv && totalAmount < 1000)
                    ? "bg-[#9dae91] text-[#2c2f34] hover:bg-[#8da081] active:translate-y-[1px]"
                    : "bg-[#f3f4f6] text-[#9ca3af] cursor-not-allowed"
                    }`}
                >
                  {isSubmitting ? 'Submitting...' : continueButtonText}
                </button>

                <p className="text-[10px] text-[#9ca3af] text-center">
                  Confirm guest count at least 4 days before event
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Deposit Requirement Modal */}
      {isDepositModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[24px] w-full max-w-[480px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center px-6 py-4 border-b border-[#f3f4f6]">
              <h3 className="font-bold text-[18px] text-[#2c2f34]">Deposit Requirement</h3>
              <button
                onClick={() => setIsDepositModalOpen(false)}
                className="size-8 rounded-full bg-[#f9fafb] flex items-center justify-center hover:bg-[#f3f4f6] transition-colors"
                title="Close"
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
                    A deposit is required for orders above <span className="font-bold text-[#2c2f34]">CHF 5,000.00</span>. This deposit will be deducted from the final invoice.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3 text-[14px] text-[#6b7280]">
                      <div className="size-1.5 rounded-full bg-[#9dae91] mt-1.5 shrink-0" />
                      Our team will connect you once order is locked and confirmed.
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsDepositModalOpen(false)}
                  className="flex-1 h-[48px] rounded-[12px] border border-[#e5e7eb] font-semibold text-[14px] text-[#6b7280] hover:bg-[#f9fafb] transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setIsDepositModalOpen(false);
                    onContinue?.();
                  }}
                  className="flex-1 h-[48px] rounded-[12px] bg-[#9dae91] font-bold text-[14px] text-[#2c2f34] shadow-lg shadow-[#9dae91]/20 hover:opacity-95 transition-all"
                >
                  Confirm & Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
