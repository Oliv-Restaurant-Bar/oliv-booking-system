import React from 'react';
import { ShoppingCart, Users, Lock, Check, Plus, X, AlertTriangle } from 'lucide-react';
import { MenuItem } from './menuItemsData';
import { EventDetails } from '@/lib/types';
import { DietaryIcon } from './DietaryIcon';
import { Button } from '@/components/ui/Button';
import { MenuCart } from './MenuCart';

interface CustomerMenuSelectionProps {
  selectedCategory: string;
  categories: string[];
  visitedCategories: string[];
  eventDetails: EventDetails;
  itemGuestCounts: Record<string, number>;
  loadingMenu: boolean;
  menuItems: MenuItem[];
  selectedItems: string[];
  itemQuantities: Record<string, number>;
  itemVariants: Record<string, string>;
  itemAddOns: Record<string, string[]>;
  itemComments: Record<string, string>;
  isCartCollapsed: boolean;
  categoryFilterMode: Record<string, 'combo' | 'individual'>;
  step2Error: string;
  categoryRefs: React.MutableRefObject<Record<string, HTMLButtonElement | null>>;
  setSelectedCategory: (category: string) => void;
  setItemGuestCounts: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  setIsCartCollapsed: (value: boolean) => void;
  setCategoryFilterMode: (mode: Record<string, 'combo' | 'individual'>) => void;
  setSelectedItems: React.Dispatch<React.SetStateAction<string[]>>;
  setItemQuantities: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  setItemAddOns: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
  setItemVariants: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setItemComments: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  getItemPerPersonPrice: (item: MenuItem) => number;
  getFlatRateSubtotal: () => number;
  getPerPersonSubtotal: () => number;
  getConsumptionSubtotal: () => number;
  isCategoryLocked: (category: string) => boolean;
  getSelectedItemsByCategory: (category: string) => MenuItem[];
  handleCategoryChange: (category: string) => void;
  categoryHasCombo: boolean;
  isConsumption: (item: MenuItem) => boolean;
  isFlatFee: (item: MenuItem) => boolean;
  isPerPerson: (item: MenuItem) => boolean;
  openDetailsModal: (item: MenuItem) => void;
  removeFromCart: (itemId: string) => void;
  isLastCategory: () => boolean;
  allCategoriesVisited: () => boolean;
  calculateRecommendedQuantity: (item: MenuItem, itemId?: string) => number | null;
}

export function CustomerMenuSelection({
  selectedCategory,
  categories,
  visitedCategories,
  eventDetails,
  itemGuestCounts,
  loadingMenu,
  menuItems,
  selectedItems,
  itemQuantities,
  itemVariants,
  itemAddOns,
  itemComments,
  isCartCollapsed,
  categoryFilterMode,
  step2Error,
  categoryRefs,
  setSelectedCategory,
  setItemGuestCounts,
  setIsCartCollapsed,
  setCategoryFilterMode,
  setSelectedItems,
  setItemQuantities,
  setItemAddOns,
  setItemVariants,
  setItemComments,
  getItemPerPersonPrice,
  getFlatRateSubtotal,
  getPerPersonSubtotal,
  getConsumptionSubtotal,
  isCategoryLocked,
  getSelectedItemsByCategory,
  handleCategoryChange,
  categoryHasCombo,
  isConsumption,
  isFlatFee,
  isPerPerson,
  openDetailsModal,
  removeFromCart,
  isLastCategory,
  allCategoriesVisited,
  calculateRecommendedQuantity,
}: CustomerMenuSelectionProps) {
  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0" style={{ borderRadius: 'var(--radius)' }}>
            <ShoppingCart className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-foreground" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
            Choose your menu
          </h3>
        </div>
        <p className="text-muted-foreground" style={{ fontSize: 'var(--text-base)' }}>
          Select dishes from our curated categories
        </p>
        <div className="mt-4 flex items-center gap-2 text-sm" style={{ fontSize: 'var(--text-small)' }}>
          <span className="text-muted-foreground">
            Browse through all {categories.length} categories step-by-step
          </span>
          <span className="text-primary font-medium">
            • {visitedCategories.length} of {categories.length} visited
          </span>
        </div>
      </div>

      {/* Guest Count & Pricing Info Bar - Only show for food categories */}
      {!['Technology', 'Decoration', 'Furniture', 'Miscellaneous'].includes(selectedCategory) && (
        <div className="mb-4 bg-secondary border-l-4 border-primary flex items-center gap-2 px-3 py-2" style={{ borderRadius: 'var(--radius)' }}>
          <Users className="w-4 h-4 text-primary flex-shrink-0" />
          <span className="text-secondary-foreground" style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-semibold)' }}>
            {eventDetails.guestCount || '0'} {parseInt(eventDetails.guestCount) === 1 ? 'guest' : 'guests'}
          </span>
          <span className="text-secondary-foreground/50 mx-1" style={{ fontSize: 'var(--text-small)' }}>
            |
          </span>
          <span className="text-secondary-foreground/70" style={{ fontSize: 'var(--text-small)' }}>
            {selectedCategory === 'Beverages'
              ? 'Charged by consumption • Per-person pricing available'
              : 'All items apply per person'}
          </span>
        </div>
      )}

      {loadingMenu ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">Loading menu...</p>
        </div>
      ) : menuItems.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">No menu items available. Please contact us directly.</p>
        </div>
      ) : (
        <>
          {/* Category Pills - Horizontal Scroll */}
          <div className="mb-6">
            <div className="flex overflow-x-auto gap-2 pb-4 -mx-2 px-2 sm:mx-0 sm:px-0 scrollbar-hide">
              {categories.map((category) => {
                const isActive = selectedCategory === category;
                const isVisited = visitedCategories.includes(category);
                const isLocked = isCategoryLocked(category);
                const categoryItemCount = getSelectedItemsByCategory(category).length;

                return (
                  <button
                    key={category}
                    ref={(el) => { categoryRefs.current[category] = el; }}
                    onClick={() => handleCategoryChange(category)}
                    disabled={isLocked}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all flex-shrink-0 whitespace-nowrap ${isActive
                      ? 'bg-primary text-primary-foreground hover:bg-secondary hover:text-secondary-foreground'
                      : isLocked
                        ? 'bg-muted/10 text-muted-foreground cursor-not-allowed opacity-50'
                        : isVisited
                          ? 'bg-muted/50 text-foreground hover:bg-muted hover:text-foreground border border-border'
                          : 'bg-muted/30 text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}
                  >
                    {isLocked && <Lock className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />}
                    {isVisited && !isActive && !isLocked && <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
                    <span className='truncate max-w-[150px]'>{category}</span>
                    {categoryItemCount > 0 && !isLocked && (
                      <span className={`px-2 py-0.5 rounded-full text-xs ${isActive ? 'bg-secondary-foreground/20 text-secondary-foreground' : 'bg-primary/10 text-primary'
                        }`}>
                        {categoryItemCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Two Column Layout: Menu Items + Cart */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Menu Items - 2 columns on desktop */}
            <div className="lg:col-span-2">
              {/* Category Hero Image */}
              <div className="mb-5 relative h-48 rounded-lg overflow-hidden" style={{ borderRadius: 'var(--radius-card)' }}>
                <img
                  src={
                    selectedCategory === 'Appetizers' ? 'https://images.unsplash.com/photo-1558679582-4d81ce75993a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080' :
                      selectedCategory === 'Salads' ? 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080' :
                        selectedCategory === 'Soups' ? 'https://images.unsplash.com/photo-1547592166-23ac45744acd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080' :
                          selectedCategory === 'Pasta' ? 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080' :
                            selectedCategory === 'Mains' ? 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080' :
                              selectedCategory === 'Seafood' ? 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080' :
                                selectedCategory === 'Cheese' ? 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080' :
                                  'https://images.unsplash.com/photo-1563805042-7684c019e1cb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'
                  }
                  alt={selectedCategory}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                  <div className="p-6">
                    <h4 className="text-white mb-1 line-clamp-2" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
                      {selectedCategory}
                    </h4>
                    <p className="text-white/90" style={{ fontSize: 'var(--text-small)' }}>
                      {menuItems.filter(item => item.category === selectedCategory).length} items available
                    </p>
                  </div>
                </div>
              </div>

              {categoryHasCombo && (
                <div className="mb-6 flex items-center justify-center">
                  <div className="bg-muted/30 p-1 rounded-xl border border-border flex justify-center gap-1 shadow-sm w-full">
                    <button
                      onClick={() => setCategoryFilterMode({ ...categoryFilterMode, [selectedCategory]: 'combo' })}
                      className={`px-6 py-2 rounded-lg transition-all text-sm font-medium flex justify-center gap-2 w-full ${(categoryFilterMode[selectedCategory] || 'combo') === 'combo'
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                        }`}
                    >
                      Combo Pack
                    </button>
                    <button
                      onClick={() => setCategoryFilterMode({ ...categoryFilterMode, [selectedCategory]: 'individual' })}
                      className={`px-6 py-2 rounded-lg transition-all text-sm font-medium flex justify-center gap-2 w-full ${(categoryFilterMode[selectedCategory] === 'individual')
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                        }`}
                    >
                      Single Items
                    </button>
                  </div>
                </div>
              )}

              {/* Menu Items Grid - Vertical card layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {menuItems
                  .filter(item => {
                    if (item.category !== selectedCategory) return false;
                    if (categoryHasCombo) {
                      const mode = categoryFilterMode[selectedCategory] || 'combo';
                      return mode === 'combo' ? item.isCombo : !item.isCombo;
                    }
                    return true;
                  })
                  .map((item) => {
                    const isSelected = selectedItems.includes(item.id);

                    return (
                      <div
                        key={item.id}
                        className={`bg-card border rounded-lg overflow-hidden transition-all flex flex-col ${isSelected ? 'border-primary shadow-sm' : 'border-border hover:border-primary/50'
                          }`}
                        style={{ borderRadius: 'var(--radius-card)' }}
                      >
                        {/* Item Image */}
                        <div className="w-full aspect-[3/2] flex-shrink-0 relative overflow-hidden bg-muted">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                          {isSelected && (
                            <div className="absolute top-2 right-2 w-7 h-7 bg-primary rounded-full flex items-center justify-center shadow">
                              <Check className="w-4 h-4 text-primary-foreground" />
                            </div>
                          )}
                        </div>

                        {/* Item Content */}
                        <div className="flex-1 p-4 flex flex-col">
                          <div className="flex items-start gap-2 mb-2">
                            {item.dietaryType !== 'none' && (
                              <div className="flex-shrink-0 mt-0.5">
                                <DietaryIcon type={item.dietaryType} size="sm" />
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="flex flex-col gap-1">
                                <h5 className="text-foreground line-clamp-2" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>
                                  {item.name}
                                </h5>
                                {isConsumption(item) && (
                                  <div className="flex">
                                    <span
                                      className="px-2 py-0.5 rounded text-xs font-medium"
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
                            </div>
                          </div>
                          <p className="text-muted-foreground mb-2 flex-1" style={{ fontSize: 'var(--text-small)' }}>
                            {item.description}
                          </p>

                          <div className="flex flex-col gap-0.5 mb-3">
                            <p className="text-primary" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>
                              {item.category === 'Beverages'
                                ? `CHF ${item.price.toFixed(2)}/bottle`
                                : (item.variants && item.variants.length > 0 && item.price === 0)
                                  ? `From CHF ${item.variants[0].price.toFixed(2)}`
                                  : (item.variants && item.variants.length > 0 ? 'From ' : '') + `CHF ${item.price.toFixed(2)}`}
                            </p>
                            <span className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                              {isConsumption(item) ? 'billed by consumption' :
                                isFlatFee(item) ? 'flat fee' : 'per person'}
                            </span>
                          </div>

                          {!isSelected ? (
                            <Button
                              onClick={() => openDetailsModal(item)}
                              variant="primary"
                              size="sm"
                              icon={Plus}
                              className="w-full"
                            >
                              Add
                            </Button>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Button
                                onClick={() => openDetailsModal(item)}
                                variant="outline"
                                size="sm"
                                className="flex-1"
                              >
                                Edit
                              </Button>
                              <Button
                                onClick={() => removeFromCart(item.id)}
                                variant="outline"
                                size="sm"
                                className="w-10 h-10 p-0 bg-destructive/10 text-destructive border-none hover:bg-destructive/20 flex-shrink-0"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Warning Message - Show if on last category but not all visited */}
              {isLastCategory() && !allCategoriesVisited() && (
                <div className="mt-5 p-4 bg-primary/10 border border-primary/20 rounded-lg flex items-start gap-3" style={{ borderRadius: 'var(--radius-card)' }}>
                  <AlertTriangle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-foreground mb-1" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>
                      Please browse all categories
                    </p>
                    <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                      You've visited {visitedCategories.length} of {categories.length} categories. Please explore all menu sections before continuing to the summary.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Cart Summary Column */}
            <div className="lg:col-span-1">
              <MenuCart
                selectedItems={selectedItems}
                menuItems={menuItems}
                itemQuantities={itemQuantities}
                itemVariants={itemVariants}
                itemAddOns={itemAddOns}
                itemComments={itemComments}
                isCartCollapsed={isCartCollapsed}
                setIsCartCollapsed={setIsCartCollapsed}
                eventDetails={eventDetails}
                itemGuestCounts={itemGuestCounts}
                getItemPerPersonPrice={getItemPerPersonPrice}
                getPerPersonSubtotal={getPerPersonSubtotal}
                getFlatRateSubtotal={getFlatRateSubtotal}
                getConsumptionSubtotal={getConsumptionSubtotal}
                calculateRecommendedQuantity={calculateRecommendedQuantity}
                openDetailsModal={openDetailsModal}
                removeFromCart={removeFromCart}
                isConsumption={isConsumption}
                isFlatFee={isFlatFee}
                isPerPerson={isPerPerson}
              />
            </div>
          </div>

          {/* Error Message for Step 2 */}
          {step2Error && (
            <div className="mt-5 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3" style={{ borderRadius: 'var(--radius-card)' }}>
              <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-destructive" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                {step2Error}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
