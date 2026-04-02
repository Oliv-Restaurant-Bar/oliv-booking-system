import React from 'react';
import { ShoppingCart, Users, Lock, Check, Plus, X, AlertTriangle, ChevronLeft, ChevronRight, Search, Edit2 } from 'lucide-react';
import { MenuItem } from './menuItemsData';
import { EventDetails } from '@/lib/types';
import { DietaryIcon } from './DietaryIcon';
import { Button } from '@/components/ui/Button';
import { MenuCart } from './MenuCart';
import { WizardHeader } from './WizardHeader';
import { useWizardTranslation } from '@/lib/i18n/client';
import { SkeletonMenuSelection } from '@/components/ui/skeleton-loaders';

interface CustomerMenuSelectionProps {
  selectedCategory: string;
  categories: string[];
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
  step2Error: string;
  categoryRefs: React.MutableRefObject<Record<string, HTMLButtonElement | null>>;
  setSelectedCategory: (category: string) => void;
  setItemGuestCounts: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  setIsCartCollapsed: (value: boolean) => void;
  setSelectedItems: React.Dispatch<React.SetStateAction<string[]>>;
  setItemQuantities: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  setItemAddOns: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
  setItemVariants: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setItemComments: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  getItemPerPersonPrice: (item: MenuItem) => number;
  getFlatRateSubtotal: () => number;
  getPerPersonSubtotal: () => number;
  getConsumptionSubtotal: () => number;
  getSelectedItemsByCategory: (category: string) => MenuItem[];
  handleCategoryChange: (category: string) => void;
  isConsumption: (item: MenuItem) => boolean;
  isFlatFee: (item: MenuItem) => boolean;
  isPerPerson: (item: MenuItem) => boolean;
  openDetailsModal: (item: MenuItem) => void;
  removeFromCart: (itemId: string) => void;
  isLastCategory: () => boolean;
  calculateRecommendedQuantity: (item: MenuItem, itemId?: string) => number | null;
  handleStep2Navigation: () => void;
  onEditDateTime?: () => void;
  isSubmitting: boolean;
  includeBeveragePrices: boolean;
  setIncludeBeveragePrices: (value: boolean) => void;
  isEditMode?: boolean;
  originalGuestCount?: string;
  onBack?: () => void;
}

export function CustomerMenuSelection({
  selectedCategory,
  categories,
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
  step2Error,
  categoryRefs,
  setSelectedCategory,
  setItemGuestCounts,
  setIsCartCollapsed,
  setSelectedItems,
  setItemQuantities,
  setItemAddOns,
  setItemVariants,
  setItemComments,
  getItemPerPersonPrice,
  getFlatRateSubtotal,
  getPerPersonSubtotal,
  getConsumptionSubtotal,
  getSelectedItemsByCategory,
  handleCategoryChange,
  isConsumption,
  isFlatFee,
  isPerPerson,
  openDetailsModal,
  removeFromCart,
  isLastCategory,
  calculateRecommendedQuantity,
  handleStep2Navigation,
  onEditDateTime,
  isSubmitting,
  includeBeveragePrices,
  setIncludeBeveragePrices,
  isEditMode = false,
  originalGuestCount = '',
  onBack,
}: CustomerMenuSelectionProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const tabsScrollRef = React.useRef<HTMLDivElement>(null);
  const [isStuck, setIsStuck] = React.useState(false);
  const sentinelRef = React.useRef<HTMLDivElement>(null);
  const sectionRefs = React.useRef<Record<string, HTMLDivElement | null>>({});
  const isManualScrolling = React.useRef(false);
  const t = useWizardTranslation();

  // Detect when sticky bar becomes stuck
  React.useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsStuck(!entry.isIntersecting),
      { threshold: 0, rootMargin: "-1px 0px 0px 0px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  // Intersection Observer for scroll tracking
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (isManualScrolling.current) return;

        // Find the most visible section (the one closest to the top of the viewport)
        const visibleEntry = entries.find(entry => entry.isIntersecting);
        if (visibleEntry) {
          setSelectedCategory(visibleEntry.target.id);
        }
      },
      {
        rootMargin: "-120px 0px -80% 0px", // Adjust based on sticky header height
        threshold: 0
      }
    );

    Object.values(sectionRefs.current).forEach(section => {
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, [categories, menuItems, searchQuery]);

  const handleTabClick = (category: string) => {
    isManualScrolling.current = true;
    setSelectedCategory(category);

    const section = sectionRefs.current[category];
    if (section) {
      const yOffset = -110; // Sticky header offset
      const y = section.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }

    // Reset manual scroll flag after animation
    setTimeout(() => {
      isManualScrolling.current = false;
    }, 1000);
  };

  return (
    <div className={`bg-[#f7f7f8] h-screen flex overflow-hidden ${isSubmitting ? 'pointer-events-none select-none' : ''}`}>
      {/* Left Column: Menu Content */}
      <div className={`flex-1 min-w-0 flex flex-col overflow-y-auto h-full scrollbar-hide transition-opacity duration-300 ${isSubmitting ? 'opacity-50' : ''}`}>
        <WizardHeader onBack={onBack} fullWidth />
        <div className="px-6 w-full pb-[100px]">
          {/* Title Section */}
          <div className="pt-6 pb-2">
            <div className="flex items-center gap-3 mb-2">
              <div className="size-[36px] rounded-xl bg-[#9dae91]/10 flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-[#9dae91]" />
              </div>
              <h1 className="font-bold text-[32px] text-[#2c2f34]">{t('sections.chooseMenu')}</h1>
            </div>
            <p className="text-[15px] text-[#6b7280] mb-0.5">{t('sections.menuSubtitle')}</p>
            <div className="flex items-center gap-1.5 text-[13px] text-[#9dae91]">
              <span>{t('labels.selectMany')}</span>
            </div>
          </div>

          {/* Sentinel to detect sticky state */}
          <div ref={sentinelRef} className="h-0" />

          {/* Sticky Search + Tabs Area */}
          <div className={`sticky top-0 z-40 transition-all duration-200 -mx-6 px-6 pb-1 pt-1 border-b border-[#f3f4f6] ${isStuck
            ? "bg-white shadow-sm"
            : "bg-transparent"
            }`}>
            <div>
              {/* Search Bar */}
              <div className="py-2">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9ca3af]" />
                  <input
                    type="text"
                    placeholder={t('placeholders.searchDishes')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-[42px] bg-white border border-[#e5e7eb] rounded-full pl-10 pr-4 text-[14px] text-[#2c2f34] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#9dae91]/40 transition-all"
                  />
                </div>
              </div>

              {/* Category Tabs */}
              <div className="flex items-center gap-1 pb-4 border-b border-[#e5e7eb]">
                <button
                  onClick={() => {
                    const el = tabsScrollRef.current;
                    if (el) el.scrollBy({ left: -200, behavior: "smooth" });
                  }}
                  className="shrink-0 size-[32px] flex items-center justify-center rounded-full border border-[#e5e7eb] bg-white hover:bg-[#f3f4f6] transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4 text-[#6b7280]" />
                </button>
                <div ref={tabsScrollRef} className="flex items-center gap-1.5 overflow-auto flex-1 no-scrollbar" style={{ scrollbarWidth: "none" }}>
                  {categories.map((category) => {
                    const isActive = selectedCategory === category;
                    const categoryItemCount = getSelectedItemsByCategory(category).length;

                    return (
                      <button
                        key={category}
                        ref={(el) => { categoryRefs.current[category] = el; }}
                        onClick={() => handleTabClick(category)}
                        className={`h-[36px] px-4 rounded-[10px] flex items-center shrink-0 transition-all cursor-pointer ${isActive
                          ? "bg-[#9dae91] text-[#2c2f34]"
                          : "bg-transparent text-[#9ca3af] hover:text-[#2c2f34]"
                          }`}
                      >
                        <span className={`text-[14px] ${isActive ? "font-semibold" : "font-medium"}`}>
                          {category}
                          {categoryItemCount > 0 && (
                            <span className="ml-1 opacity-60">({categoryItemCount})</span>
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => {
                    const el = tabsScrollRef.current;
                    if (el) el.scrollBy({ left: 200, behavior: "smooth" });
                  }}
                  className="shrink-0 size-[32px] flex items-center justify-center rounded-full border border-[#e5e7eb] bg-white hover:bg-[#f3f4f6] transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4 text-[#6b7280]" />
                </button>
              </div>
            </div>
          </div>

          {loadingMenu ? (
            <SkeletonMenuSelection />
          ) : menuItems.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">{t('status.noItems')}</p>
            </div>
          ) : (
            <div className="mt-4">

              <div className="flex flex-col gap-6">
                {categories.map((cat) => {
                  const categoryItems = menuItems.filter(item => item.category === cat);
                  const filteredItems = categoryItems.filter(item => {
                    const matchesSearch = searchQuery.trim() === '' ||
                      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      item.description.toLowerCase().includes(searchQuery.toLowerCase());

                    return matchesSearch;
                  });

                  if (filteredItems.length === 0) return null;

                  return (
                    <div
                      key={cat}
                      id={cat}
                      ref={(el) => { sectionRefs.current[cat] = el; }}
                      className="mb-6 scroll-mt-[120px]"
                    >
                      <div className="flex items-baseline justify-between mb-3 border-b border-[#f3f4f6]/60 pb-1.5">
                        <h2 className="font-bold text-[20px] text-[#2c2f34]">{cat}</h2>
                        <span className="font-normal text-[12px] text-[#9ca3af]">{t('status.itemsAvailable', { count: filteredItems.length })}</span>
                      </div>



                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredItems.map((item) => {
                          const isSelected = selectedItems.includes(item.id);

                          return (
                            <div
                              key={item.id}
                              className={`bg-white rounded-[16px] border overflow-hidden flex flex-row h-[140px] transition-all hover:shadow-md cursor-pointer group ${isSelected ? "border-[#9dae91] shadow-[0_0_0_1px_#9dae91]" : "border-[#e5e7eb]"
                                }`}
                              onClick={() => openDetailsModal(item)}
                            >
                              {item.image && (
                                <div className="w-[140px] shrink-0 bg-[#f3f4f6] overflow-hidden">
                                  <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                </div>
                              )}
                              <div className="flex-1 flex flex-col justify-between min-w-0 px-[16px] py-[16px]">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    {item.dietaryType !== 'none' && (
                                      <div className="shrink-0">
                                        <DietaryIcon type={item.dietaryType} size="sm" />
                                      </div>
                                    )}
                                    <h3 className="font-semibold text-[14px] text-[#2c2f34] truncate">{item.name}</h3>
                                    {isSelected && (
                                      <div className="shrink-0 size-[18px] rounded-full bg-[#9dae91] flex items-center justify-center">
                                        <Check className="w-2.5 h-2.5 text-white" />
                                      </div>
                                    )}
                                  </div>
                                  <p className="font-normal text-[12px] text-[#6b7280] line-clamp-2 leading-[1.3]">{item.description}</p>
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className="flex flex-col">
                                    <span className="font-semibold text-[15px] text-[#2c2f34]">
                                      CHF {(item.price > 0 ? item.price : (item.variants && item.variants.length > 0 ? item.variants[0].price : 0)).toFixed(2)}
                                    </span>
                                    <span className="text-[11px] text-[#9ca3af]">
                                      {isConsumption(item) ? t('status.billedByConsumption') : isFlatFee(item) ? t('status.flatFee') : t('status.perPerson')}
                                    </span>
                                  </div>

                                  {isSelected ? (
                                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                      <button
                                        onClick={() => openDetailsModal(item)}
                                        className="size-[32px] rounded-[10px] border border-[#e5e7eb] flex items-center justify-center cursor-pointer hover:bg-[#f9fafb] transition-colors"
                                        title={t('actions.edit')}
                                      >
                                        <Edit2 className="w-3.5 h-3.5 text-[#6b7280]" />
                                      </button>
                                      <button
                                        onClick={() => removeFromCart(item.id)}
                                        className="size-[32px] rounded-[10px] border border-[#e5e7eb] flex items-center justify-center cursor-pointer hover:bg-[#fef2f2] hover:border-[#fecaca] transition-colors text-[#9ca3af] hover:text-[#ef4444]"
                                        title={t('actions.remove')}
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openDetailsModal(item);
                                      }}
                                      className="bg-[#9dae91] h-[34px] px-4 rounded-[10px] flex items-center gap-1.5 cursor-pointer hover:opacity-90 transition-opacity"
                                    >
                                      <Plus className="w-3.5 h-3.5 text-[#262D39]" />
                                      <span className="font-medium text-[13px] text-[#262d39]">{t('actions.add')}</span>
                                    </button>
                                  )}
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

              {/* Warning Message Removed */}
            </div>
          )}

          {/* Error Message for Step 2 */}
          {step2Error && (
            <div className="mt-8 p-6 bg-[#fdf2f2] border border-[#fbd5d5] rounded-2xl flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-[#ef4444] shrink-0 mt-0.5" />
              <p className="text-[#c81e1e] font-medium text-[16px]">{step2Error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Sidebar Cart */}
      <div className="hidden lg:flex w-[380px] shrink-0 border-l border-[#e5e7eb] bg-white h-screen overflow-hidden flex-col z-[50]">
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
          setItemQuantities={setItemQuantities}
          onContinue={handleStep2Navigation}
          onEditDateTime={onEditDateTime}
          isConsumption={isConsumption}
          isFlatFee={isFlatFee}
          isPerPerson={isPerPerson}
          isDrawer={true} // Add this to handle scroll properly inside sidebar
          isSubmitting={isSubmitting}
          includeBeveragePrices={includeBeveragePrices}
          setIncludeBeveragePrices={setIncludeBeveragePrices}
          setItemGuestCounts={setItemGuestCounts}
          categories={categories}
          isEditMode={isEditMode}
          originalGuestCount={originalGuestCount}
        />
      </div>
    </div>
  );
}
