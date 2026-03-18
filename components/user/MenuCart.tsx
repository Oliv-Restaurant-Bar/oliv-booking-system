import React from 'react';
import { ShoppingCart, ChevronDown, ChevronUp, Edit2, X, Sparkles, Check, ChevronRight } from 'lucide-react';
import { MenuItem } from './menuItemsData';
import { EventDetails } from '@/lib/types';
import { DietaryIcon } from './DietaryIcon';

interface MenuCartProps {
  selectedItems: string[];
  menuItems: MenuItem[];
  itemQuantities: Record<string, number>;
  itemVariants: Record<string, string | null>;
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
  isConsumption: (item: MenuItem) => boolean;
  isFlatFee: (item: MenuItem) => boolean;
  isPerPerson: (item: MenuItem) => boolean;
  onContinue?: () => void;
  continueButtonText?: string;
  isDrawer?: boolean;
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
  isConsumption,
  isFlatFee,
  isPerPerson,
  onContinue,
  continueButtonText = 'Continue to Review',
  isDrawer = false,
}: MenuCartProps) {
  return (
    <div className={isDrawer ? "" : "sticky top-6"}>
      <div className={isDrawer ? "" : "bg-muted/30 border border-border rounded-lg overflow-hidden"} style={{ borderRadius: isDrawer ? "0" : "var(--radius-card)" }}>
        {/* Collapsible Header */}
        <button
          onClick={() => setIsCartCollapsed(!isCartCollapsed)}
          className="w-full px-5 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" />
            <h4 className="text-foreground" style={{ fontSize: 'var(--text-h4)', fontWeight: 'var(--font-weight-semibold)' }}>
              Your Menu
            </h4>
            {selectedItems.length > 0 && (
              <span className="px-2 py-0.5 bg-primary text-primary-foreground rounded-full" style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}>
                {selectedItems.length}
              </span>
            )}
          </div>
          {isCartCollapsed ? (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          )}
        </button>

        {/* Collapsed State Summary */}
        {isCartCollapsed && selectedItems.length > 0 && (
          <div className="px-5 pb-4 border-t border-border">
            <div className="pt-4 flex items-center justify-between">
              <div>
                <p className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>
                  {selectedItems.length} {selectedItems.length === 1 ? 'item' : 'items'} selected
                </p>
                <p className="text-muted-foreground mt-0.5" style={{ fontSize: 'var(--text-small)' }}>
                  For {eventDetails.guestCount || '0'} {parseInt(eventDetails.guestCount) === 1 ? 'guest' : 'guests'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-primary" style={{ fontSize: 'var(--text-h4)', fontWeight: 'var(--font-weight-semibold)' }}>
                  CHF {getPerPersonSubtotal().toFixed(2)} <span className="text-sm font-normal text-muted-foreground">/person</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Collapsible Content */}
        {!isCartCollapsed && (
          <div className="px-5 pb-5">
            {selectedItems.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
                <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                  No items selected yet
                </p>
                <p className="text-muted-foreground mt-1" style={{ fontSize: 'var(--text-small)' }}>
                  Browse categories and add dishes
                </p>
              </div>
            ) : (
              <>
                {/* Selected Items List */}
                <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
                  {selectedItems.map((itemId) => {
                    const item = menuItems.find(i => i.id === itemId);
                    if (!item) return null;
                    const quantity = itemQuantities[itemId] || 1;

                    return (
                      <div key={itemId} className="bg-card border border-border rounded-lg p-2.5" style={{ borderRadius: 'var(--radius)' }}>
                        {/* Header Row */}
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              {item.dietaryType !== 'none' && (
                                <DietaryIcon type={item.dietaryType} size="sm" />
                              )}
                              <h6 className="text-foreground truncate max-w-[200px]" style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}>
                                {item.name}
                              </h6>
                              {isConsumption(item) && (
                                <span
                                  className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                                  style={{
                                    backgroundColor: 'var(--consumption-badge-bg)',
                                    color: 'var(--consumption-badge-text)'
                                  }}
                                >
                                  Pay by consumption
                                </span>
                              )}
                              <span className="text-muted-foreground flex items-center flex-wrap" style={{ fontSize: 'var(--text-small)' }}>
                                <span className="mx-1 truncate max-w-[100px]">• {item.category}</span>
                                {itemVariants[itemId] && item.variants && (() => {
                                  const variant = item.variants.find(v => v.id === itemVariants[itemId]);
                                  return variant ? <><span className="mx-1">•</span>{variant.name}</> : '';
                                })()}
                                {(() => {
                                  const selected = itemAddOns[itemId] || [];
                                  if (selected.length === 0) return null;

                                  let optionalCount = 0;
                                  if (item.addonGroups && item.addonGroups.length > 0) {
                                    item.addonGroups.forEach(group => {
                                      if (!group.isRequired) {
                                        optionalCount += selected.filter(id => group.items.some(i => i.id === id)).length;
                                      }
                                    });
                                  } else if (item.addOns && item.addOns.length > 0) {
                                    optionalCount += selected.filter(id => item.addOns!.some(ao => ao.id === id)).length;
                                  }

                                  return optionalCount > 0 ? <><span className="mx-1">•</span>+{optionalCount}</> : null;
                                })()}
                              </span>
                            </div>
                            {itemComments[itemId] && (
                              <p className="text-muted-foreground italic mt-0.5 text-xs truncate">
                                "{itemComments[itemId]}"
                              </p>
                            )}
                          </div>
                          <div className="flex items-start gap-1.5 flex-shrink-0">
                            <button
                              onClick={() => openDetailsModal(item)}
                              className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
                              style={{ borderRadius: 'var(--radius)' }}
                              title="Edit item"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => removeFromCart(itemId)}
                              className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
                              style={{ borderRadius: 'var(--radius)' }}
                              title="Remove item"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Footer Row */}
                        {isConsumption(item) ? (
                          <div className="pt-2 border-t border-border mt-2">
                            <div className="flex flex-col gap-1.5">
                              {/* Recommended quantity display */}
                              {(() => {
                                const recommendedQty = calculateRecommendedQuantity(item, itemId);
                                const avgConsumption = (() => {
                                  if (itemVariants[itemId] && item.variants) {
                                    const variant = item.variants.find(v => v.id === itemVariants[itemId]);
                                    if (variant?.averageConsumption) return variant.averageConsumption;
                                  }
                                  return item.averageConsumption;
                                })();
                                if (!recommendedQty || !avgConsumption) return null;
                                return (
                                  <div className="flex items-center justify-between px-2 py-1.5 bg-primary/5 rounded-lg">
                                    <div className="flex items-center gap-1.5">
                                      <Sparkles className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                                      <span className="text-xs text-foreground">
                                        Recommended: <span className="font-semibold text-primary">{recommendedQty} units</span>
                                      </span>
                                    </div>
                                    <span className="text-[10px] text-muted-foreground">
                                      ({avgConsumption} people/unit)
                                    </span>
                                  </div>
                                );
                              })()}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="px-1.5 py-0.5 bg-green-100/80 text-green-700 dark:bg-green-900/30 dark:text-green-300 rounded text-xs font-medium">
                                    Available
                                  </span>
                                  <span className="text-muted-foreground text-xs mr-1">for your event</span>
                                  <span className="px-1.5 py-0.5 bg-muted text-muted-foreground rounded text-xs font-medium">
                                    {quantity}x
                                  </span>
                                </div>
                                <span
                                  className="text-xs font-medium"
                                  style={{ color: 'var(--consumption-info-text)' }}
                                >
                                  (billed by consumption)
                                </span>
                              </div>
                              <div className="flex items-center justify-between mt-0.5">
                                <span className="text-muted-foreground text-xs">
                                  Size: {itemVariants[itemId] && item.variants ? item.variants.find(v => v.id === itemVariants[itemId])?.name || (item.category === 'Beverages' ? 'Bottle' : 'Unit') : (item.category === 'Beverages' ? 'Bottle' : 'Unit')}
                                </span>
                                <span className="text-foreground text-xs font-medium">Price on consumption</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between pt-1.5 border-t border-border">
                            <div className="flex items-center gap-1.5">
                              {isPerPerson(item) && (
                                <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded text-xs" style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}>
                                  {itemGuestCounts[itemId] || parseInt(eventDetails.guestCount) || 1} guests × CHF {getItemPerPersonPrice(item).toFixed(2)}
                                </span>
                              )}
                              {!isPerPerson(item) && (
                                <span className="px-1.5 py-0.5 bg-muted text-muted-foreground rounded text-xs" style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}>
                                  Qty: {quantity}
                                </span>
                              )}
                            </div>
                            <p className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>
                              CHF {(getItemPerPersonPrice(item) * (isPerPerson(item) ? (itemGuestCounts[itemId] || parseInt(eventDetails.guestCount) || 1) : quantity)).toFixed(2)}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Subtotals */}
                <div className="border-t border-border pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>Per-person items</p>
                    <p className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                      CHF {getPerPersonSubtotal().toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>Additional items</p>
                    <p className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                      CHF {getFlatRateSubtotal().toFixed(2)}
                    </p>
                  </div>
                  {getConsumptionSubtotal() > 0 && (
                    <div className="flex items-center justify-between mb-4 px-3 py-2"
                      style={{
                        borderRadius: 'var(--radius)',
                        backgroundColor: 'var(--consumption-alert-bg)',
                        borderColor: 'var(--consumption-alert-border)'
                      }}>
                      <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                        Billed by consumption
                      </p>
                      <p className="font-medium"
                        style={{
                          fontSize: 'var(--text-base)',
                          color: 'var(--consumption-alert-text)'
                        }}>
                        CHF {getConsumptionSubtotal().toFixed(2)}
                      </p>
                    </div>
                  )}
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 mt-4" style={{ borderRadius: 'var(--radius)' }}>
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-primary" />
                      </div>
                      <div>
                        <p className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>
                          Complete total will be shown in the review step
                        </p>
                        <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                          Continue to next step to see your full order breakdown
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                {onContinue && selectedItems.length > 0 && (
                  <div className="px-5 py-4 border-t border-border mt-auto">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>
                          Per Person
                        </p>
                        <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>Complete total in review step</p>
                      </div>
                      <p className="text-primary" style={{ fontSize: 'var(--text-h4)', fontWeight: 'var(--font-weight-semibold)' }}>
                        CHF {getPerPersonSubtotal().toFixed(2)}<span className="text-sm font-normal text-muted-foreground">/person</span>
                      </p>
                    </div>
                    <button
                      onClick={onContinue}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                      style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}
                    >
                      <span>{continueButtonText}</span>
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
