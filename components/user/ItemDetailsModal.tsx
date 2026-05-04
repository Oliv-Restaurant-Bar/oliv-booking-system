import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Minus, Plus, ShoppingCart, AlertTriangle, Sparkles } from 'lucide-react';
import { MenuItem } from './menuItemsData';
import { EventDetails } from '@/lib/types';
import { DietaryIcon } from './DietaryIcon';
import { NativeRadio } from '@/components/ui/NativeRadio';
import { NativeCheckbox } from '@/components/ui/NativeCheckbox';
import { Input } from '@/components/ui/input';
import { ValidatedTextarea } from '@/components/ui/validated-textarea';
import { toast } from 'sonner';
import { useWizardTranslation, useMenuConfigTranslation } from '@/lib/i18n/client';
import { useWizardStore } from '@/lib/store/useWizardStore';

interface ItemDetailsModalProps {
  item: MenuItem | null;
  onClose: () => void;
}

export function ItemDetailsModal({
  item,
  onClose,
}: ItemDetailsModalProps) {
  const t = useWizardTranslation();
  const mt = useMenuConfigTranslation();
  
  const {
    cart, eventDetails, categoryData,
    isPerPerson, isConsumption, isFlatFee, 
    calculateRecommendedQuantity, addItem,
    isSubmitting, isAdminEdit
  } = useWizardStore();

  const selectedItems = Object.keys(cart);

  // Helper functions to get translated labels
  const getDietaryTagLabel = (tag: string) => {
    const key = tag.toLowerCase().replace(/\s+/g, '').replace(/[^a-z]/g, '');
    const mappings: Record<string, string> = {
      'glutenfree': 'glutenFree',
      'dairyfree': 'dairyFree',
      'nutfree': 'nutFree',
      'soyfree': 'soyFree',
      'sugarfree': 'sugarFree',
      'lowcarb': 'lowCarb',
      'highprotein': 'highProtein',
    };
    const mappedKey = mappings[key] || key;
    return mt(`dietary.tags.${mappedKey}`);
  };

  const getAllergenLabel = (allergen: string) => {
    const key = allergen.toLowerCase().replace(/\s+/g, '');
    const mappings: Record<string, string> = {
      'treenuts': 'treeNuts',
    };
    const mappedKey = mappings[key] || key;
    return mt(`dietary.allergens.${mappedKey}`);
  };

  const getAdditiveLabel = (additive: string) => {
    const key = additive.toLowerCase().replace(/\s+/g, '').replace('/', '');
    const mappings: Record<string, string> = {
      'artificialcolors': 'artificialColors',
      'artificialflavors': 'artificialFlavors',
      'bhabht': 'bhaBht',
    };
    const mappedKey = mappings[key] || key;
    return mt(`dietary.additives.${mappedKey}`);
  };

  const [tempQuantity, setTempQuantity] = useState(1);
  const [tempGuestCount, setTempGuestCount] = useState<number | null>(null);
  const [tempAddOns, setTempAddOns] = useState<string[]>([]);
  const [tempVariant, setTempVariant] = useState('');
  const [tempComment, setTempComment] = useState('');

  // Helper to get the current price based on selected variant
  const getCurrentPrice = () => {
    if (!item) return 0;
    if (tempVariant && item.variants) {
      const variant = item.variants.find(v => v.id === tempVariant);
      if (variant) return variant.price;
    }
    return item.price;
  };

  // Helper to get the current variant object
  const getCurrentVariant = () => {
    if (!item) return null;
    if (tempVariant && item.variants) {
      return item.variants.find(v => v.id === tempVariant);
    }
    return item.variants?.[0] || null;
  };

  useEffect(() => {
    if (item) {
      const isAlreadySelected = selectedItems.includes(item.id);

      // Initialize add-ons
      let defaultAddOns = isAlreadySelected ? (cart[item.id].addOnIds || []) : [];
      if (!isAlreadySelected && item.addonGroups) {
        item.addonGroups.forEach(group => {
          if (group.isRequired && group.items.length > 0) {
            if (group.maxSelect === 1) {
              defaultAddOns.push(group.items[0].id);
            } else {
              const itemsToSelect = Math.min(group.minSelect || 1, group.items.length);
              defaultAddOns.push(...group.items.slice(0, itemsToSelect).map(i => i.id));
            }
          }
        });
      }
      setTempAddOns(defaultAddOns);

      // Initialize variant
      const defaultVariantId = item.variants?.[0]?.id || '';
      setTempVariant(isAlreadySelected ? (cart[item.id].variantId || defaultVariantId) : defaultVariantId);

      // Initialize comment
      setTempComment(isAlreadySelected ? (cart[item.id].comment || '') : '');

      // Initialize quantity and guest count
      if (isPerPerson(item)) {
        const totalGuestCount = parseInt(eventDetails.guestCount) || 1;
        setTempGuestCount(isAlreadySelected ? (cart[item.id].guestCount || totalGuestCount) : totalGuestCount);
        setTempQuantity(1);
      } else if (isConsumption(item)) {
        const recommended = calculateRecommendedQuantity(item, cart[item.id]?.variantId);
        setTempQuantity(isAlreadySelected ? (cart[item.id].quantity || (recommended ?? 1)) : (recommended ?? 1));
        setTempGuestCount(null);
      } else {
        setTempQuantity(isAlreadySelected ? (cart[item.id].quantity || 1) : 1);
        setTempGuestCount(null);
      }
    }
  }, [item?.id]);

  // Update quantity automatically when variant changes for consumption items
  useEffect(() => {
    if (item && isConsumption(item) && tempVariant) {
      const recommended = calculateRecommendedQuantity(item, tempVariant);
      if (recommended) {
        setTempQuantity(recommended);
      }
    }
  }, [tempVariant, item, isConsumption, calculateRecommendedQuantity]);

  if (!item) return null;

  const toggleTempAddOn = (addOnId: string, groupId?: string, maxSelect?: number) => {
    setTempAddOns(prev => {
      const isRemoving = prev.includes(addOnId);

      if (isRemoving && groupId && item.addonGroups) {
        const group = item.addonGroups.find(g => g.id === groupId);
        if (group?.isRequired && (group.maxSelect || 1) > 1) {
          const alreadySelectedInGroup = prev.filter(id =>
            group.items.some((i: any) => i.id === id)
          );
          const minRequired = group.minSelect || 1;
          if (alreadySelectedInGroup.length <= minRequired) {
            toast.error(`You must select at least ${minRequired} option${minRequired > 1 ? 's' : ''} from ${group.name}`);
            return prev;
          }
        }
      }

      if (isRemoving) {
        return prev.filter(id => id !== addOnId);
      } else {
        let isSingleSelect = false;
        let groupItemIds: string[] = [];
        let maxSelectLimit = 1;

        if (groupId && item.addonGroups) {
          const group = item.addonGroups.find(g => g.id === groupId);
          if (group) {
            maxSelectLimit = group.maxSelect || 1;
            if (maxSelectLimit === 1) {
              isSingleSelect = true;
              groupItemIds = group.items.map(i => i.id);
            } else {
              const alreadySelectedInGroup = prev.filter(id =>
                group.items.some((i: any) => i.id === id)
              );
              if (alreadySelectedInGroup.length >= maxSelectLimit) {
                toast.error(`You can select maximum ${maxSelectLimit} option${maxSelectLimit > 1 ? 's' : ''} from ${group.name}`);
                return prev;
              }
            }
          }
        }

        if (isSingleSelect && groupItemIds.length > 0) {
          return [...prev.filter(id => !groupItemIds.includes(id)), addOnId];
        }

        return [...prev, addOnId];
      }
    });
  };

  const handleAddToCart = () => {
    addItem(item.id, {
      quantity: tempQuantity,
      guestCount: tempGuestCount ?? undefined,
      addOnIds: tempAddOns,
      variantId: tempVariant,
      comment: tempComment,
    });
    onClose();
  };

  return (
    <div className={`fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 ${isSubmitting ? 'pointer-events-none select-none overflow-hidden' : ''}`} onClick={onClose}>
      <div
        className={`bg-card rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] transition-opacity duration-300 ${isSubmitting ? 'opacity-70' : ''}`}
        style={{ borderRadius: 'var(--radius-card)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <DietaryIcon type={item.dietaryType} size="md" />
            <div>
              <h3 className="text-foreground" style={{ fontSize: 'var(--text-h4)', fontWeight: 'var(--font-weight-semibold)' }}>
                {item.name}
              </h3>
              <p className="text-primary mt-1" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>
                CHF {getCurrentPrice().toFixed(2)}
                {getCurrentVariant()?.name && (
                  <span className="text-muted-foreground ml-2" style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-normal)' }}>
                    ({getCurrentVariant()?.name})
                  </span>
                )}
                {item.pricingType === 'billed_by_consumption' && (
                  <span className="text-muted-foreground ml-2 capitalize" style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-normal)' }}>
                    ({t('status.billedByConsumption')})
                  </span>
                )}
                {item.pricingType === 'flat_fee' && (
                  <span className="text-muted-foreground ml-2 capitalize" style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-normal)' }}>
                    ({t('status.flatFee')})
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center hover:bg-muted rounded-lg transition-colors"
            style={{ borderRadius: 'var(--radius)' }}
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {item.image && (
            <div className="mb-6 rounded-lg overflow-hidden relative h-64" style={{ borderRadius: 'var(--radius-card)' }}>
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Description */}
          <div className="mb-6">
            <p className="text-muted-foreground" style={{ fontSize: 'var(--text-base)' }}>
              {item.description}
            </p>
          </div>

          {/* Recommendation for consumption-based items */}
          {isConsumption(item) && (() => {
            const recommended = calculateRecommendedQuantity(item, tempVariant);
            if (!recommended) return null;

            // For display purposes, we still want to show the specific consumption rate
            const avgConsumption = (() => {
              if (tempVariant && item.variants) {
                const variant = item.variants.find(v => v.id === tempVariant);
                if (variant?.averageConsumption) return variant.averageConsumption;
              }
              return item.averageConsumption;
            })();

            const guestCount = parseInt(eventDetails.guestCount) || 0;
            if (guestCount === 0) return null;

            return (
              <div className="mb-4 p-3 bg-amber-50 rounded-lg border border-amber-500/30">
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-amber-900/80 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      Recommended for {eventDetails.guestCount} guests:{' '}
                      <span className="text-amber-900/80 font-semibold">
                        {recommended} units
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Based on {avgConsumption || 1} people per unit
                    </p>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Size/Variant Selection */}
          {item.variants && item.variants.length > 0 && (
            <div className="mb-6">
              <h4 className="text-foreground mb-3" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>
                Choose Size <span className="text-muted-foreground font-normal">(Required)</span>
              </h4>
              <div className="space-y-3">
                {item.variants.map((variant) => {
                  const isSelected = tempVariant === variant.id;
                  return (
                    <label
                      key={variant.id}
                      className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${isSelected ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-border/80'
                        }`}
                      style={{ borderRadius: 'var(--radius)' }}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="relative flex items-center justify-center">
                          <NativeRadio
                            name="variant"
                            checked={isSelected}
                            onChange={() => setTempVariant(variant.id)}
                          />
                        </div>
                        <div className="flex-1">
                          <span className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                            {variant.name}
                          </span>
                          {variant.description && (
                            <span className="text-muted-foreground ml-2" style={{ fontSize: 'var(--text-small)' }}>
                              ({variant.description})
                            </span>
                          )}
                        </div>
                      </div>
                      <span className={`ml-3 ${isSelected ? 'text-primary' : 'text-foreground'}`} style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>
                        CHF {variant.price.toFixed(2)}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Dietary Information Tags */}
          {item.dietaryTags && item.dietaryTags.length > 0 && (
            <div className="mb-6">
              <h4 className="text-foreground mb-3" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>
                {t('labels.dietaryInfo')}
              </h4>
              <div className="flex flex-wrap gap-2">
                {item.dietaryTags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center gap-1.5"
                    style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}
                  >
                    <DietaryIcon type={tag} size="xs" />
                    {getDietaryTagLabel(tag)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Ingredients */}
          {item.ingredients && (
            <div className="mb-6">
              <h4 className="text-foreground mb-2" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>
                {mt('labels.ingredients')}
              </h4>
              <p className="text-muted-foreground break-all" style={{ fontSize: 'var(--text-small)' }}>
                {item.ingredients}
              </p>
            </div>
          )}

          {/* Nutritional Info */}
          {item.nutritionalInfo && (() => {
            const displayValues = {
              calories: item.nutritionalInfo.calories,
              protein: item.nutritionalInfo.protein,
              carbs: item.nutritionalInfo.carbs,
              fat: item.nutritionalInfo.fat,
              fiber: item.nutritionalInfo.fiber,
              sugar: item.nutritionalInfo.sugar,
              sodium: item.nutritionalInfo.sodium
            };
            const hasDisplayInfo = Object.values(displayValues).some(val => !!val);
            if (!hasDisplayInfo) return null;

            return (
              <div className="mb-6">
                <h4 className="text-foreground mb-3" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>
                  {mt('labels.nutritionalInfo')}
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Object.entries(displayValues).map(([key, value]) => value && (
                    <div key={key} className="p-2 bg-muted/30 border border-border/40 rounded-lg">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
                        {mt(`nutrition.${key}`)}
                      </p>
                      <p className="text-sm font-bold text-foreground break-all">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Allergen & Additive Information */}
          {((item.allergens && item.allergens.length > 0) || (item.additives && item.additives.length > 0)) && (
            <div className="mb-6 p-4 bg-destructive/5 border border-destructive/20 rounded-lg flex gap-3" style={{ borderRadius: 'var(--radius)' }}>
              <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-foreground mb-1" style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-semibold)' }}>
                  {t('labels.allergenInfo')}
                </p>
                {item.allergens && item.allergens.length > 0 && (
                  <div className="text-muted-foreground flex flex-wrap gap-x-3 gap-y-1" style={{ fontSize: 'var(--text-small)' }}>
                    <span className="font-medium text-destructive/80 shrink-0">{t('labels.contains')}:</span>
                    <div className="flex flex-wrap gap-2">
                      {item.allergens.map(a => (
                        <span key={a} className="flex items-center gap-1">
                          <DietaryIcon type={a} size="xs" />
                          {getAllergenLabel(a)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {item.additives && item.additives.length > 0 && (
                  <div className="text-muted-foreground mt-2 flex flex-wrap gap-x-3 gap-y-1" style={{ fontSize: 'var(--text-small)' }}>
                    <span className="font-medium text-destructive/80 shrink-0">{mt('labels.additives')}:</span>
                    <div className="flex flex-wrap gap-2">
                      {item.additives.map(a => (
                        <span key={a} className="flex items-center gap-1">
                          <DietaryIcon type={a} size="xs" />
                          {getAdditiveLabel(a)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Addon Groups */}
          {(() => {
            const requiredGroups = item.addonGroups?.filter(g => g.isRequired) || [];
            const optionalGroups = item.addonGroups?.filter(g => !g.isRequired) || [];

            return (
              <>
                {requiredGroups.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-foreground mb-4" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>
                      {t('labels.choices')}
                    </h4>
                    <div className="space-y-6">
                      {requiredGroups.map((group) => (
                        <div key={group.id} className="mb-4 last:mb-0">
                          {group.name && (
                            <p className="text-foreground mb-2" style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}>
                              {group.name}
                            </p>
                          )}
                          <div className="space-y-3">
                            {group.items.map((addOn) => {
                              const isChecked = tempAddOns.includes(addOn.id);
                              return (
                                <label
                                  key={addOn.id}
                                  className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${isChecked ? 'border-primary bg-primary/5' : 'border-border hover:border-border/80'
                                    }`}
                                  style={{ borderRadius: 'var(--radius)' }}
                                >
                                  <div className="flex items-center gap-3 flex-1">
                                    <div className="relative flex items-center justify-center">
                                      {group.maxSelect > 1 ? (
                                        <NativeCheckbox
                                          checked={isChecked}
                                          onChange={() => toggleTempAddOn(addOn.id, group.id, group.maxSelect)}
                                        />
                                      ) : (
                                        <NativeRadio
                                          name={`choice-${group.id}`}
                                          checked={isChecked}
                                          onChange={() => toggleTempAddOn(addOn.id, group.id, group.maxSelect)}
                                        />
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {addOn.dietaryType && addOn.dietaryType !== 'none' && (
                                        <DietaryIcon type={addOn.dietaryType} size="sm" />
                                      )}
                                      <span className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                                        {addOn.name}
                                      </span>
                                    </div>
                                  </div>
                                  <span className="text-foreground ml-3" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                                    CHF {addOn.price.toFixed(2)}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {optionalGroups.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-foreground mb-4" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>
                      {t('labels.addons')}
                    </h4>
                    <div className="space-y-6">
                      {optionalGroups.map((group) => (
                        <div key={group.id} className="mb-4 last:mb-0">
                          {group.name && (
                            <p className="text-foreground mb-2" style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}>
                              {group.name}
                            </p>
                          )}
                          <div className="space-y-3">
                            {group.items.map((addOn) => {
                              const isChecked = tempAddOns.includes(addOn.id);
                              return (
                                <label
                                  key={addOn.id}
                                  className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${isChecked ? 'border-primary bg-primary/5' : 'border-border hover:border-border/80'
                                    }`}
                                  style={{ borderRadius: 'var(--radius)' }}
                                >
                                  <div className="flex items-center gap-3 flex-1">
                                    <div className="relative flex items-center justify-center">
                                      {group.maxSelect > 1 ? (
                                        <NativeCheckbox
                                          checked={isChecked}
                                          onChange={() => toggleTempAddOn(addOn.id, group.id, group.maxSelect)}
                                        />
                                      ) : (
                                        <NativeRadio
                                          name={`choice-${group.id}`}
                                          checked={isChecked}
                                          onChange={() => toggleTempAddOn(addOn.id, group.id, group.maxSelect)}
                                        />
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {addOn.dietaryType && addOn.dietaryType !== 'none' && (
                                        <DietaryIcon type={addOn.dietaryType} size="sm" />
                                      )}
                                      <span className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                                        {addOn.name}
                                      </span>
                                    </div>
                                  </div>
                                  <span className="text-foreground ml-3" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                                    +CHF {addOn.price.toFixed(2)}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            );
          })()}

          {/* Legacy Optional Addons */}
          {!(item.addonGroups && item.addonGroups.length > 0) && (
            item.addOns && item.addOns.length > 0 && (
              <div className="mb-6">
                <h4 className="text-foreground mb-3" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>
                  {t('labels.addons')}
                </h4>
                <div className="space-y-3">
                  {item.addOns.map((addOn) => {
                    const isChecked = tempAddOns.includes(addOn.id);
                    return (
                      <label
                        key={addOn.id}
                        className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${isChecked ? 'border-primary bg-primary/5' : 'border-border hover:border-border/80'
                          }`}
                        style={{ borderRadius: 'var(--radius)' }}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="relative flex items-center justify-center">
                            <NativeCheckbox
                              checked={isChecked}
                              onChange={() => toggleTempAddOn(addOn.id)}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            {addOn.dietaryType && addOn.dietaryType !== 'none' && (
                              <DietaryIcon type={addOn.dietaryType} size="sm" />
                            )}
                            <span className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                              {addOn.name}
                            </span>
                          </div>
                        </div>
                        <span className="text-foreground ml-3" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                          +CHF {addOn.price.toFixed(2)}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )
          )}

          {/* Additional Comments */}
          <div className="mb-6">
            <h4 className="text-foreground mb-3" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>
              {t('labels.additionalComments')} <span className="text-muted-foreground font-normal ml-1">({t('labels.optional')})</span>
            </h4>
            <ValidatedTextarea
              value={tempComment}
              onChange={(e) => setTempComment(e.target.value)}
              placeholder={t('placeholders.itemComment')}
              rows={3}
              maxLength={500}
              showCharacterCount
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-card border-t border-border px-6 py-4">
          {(() => {
            const showSelectors = isAdminEdit || (item.category && categoryData[item.category]?.guestCount);
            return (
              <div className={`flex flex-col sm:flex-row sm:items-center ${showSelectors ? 'sm:justify-between' : 'justify-center'} gap-4`}>
                {/* Left: Quantity and Guest Count Selectors */}
                {showSelectors && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full sm:w-auto">
                    {(() => {
                      const isGuestCountFlagEnabled = !!(item.category && categoryData[item.category]?.guestCount);
                      const isPP = isPerPerson(item);
                      
                      // If the guest count flag is enabled, we show the simple qty stepper even for per-person items
                      // BUT if it's NOT enabled and it IS per-person, we show the complex guest count stepper
                      if (isPP && !isGuestCountFlagEnabled) {
                        return (
                          <div className="flex flex-col gap-2 w-full sm:w-auto">
                            <div className="flex items-center justify-between sm:justify-start gap-3 flex-wrap sm:flex-nowrap">
                              <span className="text-muted-foreground font-bold uppercase tracking-wider" style={{ fontSize: '10px' }}>
                                {(item.category === 'Beverages' || isFlatFee?.(item)) ? t('labels.qty') : t('labels.guests')}
                              </span>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    const currentVal = tempGuestCount !== null ? tempGuestCount : (parseInt(eventDetails.guestCount) || 1);
                                    setTempGuestCount(Math.max(1, currentVal - 1));
                                  }}
                                  className="w-10 h-10 flex items-center justify-center border-2 border-border text-foreground rounded-lg hover:border-primary hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-border disabled:hover:text-foreground bg-card"
                                  style={{ borderRadius: 'var(--radius)' }}
                                  disabled={(tempGuestCount !== null ? tempGuestCount : (parseInt(eventDetails.guestCount) || 1)) <= 1}
                                >
                                  <Minus className="w-5 h-5" />
                                </button>
                                <Input
                                  type="number"
                                  min={1}
                                  value={tempGuestCount !== null ? tempGuestCount : (parseInt(eventDetails.guestCount) || 1)}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    if (!isNaN(val) && val >= 1) {
                                      setTempGuestCount(val);
                                    }
                                  }}
                                  className="w-16 sm:w-20 h-10 text-center border-2 border-border text-foreground rounded-lg focus:border-primary focus:outline-none transition-colors bg-card"
                                  style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}
                                />
                                <button
                                  onClick={() => {
                                    const currentVal = tempGuestCount !== null ? tempGuestCount : (parseInt(eventDetails.guestCount) || 1);
                                    setTempGuestCount(currentVal + 1);
                                  }}
                                  className="w-10 h-10 flex items-center justify-center border-2 border-border text-foreground rounded-lg hover:border-primary hover:text-primary transition-colors bg-card"
                                  style={{ borderRadius: 'var(--radius)' }}
                                >
                                  <Plus className="w-5 h-5" />
                                </button>
                              </div>
                              <span className="text-muted-foreground whitespace-nowrap" style={{ fontSize: 'var(--text-small)' }}>
                                / {parseInt(eventDetails.guestCount) || 1}
                              </span>
                            </div>
                            {(tempGuestCount !== null ? tempGuestCount : (parseInt(eventDetails.guestCount) || 1)) > (parseInt(eventDetails.guestCount) || 1) && (
                              <div className="flex items-center gap-2 text-destructive">
                                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                                <span style={{ fontSize: 'var(--text-small)' }}>
                                  {(item.category === 'Beverages' || isFlatFee?.(item)) ? 'Quantity' : 'Guests'} exceed total event guests ({parseInt(eventDetails.guestCount) || 1})
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      }

                      // Otherwise, show the simple QTY stepper
                      const currentVal = isPP 
                        ? (tempGuestCount !== null ? tempGuestCount : (parseInt(eventDetails.guestCount) || 1))
                        : tempQuantity;
                        
                      const decrement = () => {
                        if (isPP) setTempGuestCount(Math.max(1, currentVal - 1));
                        else setTempQuantity(Math.max(1, currentVal - 1));
                      };
                      
                      const increment = () => {
                        if (isPP) setTempGuestCount(currentVal + 1);
                        else setTempQuantity(currentVal + 1);
                      };

                      return (
                        <div className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto">
                          <span className="text-muted-foreground font-bold uppercase tracking-wider" style={{ fontSize: '10px' }}>
                            {t('labels.qty')}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={decrement}
                              className="w-10 h-10 flex items-center justify-center border-2 border-border text-foreground rounded-lg hover:border-primary hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-border disabled:hover:text-foreground bg-card"
                              style={{ borderRadius: 'var(--radius)' }}
                              disabled={currentVal <= 1}
                            >
                              <Minus className="w-5 h-5" />
                            </button>
                            <span className="text-foreground min-w-[2rem] text-center" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>
                              {currentVal}
                            </span>
                            <button
                              onClick={increment}
                              className="w-10 h-10 flex items-center justify-center border-2 border-border text-foreground rounded-lg hover:border-primary hover:text-primary transition-colors bg-card"
                              style={{ borderRadius: 'var(--radius)' }}
                            >
                              <Plus className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Right: Add to Cart Button with Total */}
                <button
                  onClick={handleAddToCart}
                  disabled={isSubmitting}
                  className={`w-full ${showSelectors ? 'sm:w-auto' : ''} flex items-center justify-center gap-3 px-8 py-3 rounded-lg transition-all ${isSubmitting ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}
                  style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-base)' }}
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span style={{ fontWeight: 'var(--font-weight-medium)' }}>
                    {isSubmitting ? t('status.processing') : (selectedItems.includes(item.id) ? t('actions.updateCart') : t('actions.addToCart'))}
                  </span>
                </button>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
