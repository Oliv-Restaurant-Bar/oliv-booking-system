'use client';

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Calendar, User, Check, ChevronLeft, ChevronRight, Send, ClipboardList, MapPin, ShoppingCart, Lock } from 'lucide-react';
import { Button } from './Button';
import { MenuItem } from './menuItemsData';
import { ThankYouScreen } from './ThankYouScreen';
import { WizardHeader } from './WizardHeader';
import { useWizardTranslation } from '@/lib/i18n/client';
import { DateTimePickerModal } from './DateTimePickerModal';
import { submitWizardForm, requestBookingUnlock } from '@/lib/actions/wizard';
import { SkeletonKPI, SkeletonPage, SkeletonMenuSelection } from '@/components/ui/skeleton-loaders';
import { customerNameSchema, customerBusinessSchema, customerPhoneSchema, customerStreetSchema, customerPlzSchema, customerLocationSchema, customerOccasionSchema, customerSpecialRequestsSchema, userEmailSchema } from '@/lib/validation/schemas';
import { EventDetails } from '@/lib/types';
import { CustomerDetailsForm } from './CustomerDetailsForm';
import { CustomerMenuSelection } from './CustomerMenuSelection';
import { CustomerSummary } from './CustomerSummary';
import { ItemDetailsModal } from './ItemDetailsModal';
import { MenuCart } from './MenuCart';
import { toast } from 'sonner';

export function CustomMenuWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useWizardTranslation();

  const [currentStep, setCurrentStep] = useState(1);
  const [activeTab, setActiveTab] = useState('contact');
  const [eventDetails, setEventDetails] = useState<EventDetails>({
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
    billingStreetError: undefined,
    billingPlzError: undefined,
    billingLocationError: undefined,
    billingReference: '',
    room: '',
    roomError: undefined,
  });
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({});
  const [itemGuestCounts, setItemGuestCounts] = useState<Record<string, number>>({});
  const [itemAddOns, setItemAddOns] = useState<Record<string, string[]>>({});
  const [itemVariants, setItemVariants] = useState<Record<string, string>>({});
  const [itemComments, setItemComments] = useState<Record<string, string>>({});
  const [selectedCategory, setSelectedCategory] = useState('Appetizers');
  const [isCartCollapsed, setIsCartCollapsed] = useState(true);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [showCartFab, setShowCartFab] = useState(true);
  const [summaryViewMode, setSummaryViewMode] = useState<'per-person' | 'total'>('total');
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Partial<EventDetails>>({});
  const [touched, setTouched] = useState<Record<keyof EventDetails, boolean>>({
    name: false,
    email: false,
    telephone: false,
    street: false,
    plz: false,
    location: false,
    eventDate: false,
    eventTime: false,
    guestCount: false,
    occasion: false,
    specialRequests: false,
    business: false,
    reference: false,
    billingStreet: false,
    billingPlz: false,
    billingLocation: false,
    billingReference: false,
    room: false,
  } as Record<keyof EventDetails, boolean>);

  // Refs for category pill auto-scroll
  const categoryRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const lastScrollY = useRef(0);
  const [detailsModalItem, setDetailsModalItem] = useState<MenuItem | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [signature, setSignature] = useState('');
  const [editBookingData, setEditBookingData] = useState<{ items: any[], guestCount: string } | null>(null);
  const [isEditRestored, setIsEditRestored] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [inquiryNumber, setInquiryNumber] = useState('');
  const [step2Error, setStep2Error] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryData, setCategoryData] = useState<Record<string, { guestCount: boolean }>>({});
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [editSecret, setEditSecret] = useState<string | null>(null);
  const [bookingPdfData, setBookingPdfData] = useState<any>(null); // New state for PDF
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAdminEdit, setIsAdminEdit] = useState(false); // Track if admin initiated edit
  const [originalGuestCount, setOriginalGuestCount] = useState<string>(''); // Store original guest count from booking
  const [isLocked, setIsLocked] = useState(false);
  const [isLoadingEdit, setIsLoadingEdit] = useState(false);



  const [isUnlockRequested, setIsUnlockRequested] = useState(false);
  const [isRequestingUnlock, setIsRequestingUnlock] = useState(false);
  const [includeBeveragePrices, setIncludeBeveragePrices] = useState(false);

  // Date and Time picker modal states
  const [isDateTimePickerOpen, setIsDateTimePickerOpen] = useState(false);

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  // Check for edit mode from sessionStorage
  useEffect(() => {
    const editMode = searchParams.get('edit');

    if (editMode === 'true') {
      const bookingIdParam = searchParams.get('id');
      const secretParam = searchParams.get('secret');

      // Check temporary localStorage (for secure new tab redirection)
      const tempId = localStorage.getItem('temp_edit_id');
      const tempSecret = localStorage.getItem('temp_edit_secret');
      const tempTimestamp = localStorage.getItem('temp_edit_timestamp');
      const now = Date.now();

      let finalId = bookingIdParam || sessionStorage.getItem('edit_booking_id');
      let finalSecret = secretParam || sessionStorage.getItem('edit_secret');

      // Use temporary localStorage if it's less than 60 seconds old
      if (tempId && tempSecret && tempTimestamp && (now - parseInt(tempTimestamp) < 60000)) {
        // Edit mode activated via secure localStorage
        finalId = tempId;
        finalSecret = tempSecret;

        // Check if this is an admin-initiated edit
        const isAdmin = localStorage.getItem('temp_edit_is_admin') === 'true';
        setIsAdminEdit(isAdmin);
        if (isAdmin) {
          console.log('Admin edit mode detected');
        }

        // Clean up immediately for security, then store in sessionStorage for refresh persistence
        localStorage.removeItem('temp_edit_id');
        localStorage.removeItem('temp_edit_secret');
        localStorage.removeItem('temp_edit_timestamp');
        localStorage.removeItem('temp_edit_is_admin'); // Clean up admin flag

        sessionStorage.setItem('edit_booking_id', tempId);
        sessionStorage.setItem('edit_secret', tempSecret);
      }

      if (finalId && finalSecret) {
        setIsLoadingEdit(true);

        // Set edit mode FIRST before any async operations
        setBookingId(finalId);
        setEditSecret(finalSecret);
        setIsEditMode(true);

        // Sync to sessionStorage to survive refreshes
        sessionStorage.setItem('edit_booking_id', finalId);
        sessionStorage.setItem('edit_secret', finalSecret);

        // Check lock status by fetching booking
        const checkLockStatus = async () => {
          try {
            const response = await fetch(`/api/booking/${finalId}/edit/${finalSecret}`);
            if (response.ok) {
              const result = await response.json();
              if (result.success && result.data) {
                setIsLocked(result.data.isLocked || false);

                const booking = result.data;
                const lead = booking.lead;

                // Store the original guest count for display in cart
                const originalGuestCountValue = booking.guestCount?.toString() || '';
                setOriginalGuestCount(originalGuestCountValue);

                // Populate eventDetails from booking
                setEventDetails({
                  name: booking.name || lead?.contactName || '',
                  business: booking.business || '',
                  email: booking.email || lead?.contactEmail || '',
                  telephone: booking.telephone || lead?.contactPhone || '',
                  street: booking.street || '',
                  plz: booking.plz || '',
                  location: booking.location || '',
                  eventDate: booking.eventDate ? booking.eventDate.split('T')[0] : '',
                  eventTime: booking.eventTime || '',
                  guestCount: originalGuestCountValue,
                  occasion: booking.occasion || '',
                  specialRequests: booking.specialRequests || '',
                  reference: booking.reference || '',
                  paymentMethod: booking.paymentMethod || 'ec_card',
                  useSameAddressForBilling: booking.useSameAddressForBilling ?? true,
                  billingStreet: booking.billingStreet || '',
                  billingPlz: booking.billingPlz || '',
                  billingLocation: booking.billingLocation || '',
                  billingStreetError: undefined,
                  billingPlzError: undefined,
                  billingLocationError: undefined,
                  billingReference: booking.billingReference || '',
                  room: (booking.room || '').toLowerCase(),
                  roomError: undefined,
                  bookingId: finalId,
                });

                // Load menu items from booking_items
                if (booking.booking_items && booking.booking_items.length > 0) {
                  // Save for later restoration after menuItems is ready
                  setEditBookingData({
                    items: booking.booking_items,
                    guestCount: booking.guestCount?.toString() || '1'
                  });

                  const items = booking.booking_items.map((item: any) => item.itemId || item.item_id);
                  setSelectedItems(items);

                  const quantities: Record<string, number> = {};
                  const guestCounts: Record<string, number> = {};
                  const comments: Record<string, string> = {};

                  const totalBookingGuestCount = booking.guestCount || 0;

                  booking.booking_items.forEach((item: any) => {
                    const id = item.itemId || item.item_id;
                    if (id) {
                      quantities[id] = item.quantity || 1;
                      
                      // Only set an individual guest count if it's different from the total
                      // This allows items to follow the main guest count if the user updates it in Step 1
                      if (item.quantity !== totalBookingGuestCount && totalBookingGuestCount > 0) {
                        guestCounts[id] = item.quantity || 1;
                        console.log(`[Edit Mode] Item ${id} has custom quantity ${item.quantity} (Total: ${totalBookingGuestCount}). Pinned.`);
                      } else {
                        console.log(`[Edit Mode] Item ${id} matches total ${totalBookingGuestCount}. Staying in sync.`);
                      }

                      // Extract comment from notes
                      if (item.notes) {
                        const commentMatch = item.notes.match(/Comment: ([^|]+)/);
                        if (commentMatch) {
                          comments[id] = commentMatch[1].trim();
                        }
                      }
                    }
                  });

                  setItemQuantities(quantities);
                  setItemGuestCounts(guestCounts);
                  setItemComments(comments);
                }

                // Clear sessionStorage - commented out because it breaks StrictMode (dev) re-mounts
                // sessionStorage.removeItem('edit_booking_id');
                // sessionStorage.removeItem('edit_secret');
                // sessionStorage.removeItem('edit_mode');

                // Go to menu selection page
                setCurrentStep(2);
              }
            }
          } catch (error) {
            console.error('Error checking lock status:', error);
          } finally {
            setIsLoadingEdit(false);
          }
        };

        checkLockStatus();
      }
    }
  }, [searchParams]);

  // Extra effect to restore variants and addons once menu data is loaded
  useEffect(() => {
    if (menuItems.length > 0 && editBookingData && !isEditRestored) {
      console.log('[Edit Mode] Restoring variants and addons from booking notes...');
      console.log('[Edit Mode] Menu items loaded:', menuItems.length);
      console.log('[Edit Mode] Booking items to restore:', editBookingData.items.length);
      const restoredVariants: Record<string, string> = {};
      const restoredAddOns: Record<string, string[]> = {};

      editBookingData.items.forEach((item: any) => {
        const itemId = item.itemId || item.item_id;
        if (!itemId || !item.notes) {
          console.log(`[Edit Mode] Skipping item ${itemId} - no notes`);
          return;
        }

        const menuItem = menuItems.find(mi => mi.id === itemId);
        if (!menuItem) {
          console.warn(`[Edit Mode] Menu item ${itemId} not found in current menu!`);
          return;
        }

        console.log(`[Edit Mode] Restoring item: ${menuItem.name}`);
        console.log(`[Edit Mode] Notes: ${item.notes}`);
        console.log(`[Edit Mode] Unit price from booking: ${item.unitPrice}`);

        // Restore Variants
        const variantMatch = item.notes.match(/Variant: ([^|]+)/);
        if (variantMatch && menuItem.variants) {
          const variantName = variantMatch[1].trim();
          const variant = menuItem.variants.find(v => v.name === variantName);
          if (variant) {
            console.log(`[Edit Mode] ✓ Restored variant "${variantName}" (price: ${variant.price}) for item ${menuItem.name}`);
            restoredVariants[itemId] = variant.id;
          } else {
            console.warn(`[Edit Mode] ✗ Variant "${variantName}" not found in current menu variants for ${menuItem.name}`);
            console.log(`[Edit Mode] Available variants:`, menuItem.variants.map(v => v.name));
          }
        }

        // Restore Add-ons
        const addonsMatch = item.notes.match(/(?:Add-ons|Choices): ([^|]+)/);
        if (addonsMatch) {
          const addonNames = addonsMatch[1].split(',').map((s: string) => s.trim());
          const addonIds: string[] = [];

          console.log(`[Edit Mode] Restoring addons: ${addonNames.join(', ')}`);

          addonNames.forEach((name: string) => {
            // Check in addonGroups if they exist
            if (menuItem.addonGroups) {
              for (const group of menuItem.addonGroups) {
                const addOn = group.items.find(i => i.name === name);
                if (addOn) {
                  addonIds.push(addOn.id);
                  console.log(`[Edit Mode] ✓ Found addon "${name}" in group "${group.name}" (price: ${addOn.price})`);
                  break;
                }
              }
            } else if (menuItem.addOns) {
              // Check in legacy addOns
              const addOn = menuItem.addOns.find(a => a.name === name);
              if (addOn) {
                addonIds.push(addOn.id);
                console.log(`[Edit Mode] ✓ Found legacy addon "${name}" (price: ${addOn.price})`);
              }
            }
          });

          if (addonIds.length > 0) {
            console.log(`[Edit Mode] ✓ Restored ${addonIds.length}/${addonNames.length} addons for item ${menuItem.name}`);
            restoredAddOns[itemId] = addonIds;
          } else {
            console.warn(`[Edit Mode] ✗ Failed to restore any addons for ${menuItem.name}`);
          }
        }
      });

      if (Object.keys(restoredVariants).length > 0) {
        console.log(`[Edit Mode] Setting ${Object.keys(restoredVariants).length} restored variants`);
        setItemVariants(prev => ({ ...prev, ...restoredVariants }));
      }
      if (Object.keys(restoredAddOns).length > 0) {
        console.log(`[Edit Mode] Setting ${Object.keys(restoredAddOns).length} restored addon groups`);
        setItemAddOns(prev => ({ ...prev, ...restoredAddOns }));
      }
      setIsEditRestored(true);
      console.log('[Edit Mode] Restoration complete!');
    }
  }, [menuItems, editBookingData, isEditRestored]);

  // Fetch menu data from database
  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        const response = await fetch('/api/menu');
        if (response.ok) {
          const data = await response.json();

          // Filter to only include ACTIVE categories that have at least ONE active item
          const activeCategories = data.categories.filter((cat: any) => cat.isActive);

          // Get all active items first
          const activeItems = data.items.filter((item: any) => item.isActive);

          // Filter categories to only include those that have at least one active item
          const categoriesWithActiveItems = activeCategories.filter((cat: any) => {
            return activeItems.some((item: any) => item.categoryId === cat.id);
          });

          // Transform database data to MenuItem format - only include items from active categories with active items
          const items: MenuItem[] = activeItems
            .filter((item: any) => {
              // Only include items whose category is active AND has active items
              const category = categoriesWithActiveItems.find((cat: any) => cat.id === item.categoryId);
              return category !== undefined;
            })
            .map((item: any) => {
              const category = categoriesWithActiveItems.find((cat: any) => cat.id === item.categoryId);
              return {
                id: item.id,
                name: item.name,
                description: item.description || '',
                category: category?.name || 'Other',
                price: Number(item.pricePerPerson) || 0,
                pricingType: item.pricingType || 'per_person',
                image: item.imageUrl || '',
                // Mapping logic:
                // 1. If it's a beverage category, default to 'none'
                // 2. Otherwise: vegan > vegetarian > non-vegetarian
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
              };
            });

          // Get unique category names from active categories with active items
          const categoryNames = categoriesWithActiveItems.map((cat: any) => cat.name);

          // Store category data including guestCount flag
          const categoryDataMap: Record<string, { guestCount: boolean }> = {};
          categoriesWithActiveItems.forEach((cat: any) => {
            categoryDataMap[cat.name] = {
              guestCount: cat.guestCount || false,
            };
          });

          setMenuItems(items);
          setCategories(categoryNames);
          setCategoryData(categoryDataMap);
          if (categoryNames.length > 0) {
            setSelectedCategory(categoryNames[0]);
            // Initialize all categories as collapsed (closed by default)
            const initialCollapsedState = categoryNames.reduce((acc: Record<string, boolean>, cat: string) => {
              acc[cat] = true;
              return acc;
            }, {} as Record<string, boolean>);
            setCollapsedCategories(initialCollapsedState);
          }
        } else {
          // Fallback to error state - show empty menu
          console.error('Failed to fetch menu data');
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
    const btn = categoryRefs.current[selectedCategory];
    if (btn) {
      btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [selectedCategory]);

  // Show/hide cart FAB based on scroll direction (mobile only)
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (window.innerWidth < 1024 && selectedItems.length > 0) {
        setShowCartFab(currentY < lastScrollY.current || currentY < 100);
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [selectedItems.length]);

  // Handle category change 
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
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
  const realtimeErrors = useMemo(() => {
    const newErrors: Partial<EventDetails> = {};

    if (touched.name) {
      const nameResult = customerNameSchema.safeParse(eventDetails.name);
      if (!nameResult.success) newErrors.name = nameResult.error.errors[0].message;
    }

    if (touched.email) {
      const emailResult = userEmailSchema.safeParse(eventDetails.email);
      if (!emailResult.success) newErrors.email = emailResult.error.errors[0].message;
    }

    if (touched.telephone) {
      const phoneResult = customerPhoneSchema.safeParse(eventDetails.telephone);
      if (!phoneResult.success) newErrors.telephone = phoneResult.error.errors[0].message;
    }

    if (touched.street) {
      const streetResult = customerStreetSchema.safeParse(eventDetails.street);
      if (!streetResult.success) newErrors.street = streetResult.error.errors[0].message;
    }

    if (touched.plz) {
      const plzResult = customerPlzSchema.safeParse(eventDetails.plz);
      if (!plzResult.success) newErrors.plz = plzResult.error.errors[0].message;
    }

    if (touched.location) {
      const locationResult = customerLocationSchema.safeParse(eventDetails.location);
      if (!locationResult.success) newErrors.location = locationResult.error.errors[0].message;
    }

    if (touched.eventDate && !eventDetails.eventDate) {
      newErrors.eventDate = 'Event date is required';
    } else if (touched.eventDate && eventDetails.eventDate) {
      const selectedDateTime = new Date(`${eventDetails.eventDate}T${eventDetails.eventTime || '00:00'}`);
      const twentyFourHoursFromNow = new Date(Date.now() + 24 * 60 * 60 * 1000);
      if (selectedDateTime < twentyFourHoursFromNow) {
        newErrors.eventDate = 'Booking must be at least 24 hours in advance';
      }
    }

    if (touched.eventTime && !eventDetails.eventTime) {
      newErrors.eventTime = 'Event time is required';
    }

    if (touched.guestCount) {
      if (!eventDetails.guestCount) {
        newErrors.guestCount = 'Number of guests is required';
      } else if (parseInt(eventDetails.guestCount) < 1) {
        newErrors.guestCount = 'Must have at least 1 guest';
      } else if (parseInt(eventDetails.guestCount) > 10000) {
        newErrors.guestCount = 'Number of guests cannot exceed 10,000';
      }
    }

    if (touched.occasion && eventDetails.occasion) {
      const occasionResult = customerOccasionSchema.safeParse(eventDetails.occasion);
      if (!occasionResult.success) newErrors.occasion = occasionResult.error.errors[0].message;
    }

    if (touched.specialRequests && eventDetails.specialRequests) {
      const specialRequestsResult = customerSpecialRequestsSchema.safeParse(eventDetails.specialRequests);
      if (!specialRequestsResult.success) newErrors.specialRequests = specialRequestsResult.error.errors[0].message;
    }

    return newErrors;
  }, [touched, eventDetails]);

  // Merge real-time errors with submit errors (submit errors take precedence)
  const displayErrors = useMemo(() => {
    return { ...realtimeErrors, ...errors };
  }, [realtimeErrors, errors]);

  const validateStep1 = () => {
    const newErrors: Partial<EventDetails> = {};

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

    // Validate room selection
    if (!eventDetails.room) {
      newErrors.room = 'Room selection is required';
    }

    setErrors(newErrors);
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
    const isLocationValid = eventDetails.location.trim().length >= 3;
    return isStreetValid && isPlzValid && isLocationValid;
  }, [eventDetails.street, eventDetails.plz, eventDetails.location]);

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

    const isStreetValid = eventDetails.street.trim().length >= 5;
    const isPlzValid = eventDetails.plz.trim().length >= 4 &&
      eventDetails.plz.trim().length <= 10 &&
      /^\d+$/.test(eventDetails.plz.trim());
    const isLocationValid = eventDetails.location.trim().length >= 3;

    return (
      eventDetails.name.trim() !== '' &&
      eventDetails.email.trim() !== '' &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(eventDetails.email) &&
      isPhoneValid &&
      isStreetValid &&
      isPlzValid &&
      isLocationValid &&
      isDateValid &&
      eventDetails.guestCount !== '' &&
      parseInt(eventDetails.guestCount) >= 1 &&
      parseInt(eventDetails.guestCount) <= 10000 &&
      eventDetails.room !== ''
    );
  }, [eventDetails.name, eventDetails.email, eventDetails.telephone, eventDetails.street, eventDetails.plz, eventDetails.location, eventDetails.eventDate, eventDetails.eventTime, eventDetails.guestCount, eventDetails.room]);

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
    }
  };

  const validateStep2 = () => {
    if (selectedItems.length === 0) {
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

  const handleNext = () => {
    if (currentStep === 1) {
      if (validateStep1()) {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      handleStep2Navigation();
    }
  };

  // Helper functions for category navigation
  const getNextCategory = () => {
    const currentIndex = categories.indexOf(selectedCategory);
    if (currentIndex < categories.length - 1) {
      return categories[currentIndex + 1];
    }
    return null;
  };

  const isLastCategory = () => {
    return selectedCategory === categories[categories.length - 1];
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
    // On Step 2, check if on first category
    const currentCategoryIndex = categories.indexOf(selectedCategory);
    if (currentCategoryIndex > 0) {
      // Go to previous category
      setSelectedCategory(categories[currentCategoryIndex - 1]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // On first category, go back to Step 1
      handleBack();
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    console.log('Event Details:', eventDetails);
    console.log('Selected Menu Items:', selectedItems);
    console.log('Is Edit Mode:', isEditMode);
    console.log('Booking ID:', bookingId);

    // Submit to server
    // If using same address for billing, copy main address to billing fields
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
      selectedItems,
      itemQuantities,
      itemGuestCounts, // Pass per-item guest counts
      itemVariants,
      itemAddOns,
      itemComments,
      allergyDetails: [],
      bookingId, // Pass bookingId if editing
    });

    setIsSubmitting(false);

    if (result.success && result.data) {
      // Store booking ID
      const newBookingId = result.data.bookingId;
      setBookingId(newBookingId);

      // Update eventDetails with bookingId for change request functionality
      setEventDetails(prev => ({ ...prev, bookingId: newBookingId }));

      // Prepare data for PDF download on Thank You screen
      const pdfData = {
        id: result.data.bookingId,
        customerName: eventDetails.name,
        business: eventDetails.business || undefined,
        eventDate: eventDetails.eventDate,
        eventTime: eventDetails.eventTime,
        guestCount: parseInt(eventDetails.guestCount) || 0,
        occasion: eventDetails.occasion || undefined,
        items: selectedItems.map(itemId => {
          const item = menuItems.find(i => i.id === itemId);
          if (!item) return null;

          const isPerPersonItem = item.pricingType === 'per_person';
          const quantity = isPerPersonItem
            ? (itemGuestCounts[itemId] || parseInt(eventDetails.guestCount) || 1)
            : (itemQuantities[itemId] || 1);

          const variantId = itemVariants[itemId];
          const variant = variantId && Array.isArray(item?.variants)
            ? (item?.variants as any[]).find(v => v.id === variantId)
            : null;

          // Format Display Name with Variant
          let displayName = item?.name || 'Unknown Item';
          if (variant) {
            displayName += ` (${variant.name})`;
          }

          // Format Add-ons / Choices
          let choicesPart = '';
          const selectedAddOnIds = itemAddOns[itemId] || [];
          if (selectedAddOnIds.length > 0) {
            const addOnNames: string[] = [];

            selectedAddOnIds.forEach(id => {
              // 1. Check in legacy addOns
              if (item?.addOns) {
                const ao = item.addOns.find(a => a.id === id);
                if (ao) {
                  let aoL = ao.name;
                  if (ao.dietaryType === 'veg') aoL += ' (Veg)';
                  else if (ao.dietaryType === 'vegan') aoL += ' (Vegan)';
                  else if (ao.dietaryType === 'non-veg') aoL += ' (Non-Veg)';
                  addOnNames.push(aoL);
                  return;
                }
              }

              // 2. Check in addonGroups
              if (item?.addonGroups) {
                for (const group of item.addonGroups) {
                  const ao = group.items.find((i: any) => i.id === id);
                  if (ao) {
                    let aoL = ao.name;
                    if ((ao as any).dietaryType === 'veg') aoL += ' (Veg)';
                    else if ((ao as any).dietaryType === 'vegan') aoL += ' (Vegan)';
                    else if ((ao as any).dietaryType === 'non-veg') aoL += ' (Non-Veg)';
                    addOnNames.push(aoL);
                    break;
                  }
                }
              }
            });

            if (addOnNames.length > 0) {
              choicesPart = addOnNames.join(', ');
            }
          }

          const unitPrice = getItemPerPersonPrice(item!);
          const totalPrice = unitPrice * quantity;

          return {
            id: itemId,
            name: displayName,
            category: item?.category || 'Other',
            quantity: quantity,
            unitPrice: unitPrice,
            totalPrice: totalPrice,
            notes: choicesPart,
            customerComment: itemComments[itemId] || '',
            pricingType: item?.pricingType || 'per_person',
            dietaryType: item?.dietaryType || 'none',
          };
        }).filter((i): i is any => i !== null),
        estimatedTotal: result.data.estimatedTotal,
        specialRequests: eventDetails.specialRequests || undefined,
      };
      setBookingPdfData(pdfData);

      // SECURITY: editSecret is NO LONGER returned here for security reasons
      // It's sent via email only. Users must use the link from their email to edit.
      setEditSecret(null);

      // Use the inquiry number from the server response
      setInquiryNumber(result.data.inquiryNumber || `INQ-${Math.floor(Math.random() * 9000) + 1000}`);

      // Check if this is an admin editing a booking
      // If so, redirect back to the booking details page instead of showing thank you screen
      if (isAdminEdit && bookingId) {
        // Admin edit mode - redirect back to booking details page
        setIsEditMode(false); // Reset edit mode after successful submit
        setIsAdminEdit(false); // Reset admin edit flag

        // Clear persistence for refresh-resilience cleanup
        sessionStorage.removeItem('edit_booking_id');
        sessionStorage.removeItem('edit_secret');
        localStorage.removeItem('temp_edit_is_admin'); // Clean up admin flag

        // Show success message and redirect
        toast.success('Booking updated successfully!');
        router.push(`/admin/bookings?id=${bookingId}`);
        return;
      }

      // Customer mode - show thank you screen
      setIsEditMode(false); // Reset edit mode after successful submit
      setIsSubmitted(true);

      // Clear persistence for refresh-resilience cleanup
      sessionStorage.removeItem('edit_booking_id');
      sessionStorage.removeItem('edit_secret');

      // Show success message
      if (isEditMode) {
        toast.success(t('status.requestSent'));
      }
    } else {
      toast.error(result.error || t('status.noItems'));
    }
  };

  const toggleMenuItem = (itemId: string) => {
    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        // Remove item
        const newQuantities = { ...itemQuantities };
        delete newQuantities[itemId];
        setItemQuantities(newQuantities);

        // Also remove variant
        const newVariants = { ...itemVariants };
        delete newVariants[itemId];
        setItemVariants(newVariants);

        return prev.filter(id => id !== itemId);
      } else {
        // Add item with quantity 1
        setItemQuantities(prev => ({ ...prev, [itemId]: 1 }));

        // Add default variant if exists
        const item = menuItems.find(i => i.id === itemId);
        if (item && item.variants && item.variants.length > 0) {
          setItemVariants(prev => ({ ...prev, [itemId]: item.variants![0].id }));
        }

        return [...prev, itemId];
      }
    });
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setItemQuantities(prev => {
      const currentQty = prev[itemId] || 1;
      const newQty = Math.max(1, currentQty + delta);
      return { ...prev, [itemId]: newQty };
    });
  };

  const removeFromCart = (itemId: string) => {
    setSelectedItems(prev => prev.filter(id => id !== itemId));
    const newQuantities = { ...itemQuantities };
    delete newQuantities[itemId];
    setItemQuantities(newQuantities);
  };

  const getTotalPrice = () => {
    return selectedItems.reduce((total, itemId) => {
      const item = menuItems.find(i => i.id === itemId);
      if (!item) return total;

      const quantity = itemQuantities[itemId] || 1;
      const unitPrice = getItemPerPersonPrice(item);

      // Fix: Prioritize individual guest counts if they've been edited (exists in itemGuestCounts)
      // Otherwise, check categoryData if enabled, or fallback to global guest count
      const effectiveGuestCount = itemGuestCounts[itemId] 
        ? itemGuestCounts[itemId]
        : (categoryData[item.category]?.guestCount
           ? (parseInt(eventDetails.guestCount) || 1)
           : (parseInt(eventDetails.guestCount) || 1));

      // For flat-fee items (billed by consumption), use quantity
      if (isFlatFee(item) || isConsumption(item)) {
        return total + unitPrice * quantity;
      }

      // For per-person items, multiply by guest count
      return total + unitPrice * effectiveGuestCount;
    }, 0);
  };

  const getSelectedItemsByCategory = (category: string) => {
    return menuItems.filter(item =>
      item.category === category && selectedItems.includes(item.id)
    );
  };

  // Helper functions for pricing types
  const isPerPerson = (item: MenuItem) => item.pricingType === 'per-person' || item.pricingType === 'per_person';
  const isPerPersonItem = (item: MenuItem | null): boolean => {
    return item?.pricingType === 'per_person' || item?.pricingType === 'per-person';
  };
  const isFlatFee = (item: MenuItem) => item.pricingType === 'flat-rate' || item.pricingType === 'flat_fee';
  const isConsumption = (item: MenuItem) => item.pricingType === 'billed_by_consumption';
  const isNonPerPerson = (item: MenuItem) => isFlatFee(item) || isConsumption(item);

  // Calculate recommended quantity for consumption-based items
  const calculateRecommendedQuantity = (item: MenuItem, itemId?: string, variantIdOverride?: string): number | null => {
    if (!isConsumption(item)) return null;

    const guestCount = parseInt(eventDetails.guestCount) || 0;
    if (guestCount === 0) return null;

    // Get the average consumption value to use
    let avgConsumption = item.averageConsumption || null;

    // Use specific variant if provided or available in state
    const currentVariantId = variantIdOverride || (itemId ? itemVariants[itemId] : null);

    if (currentVariantId && item.variants) {
      const selectedVariant = item.variants.find(v => v.id === currentVariantId);
      if (selectedVariant?.averageConsumption) {
        avgConsumption = selectedVariant.averageConsumption;
      }
    }

    if (!avgConsumption || avgConsumption <= 0) return null;

    return Math.ceil(guestCount / avgConsumption);
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
    // Add to selected items if not already there
    if (!selectedItems.includes(itemId)) {
      setSelectedItems(prev => [...prev, itemId]);
    }

    // Update state
    setItemQuantities(prev => ({ ...prev, [itemId]: data.quantity }));
    if (data.guestCount !== null) {
      setItemGuestCounts(prev => ({ ...prev, [itemId]: data.guestCount! }));
    } else {
      setItemGuestCounts(prev => {
        const updated = { ...prev };
        delete updated[itemId];
        return updated;
      });
    }
    setItemAddOns(prev => ({ ...prev, [itemId]: data.addOns }));
    if (data.variant) {
      setItemVariants(prev => ({ ...prev, [itemId]: data.variant }));
    } else {
      setItemVariants(prev => {
        const updated = { ...prev };
        delete updated[itemId];
        return updated;
      });
    }
    if (data.comment?.trim()) {
      setItemComments(prev => ({ ...prev, [itemId]: data.comment }));
    } else {
      setItemComments(prev => {
        const updated = { ...prev };
        delete updated[itemId];
        return updated;
      });
    }

    setDetailsModalItem(null);
  };

  const getItemTotalPrice = (item: MenuItem) => {
    const quantity = itemQuantities[item.id] || 1;
    const unitPrice = getItemPerPersonPrice(item);

    // Fix: Prioritize individual guest counts if they've been edited
    const effectiveGuestCount = itemGuestCounts[item.id]
      ? itemGuestCounts[item.id]
      : (categoryData[item.category]?.guestCount
         ? (parseInt(eventDetails.guestCount) || 1)
         : (parseInt(eventDetails.guestCount) || 1));

    // For flat-fee or consumption items, multiply by quantity
    if (isNonPerPerson(item)) {
      return unitPrice * quantity;
    }

    // For per-person items, multiply by guest count
    return unitPrice * effectiveGuestCount;
  };

  const getTotalPriceWithAddOns = () => {
    return selectedItems.reduce((total, itemId) => {
      const item = menuItems.find(i => i.id === itemId);
      if (!item) return total;

      // Exclude consumption based prices if the user opted out
      if (isConsumption(item) && !includeBeveragePrices) {
        return total;
      }

      return total + getItemTotalPrice(item);
    }, 0);
  };

  // Per-person price (NOT multiplied by guest count) – used for cart display
  const getItemPerPersonPrice = useCallback((item: MenuItem) => {
    if (!item) return 0;

    // 1. First, calculate the modern menu price based on current selection (variant + addons)
    const currentVariantId = itemVariants[item.id];
    let basePrice = item.price;
    if (currentVariantId && item.variants && item.variants.length > 0) {
      const variant = item.variants.find(v => v.id === currentVariantId);
      if (variant) basePrice = variant.price;
    }

    const currentAddOnIds = itemAddOns[item.id] || [];
    const currentAddOnsPrice = currentAddOnIds.reduce((total, addOnId) => {
      if (item.addonGroups && item.addonGroups.length > 0) {
        for (const group of item.addonGroups) {
          const groupAddOn = group.items.find(i => i.id === addOnId);
          if (groupAddOn) return total + (groupAddOn.price || 0);
        }
      }
      const addOn = item.addOns?.find(ao => ao.id === addOnId);
      return total + (addOn?.price || 0);
    }, 0);

    const calculatedMenuPrice = basePrice + currentAddOnsPrice;

    // 2. In edit mode, check if we should override with the original booking price
    if (isEditMode && editBookingData?.items) {
      const bookingItem = editBookingData.items.find((bi: any) => (bi.itemId || bi.item_id) === item.id);

      if (bookingItem) {
        const originalPrice = Number(bookingItem.unitPrice) || 0;

        // If original price is 0 but menu has a price, it's likely a data issue in the booking
        // We should show the real price to the user
        if (originalPrice === 0 && calculatedMenuPrice > 0) {
          return calculatedMenuPrice;
        }

        // Check if the item's configuration has changed (variant or addons)
        let isModified = false;

        // Compare variants
        const variantMatch = bookingItem.notes?.match(/Variant: ([^|]+)/);
        const originalVariantName = variantMatch ? variantMatch[1].trim() : null;
        const currentVariant = item.variants?.find(v => v.id === currentVariantId);
        const currentVariantName = currentVariant?.name || null;

        if (originalVariantName !== currentVariantName) {
          isModified = true;
        }

        // Compare addons
        if (!isModified) {
          const addonsMatch = bookingItem.notes?.match(/(?:Add-ons|Choices): ([^|]+)/);
          const originalAddonNames = addonsMatch
            ? addonsMatch[1].split(',').map((s: string) => s.trim()).filter(Boolean)
            : [];

          const currentAddonNames: string[] = [];
          currentAddOnIds.forEach(id => {
            const ao = item.addOns?.find(a => a.id === id);
            if (ao) currentAddonNames.push(ao.name);
            else if (item.addonGroups) {
              for (const g of item.addonGroups) {
                const ga = g.items.find(i => i.id === id);
                if (ga) { currentAddonNames.push(ga.name); break; }
              }
            }
          });

          if (originalAddonNames.length !== currentAddonNames.length) {
            isModified = true;
          } else {
            const sortedOriginal = [...originalAddonNames].sort();
            const sortedCurrent = [...currentAddonNames].sort();
            if (JSON.stringify(sortedOriginal) !== JSON.stringify(sortedCurrent)) {
              isModified = true;
            }
          }
        }

        if (!isModified) {
          return originalPrice;
        }
      }
    }

    return calculatedMenuPrice;
  }, [itemVariants, itemAddOns, isEditMode, editBookingData?.items]);

  // Per-person subtotal: returns the sum of all selected per-person items
  const getPerPersonSubtotal = useCallback(() => {
    return selectedItems.reduce((total, itemId) => {
      const item = menuItems.find(i => i.id === itemId);
      if (!item || !isPerPerson(item)) return total;
      return total + getItemPerPersonPrice(item);
    }, 0);
  }, [selectedItems, menuItems, getItemPerPersonPrice, isPerPerson]);

  // Flat-rate subtotal (items like Technology, Decoration etc. that have a fixed price)
  const getFlatRateSubtotal = () => {
    return selectedItems.reduce((total, itemId) => {
      const item = menuItems.find(i => i.id === itemId);
      if (!item || !isFlatFee(item)) return total;
      const quantity = itemQuantities[itemId] || 1;
      return total + (getItemPerPersonPrice(item) * quantity);
    }, 0);
  };

  // Consumption-based subtotal (items billed by consumption)
  const getConsumptionSubtotal = () => {
    return selectedItems.reduce((total, itemId) => {
      const item = menuItems.find(i => i.id === itemId);
      if (!item || !isConsumption(item)) return total;
      const quantity = itemQuantities[itemId] || 1;
      return total + (getItemPerPersonPrice(item) * quantity);
    }, 0);
  };

  // Show thank you screen if submitted
  if (isSubmitted) {
    return (
      <ThankYouScreen
        inquiryNumber={inquiryNumber}
        bookingData={bookingPdfData}
        variant="split" // Options: 'centered' | 'split' | 'minimal'
        onCreateNew={() => {
          setIsEditMode(false);
          setIsSubmitted(false);
          setCurrentStep(1);
          setSelectedItems([]);
          setItemQuantities({});
          setItemAddOns({});
          setItemVariants({});
          setItemComments({});
          setTermsAccepted(false);
          setInquiryNumber('');
          setBookingId(null);
          setEditSecret(null);
          setBookingPdfData(null);

          // Clear persistence
          sessionStorage.removeItem('edit_booking_id');
          sessionStorage.removeItem('edit_secret');
        }}
        onEditOrder={() => {
          // Go back to summary/review page with edit mode enabled
          console.log('Edit Order clicked!');
          console.log('Current eventDetails:', eventDetails);
          console.log('Current selectedItems:', selectedItems);
          console.log('Current itemQuantities:', itemQuantities);
          setIsEditMode(true);
          setIsSubmitted(false);
          setCurrentStep(3); // Step 3 is the Review & Submit page
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
      <WizardHeader
        onBack={
          currentStep > 1
            ? () => setCurrentStep(1)
            : (isEditMode && bookingId)
              ? () => router.push(`/admin/bookings?id=${bookingId}`)
              : undefined
        }
      />
      <div className="min-h-screen bg-background flex flex-col">
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
                  <CustomerDetailsForm
                    eventDetails={eventDetails}
                    setEventDetails={setEventDetails}
                    errors={errors}
                    setErrors={setErrors}
                    touched={touched as Record<string, boolean>}
                    setTouched={setTouched as (touched: Record<string, boolean>) => void}
                    displayErrors={displayErrors}
                    setIsDateTimePickerOpen={setIsDateTimePickerOpen}
                  />

                )}

                {/* Step 2 & 3 remain the same... (truncated for brevity) */}
                {currentStep === 2 && (
                  <CustomerMenuSelection
                    selectedCategory={selectedCategory}
                    categories={categories}
                    eventDetails={eventDetails}
                    itemGuestCounts={itemGuestCounts}
                    loadingMenu={loadingMenu}
                    menuItems={menuItems}
                    selectedItems={selectedItems}
                    itemQuantities={itemQuantities}
                    itemVariants={itemVariants}
                    itemAddOns={itemAddOns}
                    itemComments={itemComments}
                    isCartCollapsed={isCartCollapsed}
                    step2Error={step2Error}
                    categoryRefs={categoryRefs}
                    setSelectedCategory={setSelectedCategory}
                    setItemGuestCounts={setItemGuestCounts}
                    setIsCartCollapsed={setIsCartCollapsed}
                    setSelectedItems={setSelectedItems}
                    setItemQuantities={setItemQuantities}
                    setItemAddOns={setItemAddOns}
                    setItemVariants={setItemVariants}
                    setItemComments={setItemComments}
                    getItemPerPersonPrice={getItemPerPersonPrice}
                    getFlatRateSubtotal={getFlatRateSubtotal}
                    getPerPersonSubtotal={getPerPersonSubtotal}
                    getConsumptionSubtotal={getConsumptionSubtotal}
                    getSelectedItemsByCategory={getSelectedItemsByCategory}
                    handleCategoryChange={handleCategoryChange}
                    isConsumption={isConsumption}
                    isFlatFee={isFlatFee}
                    isPerPerson={isPerPerson}
                    openDetailsModal={openDetailsModal}
                    removeFromCart={removeFromCart}
                    isLastCategory={isLastCategory}
                    calculateRecommendedQuantity={calculateRecommendedQuantity}
                    handleStep2Navigation={handleStep2Navigation}
                    onEditDateTime={() => setIsDateTimePickerOpen(true)}
                    isSubmitting={isSubmitting}
                    includeBeveragePrices={includeBeveragePrices}
                    setIncludeBeveragePrices={setIncludeBeveragePrices}
                    isEditMode={isEditMode}
                    originalGuestCount={originalGuestCount || eventDetails.guestCount}
                  />
                )}

                {currentStep === 3 && (
                  <CustomerSummary
                    eventDetails={eventDetails}
                    isLocked={isLocked}
                    isUnlockRequested={isUnlockRequested}
                    isRequestingUnlock={isRequestingUnlock}
                    handleRequestUnlock={handleRequestUnlock}
                    isEditMode={isEditMode}
                    setCurrentStep={setCurrentStep}
                    setActiveTab={setActiveTab}
                    selectedItems={selectedItems}
                    menuItems={menuItems}
                    categories={categories}
                    collapsedCategories={collapsedCategories}
                    setCollapsedCategories={setCollapsedCategories}
                    itemQuantities={itemQuantities}
                    itemGuestCounts={itemGuestCounts}
                    itemVariants={itemVariants}
                    itemAddOns={itemAddOns}
                    itemComments={itemComments}
                    getItemPerPersonPrice={getItemPerPersonPrice}
                    getItemTotalPrice={getItemTotalPrice}
                    getPerPersonSubtotal={getPerPersonSubtotal}
                    summaryViewMode={summaryViewMode}
                    setSummaryViewMode={setSummaryViewMode}
                    includeBeveragePrices={includeBeveragePrices}
                    setIncludeBeveragePrices={setIncludeBeveragePrices}
                    isConsumption={isConsumption}
                    isPerPerson={isPerPerson}
                    getFlatRateSubtotal={getFlatRateSubtotal}
                    getConsumptionSubtotal={getConsumptionSubtotal}
                    termsAccepted={termsAccepted}
                    setTermsAccepted={setTermsAccepted}
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
                          disabled={!isStep1Valid}
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
          onConfirm={handleModalConfirm}
          eventDetails={eventDetails}
          selectedItems={selectedItems}
          itemQuantities={itemQuantities}
          itemGuestCounts={itemGuestCounts}
          itemAddOns={itemAddOns}
          itemVariants={itemVariants}
          itemComments={itemComments}
          isPerPerson={isPerPerson}
          isConsumption={isConsumption}
          isFlatFee={isFlatFee}
          calculateRecommendedQuantity={calculateRecommendedQuantity}
        />
        {/* Mobile Cart FAB - side-attached style, only on step 2 with items selected */}
        {
          currentStep === 2 && selectedItems.length > 0 && showCartFab && (
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
                  {selectedItems.length}
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
                  selectedItems={selectedItems}
                  menuItems={menuItems}
                  itemQuantities={itemQuantities}
                  itemVariants={itemVariants}
                  itemAddOns={itemAddOns}
                  itemComments={itemComments}
                  isCartCollapsed={false}
                  setIsCartCollapsed={() => { }}
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
                  isConsumption={isConsumption}
                  isFlatFee={isFlatFee}
                  isPerPerson={isPerPerson}
                  onContinue={() => { setIsMobileDrawerOpen(false); handleStep2Navigation(); }}
                  onEditDateTime={() => {
                    setIsMobileDrawerOpen(false);
                    setIsDateTimePickerOpen(true);
                  }}
                  includeBeveragePrices={includeBeveragePrices}
                  setIncludeBeveragePrices={setIncludeBeveragePrices}
                  isDrawer
                  isSubmitting={isSubmitting}
                  setItemGuestCounts={setItemGuestCounts}
                  categories={categories}
                  onCloseDrawer={() => setIsMobileDrawerOpen(false)}
                  isEditMode={isEditMode}
                  originalGuestCount={originalGuestCount || eventDetails.guestCount}
                />
              </div>
            </div>
          )
        }
      </div >

      {/* Date & Time Picker Modal */}
      <DateTimePickerModal
        isOpen={isDateTimePickerOpen}
        onClose={() => {
          setIsDateTimePickerOpen(false);
          // Mark fields as touched when modal closes to trigger validation
          if (eventDetails.eventDate || eventDetails.eventTime) {
            setTouched(prev => ({ ...prev, eventDate: true, eventTime: true }));
          }
        }}
        onSelectDate={(date) => {
          setEventDetails({ ...eventDetails, eventDate: date });
          setTouched(prev => ({ ...prev, eventDate: true }));
          if (errors.eventDate) setErrors({ ...errors, eventDate: undefined });
        }}
        onSelectTime={(time) => {
          setEventDetails({ ...eventDetails, eventTime: time });
          setTouched(prev => ({ ...prev, eventTime: true }));
          if (errors.eventTime) setErrors({ ...errors, eventTime: undefined });
        }}
        initialDate={eventDetails.eventDate}
        initialTime={eventDetails.eventTime}
      />
    </>
  );
}
