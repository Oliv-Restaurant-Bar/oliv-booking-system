import { create } from 'zustand';
import { EventDetails, MenuItemData, VisibilitySchedule, Category } from '@/lib/types';
import { 
  customerNameSchema, 
  customerPhoneSchema, 
  customerStreetSchema, 
  customerPlzSchema, 
  customerLocationSchema, 
  customerOccasionSchema, 
  customerSpecialRequestsSchema, 
  userEmailSchema 
} from '@/lib/validation/schemas';



export interface CartItem {
  id: string;
  quantity: number;
  guestCount?: number;
  variantId?: string;
  addOnIds: string[];
  comment: string;
}

interface WizardState {
  // UI State
  currentStep: number;
  activeTab: string;
  isSubmitting: boolean;
  loadingMenu: boolean;
  isDateTimePickerOpen: boolean;
  isCartCollapsed: boolean;
  isMobileDrawerOpen: boolean;
  showCartFab: boolean;
  summaryViewMode: 'per-person' | 'total';
  collapsedCategories: Record<string, boolean>;
  step2Error: string;
  isSubmitted: boolean;
  inquiryNumber: string;
  bookingPdfData: any;
  isLocked: boolean;
  isUnlockRequested: boolean;
  isRequestingUnlock: boolean;
  termsAccepted: boolean;
  signature: string;
  activeCategory: string;
  detailsModalItem: any | null;
  isLoadingEdit: boolean;


  
  // Data State
  eventDetails: EventDetails;
  menuItems: any[]; // Using any[] for now to match the complex transformed type in CustomMenuWizard
  categories: string[];
  categoryData: Record<string, { 
    guestCount: boolean; 
    useSpecialCalculation: boolean; 
    assignedVisibilitySchedules: string[];
    sortOrder: number;
  }>;
  visibilitySchedules: VisibilitySchedule[];
  validationErrors: Record<string, string | undefined>;
  touchedFields: Record<string, boolean>;

  
  // Edit/Persistence State
  isEditMode: boolean;
  isAdminEdit: boolean;
  editBookingData: any;
  bookingId: string | null;
  editSecret: string | null;
  
  // Cart State
  cart: Record<string, CartItem>;
  includeBeveragePrices: boolean;

  // Actions
  setCurrentStep: (step: number) => void;
  setActiveTab: (tab: string) => void;
  setEventDetails: (details: Partial<EventDetails>) => void;
  setLoadingMenu: (loading: boolean) => void;
  setIncludeBeveragePrices: (include: boolean) => void;
  setEditMode: (isEditMode: boolean, isAdminEdit?: boolean) => void;
  setBookingInfo: (id: string | null, secret: string | null) => void;
  setIsDateTimePickerOpen: (isOpen: boolean) => void;
  setValidationErrors: (errors: Record<string, string | undefined>) => void;
  setTouchedFields: (touched: Record<string, boolean>) => void;
  setIsCartCollapsed: (isCollapsed: boolean) => void;
  setIsMobileDrawerOpen: (isOpen: boolean) => void;
  setShowCartFab: (show: boolean) => void;
  setSummaryViewMode: (mode: 'per-person' | 'total') => void;
  setCollapsedCategories: (collapsed: Record<string, boolean>) => void;
  setCollapsedCategory: (category: string, collapsed: boolean) => void;
  setStep2Error: (error: string) => void;
  setSubmitted: (isSubmitted: boolean, inquiryNumber?: string) => void;
  setBookingPdfData: (data: any) => void;
  setIsLocked: (isLocked: boolean) => void;
  setIsUnlockRequested: (isRequested: boolean) => void;
  setIsRequestingUnlock: (isRequesting: boolean) => void;
  setTermsAccepted: (accepted: boolean) => void;
  setSignature: (signature: string) => void;
  setActiveCategory: (category: string) => void;
  setDetailsModalItem: (item: any | null) => void;
  setIsLoadingEdit: (isLoading: boolean) => void;
  setIsSubmitting: (isSubmitting: boolean) => void;


  
  // Menu Actions
  setMenuData: (data: {
    menuItems: any[];
    categories: string[];
    categoryData: Record<string, any>;
    visibilitySchedules: VisibilitySchedule[];
  }) => void;

  // Cart Actions
  addItem: (itemId: string, config?: Partial<Omit<CartItem, 'id'>>) => void;
  removeItem: (itemId: string) => void;
  updateItem: (itemId: string, updates: Partial<Omit<CartItem, 'id'>>) => void;
  clearCart: () => void;
  
  // Helpers
  isPerPerson: (item: any) => boolean;
  isFlatFee: (item: any) => boolean;
  isConsumption: (item: any) => boolean;

  // Complex Actions
  restoreBooking: (booking: any) => void;
  
  // Computed (Functions that return derived state)
  getVisibleCategories: () => string[];
  getVisibleMenuItems: () => any[];
  getItemPerPersonPrice: (item: any) => number;
  getItemTotalPrice: (item: any) => number;
  getDietaryPerPersonTotals: () => { veg: number; nonVeg: number };
  getPerPersonSubtotal: () => number;
  getFlatRateSubtotal: () => number;
  getConsumptionSubtotal: () => number;
  getTotalPrice: () => number;
  getSelectedItemsByCategory: (category: string) => any[];
  calculateRecommendedQuantity: (item: any, variantIdOverride?: string) => number | null;
  getRealtimeErrors: () => Record<string, string | undefined>;
}

const initialEventDetails: EventDetails = {
  name: '',
  business: '',
  email: '',
  telephone: '',
  street: '',
  plz: '',
  location: '',
  eventDate: '',
  eventTime: '',
  guestCount: '',
  occasion: '',
  specialRequests: '',
  reference: '',
  paymentMethod: 'ec_card',
  useSameAddressForBilling: true,
  billingStreet: '',
  billingPlz: '',
  billingLocation: '',
  billingBusiness: '',
  billingEmail: '',
  billingReference: '',
  room: '',
};

export const useWizardStore = create<WizardState>((set, get) => ({
  // UI State
  currentStep: 1,
  activeTab: 'contact',
  isSubmitting: false,
  loadingMenu: true,
  isEditMode: false,
  isAdminEdit: false,
  editBookingData: null,
  bookingId: null,
  editSecret: null,
  isDateTimePickerOpen: false,
  isCartCollapsed: true,
  isMobileDrawerOpen: false,
  showCartFab: true,
  summaryViewMode: 'total',
  collapsedCategories: {},
  step2Error: '',
  isSubmitted: false,
  inquiryNumber: '',
  bookingPdfData: null,
  isLocked: false,
  isUnlockRequested: false,
  isRequestingUnlock: false,
  termsAccepted: false,
  signature: '',
  activeCategory: '',
  detailsModalItem: null,
  isLoadingEdit: false,


  // Data State
  eventDetails: initialEventDetails,
  menuItems: [],
  categories: [],
  categoryData: {},
  visibilitySchedules: [],
  validationErrors: {},
  touchedFields: {},


  // Cart State
  cart: {},
  includeBeveragePrices: false,

  // UI Actions
  setCurrentStep: (currentStep) => set({ currentStep }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setLoadingMenu: (loadingMenu) => set({ loadingMenu }),
  setIncludeBeveragePrices: (includeBeveragePrices) => set({ includeBeveragePrices }),
  setEditMode: (isEditMode, isAdminEdit = false) => set({ isEditMode, isAdminEdit }),
  setBookingInfo: (bookingId, editSecret) => set({ bookingId, editSecret }),

  setEventDetails: (details) => set((state) => ({
    eventDetails: { ...state.eventDetails, ...details }
  })),

  setIsDateTimePickerOpen: (isDateTimePickerOpen) => set({ isDateTimePickerOpen }),
  setValidationErrors: (validationErrors) => set({ validationErrors }),
  setTouchedFields: (touchedFields) => set({ touchedFields }),
  setIsCartCollapsed: (isCartCollapsed) => set({ isCartCollapsed }),
  setIsMobileDrawerOpen: (isMobileDrawerOpen) => set({ isMobileDrawerOpen }),
  setShowCartFab: (showCartFab) => set({ showCartFab }),
  setSummaryViewMode: (summaryViewMode) => set({ summaryViewMode }),
  setCollapsedCategories: (collapsedCategories) => set({ collapsedCategories }),
  setCollapsedCategory: (category, collapsed) => set((state) => ({
    collapsedCategories: { ...state.collapsedCategories, [category]: collapsed }
  })),
  setStep2Error: (step2Error) => set({ step2Error }),
  setSubmitted: (isSubmitted, inquiryNumber = '') => set({ isSubmitted, inquiryNumber }),
  setBookingPdfData: (bookingPdfData) => set({ bookingPdfData }),
  setIsLocked: (isLocked) => set({ isLocked }),
  setIsUnlockRequested: (isUnlockRequested) => set({ isUnlockRequested }),
  setIsRequestingUnlock: (isRequestingUnlock) => set({ isRequestingUnlock }),
  setTermsAccepted: (termsAccepted) => set({ termsAccepted }),
  setSignature: (signature) => set({ signature }),
  setActiveCategory: (activeCategory) => set({ activeCategory }),
  setDetailsModalItem: (detailsModalItem) => set({ detailsModalItem }),
  setIsLoadingEdit: (isLoadingEdit) => set({ isLoadingEdit }),
  setIsSubmitting: (isSubmitting) => set({ isSubmitting }),



  // Data Actions
  setMenuData: (data) => set({
    menuItems: data.menuItems,
    categories: data.categories,
    categoryData: data.categoryData,
    visibilitySchedules: data.visibilitySchedules,
    loadingMenu: false,
  }),

  // Cart Actions
  addItem: (itemId, config) => set((state) => {
    if (state.isSubmitting) return state;
    // If item already in cart, don't re-add unless explicit
    if (state.cart[itemId] && !config) return state;
    
    const newItem: CartItem = {
      id: itemId,
      quantity: config?.quantity ?? 1,
      guestCount: config?.guestCount,
      variantId: config?.variantId,
      addOnIds: config?.addOnIds ?? [],
      comment: config?.comment ?? '',
    };
    return {
      cart: { ...state.cart, [itemId]: newItem }
    };
  }),

  removeItem: (itemId) => set((state) => {
    if (state.isSubmitting) return state;
    const newCart = { ...state.cart };
    delete newCart[itemId];
    return { cart: newCart };
  }),

  updateItem: (itemId, updates) => set((state) => {
    if (state.isSubmitting) return state;
    if (!state.cart[itemId]) return state;
    return {
      cart: {
        ...state.cart,
        [itemId]: { ...state.cart[itemId], ...updates }
      }
    };
  }),

  clearCart: () => set({ cart: {} }),

  // Helpers for pricing types
  isPerPerson: (item: any) => item.pricingType === 'per-person' || item.pricingType === 'per_person',
  isFlatFee: (item: any) => item.pricingType === 'flat-rate' || item.pricingType === 'flat_fee',
  isConsumption: (item: any) => item.pricingType === 'billed_by_consumption',

  // Computed Methods
  getVisibleMenuItems: () => {
    const { menuItems, visibilitySchedules, eventDetails, categoryData } = get();
    if (!eventDetails.eventDate || !visibilitySchedules.length) return menuItems;

    const selectedDate = new Date(eventDetails.eventDate);
    selectedDate.setHours(0, 0, 0, 0);

    const isVisible = (assignedSchedules: string[]) => {
      if (!assignedSchedules || assignedSchedules.length === 0) return true;
      return assignedSchedules.some(scheduleId => {
        const schedule = visibilitySchedules.find(s => s.id === scheduleId);
        if (!schedule || !schedule.isActive) return false;
        const start = new Date(schedule.startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(schedule.endDate);
        end.setHours(23, 59, 59, 999);
        return selectedDate >= start && selectedDate <= end;
      });
    };

    return menuItems.filter(item => {
      const itemVisible = isVisible(item.assignedVisibilitySchedules || []);
      if (!itemVisible) return false;
      const catData = categoryData[item.category];
      if (catData && !isVisible(catData.assignedVisibilitySchedules)) return false;
      return true;
    }).sort((a, b) => {
      // First sort by isRecommended (descending - true first)
      if (a.isRecommended !== b.isRecommended) {
        return a.isRecommended ? -1 : 1;
      }
      // Then sort by sortOrder (ascending)
      return (a.sortOrder || 0) - (b.sortOrder || 0);
    });
  },

  getVisibleCategories: () => {
    const { categories, categoryData, visibilitySchedules, eventDetails } = get();
    if (!eventDetails.eventDate || !visibilitySchedules.length) return categories;

    const selectedDate = new Date(eventDetails.eventDate);
    selectedDate.setHours(0, 0, 0, 0);

    const isVisible = (assignedSchedules: string[]) => {
      if (!assignedSchedules || assignedSchedules.length === 0) return true;
      return assignedSchedules.some(scheduleId => {
        const schedule = visibilitySchedules.find(s => s.id === scheduleId);
        if (!schedule || !schedule.isActive) return false;
        const start = new Date(schedule.startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(schedule.endDate);
        end.setHours(23, 59, 59, 999);
        return selectedDate >= start && selectedDate <= end;
      });
    };

    return categories.filter(catName => {
      const data = categoryData[catName];
      if (!data) return true;
      return isVisible(data.assignedVisibilitySchedules);
    }).sort((a, b) => {
      const dataA = categoryData[a];
      const dataB = categoryData[b];
      return (dataA?.sortOrder || 0) - (dataB?.sortOrder || 0);
    });
  },

  getItemPerPersonPrice: (item) => {
    const { cart, isEditMode, editBookingData } = get();
    if (!item) return 0;

    const cartItem = cart[item.id];
    let basePrice = item.price;
    if (cartItem?.variantId && item.variants) {
      const variant = item.variants.find((v: any) => v.id === cartItem.variantId);
      if (variant) basePrice = variant.price;
    }

    const currentAddOnIds = cartItem?.addOnIds || [];
    const currentAddOnsPrice = currentAddOnIds.reduce((total: number, addOnId: string) => {
      if (item.addonGroups) {
        for (const group of item.addonGroups) {
          const groupAddOn = group.items.find((i: any) => i.id === addOnId);
          if (groupAddOn) return total + (groupAddOn.price || 0);
        }
      }
      const addOn = item.addOns?.find((ao: any) => ao.id === addOnId);
      return total + (addOn?.price || 0);
    }, 0);

    const calculatedMenuPrice = basePrice + currentAddOnsPrice;

    if (isEditMode && editBookingData?.booking_items) {
      const bookingItem = editBookingData.booking_items.find((bi: any) => (bi.itemId || bi.item_id) === item.id);
      if (bookingItem) {
        const originalPrice = Number(bookingItem.unitPrice) || 0;
        if (originalPrice === 0 && calculatedMenuPrice > 0) return calculatedMenuPrice;

        // Simplified modify check for the store - if anything changed from cartItem, use calculatedMenuPrice
        // For now, we'll assume calculatedMenuPrice is correct if the user manually changed it
        // The restoration logic will set the initial state correctly
        return originalPrice; 
      }
    }

    return calculatedMenuPrice;
  },

  getItemTotalPrice: (item) => {
    const { cart, eventDetails, getItemPerPersonPrice } = get();
    const cartItem = cart[item.id];
    if (!cartItem) return 0;

    const unitPrice = getItemPerPersonPrice(item);
    const guestCount = parseInt(eventDetails.guestCount) || 1;
    const effectiveGuestCount = cartItem.guestCount ?? guestCount;

    if (item.pricingType === 'per_person' || item.pricingType === 'per-person') {
      return unitPrice * effectiveGuestCount;
    }
    return unitPrice * cartItem.quantity;
  },

  getDietaryPerPersonTotals: () => {
    const { cart, categoryData } = get();
    const visibleItems = get().getVisibleMenuItems();
    
    const ppItems = Object.keys(cart)
      .map(itemId => {
        const item = visibleItems.find(i => i.id === itemId);
        if (!item || (item.pricingType !== 'per-person' && item.pricingType !== 'per_person')) return null;
        return { ...item, price: get().getItemPerPersonPrice(item) };
      })
      .filter((i): i is any => i !== null);

    let vegTotal = 0;
    let nonVegTotal = 0;

    // Group items by category
    const itemsByCat: Record<string, typeof ppItems> = {};
    ppItems.forEach(item => {
      const cat = item.category || 'Uncategorized';
      if (!itemsByCat[cat]) itemsByCat[cat] = [];
      itemsByCat[cat].push(item);
    });

    Object.entries(itemsByCat).forEach(([catName, items]) => {
      const isSpecial = categoryData[catName]?.useSpecialCalculation;

      if (isSpecial) {
        // Shared category (e.g. Starters, Desserts): take highest price and apply to all
        const maxPrice = items.length > 0 ? Math.max(...items.map(i => i.price)) : 0;
        vegTotal += maxPrice;
        nonVegTotal += maxPrice;
      } else {
        // Normal category (e.g. Main Courses): sum prices by dietary track
        // 'none' applies to both tracks
        const vegSum = items
          .filter(i => ['veg', 'vegan', 'none'].includes(i.dietaryType))
          .reduce((sum, i) => sum + i.price, 0);
          
        const nonVegSum = items
          .filter(i => ['non-veg', 'none'].includes(i.dietaryType))
          .reduce((sum, i) => sum + i.price, 0);

        vegTotal += vegSum;
        nonVegTotal += nonVegSum;
      }
    });

    return {
      veg: vegTotal,
      nonVeg: nonVegTotal
    };
  },

  getPerPersonSubtotal: () => {
    const totals = get().getDietaryPerPersonTotals();
    // Use the max as the base subtotal for any component that only expects one number
    return Math.max(totals.veg, totals.nonVeg);
  },

  getFlatRateSubtotal: () => {
    const { cart } = get();
    const visibleItems = get().getVisibleMenuItems();
    return Object.keys(cart).reduce((total, itemId) => {
      const item = visibleItems.find(i => i.id === itemId);
      if (!item || (item.pricingType !== 'flat_fee' && item.pricingType !== 'flat-rate')) return total;
      return total + (get().getItemPerPersonPrice(item) * cart[itemId].quantity);
    }, 0);
  },

  getConsumptionSubtotal: () => {
    const { cart } = get();
    const visibleItems = get().getVisibleMenuItems();
    return Object.keys(cart).reduce((total, itemId) => {
      const item = visibleItems.find(i => i.id === itemId);
      if (!item || item.pricingType !== 'billed_by_consumption') return total;
      return total + (get().getItemPerPersonPrice(item) * cart[itemId].quantity);
    }, 0);
  },

  getTotalPrice: () => {
    const { cart, includeBeveragePrices } = get();
    const visibleItems = get().getVisibleMenuItems();
    return Object.keys(cart).reduce((total, itemId) => {
      const item = visibleItems.find(i => i.id === itemId);
      if (!item) return total;
      if (item.pricingType === 'billed_by_consumption' && !includeBeveragePrices) return total;
      return total + get().getItemTotalPrice(item);
    }, 0);
  },

  getSelectedItemsByCategory: (category) => {
    const { cart } = get();
    const visibleItems = get().getVisibleMenuItems();
    return visibleItems.filter(item => item.category === category && cart[item.id]);
  },

  calculateRecommendedQuantity: (item, variantIdOverride) => {
    if (item.pricingType !== 'billed_by_consumption') return null;
    const { eventDetails, cart } = get();
    const guestCount = parseInt(eventDetails.guestCount) || 0;
    if (guestCount === 0) return null;

    let avgConsumption = item.averageConsumption || null;
    const currentVariantId = variantIdOverride || cart[item.id]?.variantId;
    if (currentVariantId && item.variants) {
      const selectedVariant = item.variants.find((v: any) => v.id === currentVariantId);
      if (selectedVariant?.averageConsumption) avgConsumption = selectedVariant.averageConsumption;
    }

    if (!avgConsumption || avgConsumption <= 0) return null;
    return Math.ceil(guestCount / avgConsumption);
  },

  restoreBooking: (booking) => {
    const { menuItems } = get();
    set({ editBookingData: booking, isEditMode: true });
    
    // Populate eventDetails
    const lead = booking.lead;
    const guestCount = booking.guestCount?.toString() || '';
    set({
      eventDetails: {
        name: booking.name || lead?.contactName || '',
        business: booking.business || '',
        email: booking.email || lead?.contactEmail || '',
        telephone: booking.telephone || lead?.contactPhone || '',
        street: booking.street || '',
        plz: booking.plz || '',
        location: booking.location || '',
        eventDate: booking.eventDate ? booking.eventDate.split('T')[0] : '',
        eventTime: booking.eventTime || '',
        guestCount: guestCount,
        occasion: booking.occasion || '',
        specialRequests: booking.specialRequests || '',
        reference: booking.reference || '',
        paymentMethod: booking.paymentMethod || 'ec_card',
        useSameAddressForBilling: booking.useSameAddressForBilling ?? true,
        billingStreet: booking.billingStreet || '',
        billingPlz: booking.billingPlz || '',
        billingLocation: booking.billingLocation || '',
        billingBusiness: booking.billingBusiness || '',
        billingEmail: booking.billingEmail || '',
        billingReference: booking.billingReference || '',
        room: (booking.room || '').toLowerCase(),
      }
    });

    // Populate Cart
    if (booking.booking_items && booking.booking_items.length > 0) {
      const newCart: Record<string, CartItem> = {};
      const totalBookingGuestCount = booking.guestCount || 0;

      booking.booking_items.forEach((item: any) => {
        const itemId = item.itemId || item.item_id;
        if (!itemId) return;

        const menuItem = menuItems.find(mi => mi.id === itemId);
        const notes = item.notes || '';
        
        // Restore variant
        const variantMatch = notes.match(/Variant: ([^|]+)/);
        let variantId = undefined;
        if (variantMatch && menuItem?.variants) {
          const vName = variantMatch[1].trim().toLowerCase();
          variantId = menuItem.variants.find((v: any) => v.name.toLowerCase() === vName)?.id;
        }

        // Restore addons
        const addonsMatch = notes.match(/(?:Add-ons|Choices): ([^|]+)/);
        const addOnIds: string[] = [];
        if (addonsMatch && (menuItem?.addonGroups || menuItem?.addOns)) {
          const names = addonsMatch[1].split(/[|,]/).map((s: string) => s.trim().toLowerCase());
          names.forEach((name: string) => {
            if (menuItem.addonGroups) {
              for (const g of menuItem.addonGroups) {
                const ao = g.items.find((i: any) => i.name.toLowerCase() === name);
                if (ao) { addOnIds.push(ao.id); break; }
              }
            }
            if (menuItem.addOns) {
              const ao = menuItem.addOns.find((a: any) => a.name.toLowerCase() === name);
              if (ao) addOnIds.push(ao.id);
            }
          });
        }

        // Restore comment
        const commentMatch = notes.match(/Comment: ([^|]+)/);

        newCart[itemId] = {
          id: itemId,
          quantity: item.quantity || 1,
          guestCount: (item.quantity !== totalBookingGuestCount && totalBookingGuestCount > 0) ? item.quantity : undefined,
          variantId,
          addOnIds,
          comment: commentMatch ? commentMatch[1].trim() : '',
        };
      });
      set({ cart: newCart });
    }
  },
  getRealtimeErrors: () => {
    const { eventDetails, touchedFields } = get();
    const errors: Record<string, string | undefined> = {};

    if (touchedFields.name) {
      const result = customerNameSchema.safeParse(eventDetails.name);
      if (!result.success) errors.name = result.error.errors[0].message;
    }

    if (touchedFields.email) {
      const result = userEmailSchema.safeParse(eventDetails.email);
      if (!result.success) errors.email = result.error.errors[0].message;
    }

    if (touchedFields.telephone) {
      const result = customerPhoneSchema.safeParse(eventDetails.telephone);
      if (!result.success) errors.telephone = result.error.errors[0].message;
    }

    if (touchedFields.street) {
      const result = customerStreetSchema.safeParse(eventDetails.street);
      if (!result.success) errors.street = result.error.errors[0].message;
    }

    if (touchedFields.plz) {
      const result = customerPlzSchema.safeParse(eventDetails.plz);
      if (!result.success) errors.plz = result.error.errors[0].message;
    }

    if (touchedFields.location) {
      const result = customerLocationSchema.safeParse(eventDetails.location);
      if (!result.success) errors.location = result.error.errors[0].message;
    }

    if (touchedFields.eventDate && !eventDetails.eventDate) {
      errors.eventDate = 'Event date is required';
    } else if (touchedFields.eventDate && eventDetails.eventDate) {
      const selectedDateTime = new Date(`${eventDetails.eventDate}T${eventDetails.eventTime || '00:00'}`);
      const twentyFourHoursFromNow = new Date(Date.now() + 24 * 60 * 60 * 1000);
      if (selectedDateTime < twentyFourHoursFromNow) {
        errors.eventDate = 'Booking must be at least 24 hours in advance';
      }
    }

    if (touchedFields.eventTime && !eventDetails.eventTime) {
      errors.eventTime = 'Event time is required';
    }

    if (touchedFields.guestCount) {
      if (!eventDetails.guestCount) {
        errors.guestCount = 'Number of guests is required';
      } else {
        const count = parseInt(eventDetails.guestCount);
        if (isNaN(count) || count < 1) {
          errors.guestCount = 'Must have at least 1 guest';
        } else if (count > 10000) {
          errors.guestCount = 'Number of guests cannot exceed 10,000';
        }
      }
    }

    if (touchedFields.occasion && eventDetails.occasion) {
      const result = customerOccasionSchema.safeParse(eventDetails.occasion);
      if (!result.success) errors.occasion = result.error.errors[0].message;
    }

    if (touchedFields.specialRequests && eventDetails.specialRequests) {
      const result = customerSpecialRequestsSchema.safeParse(eventDetails.specialRequests);
      if (!result.success) errors.specialRequests = result.error.errors[0].message;
    }

    // Billing address validation if applicable
    if (eventDetails.paymentMethod === 'on_bill' && !eventDetails.useSameAddressForBilling) {
      if (touchedFields.billingStreet) {
        const result = customerStreetSchema.safeParse(eventDetails.billingStreet);
        if (!result.success) errors.billingStreet = result.error.errors[0].message;
      }
      if (touchedFields.billingPlz) {
        const result = customerPlzSchema.safeParse(eventDetails.billingPlz);
        if (!result.success) errors.billingPlz = result.error.errors[0].message;
      }
      if (touchedFields.billingLocation) {
        const result = customerLocationSchema.safeParse(eventDetails.billingLocation);
        if (!result.success) errors.billingLocation = result.error.errors[0].message;
      }
    }

    return errors;
  },
}));

