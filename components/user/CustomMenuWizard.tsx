'use client';

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Calendar, User, Check, ChevronLeft, ChevronRight, Send, MapPin, ShoppingCart, Lock, ClipboardList } from 'lucide-react';
import { Button } from './Button';
import { MenuItem } from './menuItemsData';
import { ThankYouScreen } from './ThankYouScreen';
import { WizardHeader } from './WizardHeader';
import { useWizardTranslation } from '@/lib/i18n/client';
import { DateTimePickerModal } from './DateTimePickerModal';
import { submitWizardForm, requestBookingUnlock } from '@/lib/actions/wizard';
import { SkeletonKPI, SkeletonPage, SkeletonMenuSelection } from '@/components/ui/skeleton-loaders';
import { EventDetails, VisibilitySchedule } from '@/lib/types';
import { CustomerDetailsForm } from './CustomerDetailsForm';
import { CustomerMenuSelection } from './CustomerMenuSelection';
import { CustomerSummary } from './CustomerSummary';
import { ItemDetailsModal } from './ItemDetailsModal';
import { MenuCart } from './MenuCart';
import { toast } from 'sonner';
import { useWizardStore } from '@/lib/store/useWizardStore';
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


export function CustomMenuWizard({ 
  initialMenuData,
  initialLocale 
}: { 
  initialMenuData?: any;
  initialLocale?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useWizardTranslation();

  const {
    currentStep, setCurrentStep,
    activeTab, setActiveTab,
    eventDetails, setEventDetails,
    cart, addItem, removeItem, updateItem, clearCart,
    menuItems, setMenuData,
    categories,
    categoryData,
    visibilitySchedules,
    loadingMenu, setLoadingMenu,
    isSubmitting,
    isEditMode, setEditMode,
    isAdminEdit,
    bookingId, setBookingInfo,
    editSecret,
    editBookingData, restoreBooking,
    includeBeveragePrices, setIncludeBeveragePrices,
    getVisibleCategories, getVisibleMenuItems,
    getTotalPrice, getItemPerPersonPrice, getItemTotalPrice,
    getPerPersonSubtotal, getFlatRateSubtotal, getConsumptionSubtotal,
    getSelectedItemsByCategory, calculateRecommendedQuantity,
    isPerPerson, isFlatFee, isConsumption,
    validationErrors, setValidationErrors,
    touchedFields, setTouchedFields,
    isDateTimePickerOpen, setIsDateTimePickerOpen,
    isLocked, setIsLocked,
    isUnlockRequested, setIsUnlockRequested,
    isRequestingUnlock, setIsRequestingUnlock,
    termsAccepted, setTermsAccepted,
    summaryViewMode, setSummaryViewMode,
    collapsedCategories, setCollapsedCategories,
    isCartCollapsed, setIsCartCollapsed,
    isMobileDrawerOpen, setIsMobileDrawerOpen,
    showCartFab, setShowCartFab,
    isSubmitted, setSubmitted,
    inquiryNumber, step2Error, setStep2Error,
    bookingPdfData, setBookingPdfData,
    isLoadingEdit, setIsLoadingEdit,
    setIsSubmitting,
    activeCategory, setActiveCategory,
    detailsModalItem, setDetailsModalItem,
    getRealtimeErrors
  } = useWizardStore();

  const selectedItemIds = useMemo(() => Object.keys(cart), [cart]);

  // Refs and local UI state
  const categoryRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const lastScrollY = useRef(0);




  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  // Main loader: Fetch menu data AND handle edit mode initialization
  useEffect(() => {
    const loadEverything = async () => {
      // 1. Load Menu (if not SSR)
      if (!initialMenuData && menuItems.length === 0) {
        setLoadingMenu(true);
        try {
          const response = await fetch('/api/menu');
          if (response.ok) {
            const data = await response.json();
            processMenuData(data);
          }
        } catch (error) {
          console.error('Menu load error:', error);
        } finally {
          setLoadingMenu(false);
        }
      } else if (initialMenuData && menuItems.length === 0) {
        processMenuData(initialMenuData);
      }

      // 2. Handle Edit Mode
      const editMode = searchParams.get('edit') === 'true';
      if (editMode) {
        const bookingIdParam = searchParams.get('id');
        const secretParam = searchParams.get('secret');
        
        // Persistence/Secure transfer logic
        const tempId = localStorage.getItem('temp_edit_id');
        const tempSecret = localStorage.getItem('temp_edit_secret');
        const tempTimestamp = localStorage.getItem('temp_edit_timestamp');
        const now = Date.now();

        let finalId = bookingIdParam || sessionStorage.getItem('edit_booking_id');
        let finalSecret = secretParam || sessionStorage.getItem('edit_secret');

        if (tempId && tempSecret && tempTimestamp && (now - parseInt(tempTimestamp) < 60000)) {
          finalId = tempId;
          finalSecret = tempSecret;
          const isAdmin = localStorage.getItem('temp_edit_is_admin') === 'true';
          setEditMode(true, isAdmin);
          
          localStorage.removeItem('temp_edit_id');
          localStorage.removeItem('temp_edit_secret');
          localStorage.removeItem('temp_edit_timestamp');
          localStorage.removeItem('temp_edit_is_admin');
        }

        if (finalId && finalSecret) {
          setBookingInfo(finalId, finalSecret);
          setEditMode(true);
          setSubmitted(false); // Reset submitted state for new edit session
          sessionStorage.setItem('edit_booking_id', finalId);
          sessionStorage.setItem('edit_secret', finalSecret);
          
          setIsLoadingEdit(true);
          try {
            const response = await fetch(`/api/booking/${finalId}/edit/${finalSecret}`);
            if (response.ok) {
              const result = await response.json();
              if (result.success && result.data) {
                setIsLocked(result.data.isLocked || false);
                // The actual restoration happens in Step 3 below when menuItems is ready
                // but we trigger it by saving the editBookingData in the store
                restoreBooking(result.data); 
                setCurrentStep(2);
              }
            }
          } catch (e) {
            console.error('Edit load error:', e);
          } finally {
            setIsLoadingEdit(false);
          }
        }
      }
    };
    loadEverything();
  }, [initialMenuData, searchParams, setBookingInfo, setEditMode, restoreBooking, setCurrentStep]);


  // Initialize menu data if provided via props (SSR)
  useEffect(() => {
    if (initialMenuData) {
      console.log('[SSR] Initializing menu data from props');
      processMenuData(initialMenuData);
    }
  }, [initialMenuData]);


  // Shared function to process menu data (from props or fetch)
  const processMenuData = (data: any) => {
    // Filter to only include ACTIVE categories that have at least ONE active item
    const activeCategories = data.categories.filter((cat: any) => cat.isActive);

    // Get all active items first
    const activeItems = data.items.filter((item: any) => item.isActive);

    // Filter categories to only include those that have at least one active item
    const categoriesWithActiveItems = activeCategories.filter((cat: any) => {
      return activeItems.some((item: any) => item.categoryId === cat.id);
    });

    // Transform database data to MenuItem format - only include items from active categories with active items
    const transformedItems: MenuItem[] = activeItems
      .filter((item: any) => {
        // Only include items whose category is active AND has active items
        const category = categoriesWithActiveItems.find((cat: any) => cat.id === item.categoryId);
        return category !== undefined;
      })
      .map((item: any) => {
        const category = data.categories?.find((cat: any) => cat.id === item.categoryId);
        return {
          id: item.id,
          name: item.name,
          description: item.description || item.ingredients || '',
          category: category?.name || 'Uncategorized',
          useSpecialCalculation: !!category?.useSpecialCalculation,
          price: Number(item.pricePerPerson) || 0,
          pricingType: item.pricingType || 'per_person',
          image: item.imageUrl || '',
          dietaryType: (category?.name === 'Beverages' || category?.name === 'Drinks') ? 'none' : (item.dietaryType || 'none'),
          dietaryTags: item.dietaryTags || [],
          allergens: item.allergens || [],
          additives: item.additives || [],
          ingredients: item.ingredients || '',
          nutritionalInfo: item.nutritionalInfo || null,
          isGlutenFree: item.dietaryTags?.includes('Gluten Free') || item.dietaryTags?.includes('gluten-free') || false,
          averageConsumption: item.averageConsumption || null,
          variants: item.variants || [],
          addOns: (() => {
            const catAddonGroupIds = (data.categoryAddonGroups || [])
              .filter((cg: any) => cg.categoryId === item.categoryId)
              .map((cg: any) => cg.addonGroupId);
            const itemAddonGroupIds = (data.itemAddonGroups || [])
              .filter((ig: any) => ig.itemId === item.id)
              .map((ig: any) => ig.addonGroupId);

            const allAddonGroupIds = [...new Set([...catAddonGroupIds, ...itemAddonGroupIds])];
            const mergedAddons: any[] = [];

            allAddonGroupIds.forEach((groupId: string) => {
              const groupItems = data.addonItemsByGroup?.[groupId] || [];
              groupItems.forEach((gi: any) => {
                if (gi.isActive) {
                  mergedAddons.push({
                    id: gi.id,
                    name: gi.name,
                    price: Number(gi.price) || 0,
                    dietaryType: gi.dietaryType,
                  });
                }
              });
            });
            return mergedAddons;
          })(),
          addonGroups: (() => {
            const catAddonGroupIds = (data.categoryAddonGroups || [])
              .filter((cg: any) => cg.categoryId === item.categoryId)
              .map((cg: any) => cg.addonGroupId);
            const itemAddonGroupIds = (data.itemAddonGroups || [])
              .filter((ig: any) => ig.itemId === item.id)
              .map((ig: any) => ig.addonGroupId);

            const allAddonGroupIds = [...new Set([...catAddonGroupIds, ...itemAddonGroupIds])];

            return allAddonGroupIds.map((groupId: string) => {
              const groupInfo = data.addonGroups?.find((g: any) => g.id === groupId);
              if (!groupInfo) return null;

              const groupItems = data.addonItemsByGroup?.[groupId] || [];
              const activeItems = groupItems.filter((gi: any) => gi.isActive).map((gi: any) => ({
                id: gi.id,
                name: gi.name,
                price: Number(gi.price) || 0,
                description: gi.description || gi.ingredients || '',
                dietaryType: gi.dietaryType,
              }));

              return {
                id: groupInfo.id,
                name: groupInfo.name,
                isRequired: groupInfo.isRequired || false,
                minSelect: groupInfo.minSelect || 0,
                maxSelect: groupInfo.maxSelect || 1,
                items: activeItems,
              };
            }).filter(Boolean);
          })(),
          sortOrder: item.sortOrder || 0,
          isRecommended: !!item.isRecommended,
          assignedVisibilitySchedules: item.assignedVisibilitySchedules || [],
        };
      });

    // Add standalone legacy addons to the items list
    const addonItems: MenuItem[] = (data.addons || [])
      .filter((addon: any) => addon.isActive)
      .map((addon: any) => ({
        id: addon.id,
        name: addon.name,
        description: addon.description || '',
        category: 'Add-ons',
        price: Number(addon.price) || 0,
        pricingType: addon.pricingType || 'flat_fee',
        image: '',
        dietaryType: 'none',
        variants: [],
        addOns: [],
        addonGroups: [],
        sortOrder: 1000,
      }));

    const allItems = [...transformedItems, ...addonItems];

    // Get unique category names
    const categoryNames = [...new Set([
      ...categoriesWithActiveItems.map((cat: any) => cat.name),
      ...addonItems.map(item => item.category)
    ])];

    // Store category data including guestCount flag
    const categoryDataMap: Record<string, { 
      guestCount: boolean; 
      useSpecialCalculation: boolean; 
      assignedVisibilitySchedules: string[];
      sortOrder: number;
    }> = {};
    categoriesWithActiveItems.forEach((cat: any) => {
      categoryDataMap[cat.name] = {
        guestCount: cat.guestCount || false,
        useSpecialCalculation: !!cat.useSpecialCalculation,
        assignedVisibilitySchedules: cat.assignedVisibilitySchedules || [],
        sortOrder: cat.sortOrder || 0,
      };
    });
    
    // Add default data for addon categories
    if (addonItems.length > 0 && !categoryDataMap['Add-ons']) {
      categoryDataMap['Add-ons'] = { guestCount: false, useSpecialCalculation: false, assignedVisibilitySchedules: [], sortOrder: 1000 };
    }

    setMenuData({
      menuItems: allItems,
      categories: categoryNames,
      categoryData: categoryDataMap,
      visibilitySchedules: data.visibilitySchedules || []
    });
    
    if (categoryNames.length > 0) {
      // Initialize all categories as collapsed (closed by default)
      const initialCollapsedState = categoryNames.reduce((acc: Record<string, boolean>, cat: string) => {
        acc[cat] = true;
        return acc;
      }, {} as Record<string, boolean>);
      setCollapsedCategories(initialCollapsedState);
    }
  };


  // Fetch menu data from database
  useEffect(() => {
    const fetchMenuData = async () => {
      if (initialMenuData) return; // Skip if already loaded from SSR
      try {
        const response = await fetch('/api/menu');
        if (response.ok) {
          const data = await response.json();
          processMenuData(data);
        } else {
          // Fallback to error state - show empty menu
          console.error('Failed to fetch menu data');
          setLoadingMenu(false);
        }
      } catch (error) {
        console.error('Error fetching menu data:', error);
      } finally {
        setLoadingMenu(false);
      }
    };

    fetchMenuData();
  }, []);

  // Auto-scroll active category pill into view
  useEffect(() => {
    const btn = categoryRefs.current[activeCategory];
    if (btn) {
      btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activeCategory]);

  // Show/hide cart FAB based on scroll direction (mobile only)
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (window.innerWidth < 1024 && selectedItemIds.length > 0) {
        setShowCartFab(currentY < lastScrollY.current || currentY < 100);
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [selectedItemIds.length]);


  // Filtered categories and items based on visibility schedules (unified with store)
  const visibleCategories = getVisibleCategories();
  const visibleMenuItems = getVisibleMenuItems();

  useEffect(() => {
    // Ensure the first visible category is selected if none is selected
    // or if the current choice is no longer visible.
    if (visibleCategories.length > 0) {
      if (!activeCategory || !visibleCategories.includes(activeCategory)) {
        console.log('[Wizard] Defaulting selection to first visible category:', visibleCategories[0]);
        setActiveCategory(visibleCategories[0]);
      }
    }
  }, [visibleCategories, activeCategory]);

  // Auto-remove items from cart if they become invisible due to date changes
  useEffect(() => {
    const hiddenSelectedItems = selectedItemIds.filter(itemId => !visibleMenuItems.some(item => item.id === itemId));
    if (hiddenSelectedItems.length > 0) {
      hiddenSelectedItems.forEach(itemId => removeItem(itemId));
    }
  }, [visibleMenuItems, selectedItemIds, removeItem]);


  // Handle category change 
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const steps = [
    {
      number: 1,
      title: t('steps.contact'),
      subtitle: t('steps.welcome'),
      icon: User
    },
    {
      number: 2,
      title: t('steps.selection'),
      subtitle: t('sections.chooseMenu'),
      icon: ClipboardList
    },
    {
      number: 3,
      title: t('steps.review'),
      subtitle: t('sections.reviewRequest'),
      icon: Check
    },
  ];

  const tabs = [
    { id: 'contact', label: t('steps.contact'), icon: User },
    { id: 'address', label: t('sections.address'), icon: MapPin },
    { id: 'event', label: t('sections.event'), icon: Calendar },
    { id: 'requests', label: t('sections.specialRequests'), icon: ClipboardList },
  ];

  // Real-time validation errors for touched fields
  const realtimeErrors = getRealtimeErrors();

  // Merge real-time errors with partial state validation
  const displayErrors = useMemo(() => {
    return { ...realtimeErrors, ...validationErrors };
  }, [realtimeErrors, validationErrors]);

  const validateStep1 = () => {
    const newErrors: Record<string, string | undefined> = {};

    // Validate name
    const nameResult = customerNameSchema.safeParse(eventDetails.name);
    if (!nameResult.success) {
      newErrors.name = nameResult.error.errors[0].message;
    }

    // Validate email
    const emailResult = userEmailSchema.safeParse(eventDetails.email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    }

    // Validate phone
    const phoneResult = customerPhoneSchema.safeParse(eventDetails.telephone);
    if (!phoneResult.success) {
      newErrors.telephone = phoneResult.error.errors[0].message;
    }

    if (!eventDetails.eventDate) {
      newErrors.eventDate = 'Event date is required';
    } else {
      const selectedDateTime = new Date(`${eventDetails.eventDate}T${eventDetails.eventTime || '00:00'}`);
      const twentyFourHoursFromNow = new Date(Date.now() + 24 * 60 * 60 * 1000);

      if (selectedDateTime < twentyFourHoursFromNow) {
        newErrors.eventDate = 'Booking must be at least 24 hours in advance';
      }
    }

    // Validate street
    const streetResult = customerStreetSchema.safeParse(eventDetails.street);
    if (!streetResult.success) {
      newErrors.street = streetResult.error.errors[0].message;
    }

    // Validate PLZ
    const plzResult = customerPlzSchema.safeParse(eventDetails.plz);
    if (!plzResult.success) {
      newErrors.plz = plzResult.error.errors[0].message;
    }

    // Validate location
    const locationResult = customerLocationSchema.safeParse(eventDetails.location);
    if (!locationResult.success) {
      newErrors.location = locationResult.error.errors[0].message;
    }

    if (!eventDetails.eventTime) {
      newErrors.eventTime = 'Event time is required';
    }

    if (!eventDetails.guestCount) {
      newErrors.guestCount = 'Number of guests is required';
    } else if (parseInt(eventDetails.guestCount) < 1) {
      newErrors.guestCount = 'Must have at least 1 guest';
    } else if (parseInt(eventDetails.guestCount) > 10000) {
      newErrors.guestCount = 'Number of guests cannot exceed 10,000';
    }

    // Validate occasion (optional)
    if (eventDetails.occasion) {
      const occasionResult = customerOccasionSchema.safeParse(eventDetails.occasion);
      if (!occasionResult.success) {
        newErrors.occasion = occasionResult.error.errors[0].message;
      }
    }

    // Validate special requests (optional)
    if (eventDetails.specialRequests) {
      const specialRequestsResult = customerSpecialRequestsSchema.safeParse(eventDetails.specialRequests);
      if (!specialRequestsResult.success) {
        newErrors.specialRequests = specialRequestsResult.error.errors[0].message;
      }
    }


    // Validate billing address if 'On Invoice' is selected and not using same address
    if (eventDetails.paymentMethod === 'on_bill' && !eventDetails.useSameAddressForBilling) {
      const billingStreetResult = customerStreetSchema.safeParse(eventDetails.billingStreet);
      if (!billingStreetResult.success) {
        newErrors.billingStreet = billingStreetResult.error.errors[0].message;
      }

      const billingPlzResult = customerPlzSchema.safeParse(eventDetails.billingPlz);
      if (!billingPlzResult.success) {
        newErrors.billingPlz = billingPlzResult.error.errors[0].message;
      }

      const billingLocationResult = customerLocationSchema.safeParse(eventDetails.billingLocation);
      if (!billingLocationResult.success) {
        newErrors.billingLocation = billingLocationResult.error.errors[0].message;
      }
    }

    setValidationErrors(newErrors);

    // If there are errors, mark all fields as touched to show them
    if (Object.keys(newErrors).length > 0) {
      const allTouched = {
        name: true,
        email: true,
        telephone: true,
        street: true,
        plz: true,
        location: true,
        eventDate: true,
        eventTime: true,
        guestCount: true,
        occasion: true,
        specialRequests: true,
        billingStreet: true,
        billingPlz: true,
        billingLocation: true,
      };
      setTouchedFields(allTouched);
      
      // Toast to inform user
      toast.error('Bitte füllen Sie alle erforderlichen Felder aus.');
    }

    return Object.keys(newErrors).length === 0;
  };

  // Memoized validation states for better reactivity
  const isContactTabValid = useMemo(() => {
    const phoneTrimmed = eventDetails.telephone.trim();
    const phoneDigitsOnly = phoneTrimmed.replace(/\s/g, '').replace(/\+/g, '');
    return (
      eventDetails.name.trim() !== '' &&
      eventDetails.email.trim() !== '' &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(eventDetails.email) &&
      phoneTrimmed !== '' &&
      phoneDigitsOnly.length >= 10 &&
      phoneDigitsOnly.length <= 20
    );
  }, [eventDetails.name, eventDetails.email, eventDetails.telephone]);

  const isAddressTabValid = useMemo(() => {
    const isStreetValid = eventDetails.street.trim().length >= 5;
    const isPlzValid = eventDetails.plz.trim().length >= 4 &&
      eventDetails.plz.trim().length <= 10 &&
      /^\d+$/.test(eventDetails.plz.trim());
    const isLocationValid = eventDetails.location.trim().length >= 4;

    // Billing address validation if applicable
    let isBillingValid = true;
    if (eventDetails.paymentMethod === 'on_bill' && !eventDetails.useSameAddressForBilling) {
      const isBStreetValid = eventDetails.billingStreet.trim().length >= 5;
      const isBPlzValid = eventDetails.billingPlz.trim().length >= 4 &&
        eventDetails.billingPlz.trim().length <= 10 &&
        /^\d+$/.test(eventDetails.billingPlz.trim());
      const isBLocationValid = eventDetails.billingLocation.trim().length >= 2;
      isBillingValid = isBStreetValid && isBPlzValid && isBLocationValid;
    }

    return isStreetValid && isPlzValid && isLocationValid && isBillingValid;
  }, [eventDetails.street, eventDetails.plz, eventDetails.location, eventDetails.paymentMethod, eventDetails.useSameAddressForBilling, eventDetails.billingStreet, eventDetails.billingPlz, eventDetails.billingLocation]);

  const isEventTabValid = useMemo(() => {
    const isDateValid = eventDetails.eventDate !== '' &&
      (new Date(`${eventDetails.eventDate}T${eventDetails.eventTime || '00:00'}`) >= new Date(Date.now() + 24 * 60 * 60 * 1000));

    return (
      isDateValid &&
      eventDetails.guestCount !== '' &&
      parseInt(eventDetails.guestCount) >= 1 &&
      parseInt(eventDetails.guestCount) <= 10000
    );
  }, [eventDetails.eventDate, eventDetails.eventTime, eventDetails.guestCount]);

  const isStep1Valid = useMemo(() => {
    const isDateValid = eventDetails.eventDate !== '' &&
      (new Date(`${eventDetails.eventDate}T${eventDetails.eventTime || '00:00'}`) >= new Date(Date.now() + 24 * 60 * 60 * 1000));

    const phoneTrimmed = eventDetails.telephone.trim();
    const phoneDigitsOnly = phoneTrimmed.replace(/\s/g, '').replace(/\+/g, '');
    const isPhoneValid = phoneTrimmed !== '' &&
      phoneDigitsOnly.length >= 10 &&
      phoneDigitsOnly.length <= 20 &&
      /^[0-9+\s]+$/.test(phoneTrimmed);

    const isAddressValid = eventDetails.street.trim().length >= 5 &&
      eventDetails.plz.trim().length >= 4 &&
      /^\d+$/.test(eventDetails.plz.trim()) &&
      eventDetails.location.trim().length >= 4;

    // Billing address check for overall Step 1 validity
    let isBillingValid = true;
    if (eventDetails.paymentMethod === 'on_bill' && !eventDetails.useSameAddressForBilling) {
      isBillingValid = eventDetails.billingStreet.trim().length >= 5 &&
        eventDetails.billingPlz.trim().length >= 4 &&
        /^\d+$/.test(eventDetails.billingPlz.trim()) &&
        eventDetails.billingLocation.trim().length >= 2;
    }

    return (
      isDateValid &&
      isPhoneValid &&
      isAddressValid &&
      isBillingValid &&
      eventDetails.name.trim() !== '' &&
      eventDetails.email.trim() !== '' &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(eventDetails.email) &&
      eventDetails.guestCount !== '' &&
      parseInt(eventDetails.guestCount) >= 1 &&
      parseInt(eventDetails.guestCount) <= 10000
    );
  }, [eventDetails.eventDate, eventDetails.eventTime, eventDetails.telephone, eventDetails.street, eventDetails.plz, eventDetails.location, eventDetails.name, eventDetails.email, eventDetails.guestCount, eventDetails.room, eventDetails.paymentMethod, eventDetails.useSameAddressForBilling, eventDetails.billingStreet, eventDetails.billingPlz, eventDetails.billingLocation]);


  const isCurrentTabValid = useMemo(() => {
    switch (activeTab) {
      case 'contact':
        return isContactTabValid;
      case 'address':
        return isAddressTabValid;
      case 'event':
        return isEventTabValid;
      case 'requests':
        return isStep1Valid; // Validate all required fields before proceeding to step 2
      default:
        return true;
    }
  }, [activeTab, isContactTabValid, isAddressTabValid, isEventTabValid, isStep1Valid]);

  // Helper functions for tab navigation
  const getNextTab = () => {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
    if (currentIndex < tabs.length - 1) {
      return tabs[currentIndex + 1].id;
    }
    return null;
  };

  const isLastTab = () => {
    return activeTab === tabs[tabs.length - 1].id;
  };

  const handleStep1Navigation = () => {
    // Since all sections are visible on one page, validate and proceed directly to Step 2
    if (validateStep1()) {
      setCurrentStep(2);
      // Proactively select the first category to ensure UI sync
      if (visibleCategories.length > 0) {
        setActiveCategory(visibleCategories[0]);
      }
    }
  };

  const validateStep2 = () => {
    if (selectedItemIds.length === 0) {
      setStep2Error('Please select at least one menu item to continue');
      return false;
    }
    setStep2Error('');
    return true;
  };

  const handleRequestUnlock = async () => {
    if (!bookingId || !editSecret) return;

    setIsRequestingUnlock(true);
    try {
      const result = await requestBookingUnlock(bookingId, editSecret);
      if (result.success) {
        setIsUnlockRequested(true);
        toast.success("Request sent successfully!");
      } else {
        toast.error("Failed to send request. Please try again or contact us.");
      }
    } catch (error) {
      console.error("Error requesting unlock:", error);
      toast.error("An unexpected error occurred.");
    } finally {
      setIsRequestingUnlock(false);
    }
  };

  const handleStep2Navigation = () => {
    // Start submission directly skipping Step 3
    if (validateStep2()) {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStep2Back = () => {
    // On Step 2, check if on first visible category
    const currentCategoryIndex = visibleCategories.indexOf(activeCategory);
    if (currentCategoryIndex > 0) {
      // Go to previous category
      setActiveCategory(visibleCategories[currentCategoryIndex - 1]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // On first category, go back to Step 1
      handleBack();
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Submit to server
      const billingStreet = eventDetails.useSameAddressForBilling
        ? eventDetails.street
        : eventDetails.billingStreet;
      const billingPlz = eventDetails.useSameAddressForBilling
        ? eventDetails.plz
        : eventDetails.billingPlz;
      const billingLocation = eventDetails.useSameAddressForBilling
        ? eventDetails.location
        : eventDetails.billingLocation;

      const result = await submitWizardForm({
        contactName: eventDetails.name,
        contactEmail: eventDetails.email,
        contactPhone: eventDetails.telephone,
        business: eventDetails.business,
        street: eventDetails.street,
        plz: eventDetails.plz,
        location: eventDetails.location,
        eventDate: eventDetails.eventDate,
        eventTime: eventDetails.eventTime,
        guestCount: parseInt(eventDetails.guestCount) || 0,
        occasion: eventDetails.occasion,
        specialRequests: eventDetails.specialRequests,
        paymentMethod: eventDetails.paymentMethod || 'cash',
        useSameAddressForBilling: eventDetails.useSameAddressForBilling ?? true,
        billingStreet: billingStreet || '',
        billingPlz: billingPlz || '',
        billingLocation: billingLocation || '',
        billingReference: eventDetails.billingReference || '',
        room: eventDetails.room || '',
        reference: eventDetails.reference || '',
        selectedItems: selectedItemIds,
        itemQuantities: Object.fromEntries(selectedItemIds.map(id => [id, cart[id]?.quantity || 1])),
        itemGuestCounts: Object.fromEntries(selectedItemIds.map(id => [id, cart[id]?.guestCount || parseInt(eventDetails.guestCount) || 1])),
        itemVariants: Object.fromEntries(selectedItemIds.map(id => [id, cart[id]?.variantId || ''])),
        itemAddOns: Object.fromEntries(selectedItemIds.map(id => [id, cart[id]?.addOnIds || []])),
        itemComments: Object.fromEntries(selectedItemIds.map(id => [id, cart[id]?.comment || ''])),
        allergyDetails: [],
        bookingId,
      });

      if (result.success && result.data) {
        const newBookingId = result.data.bookingId;
        setBookingInfo(newBookingId, null);

        const pdfData = {
          id: result.data.bookingId,
          customerName: eventDetails.name,
          business: eventDetails.business || undefined,
          eventDate: eventDetails.eventDate,
          eventTime: eventDetails.eventTime,
          guestCount: parseInt(eventDetails.guestCount) || 0,
          occasion: eventDetails.occasion || undefined,
          items: selectedItemIds.map(itemId => {
            const item = menuItems.find(i => i.id === itemId);
            if (!item) return null;

            const cartItem = cart[itemId];
            const quantity = (isPerPerson(item) ? (cartItem.guestCount || parseInt(eventDetails.guestCount) || 1) : cartItem.quantity || 1);
            const unitPrice = getItemPerPersonPrice(item);
            
            const variantName = cartItem.variantId && item.variants
              ? item.variants.find((v: any) => v.id === cartItem.variantId)?.name
              : '';
              
            const resolveAddonNames = (ids: string[]) => {
              if (!ids || ids.length === 0) return [];
              return ids.map(id => {
                // 1. Try finding in current item's groups
                if (item.addonGroups) {
                  for (const group of item.addonGroups) {
                    const ao = group.items.find((i: any) => i.id === id);
                    if (ao) return ao.name;
                  }
                }
                // 2. Try finding in current item's legacy addons
                const legacyAo = item.addOns?.find((ao: any) => ao.id === id);
                if (legacyAo) return legacyAo.name;
                
                // 3. Global fallback: search ALL menu items for this addon ID
                for (const otherItem of menuItems) {
                  if (otherItem.addonGroups) {
                    for (const group of otherItem.addonGroups) {
                      const ao = group.items.find((i: any) => i.id === id);
                      if (ao) return ao.name;
                    }
                  }
                  const otherLegacyAo = otherItem.addOns?.find((ao: any) => ao.id === id);
                  if (otherLegacyAo) return otherLegacyAo.name;
                }
                
                return id; // Final fallback to ID
              });
            };

            const addonNames = resolveAddonNames(cartItem.addOnIds);
              
            const itemNotes = [
              variantName ? `Variant: ${variantName}` : '',
              addonNames.length > 0 ? `Choices: ${addonNames.join(', ')}` : ''
            ].filter(Boolean).join(' | ');

            return {
              id: itemId,
              name: item.name,
              category: item.category,
              quantity: quantity,
              unitPrice: unitPrice,
              totalPrice: unitPrice * quantity,
              notes: itemNotes,
              customerComment: cartItem.comment || '',
              pricingType: item.pricingType,
              dietaryType: item.dietaryType || 'none',
              useSpecialCalculation: categoryData[item.category]?.useSpecialCalculation || false,
            };
          }).filter(Boolean),
          estimatedTotal: result.data.estimatedTotal,
          specialRequests: eventDetails.specialRequests || undefined,
        };
        setBookingPdfData(pdfData);
        const inquiryNo = result.data.inquiryNumber || `INQ-${Math.floor(Math.random() * 9000) + 1000}`;
        
        if (isEditMode) {
          toast.success(t('status.requestSent'));
          sessionStorage.removeItem('edit_booking_id');
          sessionStorage.removeItem('edit_secret');
          router.push(`/admin/bookings?id=${newBookingId}&tab=menu-details`);
        } else {
          setSubmitted(true, inquiryNo);
          sessionStorage.removeItem('edit_booking_id');
          sessionStorage.removeItem('edit_secret');
          setIsSubmitting(false);
        }
      } else {
        setIsSubmitting(false);
        toast.error(result.error || t('status.noItems'));
      }
    } catch (error: any) {
      console.error('Submission error:', error);
      setIsSubmitting(false);
      toast.error(t('status.error'));
    }
  };

  const openDetailsModal = (item: MenuItem) => {
    setDetailsModalItem(item);
  };

  const closeDetailsModal = () => {
    setDetailsModalItem(null);
  };

  const handleModalConfirm = (itemId: string, data: {
    quantity: number;
    guestCount: number | null;
    addOns: string[];
    variant: string;
    comment: string;
  }) => {
    updateItem(itemId, {
      quantity: data.quantity,
      guestCount: data.guestCount || undefined,
      addOnIds: data.addOns,
      variantId: data.variant,
      comment: data.comment
    });
    setDetailsModalItem(null);
  };



  // Show thank you screen if submitted
  if (isSubmitted) {
    return (
      <ThankYouScreen
        inquiryNumber={inquiryNumber}
        bookingData={bookingPdfData}
        onCreateNew={() => {
          setEditMode(false);
          setSubmitted(false);
          setBookingInfo(null, null);
          setBookingPdfData(null);

          // Clear persistence
          sessionStorage.removeItem('edit_booking_id');
          sessionStorage.removeItem('edit_secret');
        }}

        onEditOrder={() => {
          setEditMode(true);
          setSubmitted(false, inquiryNumber);
          setCurrentStep(2); // Go back to menu selection
        }}
        onGoHome={() => {
          // Navigation is handled by the WizardHeader back button
          // User can also use browser back or the header logo
        }}
      />
    );
  }

  if (isLoadingEdit || loadingMenu) {
    return (
      <div className="min-h-screen bg-[#f7f7f8] flex flex-col items-center justify-center">
        <div className="relative">
          <div className="size-[64px] border-4 border-[#9dae91]/20 border-t-[#9dae91] rounded-full animate-spin" />
        </div>
        <p className="mt-4 text-[15px] font-medium text-[#6b7280]">
          {loadingMenu ? "Bereitstellung des Menüs..." : "Laden Ihrer Buchung..."}
        </p>
      </div>
    );
  }

  return (
    <>
      {currentStep !== 2 && (
        <WizardHeader
          onBack={
            currentStep > 1
              ? () => setCurrentStep(1)
              : (isEditMode && bookingId)
                ? () => router.push(`/admin/bookings?id=${bookingId}&tab=menu-details`)
                : undefined
          }
        />
      )}
      <div className={`${currentStep === 2 ? "h-screen overflow-hidden" : "min-h-screen"} bg-background flex flex-col`}>
        {/* Mobile Step Indicator - Only visible on mobile */}
        {/*<div className="lg:hidden sticky top-0 z-40 bg-primary text-primary-foreground px-4 py-3">
          <div className="max-w-4xl mx-auto">
            {/* Compact Row: Step Counter + Title 
            <div className="flex items-center justify-between gap-3 mb-2">
              <p className="text-primary-foreground opacity-80 flex-shrink-0" style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}>
                {t('status.itemsAvailable', { count: currentStep })}
              </p>
              <h2 className="text-primary-foreground text-right" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>
                {steps[currentStep - 1]?.title || t('steps.review')}
              </h2>
            </div>
            //progress bar
            <div className="flex items-center gap-2">
              {steps.map((step) => {
                const isActive = currentStep === step.number;
                const isCompleted = currentStep > step.number;

                return (
                  <div key={step.number} className="flex-1">
                    <div className={`h-1.5 rounded-full transition-all duration-300 ${isCompleted || isActive
                      ? 'bg-primary-foreground'
                      : 'bg-primary-foreground/20'
                      }`} style={{ borderRadius: 'var(--radius)' }} />
                  </div>
                );
              })}
            </div>
          </div>
        </div> */}

        {/* Main Content - Two Column Layout */}
        <div className="flex-1 flex flex-col items-center w-full">
          {/* Right Content Area - w-full - With left margin on desktop to account for fixed sidebar */}
          <main className={`w-full bg-background ${currentStep === 2 ? "" : "p-4 lg:p-8"}`}>
            <div className={
              currentStep === 2 ? "w-full" :
                currentStep === 1 ? "max-w-4xl mx-auto" :
                  "max-w-5xl mx-auto"
            }>
              <div>
                {/* Step 1: Event Details - SINGLE PAGE LAYOUT WITH GROUPED SECTIONS */}
                {currentStep === 1 && (
                  <CustomerDetailsForm />
                )}

                {currentStep === 2 && (
                  <CustomerMenuSelection
                    categoryRefs={categoryRefs}
                    handleStep2Navigation={handleStep2Navigation}
                    onBack={
                      currentStep > 1
                        ? () => setCurrentStep(1)
                        : (isEditMode && bookingId)
                          ? () => router.push(`/admin/bookings?id=${bookingId}&tab=menu-details`)
                          : undefined
                    }
                  />
                )}

                {currentStep === 3 && (
                  <CustomerSummary
                    handleRequestUnlock={handleRequestUnlock}
                  />
                )}

                {/* Navigation Buttons - Hidden on Step 2 because it has its own sidebar-aware navigation */}
                {currentStep !== 2 && (
                  <div className="sticky bottom-0 bg-card flex items-center justify-between mt-3 pt-3 border-t border-border gap-2 -mx-5 px-5 -mb-5 pb-3 lg:-mx-8 lg:px-8 lg:-mb-8 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]" style={{ borderRadius: '0 0 var(--radius-card) var(--radius-card)' }}>
                    {/* Back button - Show when on Step 2 or 3 */}
                    {currentStep > 1 && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          if (currentStep === 2) {
                            // On Step 2, go to previous category or back to Step 1
                            handleStep2Back();
                          } else {
                            // Step 3 or higher, navigate to previous step
                            handleBack();
                          }
                        }}
                        icon={ChevronLeft}
                        iconPosition="left"
                        size="sm"
                      >
                        {t('actions.back')}
                      </Button>
                    )}

                    <div className="flex items-center gap-2 ml-auto">
                      {currentStep === 1 && (
                        <Button
                          variant="primary"
                          onClick={handleStep1Navigation}
                          icon={ChevronRight}
                          iconPosition="right"
                          disabled={isSubmitting}
                          size="sm"
                        >
                          {t('actions.proceedToMenu')}
                        </Button>
                      )}

                      {currentStep === 2 && (
                        <Button
                          variant="primary"
                          onClick={() => setIsMobileDrawerOpen(true)}
                          icon={ShoppingCart}
                          iconPosition="right"
                          size="sm"
                        >
                          {t('status.notSelected')}
                        </Button>
                      )}

                      {currentStep === 3 && (
                        <Button
                          variant={isLocked ? "outline" : "primary"}
                          onClick={isLocked ? undefined : handleSubmit}
                          icon={isLocked ? Lock : Send}
                          iconPosition="right"
                          disabled={(!termsAccepted || isSubmitting) || isLocked}
                          size="sm"
                        >
                          {isLocked
                            ? t('status.bookingLocked')
                            : isSubmitting
                              ? t('status.processing')
                              : isEditMode
                                ? t('actions.updateRequest')
                                : t('actions.submitRequest')}
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>

        <ItemDetailsModal
          item={detailsModalItem}
          onClose={closeDetailsModal}
        />
        {/* Mobile Cart FAB - side-attached style, only on step 2 with items selected */}
        {
          currentStep === 2 && selectedItemIds.length > 0 && showCartFab && (
            <button
              onClick={() => setIsMobileDrawerOpen(true)}
              className="lg:hidden fixed right-0 bottom-24 z-40 bg-primary text-primary-foreground shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 p-4 flex items-center gap-2.5 border-2 border-primary-foreground/10 border-r-0"
              style={{ borderRadius: 'var(--radius-card) 0 0 var(--radius-card)' }}
              aria-label="View shopping cart"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5" />
                <span
                  className="absolute -top-2 -right-2 bg-secondary text-secondary-foreground rounded-full w-5 h-5 flex items-center justify-center"
                  style={{ fontSize: '11px', fontWeight: 'var(--font-weight-semibold)' }}
                >
                  {selectedItemIds.length}
                </span>
              </div>
              <div className="flex flex-col items-start">
                <span style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-semibold)', lineHeight: '1' }}>
                  CHF {getTotalPrice().toFixed(2)}
                </span>
              </div>
            </button>
          )
        }

        {/* Mobile Cart Drawer */}
        {
          isMobileDrawerOpen && (
            <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setIsMobileDrawerOpen(false)}>
              {/* Backdrop */}
              <div className="absolute inset-0 bg-black/40" />
              {/* Drawer */}
              <div
                className="absolute bottom-0 left-0 right-0 bg-card rounded-t-2xl max-h-[80vh] flex flex-col animate-slide-up"
                style={{ borderRadius: 'var(--radius-card) var(--radius-card) 0 0' }}
                onClick={(e) => e.stopPropagation()}
              >
                <MenuCart
                  isCartCollapsed={isCartCollapsed}
                  setIsCartCollapsed={setIsCartCollapsed}
                  onContinue={() => { setIsMobileDrawerOpen(false); handleStep2Navigation(); }}
                  continueButtonText={t('actions.continueToReview')}
                  onEditDateTime={() => {
                    setIsMobileDrawerOpen(false);
                    setIsDateTimePickerOpen(true);
                  }}
                  isDrawer
                  onCloseDrawer={() => setIsMobileDrawerOpen(false)}
                />
              </div>
            </div>
          )
        }
      </div >

      {/* Item Details Modal */}
      {detailsModalItem && (
        <ItemDetailsModal
          item={detailsModalItem}
          onClose={() => setDetailsModalItem(null)}
        />
      )}

      {/* Date & Time Picker Modal */}
      <DateTimePickerModal
        isOpen={isDateTimePickerOpen}
        onClose={() => {
          setIsDateTimePickerOpen(false);
          // Mark fields as touched when modal closes to trigger validation
          if (eventDetails.eventDate || eventDetails.eventTime) {
            setTouchedFields({ eventDate: true, eventTime: true });
          }
        }}
        onSelectDate={(date) => {
          setEventDetails({ eventDate: date });
          setTouchedFields({ eventDate: true });
          if (validationErrors.eventDate) {
            const nextErrors = { ...validationErrors };
            delete nextErrors.eventDate;
            setValidationErrors(nextErrors);
          }
        }}
        onSelectTime={(time) => {
          setEventDetails({ eventTime: time });
          setTouchedFields({ eventTime: true });
          if (validationErrors.eventTime) {
            const nextErrors = { ...validationErrors };
            delete nextErrors.eventTime;
            setValidationErrors(nextErrors);
          }
        }}
        initialDate={eventDetails.eventDate}
        initialTime={eventDetails.eventTime}
      />
      {/* Global Submission Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 z-[10000] bg-white/60 backdrop-blur-[2px] flex flex-col items-center justify-center animate-in fade-in duration-300 transition-all cursor-wait">
          <div className="relative">
            <div className="size-16 border-4 border-[#9dae91]/20 border-t-[#9dae91] rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Send className="w-6 h-6 text-[#9dae91] animate-pulse" />
            </div>
          </div>
          <div className="mt-6 text-center space-y-1">
            <p className="text-[17px] font-bold text-[#2c2f34]">Bestellung wird gesendet...</p>
            <p className="text-[14px] text-[#6b7280]">Einen Moment bitte, wir bearbeiten Ihre Anfrage.</p>
          </div>
        </div>
      )}
    </>
  );
}
