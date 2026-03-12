'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Calendar, Users, Mail, Phone, User, Check, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Send, Eye, Edit2, ClipboardList, Building2, MapPin, Clock, Sparkles, ShoppingCart, X, Plus, Minus, AlertTriangle, Lock, CreditCard } from 'lucide-react';
import { Button } from './Button';
import { MenuItem, MenuItemVariant } from './menuItemsData';
import { DietaryIcon } from './DietaryIcon';
import { ThankYouScreen } from './ThankYouScreen';
import { WizardHeader } from './WizardHeader';
import { DateTimePickerModal } from './DateTimePickerModal';
import { submitWizardForm, requestBookingUnlock } from '@/lib/actions/wizard';
import { NativeRadio } from '@/components/ui/NativeRadio';
import { NativeCheckbox } from '@/components/ui/NativeCheckbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SkeletonKPI, SkeletonPage } from '@/components/ui/skeleton-loaders';
import { ValidatedInput } from '@/components/ui/validated-input';
import { ValidatedTextarea } from '@/components/ui/validated-textarea';
import { customerNameSchema, customerBusinessSchema, customerPhoneSchema, customerStreetSchema, customerPlzSchema, customerLocationSchema, customerOccasionSchema, customerSpecialRequestsSchema, userEmailSchema } from '@/lib/validation/schemas';
import { toast } from 'sonner';

interface EventDetails {
  name: string;
  business: string;
  email: string;
  telephone: string;
  street: string;
  plz: string;
  location: string;
  eventDate: string;
  eventTime: string;
  guestCount: string;
  occasion: string;
  specialRequests: string;
  paymentMethod: string;
  useSameAddressForBilling: boolean;
  billingStreet: string;
  billingPlz: string;
  billingLocation: string;
  billingStreetError?: string;
  billingPlzError?: string;
  billingLocationError?: string;
}

export function CustomMenuWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();

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
    paymentMethod: 'on_bill',
    useSameAddressForBilling: true,
    billingStreet: '',
    billingPlz: '',
    billingLocation: '',
    billingStreetError: undefined,
    billingPlzError: undefined,
    billingLocationError: undefined,
  });
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({});
  const [itemGuestCounts, setItemGuestCounts] = useState<Record<string, number>>({});
  const [itemAddOns, setItemAddOns] = useState<Record<string, string[]>>({});
  const [itemVariants, setItemVariants] = useState<Record<string, string>>({});
  const [itemComments, setItemComments] = useState<Record<string, string>>({});
  const [selectedCategory, setSelectedCategory] = useState('Appetizers');
  const [visitedCategories, setVisitedCategories] = useState<string[]>([]);
  const [isCartCollapsed, setIsCartCollapsed] = useState(true);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [showCartFab, setShowCartFab] = useState(true);
  const [mainCourseReductionMessage, setMainCourseReductionMessage] = useState('');
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
  } as Record<keyof EventDetails, boolean>);

  // Refs for category pill auto-scroll
  const categoryRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const lastScrollY = useRef(0);
  const [showPreview, setShowPreview] = useState(false);
  const [detailsModalItem, setDetailsModalItem] = useState<MenuItem | null>(null);
  const [tempQuantity, setTempQuantity] = useState(1);
  const [tempGuestCount, setTempGuestCount] = useState<number | null>(null);
  const [tempAddOns, setTempAddOns] = useState<string[]>([]);
  const [tempVariant, setTempVariant] = useState<string>('');
  const [tempComment, setTempComment] = useState<string>('');
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
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isLoadingEdit, setIsLoadingEdit] = useState(false);
  const [categoryFilterMode, setCategoryFilterMode] = useState<Record<string, 'combo' | 'individual'>>({});

  const categoryHasCombo = useMemo(() => {
    return menuItems.some(item => item.category === selectedCategory && item.isCombo);
  }, [menuItems, selectedCategory]);
  const [isUnlockRequested, setIsUnlockRequested] = useState(false);
  const [isRequestingUnlock, setIsRequestingUnlock] = useState(false);
  const [includeBeveragePrices, setIncludeBeveragePrices] = useState(false);

  // Date and Time picker modal states
  const [isDateTimePickerOpen, setIsDateTimePickerOpen] = useState(false);

  // Check for edit mode from sessionStorage
  useEffect(() => {
    const editMode = searchParams.get('edit');

    if (editMode === 'true') {
      const bookingIdParam = sessionStorage.getItem('edit_booking_id');
      const secretParam = sessionStorage.getItem('edit_secret');

      if (bookingIdParam && secretParam) {
        console.log('Edit mode activated from sessionStorage');
        setIsLoadingEdit(true);

        setBookingId(bookingIdParam);
        setEditSecret(secretParam);
        setIsEditMode(true);

        // Check lock status by fetching booking
        const checkLockStatus = async () => {
          try {
            const response = await fetch(`/api/booking/${bookingIdParam}/edit/${secretParam}`);
            if (response.ok) {
              const result = await response.json();
              if (result.success && result.data) {
                setIsLocked(result.data.isLocked || false);

                const booking = result.data;
                const lead = booking.lead;

                console.log('Booking data loaded:', booking);

                // Populate eventDetails from booking
                setEventDetails({
                  name: lead?.contactName || '',
                  business: booking.businessName || '',
                  email: lead?.contactEmail || '',
                  telephone: lead?.contactPhone || '',
                  street: booking.street || '',
                  plz: booking.plz || '',
                  location: booking.location || '',
                  eventDate: booking.eventDate ? booking.eventDate.split('T')[0] : '',
                  eventTime: booking.eventTime || '',
                  guestCount: booking.guestCount?.toString() || '',
                  occasion: booking.occasion || '',
                  specialRequests: booking.specialRequests || '',
                  paymentMethod: booking.paymentMethod || 'on_bill',
                  useSameAddressForBilling: booking.useSameAddressForBilling ?? true,
                  billingStreet: booking.billingStreet || '',
                  billingPlz: booking.billingPlz || '',
                  billingLocation: booking.billingLocation || '',
                  billingStreetError: undefined,
                  billingPlzError: undefined,
                  billingLocationError: undefined,
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

                  booking.booking_items.forEach((item: any) => {
                    const id = item.itemId || item.item_id;
                    if (id) {
                      quantities[id] = item.quantity || 1;
                      // Guest count for per-item is stored in quantity in the latest version
                      guestCounts[id] = item.quantity || 1;

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

                // Go to summary page
                setCurrentStep(3);
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
      console.log('Restoring variants and addons from booking notes...');
      const restoredVariants: Record<string, string> = {};
      const restoredAddOns: Record<string, string[]> = {};

      editBookingData.items.forEach((item: any) => {
        const itemId = item.itemId || item.item_id;
        if (!itemId || !item.notes) return;

        const menuItem = menuItems.find(mi => mi.id === itemId);
        if (!menuItem) return;

        // Restore Variants
        const variantMatch = item.notes.match(/Variant: ([^|]+)/);
        if (variantMatch && menuItem.variants) {
          const variantName = variantMatch[1].trim();
          const variant = menuItem.variants.find(v => v.name === variantName);
          if (variant) {
            console.log(`  → Restored variant "${variantName}" for item ${menuItem.name}`);
            restoredVariants[itemId] = variant.id;
          }
        }

        // Restore Add-ons
        const addonsMatch = item.notes.match(/Add-ons: ([^|]+)/);
        if (addonsMatch) {
          const addonNames = addonsMatch[1].split(',').map((s: string) => s.trim());
          const addonIds: string[] = [];

          addonNames.forEach((name: string) => {
            // Check in addonGroups if they exist
            if (menuItem.addonGroups) {
              for (const group of menuItem.addonGroups) {
                const addOn = group.items.find(i => i.name === name);
                if (addOn) {
                  addonIds.push(addOn.id);
                  break;
                }
              }
            } else if (menuItem.addOns) {
              // Check in legacy addOns
              const addOn = menuItem.addOns.find(a => a.name === name);
              if (addOn) {
                addonIds.push(addOn.id);
              }
            }
          });

          if (addonIds.length > 0) {
            console.log(`  → Restored ${addonIds.length} addons for item ${menuItem.name}`);
            restoredAddOns[itemId] = addonIds;
          }
        }
      });

      if (Object.keys(restoredVariants).length > 0) {
        setItemVariants(prev => ({ ...prev, ...restoredVariants }));
      }
      if (Object.keys(restoredAddOns).length > 0) {
        setItemAddOns(prev => ({ ...prev, ...restoredAddOns }));
      }
      setIsEditRestored(true);
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
                image: item.imageUrl || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=400&fit=crop',
                // Mapping logic:
                // 1. If it's a beverage category, default to 'none'
                // 2. Otherwise: vegan > vegetarian > non-vegetarian
                dietaryType: (category?.name === 'Beverages' || category?.name === 'Drinks') ? 'none' : (item.dietaryType || 'none'),
                dietaryTags: item.dietaryTags || [],
                allergens: item.allergens || [],
                additives: item.additives || [],
                ingredients: item.ingredients || '',
                isGlutenFree: item.dietaryTags?.includes('Gluten Free') || item.dietaryTags?.includes('gluten-free') || false,
                isCombo: item.isCombo || false,
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
            setVisitedCategories([categoryNames[0]]);
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

  // Check if category is locked (more than 1 ahead of visited categories)
  const isCategoryLocked = (category: string) => {
    if (visitedCategories.includes(category)) {
      return false; // Already visited, always accessible
    }
    const categoryIndex = categories.indexOf(category);
    const maxVisitedIndex = Math.max(
      ...visitedCategories.map((c) => categories.indexOf(c)),
    );
    // Lock if trying to skip ahead (more than 1 position beyond max visited)
    return categoryIndex > maxVisitedIndex + 1;
  };

  // Handle category change and track visited categories
  const handleCategoryChange = (category: string) => {
    // Prevent jumping to locked categories
    if (isCategoryLocked(category)) {
      return;
    }

    setSelectedCategory(category);
    if (!visitedCategories.includes(category)) {
      setVisitedCategories(prev => [...prev, category]);
    }
  };

  const steps = [
    {
      number: 1,
      title: 'Event Details',
      subtitle: 'Share your contact details, event date, and number of guests with us.',
      icon: User
    },
    {
      number: 2,
      title: 'Choose Menu',
      subtitle: 'Select from our curated offerings - from appetizers to desserts.',
      icon: ClipboardList
    },
    {
      number: 3,
      title: 'Review & Submit',
      subtitle: 'We\'ll contact you to review your request and confirm availability.',
      icon: Check
    },
  ];

  const tabs = [
    { id: 'contact', label: 'Contact', icon: User },
    { id: 'address', label: 'Address', icon: MapPin },
    { id: 'event', label: 'Event', icon: Calendar },
    { id: 'requests', label: 'Requests', icon: ClipboardList },
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
      parseInt(eventDetails.guestCount) <= 10000
    );
  }, [eventDetails.name, eventDetails.email, eventDetails.telephone, eventDetails.street, eventDetails.plz, eventDetails.location, eventDetails.eventDate, eventDetails.eventTime, eventDetails.guestCount]);

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
      } else {
        alert("Failed to send request. Please try again or contact us.");
      }
    } catch (error) {
      console.error("Error requesting unlock:", error);
      alert("An unexpected error occurred.");
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

  const allCategoriesVisited = () => {
    return visitedCategories.length === categories.length;
  };

  const handleStep2Navigation = () => {
    if (!isLastCategory()) {
      // Move to next category
      const nextCategory = getNextCategory();
      if (nextCategory) {
        handleCategoryChange(nextCategory);
        // Scroll to top of menu section
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else if (allCategoriesVisited()) {
      // All categories visited, can proceed to step 3
      if (validateStep2()) {
        setCurrentStep(3);
      }
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
      paymentMethod: eventDetails.paymentMethod || 'on_bill',
      useSameAddressForBilling: eventDetails.useSameAddressForBilling ?? true,
      billingStreet: eventDetails.billingStreet || '',
      billingPlz: eventDetails.billingPlz || '',
      billingLocation: eventDetails.billingLocation || '',
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

    if (result.success) {
      // Store booking ID and edit secret for editing later
      setBookingId(result.data?.bookingId || null);
      setEditSecret(result.data?.editSecret || null);

      // Use the inquiry number from the server response
      setInquiryNumber(result.data?.inquiryNumber || `INQ-${Math.floor(Math.random() * 9000) + 1000}`);
      setIsEditMode(false); // Reset edit mode after successful submit
      setIsSubmitted(true);

      // Show success message
      if (isEditMode) {
        alert('Your order has been updated successfully!');
      }
    } else {
      alert(result.error || 'Failed to submit your request. Please try again.');
    }
  };

  const toggleMenuItem = (itemId: string) => {
    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        // Remove item
        const newQuantities = { ...itemQuantities };
        delete newQuantities[itemId];
        setItemQuantities(newQuantities);
        return prev.filter(id => id !== itemId);
      } else {
        // Add item with quantity 1
        setItemQuantities(prev => ({ ...prev, [itemId]: 1 }));
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

      // Use per-item guest count if category has guestCount enabled, otherwise use total guest count
      const effectiveGuestCount = categoryData[item.category]?.guestCount
        ? (itemGuestCounts[itemId] || parseInt(eventDetails.guestCount) || 1)
        : (parseInt(eventDetails.guestCount) || 1);

      // Get price (per-person or flat fee)
      let basePrice = item.price;
      const selectedVariantId = itemVariants[itemId];
      if (selectedVariantId && item.variants && item.variants.length > 0) {
        const variant = item.variants.find(v => v.id === selectedVariantId);
        if (variant) basePrice = variant.price;
      }

      // For flat-fee items (billed by consumption), don't multiply by guest count
      if (item.pricingType === 'flat_fee') {
        return total + basePrice * quantity;
      }

      // For per-person items, multiply by guest count
      return total + basePrice * quantity * effectiveGuestCount;
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
  const calculateRecommendedQuantity = (item: MenuItem, itemId?: string): number | null => {
    if (!isConsumption(item)) return null;

    const guestCount = parseInt(eventDetails.guestCount) || 0;
    if (guestCount === 0) return null;

    // Get the average consumption value to use
    let avgConsumption = item.averageConsumption || null;

    // If a variant is selected, use the variant's average consumption if available
    if (itemId && itemVariants[itemId] && item.variants) {
      const selectedVariant = item.variants.find(v => v.id === itemVariants[itemId]);
      if (selectedVariant?.averageConsumption) {
        avgConsumption = selectedVariant.averageConsumption;
      }
    }

    if (!avgConsumption || avgConsumption <= 0) return null;

    return Math.ceil(guestCount / avgConsumption);
  };

  const openDetailsModal = (item: MenuItem) => {
    const isAlreadySelected = selectedItems.includes(item.id);
    setDetailsModalItem(item);

    let defaultAddOns = isAlreadySelected ? (itemAddOns[item.id] || []) : [];
    if (!isAlreadySelected && item.addonGroups) {
      item.addonGroups.forEach(group => {
        if (group.isRequired && group.items.length > 0) {
          // Select ALL items by default if it's required included items
          defaultAddOns.push(...group.items.map(i => i.id));
        }
      });
    }
    setTempAddOns(defaultAddOns);

    // Set variant - use existing selection or default to first variant
    const defaultVariantId = item.variants?.[0]?.id || '';
    setTempVariant(isAlreadySelected ? (itemVariants[item.id] || defaultVariantId) : defaultVariantId);
    setTempComment(isAlreadySelected ? (itemComments[item.id] || '') : '');

    // Initialize quantity and guest count based on pricing type
    if (isPerPerson(item)) {
      // Per-person: Use guest count, quantity always 1
      const totalGuestCount = parseInt(eventDetails.guestCount) || 1;
      setTempGuestCount(isAlreadySelected ? (itemGuestCounts[item.id] || totalGuestCount) : totalGuestCount);
      setTempQuantity(1); // Always 1 for per-person
    } else if (isConsumption(item)) {
      // Consumption: Calculate recommended quantity
      const selectedVariantId = isAlreadySelected ? (itemVariants[item.id] || defaultVariantId) : defaultVariantId;
      const recommended = calculateRecommendedQuantity(item, item.id);
      setTempQuantity(isAlreadySelected ? (itemQuantities[item.id] || recommended || 1) : (recommended || 1));
      setTempGuestCount(null);
    } else {
      // Flat-rate: Use quantity
      setTempQuantity(isAlreadySelected ? (itemQuantities[item.id] || 1) : 1);
      setTempGuestCount(null);
    }
  };

  const closeDetailsModal = () => {
    setDetailsModalItem(null);
    setTempQuantity(1);
    setTempAddOns([]);
    setTempVariant('');
    setTempComment('');
  };

  const toggleTempAddOn = (addOnId: string, groupId?: string, maxSelect?: number) => {
    // Prevent unchecking if it's part of a required group
    if (groupId && detailsModalItem?.addonGroups) {
      const group = detailsModalItem.addonGroups.find(g => g.id === groupId);
      if (group?.isRequired) {
        return; // Do nothing, required items cannot be toggled
      }
    }

    setTempAddOns(prev => {
      if (prev.includes(addOnId)) {
        return prev.filter(id => id !== addOnId);
      } else {
        // Look up group dynamically
        let isSingleSelect = false;
        let groupItemIds: string[] = [];
        let maxSelectLimit = 1;

        if (groupId && detailsModalItem?.addonGroups) {
          const group = detailsModalItem.addonGroups.find(g => g.id === groupId);
          if (group) {
            maxSelectLimit = group.maxSelect || 1;
            if (maxSelectLimit === 1) {
              isSingleSelect = true;
              groupItemIds = group.items.map(i => i.id);
            } else {
              // Multi-select group: Check if we've reached maxSelect limit
              const alreadySelectedInGroup = prev.filter(id =>
                group.items.some((item: any) => item.id === id)
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

  const addToCartFromModal = () => {
    if (!detailsModalItem) return;

    const itemId = detailsModalItem.id;

    // Add to selected items if not already there
    if (!selectedItems.includes(itemId)) {
      setSelectedItems(prev => [...prev, itemId]);
    }

    // Set quantity and guest count based on pricing type
    if (isPerPerson(detailsModalItem)) {
      // Per-person items: Always quantity=1, use guest count
      setItemQuantities(prev => ({ ...prev, [itemId]: 1 }));
      setItemGuestCounts(prev => ({ ...prev, [itemId]: tempGuestCount || parseInt(eventDetails.guestCount) || 1 }));
    } else {
      // Flat-rate items: Use quantity, remove guest count if exists
      setItemQuantities(prev => ({ ...prev, [itemId]: tempQuantity }));
      // Remove guest count for flat-rate items
      setItemGuestCounts(prev => {
        const updated = { ...prev };
        delete updated[itemId];
        return updated;
      });
    }

    // Update add-ons
    setItemAddOns(prev => ({ ...prev, [itemId]: tempAddOns }));

    // Update variant
    if (tempVariant) {
      setItemVariants(prev => ({ ...prev, [itemId]: tempVariant }));
    }

    // Update comment
    if (tempComment.trim()) {
      setItemComments(prev => ({ ...prev, [itemId]: tempComment }));
    } else {
      // Remove comment if empty
      setItemComments(prev => {
        const updated = { ...prev };
        delete updated[itemId];
        return updated;
      });
    }

    closeDetailsModal();
  };

  const getItemTotalPrice = (item: MenuItem) => {
    const quantity = itemQuantities[item.id] || 1;

    // Use per-item guest count if category has guestCount enabled, otherwise use total guest count
    const effectiveGuestCount = categoryData[item.category]?.guestCount
      ? (itemGuestCounts[item.id] || parseInt(eventDetails.guestCount) || 1)
      : (parseInt(eventDetails.guestCount) || 1);

    const addOns = itemAddOns[item.id] || [];
    const addOnsPrice = addOns.reduce((total, addOnId) => {
      const addOn = item.addOns?.find(ao => ao.id === addOnId);
      return total + (addOn?.price || 0);
    }, 0);

    // Get price from variant if selected, otherwise use base price
    let basePrice = item.price;
    const variantId = itemVariants[item.id];
    if (variantId && item.variants) {
      const variant = item.variants.find(v => v.id === variantId);
      if (variant) {
        basePrice = variant.price;
      }
    }

    // For flat-fee or consumption items, don't multiply by guest count
    if (isNonPerPerson(item)) {
      return (basePrice + addOnsPrice) * quantity;
    }

    // For per-person items, multiply by guest count
    return (basePrice + addOnsPrice) * quantity * effectiveGuestCount;
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
  const getItemPerPersonPrice = (item: MenuItem) => {
    const quantity = itemQuantities[item.id] || 1;
    const addOns = itemAddOns[item.id] || [];
    const addOnsPrice = addOns.reduce((total, addOnId) => {
      const addOn = item.addOns?.find(ao => ao.id === addOnId);
      return total + (addOn?.price || 0);
    }, 0);
    let basePrice = item.price;
    const variantId = itemVariants[item.id];
    if (variantId && item.variants) {
      const variant = item.variants.find(v => v.id === variantId);
      if (variant) basePrice = variant.price;
    }
    return (basePrice + addOnsPrice) * quantity;
  };

  // Per-person subtotal (average per person calculation)
  const getPerPersonSubtotal = () => {
    const totalGuestCount = parseInt(eventDetails.guestCount) || 1;
    const totalCost = selectedItems.reduce((total, itemId) => {
      const item = menuItems.find(i => i.id === itemId);
      if (!item || !isPerPerson(item)) return total;

      const unitPrice = getItemPerPersonPrice(item);
      const itemGuestCount = itemGuestCounts[itemId] || totalGuestCount;

      return total + (unitPrice * itemGuestCount);
    }, 0);

    return totalCost / totalGuestCount;
  };

  // Flat-rate subtotal (items like Technology, Decoration etc. that have a fixed price)
  const getFlatRateSubtotal = () => {
    return selectedItems.reduce((total, itemId) => {
      const item = menuItems.find(i => i.id === itemId);
      if (!item || !isFlatFee(item)) return total;
      return total + getItemPerPersonPrice(item);
    }, 0);
  };

  // Consumption-based subtotal (items billed by consumption)
  const getConsumptionSubtotal = () => {
    return selectedItems.reduce((total, itemId) => {
      const item = menuItems.find(i => i.id === itemId);
      if (!item || !isConsumption(item)) return total;
      return total + getItemPerPersonPrice(item);
    }, 0);
  };

  // Show thank you screen if submitted
  if (isSubmitted) {
    return (
      <ThankYouScreen
        inquiryNumber={inquiryNumber}
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

  if (isLoadingEdit) {
    return (
      <div className="min-h-screen bg-background">
        <WizardHeader />
        <div className="p-8">
          <SkeletonPage content="custom" hasHeader hasKPI={false} />
        </div>
      </div>
    );
  }

  return (
    <>
      <WizardHeader />
      <div className="min-h-screen bg-background flex flex-col">
        {/* Mobile Step Indicator - Only visible on mobile */}
        <div className="lg:hidden sticky top-20 z-40 bg-primary text-primary-foreground px-4 py-3">
          <div className="max-w-4xl mx-auto">
            {/* Compact Row: Step Counter + Title */}
            <div className="flex items-center justify-between gap-3 mb-2">
              <p className="text-primary-foreground opacity-80 flex-shrink-0" style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}>
                Step {currentStep}/3
              </p>
              <h2 className="text-primary-foreground text-right" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>
                {steps[currentStep - 1]?.title || 'Review & Submit'}
              </h2>
            </div>

            {/* Progress Bar */}
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
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="flex-1 flex flex-col lg:flex-row">
          {/* Left Sidebar - 25% width with primary background - Hidden on mobile - Fixed on desktop */}
          <aside className="hidden lg:block lg:w-[25%] bg-primary text-primary-foreground p-6 lg:p-8 lg:fixed lg:left-0 lg:top-20 lg:h-[calc(100vh-5rem)] lg:overflow-y-auto">
            <div className="max-w-md mx-auto lg:mx-0">
              {/* Title */}
              <div className="mb-8">
                <h2 className="text-primary-foreground mb-2" style={{ fontSize: 'var(--text-h2)', fontWeight: 'var(--font-weight-semibold)' }}>
                  Menu configurator for your event
                </h2>
                <p className="text-primary-foreground opacity-90" style={{ fontSize: 'var(--text-base)' }}>
                  Create your own personalized menu. We look forward to your inquiry and will get back to you promptly.
                </p>
              </div>

              {/* Vertical Steps */}
              <div className="space-y-6">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = currentStep === step.number;
                  const isCompleted = currentStep > step.number;

                  return (
                    <div key={step.number} className="relative flex items-start gap-3">
                      {/* Connecting Line */}
                      {index < steps.length - 1 && (
                        <div
                          className="absolute left-5 top-10 -bottom-6 w-0.5 -translate-x-1/2 transition-all duration-500"
                          style={{
                            backgroundColor: isCompleted
                              ? 'var(--color-secondary)'
                              : 'rgba(255, 255, 255, 0.2)'
                          }}
                        />
                      )}

                      {/* Step Circle */}
                      <div
                        className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center transition-all duration-300 relative z-10 ${isCompleted
                          ? 'bg-secondary text-secondary-foreground'
                          : isActive
                            ? 'bg-secondary text-secondary-foreground ring-4 ring-secondary/20'
                            : 'bg-transparent text-primary-foreground border-2 border-primary-foreground/30'
                          }`}
                      >
                        {isCompleted ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          <Icon className="w-4 h-4" />
                        )}
                      </div>

                      {/* Step Content */}
                      <div className="flex-1 pt-1.5">
                        <p
                          className={`mb-1 text-primary-foreground ${isActive || isCompleted ? 'opacity-100' : 'opacity-60'}`}
                          style={{ fontSize: 'var(--text-h4)', fontWeight: 'var(--font-weight-semibold)' }}
                        >
                          {step.title}
                        </p>
                        <p
                          className="text-primary-foreground opacity-80"
                          style={{ fontSize: 'var(--text-small)' }}
                        >
                          {step.subtitle}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Progress Summary */}
              <div className="mt-6 p-3 bg-primary-foreground/10 rounded-lg" style={{ borderRadius: 'var(--radius-card)' }}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-primary-foreground opacity-80" style={{ fontSize: 'var(--text-small)' }}>
                    Overall Progress
                  </p>
                  <span className="text-primary-foreground opacity-90" style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-semibold)' }}>
                    {currentStep}/3 · {Math.round(((currentStep - 1) / 2) * 100)}%
                  </span>
                </div>
                <div className="h-2 bg-primary-foreground/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-foreground transition-all duration-500"
                    style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </aside>

          {/* Right Content Area - 75% width - With left margin on desktop to account for fixed sidebar */}
          <main className="w-full lg:w-[75%] lg:ml-[25%] bg-background p-4 lg:p-8">
            <div className="max-w-7xl mx-auto">
              <div className="bg-card rounded-lg p-5 lg:p-8 border border-border" style={{ borderRadius: 'var(--radius-card)' }}>
                {/* Step 1: Event Details - SINGLE PAGE LAYOUT WITH GROUPED SECTIONS */}
                {currentStep === 1 && (
                  <div>
                    <div className="mb-6">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0" style={{ borderRadius: 'var(--radius)' }}>
                          <ClipboardList className="w-5 h-5 text-primary" />
                        </div>
                        <h3 className="text-foreground" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
                          Tell us about your event
                        </h3>
                      </div>
                      <p className="text-muted-foreground" style={{ fontSize: 'var(--text-base)' }}>
                        Please fill out all the required information below
                      </p>
                    </div>

                    {/* Grouped Sections with Background */}
                    <div className="space-y-4">
                      {/* Contact Information Section */}
                      <div className="bg-muted/30 rounded-lg p-5 border border-border" style={{ borderRadius: 'var(--radius-card)' }}>
                        <h4 className="text-foreground mb-4 flex items-center gap-2" style={{ fontSize: 'var(--text-h4)', fontWeight: 'var(--font-weight-semibold)' }}>
                          <User className="w-4 h-4 text-primary" />
                          Contact Information
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <ValidatedInput
                            label="Name"
                            type="text"
                            value={eventDetails.name}
                            onChange={(e) => {
                              setEventDetails({ ...eventDetails, name: e.target.value });
                              if (errors.name) setErrors({ ...errors, name: undefined });
                            }}
                            placeholder="Max Mustermann"
                            maxLength={100}
                            showCharacterCount
                            error={errors.name}
                            required
                            className='w-full px-4 py-2.5 bg-background border rounded-lg transition-colors border-border focus:border-primary'
                          />

                          <ValidatedInput
                            label="Business"
                            type="text"
                            value={eventDetails.business}
                            onChange={(e) => {
                              setEventDetails({ ...eventDetails, business: e.target.value });
                              if (errors.business) setErrors({ ...errors, business: undefined });
                            }}
                            placeholder="Musterfirma AG"
                            maxLength={100}
                            showCharacterCount
                            error={errors.business}
                            helperText="Optional"
                            className='w-full px-4 py-2.5 bg-background border rounded-lg transition-colors border-border focus:border-primary'
                          />

                          <ValidatedInput
                            label="Email"
                            type="email"
                            value={eventDetails.email}
                            onChange={(e) => {
                              setEventDetails({ ...eventDetails, email: e.target.value });
                              if (errors.email) setErrors({ ...errors, email: undefined });
                            }}
                            placeholder="max@firma.ch"
                            maxLength={255}
                            showCharacterCount
                            error={errors.email}
                            helperText="Must be a valid email address"
                            required
                            className='w-full px-4 py-2.5 bg-background border rounded-lg transition-colors border-border focus:border-primary'
                          />

                          <ValidatedInput
                            label="Telephone"
                            type="tel"
                            value={eventDetails.telephone}
                            onChange={(e) => {
                              const value = e.target.value.replace(/[^0-9+\s]/g, '');
                              setEventDetails({ ...eventDetails, telephone: value });
                              if (!touched.telephone) setTouched({ ...touched, telephone: true });
                            }}
                            onBlur={() => {
                              if (!touched.telephone) setTouched({ ...touched, telephone: true });
                            }}
                            placeholder="+41 31 123 45 67"
                            maxLength={20}
                            showCharacterCount
                            error={displayErrors.telephone}
                            helperText="Min. 10 characters"
                            required
                            className='w-full px-4 py-2.5 bg-background border rounded-lg transition-colors border-border focus:border-primary'
                          />
                        </div>
                      </div>

                      {/* Address Section */}
                      <div className="bg-muted/30 rounded-lg p-5 border border-border" style={{ borderRadius: 'var(--radius-card)' }}>
                        <h4 className="text-foreground mb-4 flex items-center gap-2" style={{ fontSize: 'var(--text-h4)', fontWeight: 'var(--font-weight-semibold)' }}>
                          <MapPin className="w-4 h-4 text-primary" />
                          Address
                        </h4>
                        <div className="space-y-4">
                          <ValidatedInput
                            label="Strasse & Nr."
                            type="text"
                            value={eventDetails.street}
                            onChange={(e) => {
                              setEventDetails({ ...eventDetails, street: e.target.value });
                              if (!touched.street) setTouched({ ...touched, street: true });
                            }}
                            onBlur={() => {
                              if (!touched.street) setTouched({ ...touched, street: true });
                            }}
                            placeholder="Musterstrasse 123"
                            maxLength={100}
                            showCharacterCount
                            error={displayErrors.street}
                            helperText="Min. 5 characters"
                            required
                            className='w-full px-4 py-2.5 bg-background border rounded-lg transition-colors border-border focus:border-primary'
                          />

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ValidatedInput
                              label="PLZ"
                              type="text"
                              value={eventDetails.plz}
                              onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9]/g, '');
                                setEventDetails({ ...eventDetails, plz: value });
                                if (!touched.plz) setTouched({ ...touched, plz: true });
                              }}
                              onBlur={() => {
                                if (!touched.plz) setTouched({ ...touched, plz: true });
                              }}
                              placeholder="3000"
                              maxLength={10}
                              showCharacterCount
                              error={displayErrors.plz}
                              helperText="Min. 4 characters"
                              required
                            // className='w-full px-4 py-2.5 bg-background border rounded-lg transition-colors border-border focus:border-primary'
                            />

                            <ValidatedInput
                              label="Location"
                              type="text"
                              value={eventDetails.location}
                              onChange={(e) => {
                                setEventDetails({ ...eventDetails, location: e.target.value });
                                if (!touched.location) setTouched({ ...touched, location: true });
                              }}
                              onBlur={() => {
                                if (!touched.location) setTouched({ ...touched, location: true });
                              }}
                              placeholder="Bern"
                              maxLength={50}
                              showCharacterCount
                              error={errors.location}
                              helperText="Min. 2 characters"
                              required
                            // className='w-full px-4 py-2.5 bg-background border rounded-lg transition-colors border-border focus:border-primary'
                            />
                          </div>
                        </div>
                      </div>

                      {/* Event Details Section */}
                      <div className="bg-muted/30 rounded-lg p-5 border border-border" style={{ borderRadius: 'var(--radius-card)' }}>
                        <h4 className="text-foreground mb-4 flex items-center gap-2" style={{ fontSize: 'var(--text-h4)', fontWeight: 'var(--font-weight-semibold)' }}>
                          <Calendar className="w-4 h-4 text-primary" />
                          Event Details
                        </h4>
                        <div className="grid grid-cols-1 gap-4">
                          {/* Date & Time Picker */}
                          <div>
                            <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-label)', fontWeight: 'var(--font-weight-medium)' }}>
                              Date & Time *
                            </label>
                            <button
                              type="button"
                              onClick={() => setIsDateTimePickerOpen(true)}
                              className={`
                                w-full px-4 py-3 bg-background border rounded-lg transition-colors text-left
                                flex items-center justify-between group
                                ${(errors.eventDate || errors.eventTime) ? 'border-destructive' : 'border-border hover:border-primary hover:shadow-sm'}
                              `}
                              style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-base)' }}
                            >
                              <span className={(eventDetails.eventDate || eventDetails.eventTime) ? 'text-foreground' : 'text-muted-foreground'}>
                                {eventDetails.eventDate && eventDetails.eventTime
                                  ? `${new Date(eventDetails.eventDate).toLocaleDateString('de-CH', { day: '2-digit', month: 'short', year: 'numeric' })} um ${eventDetails.eventTime}`
                                  : eventDetails.eventDate
                                    ? new Date(eventDetails.eventDate).toLocaleDateString('de-CH', { day: '2-digit', month: 'short', year: 'numeric' })
                                    : eventDetails.eventTime
                                      ? eventDetails.eventTime
                                      : 'Date & Time'
                                }
                              </span>
                              <Calendar className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                            </button>
                            {(errors.eventDate || errors.eventTime) && (
                              <p className="text-destructive mt-1" style={{ fontSize: 'var(--text-small)' }}>
                                {errors.eventDate || errors.eventTime}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-label)', fontWeight: 'var(--font-weight-medium)' }}>
                              Number of guests *
                            </label>
                            <Input
                              type="number"
                              value={eventDetails.guestCount}
                              onChange={(e) => setEventDetails({ ...eventDetails, guestCount: e.target.value })}
                              className={`w-full px-4 py-2.5 bg-background border rounded-lg transition-colors ${errors.guestCount ? 'border-destructive' : 'border-border focus:border-primary'
                                }`}
                              placeholder="10"
                              min="1"
                              max="10000"
                              style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-base)' }}
                            />
                            {errors.guestCount && (
                              <p className="text-destructive mt-1" style={{ fontSize: 'var(--text-small)' }}>
                                {errors.guestCount}
                              </p>
                            )}
                          </div>

                          <ValidatedInput
                            label="Occasion"
                            type="text"
                            value={eventDetails.occasion}
                            onChange={(e) => {
                              setEventDetails({ ...eventDetails, occasion: e.target.value });
                              if (errors.occasion) setErrors({ ...errors, occasion: undefined });
                            }}
                            placeholder="e.g. company party"
                            maxLength={100}
                            showCharacterCount
                            error={errors.occasion}
                            helperText="Optional"
                          // className='w-full px-4 py-2.5 bg-background border rounded-lg transition-colors border-border focus:border-primary'
                          />
                        </div>
                      </div>

                      {/* Special Requests Section */}
                      <div className="bg-muted/30 rounded-lg p-5 border border-border" style={{ borderRadius: 'var(--radius-card)' }}>
                        <h4 className="text-foreground mb-4 flex items-center gap-2" style={{ fontSize: 'var(--text-h4)', fontWeight: 'var(--font-weight-semibold)' }}>
                          <ClipboardList className="w-4 h-4 text-primary" />
                          Special Requests
                        </h4>
                        <ValidatedTextarea
                          label="Allergies, dietary requirements or other comments"
                          value={eventDetails.specialRequests}
                          onChange={(e) => {
                            setEventDetails({ ...eventDetails, specialRequests: e.target.value });
                            if (errors.specialRequests) setErrors({ ...errors, specialRequests: undefined });
                          }}
                          placeholder="e.g. 2 people vegetarian, 1 person gluten-free..."
                          rows={4}
                          maxLength={1000}
                          showCharacterCount
                          error={errors.specialRequests}
                          helperText="Optional"
                          className='w-full px-4 py-2.5 bg-background border rounded-lg transition-colors border-border focus:border-primary'
                        />
                      </div>

                      {/* Payment Options Section */}
                      <div className="bg-muted/30 rounded-lg p-5 border border-border" style={{ borderRadius: 'var(--radius-card)' }}>
                        <h4 className="text-foreground mb-4 flex items-center gap-2" style={{ fontSize: 'var(--text-h4)', fontWeight: 'var(--font-weight-semibold)' }}>
                          <CreditCard className="w-4 h-4 text-primary" />
                          Payment Options
                        </h4>
                        <p className="text-muted-foreground mb-4" style={{ fontSize: 'var(--text-base)' }}>
                          Choose your preferred payment method
                        </p>
                        <div className="space-y-3">
                          <label
                            className={`flex items-center gap-3 cursor-pointer p-4 rounded-lg border-2 transition-all ${eventDetails.paymentMethod === 'on_bill' ? 'border-primary bg-primary/5' : 'border-border hover:border-border/80'}`}
                            style={{ borderRadius: 'var(--radius)' }}
                          >
                            <NativeRadio
                              name="paymentMethod"
                              checked={eventDetails.paymentMethod === 'on_bill'}
                              onChange={() => setEventDetails({ ...eventDetails, paymentMethod: 'on_bill' })}
                            />
                            <div className="flex-1">
                              <span className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                                On Invoice
                              </span>
                            </div>
                          </label>

                          <label
                            className={`flex items-center gap-3 cursor-pointer p-4 rounded-lg border-2 transition-all ${eventDetails.paymentMethod === 'cash_card' ? 'border-primary bg-primary/5' : 'border-border hover:border-border/80'}`}
                            style={{ borderRadius: 'var(--radius)' }}
                          >
                            <NativeRadio
                              name="paymentMethod"
                              checked={eventDetails.paymentMethod === 'cash_card'}
                              onChange={() => setEventDetails({ ...eventDetails, paymentMethod: 'cash_card' })}
                            />
                            <div className="flex-1">
                              <span className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                                EC Card / Card on Site
                              </span>
                            </div>
                          </label>
                        </div>
                      </div>

                      {/* Billing Address Section */}
                      <div className="bg-muted/30 rounded-lg p-5 border border-border" style={{ borderRadius: 'var(--radius-card)' }}>
                        <h4 className="text-foreground mb-4 flex items-center gap-2" style={{ fontSize: 'var(--text-h4)', fontWeight: 'var(--font-weight-semibold)' }}>
                          <Building2 className="w-4 h-4 text-primary" />
                          Billing Address
                        </h4>
                        <p className="text-muted-foreground mb-4" style={{ fontSize: 'var(--text-base)' }}>
                          Specify where the invoice should be sent
                        </p>
                        <div className="bg-background/50 border border-border rounded-lg p-4 space-y-4" style={{ borderRadius: 'var(--radius)' }}>
                          <label className="flex items-center gap-3 cursor-pointer">
                            <NativeCheckbox
                              checked={eventDetails.useSameAddressForBilling}
                              onChange={(e) => setEventDetails({ ...eventDetails, useSameAddressForBilling: e.target.checked })}
                            />
                            <span className="text-foreground" style={{ fontSize: 'var(--text-base)' }}>
                              Use same address for billing
                            </span>
                          </label>

                          {!eventDetails.useSameAddressForBilling && (
                            <div className="space-y-4 mt-4 pt-4 border-t border-border">
                              <ValidatedInput
                                label="Billing Street & Nr."
                                type="text"
                                value={eventDetails.billingStreet}
                                onChange={(e) => setEventDetails({ ...eventDetails, billingStreet: e.target.value, billingStreetError: undefined })}
                                placeholder="Street and house number"
                                maxLength={100}
                                showCharacterCount
                                helperText="Optional"
                                error={eventDetails.billingStreetError}
                              />

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <ValidatedInput
                                  label="PLZ"
                                  type="text"
                                  value={eventDetails.billingPlz}
                                  onChange={(e) => {
                                    const value = e.target.value.replace(/[^0-9]/g, '');
                                    setEventDetails({ ...eventDetails, billingPlz: value, billingPlzError: undefined });
                                  }}
                                  placeholder="3000"
                                  maxLength={10}
                                  showCharacterCount
                                  helperText="Optional"
                                  error={eventDetails.billingPlzError}
                                />

                                <ValidatedInput
                                  label="Location"
                                  type="text"
                                  value={eventDetails.billingLocation}
                                  onChange={(e) => setEventDetails({ ...eventDetails, billingLocation: e.target.value, billingLocationError: undefined })}
                                  placeholder="Bern"
                                  maxLength={50}
                                  showCharacterCount
                                  helperText="Optional"
                                  error={eventDetails.billingLocationError}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2 & 3 remain the same... (truncated for brevity) */}
                {currentStep === 2 && (
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
                                    {/* <Sparkles className={`w-4 h-4 ${(categoryFilterMode[selectedCategory] || 'combo') === 'combo' ? 'text-white' : 'text-primary'}`} /> */}
                                    Combo Pack
                                  </button>
                                  <button
                                    onClick={() => setCategoryFilterMode({ ...categoryFilterMode, [selectedCategory]: 'individual' })}
                                    className={`px-6 py-2 rounded-lg transition-all text-sm font-medium flex justify-center gap-2 w-full ${(categoryFilterMode[selectedCategory] === 'individual')
                                      ? 'bg-primary text-primary-foreground shadow-md'
                                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                                      }`}
                                  >
                                    {/* <ClipboardList className={`w-4 h-4 ${categoryFilterMode[selectedCategory] === 'individual' ? 'text-white' : 'text-primary'}`} /> */}
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

                                        {/* Dietary Tags on Card
                                        {item.dietaryTags && item.dietaryTags.length > 0 && (
                                          <div className="flex flex-wrap gap-1.5 mb-3">
                                            {item.dietaryTags.map((tag) => (
                                              <span
                                                key={tag}
                                                className="px-2 py-0.5 rounded-full bg-primary/5 text-primary border border-primary/10"
                                                style={{ fontSize: '10px', fontWeight: 'var(--font-weight-medium)' }}
                                              >
                                                {tag}
                                              </span>
                                            ))}
                                          </div>
                                        )} */}
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
                            {
                              isLastCategory() && !allCategoriesVisited() && (
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
                              )
                            }
                          </div>

                          {/* Cart Summary - 1 column on desktop, full width on mobile */}
                          <div className="lg:col-span-1">
                            <div className="sticky top-6">
                              <div className="bg-muted/30 border border-border rounded-lg overflow-hidden" style={{ borderRadius: 'var(--radius-card)' }}>
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
                                    {/* <div className="mb-4 pt-2 border-t border-border">
                                      <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                                        Per-person items calculated for {eventDetails.guestCount || '0'} {parseInt(eventDetails.guestCount) === 1 ? 'guest' : 'guests'}
                                      </p>
                                    </div> */}

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
                                                      {/* Recommended quantity display - MOVED TO TOP */}
                                                      {(() => {
                                                        const recommendedQty = calculateRecommendedQuantity(item, itemId);
                                                        const avgConsumption = (() => {
                                                          // Get variant's average consumption if available
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
                                          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3" style={{ borderRadius: 'var(--radius)' }}>
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
                                      </>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
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
                )}

                {currentStep === 3 && (
                  <div>
                    <div className="mb-6">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0" style={{ borderRadius: 'var(--radius)' }}>
                          <Eye className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-foreground" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
                            Review your request
                          </h3>
                          {isEditMode && (
                            <p className="text-primary text-sm">Edit Mode - Make changes below</p>
                          )}
                        </div>
                      </div>
                      <p className="text-muted-foreground" style={{ fontSize: 'var(--text-base)' }}>
                        Check all details before submitting
                      </p>

                      {isLocked && (
                        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg flex flex-col sm:flex-row items-start gap-4" style={{ borderRadius: 'var(--radius-card)' }}>
                          <div className="flex items-start gap-3 flex-1">
                            <Lock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-amber-800 font-semibold" style={{ fontSize: 'var(--text-base)' }}>
                                This booking is locked
                              </p>
                              <p className="text-amber-700 text-sm" style={{ fontSize: 'var(--text-small)' }}>
                                Your inquiry is currently being processed by our team and can no longer be edited online. Please contact us directly or click the button if you need to make urgent changes.
                              </p>
                            </div>
                          </div>
                          <div className="w-full sm:w-auto flex-shrink-0">
                            {isUnlockRequested ? (
                              <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg border border-green-200" style={{ borderRadius: 'var(--radius)' }}>
                                <Check className="w-4 h-4" />
                                <span className="text-sm font-medium">Request Sent</span>
                              </div>
                            ) : (
                              <button
                                onClick={handleRequestUnlock}
                                disabled={isRequestingUnlock}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 transition-colors shadow-sm"
                                style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}
                              >
                                {isRequestingUnlock ? (
                                  <>
                                    <Clock className="w-4 h-4 animate-spin" />
                                    Processing...
                                  </>
                                ) : (
                                  <>
                                    <Edit2 className="w-4 h-4" />
                                    Request Edit
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-5">
                      {/* Contact Information */}
                      <div className="bg-muted/30 border border-border rounded-lg p-5" style={{ borderRadius: 'var(--radius-card)' }}>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0" style={{ borderRadius: 'var(--radius)' }}>
                              <User className="w-4 h-4 text-primary" />
                            </div>
                            <h4 className="text-foreground" style={{ fontSize: 'var(--text-h4)', fontWeight: 'var(--font-weight-semibold)' }}>
                              Contact Information
                            </h4>
                          </div>
                          {!isLocked && (
                            <button
                              onClick={() => {
                                setCurrentStep(1);
                                setActiveTab('contact');
                              }}
                              className="flex items-center gap-2 px-3 py-1.5 bg-card border border-border rounded-lg hover:bg-muted transition-colors"
                              style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              Edit
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-muted-foreground mb-1" style={{ fontSize: 'var(--text-small)' }}>Name</p>
                            <p className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                              {eventDetails.name || '-'}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1" style={{ fontSize: 'var(--text-small)' }}>Business</p>
                            <p className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                              {eventDetails.business || '-'}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1" style={{ fontSize: 'var(--text-small)' }}>Email</p>
                            <p className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                              {eventDetails.email || '-'}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1" style={{ fontSize: 'var(--text-small)' }}>Telephone</p>
                            <p className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                              {eventDetails.telephone || '-'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Address Information */}
                      <div className="bg-muted/30 border border-border rounded-lg p-5" style={{ borderRadius: 'var(--radius-card)' }}>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0" style={{ borderRadius: 'var(--radius)' }}>
                              <MapPin className="w-4 h-4 text-primary" />
                            </div>
                            <h4 className="text-foreground" style={{ fontSize: 'var(--text-h4)', fontWeight: 'var(--font-weight-semibold)' }}>
                              Address
                            </h4>
                          </div>
                          {!isLocked && (
                            <button
                              onClick={() => {
                                setCurrentStep(1);
                                setActiveTab('address');
                              }}
                              className="flex items-center gap-2 px-3 py-1.5 bg-card border border-border rounded-lg hover:bg-muted transition-colors"
                              style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              Edit
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="md:col-span-3">
                            <p className="text-muted-foreground mb-1" style={{ fontSize: 'var(--text-small)' }}>Street & Nr.</p>
                            <p className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                              {eventDetails.street || '-'}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1" style={{ fontSize: 'var(--text-small)' }}>PLZ</p>
                            <p className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                              {eventDetails.plz || '-'}
                            </p>
                          </div>
                          <div className="md:col-span-2">
                            <p className="text-muted-foreground mb-1" style={{ fontSize: 'var(--text-small)' }}>Location</p>
                            <p className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                              {eventDetails.location || '-'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Event Details */}
                      <div className="bg-muted/30 border border-border rounded-lg p-5" style={{ borderRadius: 'var(--radius-card)' }}>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0" style={{ borderRadius: 'var(--radius)' }}>
                              <Calendar className="w-4 h-4 text-primary" />
                            </div>
                            <h4 className="text-foreground" style={{ fontSize: 'var(--text-h4)', fontWeight: 'var(--font-weight-semibold)' }}>
                              Event Details
                            </h4>
                          </div>
                          {!isLocked && (
                            <button
                              onClick={() => {
                                setCurrentStep(1);
                                setActiveTab('event');
                              }}
                              className="flex items-center gap-2 px-3 py-1.5 bg-card border border-border rounded-lg hover:bg-muted transition-colors"
                              style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              Edit
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-muted-foreground mb-1" style={{ fontSize: 'var(--text-small)' }}>Date</p>
                            <p className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                              {eventDetails.eventDate ? new Date(eventDetails.eventDate).toLocaleDateString('de-CH', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric'
                              }) : '-'}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1" style={{ fontSize: 'var(--text-small)' }}>Time</p>
                            <p className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                              {eventDetails.eventTime || '-'}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1" style={{ fontSize: 'var(--text-small)' }}>Number of Guests</p>
                            <p className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                              {eventDetails.guestCount || '-'}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1" style={{ fontSize: 'var(--text-small)' }}>Occasion</p>
                            <p className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                              {eventDetails.occasion || '-'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Special Requests */}
                      {eventDetails.specialRequests && (
                        <div className="bg-muted/30 border border-border rounded-lg p-5" style={{ borderRadius: 'var(--radius-card)' }}>
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0" style={{ borderRadius: 'var(--radius)' }}>
                                <ClipboardList className="w-4 h-4 text-primary" />
                              </div>
                              <h4 className="text-foreground" style={{ fontSize: 'var(--text-h4)', fontWeight: 'var(--font-weight-semibold)' }}>
                                Special Requests
                              </h4>
                            </div>
                            {!isLocked && (
                              <button
                                onClick={() => {
                                  setCurrentStep(1);
                                  setActiveTab('requests');
                                }}
                                className="flex items-center gap-2 px-3 py-1.5 bg-card border border-border rounded-lg hover:bg-muted transition-colors"
                                style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                Edit
                              </button>
                            )}
                          </div>
                          <p className="text-foreground" style={{ fontSize: 'var(--text-base)' }}>
                            {eventDetails.specialRequests}
                          </p>
                        </div>
                      )}

                      {/* Selected Menu Items - Grouped by Category */}
                      <div className="bg-muted/30 border border-border rounded-lg p-5" style={{ borderRadius: 'var(--radius-card)' }}>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0" style={{ borderRadius: 'var(--radius)' }}>
                              <ShoppingCart className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <h4 className="text-foreground" style={{ fontSize: 'var(--text-h4)', fontWeight: 'var(--font-weight-semibold)' }}>
                                Selected Menu ({selectedItems.length} {selectedItems.length === 1 ? 'item' : 'items'})
                              </h4>
                              <p className="text-muted-foreground mt-0.5" style={{ fontSize: 'var(--text-small)' }}>
                                Per person quantities
                              </p>
                            </div>
                          </div>
                          {!isLocked && (
                            <button
                              onClick={() => setCurrentStep(2)}
                              className="flex items-center gap-2 px-3 py-1.5 bg-card border border-border rounded-lg hover:bg-muted transition-colors"
                              style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              Edit
                            </button>
                          )}
                        </div>

                        {selectedItems.length === 0 ? (
                          <div className="text-center py-8">
                            <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
                            <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                              No items selected
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {(() => {
                              // Group items by category
                              const categoryList = categories;

                              return categoryList.map((category) => {
                                const categoryItems = selectedItems
                                  .map((itemId) => menuItems.find((i) => i.id === itemId))
                                  .filter((item): item is MenuItem => item !== undefined && item.category === category);

                                if (categoryItems.length === 0) return null;

                                const isCollapsed = collapsedCategories[category];

                                return (
                                  <div
                                    key={category}
                                    className="bg-card border border-border rounded-lg overflow-hidden"
                                    style={{ borderRadius: 'var(--radius)' }}
                                  >
                                    {/* Collapsible Category Header */}
                                    <button
                                      onClick={() =>
                                        setCollapsedCategories((prev) => ({
                                          ...prev,
                                          [category]: !prev[category],
                                        }))
                                      }
                                      className="w-full flex items-center justify-between gap-2 p-2 hover:bg-muted/50 transition-colors"
                                    >
                                      <div className="flex items-center gap-2">
                                        {isCollapsed ? (
                                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                        ) : (
                                          <ChevronUp className="w-4 h-4 text-muted-foreground" />
                                        )}
                                        <h5 className="text-foreground font-semibold truncate max-w-125" style={{ fontSize: 'var(--text-base)' }}>
                                          {category}
                                        </h5>
                                        <span className="px-2 py-0.5 bg-muted rounded-full text-xs text-muted-foreground">
                                          {categoryItems.length}
                                        </span>
                                      </div>
                                      <span className="text-muted-foreground text-xs">
                                        {isCollapsed ? 'Show' : 'Hide'}
                                      </span>
                                    </button>

                                    {/* Items in this category - collapsible */}
                                    {!isCollapsed && (
                                      <div className="p-4 pt-2 space-y-2">
                                        {categoryItems.map((item) => {
                                          const itemId = item.id;
                                          const quantity = itemQuantities[itemId] || 1;

                                          return (
                                            <div
                                              key={itemId}
                                              className="flex items-center gap-3 p-2 rounded-lg bg-muted/20"
                                            >
                                              {/* Thumbnail */}
                                              <div className="w-12 h-12 flex-shrink-0 rounded overflow-hidden bg-muted">
                                                <img
                                                  src={item.image}
                                                  alt={item.name}
                                                  className="w-full h-full object-cover"
                                                />
                                              </div>

                                              {/* Item Details */}
                                              <div className="flex-1 min-w-0">
                                                <div className="flex flex-col gap-1">
                                                  <div className="flex items-center gap-2">
                                                    {item.dietaryType !== 'none' && (
                                                      <DietaryIcon type={item.dietaryType} size="sm" />
                                                    )}
                                                    <h6 className="text-foreground font-medium text-sm truncate max-w-125">
                                                      {item.name}
                                                    </h6>
                                                  </div>
                                                  {/* Pay by consumption badge for consumption-based items */}
                                                  {isConsumption(item) && (
                                                    <div className="flex">
                                                      <span
                                                        className="px-2 py-0.5 rounded text-[10px] font-medium"
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

                                                {/* Variants, Add-ons, Comments */}
                                                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
                                                  {itemVariants[itemId] && item.variants && (() => {
                                                    const variant = item.variants.find((v) => v.id === itemVariants[itemId]);
                                                    return variant ? (
                                                      <span>Variant: {variant.name}</span>
                                                    ) : null;
                                                  })()}
                                                  {itemAddOns[itemId] && itemAddOns[itemId].length > 0 && (
                                                    <span>
                                                      Add-ons:{' '}
                                                      {itemAddOns[itemId]
                                                        .map((addOnId) => {
                                                          const addOn = item.addOns?.find((ao) => ao.id === addOnId);
                                                          return addOn ? addOn.name : null;
                                                        })
                                                        .filter(Boolean)
                                                        .join(', ')}
                                                    </span>
                                                  )}
                                                  {itemComments[itemId] && (
                                                    <span className="italic truncate max-w-125">Note: {itemComments[itemId]}</span>
                                                  )}
                                                </div>
                                              </div>

                                              {/* Price */}
                                              <div className="flex-shrink-0 text-right">
                                                <p className="text-primary font-semibold text-sm">
                                                  {isConsumption(item)
                                                    ? `CHF ${item.price.toFixed(2)}/unit`
                                                    : `CHF ${(getItemPerPersonPrice(item) * (isPerPerson(item) ? (itemGuestCounts[itemId] || parseInt(eventDetails.guestCount) || 1) : quantity)).toFixed(2)}`}
                                                </p>
                                                <p className="text-muted-foreground text-xs">
                                                  {isConsumption(item)
                                                    ? 'billed by consumption'
                                                    : isPerPerson(item)
                                                      ? `${itemGuestCounts[itemId] || parseInt(eventDetails.guestCount) || 1} guests × CHF ${getItemPerPersonPrice(item).toFixed(2)}`
                                                      : `Qty: ${quantity} × CHF ${getItemPerPersonPrice(item).toFixed(2)}`}
                                                </p>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                );
                              });
                            })()}

                            {/* Per-Person Total */}
                            <div className="border-t border-border pt-4 mt-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-foreground mb-1" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>
                                    Per Person Total
                                  </p>
                                  <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                                    {selectedItems.length} {selectedItems.length === 1 ? 'item' : 'items'} selected for {eventDetails.guestCount || '0'}{' '}
                                    {parseInt(eventDetails.guestCount) === 1 ? 'guest' : 'guests'}
                                  </p>
                                </div>
                                <p className="text-primary" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
                                  CHF {getPerPersonSubtotal().toFixed(2)}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Dietary Breakdown & Order Summary - Side by Side */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Dietary Breakdown Card */}
                        <div className="bg-muted/30 border border-border rounded-lg p-5" style={{ borderRadius: 'var(--radius-card)' }}>
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0" style={{ borderRadius: 'var(--radius)' }}>
                              <Users className="w-4 h-4 text-primary" />
                            </div>
                            <h4 className="text-foreground" style={{ fontSize: 'var(--text-h4)', fontWeight: 'var(--font-weight-semibold)' }}>
                              Dietary Breakdown
                            </h4>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Meat/Fish Summary */}
                            <div className="bg-card border border-border rounded-lg p-4" style={{ borderRadius: 'var(--radius)' }}>
                              <p className="text-muted-foreground mb-2" style={{ fontSize: 'var(--text-small)' }}>
                                🍖 Meat/Fish Selections
                              </p>
                              <p className="text-primary mb-1" style={{ fontSize: 'var(--text-h2)', fontWeight: 'var(--font-weight-semibold)' }}>
                                {selectedItems.filter((itemId) => {
                                  const item = menuItems.find((i) => i.id === itemId);
                                  return item?.dietaryType === 'non-veg';
                                }).length}{' '}
                                items
                              </p>
                              {eventDetails.guestCount && (
                                <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                                  Total:{' '}
                                  {selectedItems
                                    .filter((itemId) => {
                                      const item = menuItems.find((i) => i.id === itemId);
                                      return (item?.dietaryType === 'non-veg' && item?.pricingType === 'per-person') || (item?.dietaryType === 'non-veg' && item?.pricingType === 'flat_fee');
                                    })
                                    .reduce((total, itemId) => total + (itemQuantities[itemId] || 1), 0) * parseInt(eventDetails.guestCount)}{' '}
                                  portions
                                </p>
                              )}
                            </div>

                            {/* Veggie/Vegan Summary */}
                            <div className="bg-card border border-border rounded-lg p-4" style={{ borderRadius: 'var(--radius)' }}>
                              <p className="text-muted-foreground mb-2" style={{ fontSize: 'var(--text-small)' }}>
                                🥗 Veggie/Vegan Selections
                              </p>
                              <p className="text-primary mb-1" style={{ fontSize: 'var(--text-h2)', fontWeight: 'var(--font-weight-semibold)' }}>
                                {selectedItems.filter((itemId) => {
                                  const item = menuItems.find((i) => i.id === itemId);
                                  return item?.dietaryType === 'veg' || item?.dietaryType === 'vegan';
                                }).length}{' '}
                                items
                              </p>
                              {eventDetails.guestCount && (
                                <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                                  Total:{' '}
                                  {selectedItems
                                    .filter((itemId) => {
                                      const item = menuItems.find((i) => i.id === itemId);
                                      return ((item?.dietaryType === 'veg' || item?.dietaryType === 'vegan') && item?.pricingType === 'per-person') || ((item?.dietaryType === 'veg' || item?.dietaryType === 'vegan') && item?.pricingType === 'flat_fee');
                                    })
                                    .reduce((total, itemId) => total + (itemQuantities[itemId] || 1), 0) * parseInt(eventDetails.guestCount)}{' '}
                                  portions
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Order Summary Card with Toggle View */}
                        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm" style={{ borderRadius: 'var(--radius-card)' }}>
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0" style={{ borderRadius: 'var(--radius)' }}>
                                <ShoppingCart className="w-4 h-4 text-gray-500" />
                              </div>
                              <h4 className="text-gray-800" style={{ fontSize: 'var(--text-h4)', fontWeight: 'var(--font-weight-semibold)' }}>
                                Order overview
                              </h4>
                            </div>
                            {/* View Toggle */}
                            <div className="flex items-center gap-1 bg-white p-1 rounded-md border border-gray-200 shadow-sm">
                              <button
                                onClick={() => setSummaryViewMode('per-person')}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${summaryViewMode === 'per-person'
                                  ? 'bg-[#8da78d] text-white'
                                  : 'text-gray-500 hover:text-gray-700 bg-transparent'
                                  }`}
                              >
                                Pro Person
                              </button>
                              <button
                                onClick={() => setSummaryViewMode('total')}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${summaryViewMode === 'total'
                                  ? 'bg-[#8da78d] text-white'
                                  : 'text-gray-500 hover:text-gray-700 bg-transparent'
                                  }`}
                              >
                                Total + extras
                              </button>
                            </div>
                          </div>

                          {summaryViewMode === 'per-person' ? (
                            // Per-Person View
                            <div className="space-y-4">
                              <div className="bg-card border border-border rounded-lg p-4" style={{ borderRadius: 'var(--radius)' }}>
                                <p className="text-foreground font-semibold mb-3" style={{ fontSize: 'var(--text-base)' }}>
                                  Per-Person Breakdown
                                </p>

                                {/* Menu Items by Category - Per Person */}
                                {(() => {
                                  const foodCategories = categories.filter(cat =>
                                    !['Technology', 'Decoration', 'Furniture', 'Miscellaneous', 'Beverages'].includes(cat)
                                  );

                                  return (
                                    <div key="food-categories" className="space-y-3">
                                      {foodCategories.map((category) => {
                                        const categoryItems = selectedItems
                                          .map((itemId) => menuItems.find((i) => i.id === itemId))
                                          .filter((item) => {
                                            return item &&
                                              item.category === category &&
                                              isPerPerson(item);
                                          });

                                        if (categoryItems.length === 0) return null;

                                        return (
                                          <div key={category} className="space-y-1">
                                            {/* Category Header */}
                                            <div className="font-semibold text-foreground text-sm mb-1">
                                              {category}
                                            </div>
                                            {/* Items in this category */}
                                            {categoryItems.map((item) => {
                                              if (!item) return null;
                                              const itemId = item.id;
                                              const quantity = itemQuantities[itemId] || 1;

                                              return (
                                                <div
                                                  key={itemId}
                                                  className="flex justify-between items-center py-1 pl-3 border-b border-border/50 last:border-0"
                                                >
                                                  <div className="flex items-center gap-2">
                                                    <span className="text-muted-foreground truncate max-w-125" style={{ fontSize: 'var(--text-small)' }}>
                                                      {item.name}
                                                    </span>
                                                    <span className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                                                      ×{quantity}
                                                    </span>
                                                  </div>
                                                  <span className="text-foreground font-medium">
                                                    CHF {(getItemPerPersonPrice(item) * quantity).toFixed(2)}
                                                  </span>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  );
                                })()}
                              </div>

                              {/* Per-Person Total */}
                              <div className="bg-primary/5 border border-primary/30 rounded-lg p-4" style={{ borderRadius: 'var(--radius)' }}>
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className="text-foreground font-semibold" style={{ fontSize: 'var(--text-base)' }}>
                                      Per Person Total
                                    </p>
                                    <p className="text-muted-foreground text-sm mt-1">
                                      × {eventDetails.guestCount || '0'} guests
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-primary" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-bold)' }}>
                                      CHF {getPerPersonSubtotal().toFixed(2)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            // Total + Extras View
                            <div className="space-y-4">
                              {/* Food Menu Items Section */}
                              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-4 shadow-sm" style={{ borderRadius: 'var(--radius)' }}>
                                <div className="bg-gray-50/50 px-4 py-3 border-b border-gray-200">
                                  <p className="text-[#374151] font-semibold" style={{ fontSize: 'var(--text-base)' }}>
                                    🍽️ Menu
                                  </p>
                                </div>
                                <div className="p-4 space-y-2">
                                  {(() => {
                                    const foodCategories = categories.filter(cat =>
                                      !['Technology', 'Decoration', 'Furniture', 'Miscellaneous'].includes(cat)
                                    );
                                    const breakdown = foodCategories
                                      .map((cat) => {
                                        const items = selectedItems.filter((itemId) => {
                                          const item = menuItems.find((i) => i.id === itemId);
                                          return item?.category === cat && !isConsumption(item);
                                        });
                                        const subtotal = items.reduce((sum, itemId) => {
                                          const item = menuItems.find((i) => i.id === itemId);
                                          return sum + (item ? getItemTotalPrice(item) : 0);
                                        }, 0);
                                        return {
                                          name: cat,
                                          count: items.length,
                                          subtotal,
                                        };
                                      })
                                      .filter((cat) => cat.count > 0);

                                    return (
                                      <div key="food-categories" className="space-y-1">
                                        {breakdown.map((cat) => (
                                          <div
                                            key={cat.name}
                                            className="flex justify-between items-center py-1.5"
                                          >
                                            <span className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                                              {cat.name} ({cat.count})
                                            </span>
                                            <span className="text-foreground font-medium">
                                              CHF {cat.subtotal.toFixed(2)}
                                            </span>
                                          </div>
                                        ))}
                                        <div className="pt-3 mt-3 border-t border-[#8da78d] flex justify-between">
                                          <span className="text-[#374151] font-bold">
                                            Subtotal for meals:
                                          </span>
                                          <span className="text-[#374151] font-bold">
                                            CHF{' '}
                                            {selectedItems
                                              .filter((itemId) => {
                                                const item = menuItems.find((i) => i.id === itemId);
                                                return item && foodCategories.includes(item.category);
                                              })
                                              .reduce((sum, itemId) => {
                                                const item = menuItems.find((i) => i.id === itemId);
                                                return sum + (item ? getItemTotalPrice(item) : 0);
                                              }, 0)
                                              .toFixed(2)}
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  })()}
                                </div>
                              </div>

                              {/* Billed by Consumption Section */}
                              {(() => {
                                const consumptionItems = selectedItems.filter((itemId) => {
                                  const item = menuItems.find((i) => i.id === itemId);
                                  return item && isConsumption(item);
                                });

                                if (consumptionItems.length === 0) return null;

                                const consumptionSubtotal = consumptionItems.reduce((sum, itemId) => {
                                  const item = menuItems.find((i) => i.id === itemId);
                                  return sum + (item ? getItemTotalPrice(item) : 0);
                                }, 0);

                                return (
                                  <>
                                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-4 shadow-sm" style={{ borderRadius: 'var(--radius)' }}>
                                      <div className="bg-gray-50/50 px-4 py-3 border-b border-gray-200">
                                        <p className="text-[#374151] font-semibold" style={{ fontSize: 'var(--text-base)' }}>
                                          🍷 Billed by Consumption
                                        </p>
                                        {!includeBeveragePrices && (
                                          <p className="text-gray-500 text-xs mt-1">
                                            Prices are displayed, but not included in the total price.
                                          </p>
                                        )}
                                      </div>
                                      <div className="p-4 space-y-2">
                                        {consumptionItems.map((itemId) => {
                                          const item = menuItems.find((i) => i.id === itemId);
                                          if (!item) return null;
                                          const itemTotal = getItemTotalPrice(item);
                                          return (
                                            <div key={itemId} className="flex justify-between items-center py-1.5">
                                              <div className="flex items-center gap-2 flex-wrap min-w-0 pr-4">
                                                <span className="text-gray-500 truncate" style={{ fontSize: 'var(--text-small)' }}>
                                                  {item.name}
                                                </span>
                                              </div>
                                              <span className={`font-medium flex-shrink-0 ${!includeBeveragePrices ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                                                CHF {itemTotal.toFixed(2)}
                                              </span>
                                            </div>
                                          );
                                        })}
                                        <div className="pt-3 mt-3 border-t border-gray-100 flex justify-between">
                                          <span className="text-[#374151] font-bold">
                                            Subtotal (consumption):
                                          </span>
                                          <span className="text-[#374151] font-bold">
                                            CHF {includeBeveragePrices ? consumptionSubtotal.toFixed(2) : '0.00'}
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Drink Inclusion Checkbox Card */}
                                    <div className="p-4 mb-6 shadow-sm flex items-start gap-3"
                                      style={{
                                        backgroundColor: 'var(--consumption-alert-bg)',
                                        borderColor: 'var(--consumption-alert-border)',
                                        borderRadius: 'var(--radius)'
                                      }}>
                                      <NativeCheckbox
                                        id="include-drinks"
                                        checked={includeBeveragePrices}
                                        onChange={(e) => setIncludeBeveragePrices(e.target.checked)}
                                        className="mt-1"
                                      />
                                      <label htmlFor="include-drinks" className="cursor-pointer">
                                        <span className="block text-gray-800 font-medium mb-1">Include consumption-based prices in the estimate</span>
                                        {!includeBeveragePrices && (
                                          <span className="block text-sm" style={{ color: 'var(--consumption-alert-text)' }}>⚠️ Consumption-based prices are currently excluded from the overall estimate.</span>
                                        )}
                                      </label>
                                    </div>
                                  </>
                                );
                              })()}

                              {/* Technology Section */}
                              {(() => {
                                const techItems = selectedItems.filter((itemId) => {
                                  const item = menuItems.find((i) => i.id === itemId);
                                  return item?.category === 'Technology' && !isConsumption(item);
                                });

                                if (techItems.length === 0) return null;

                                const techSubtotal = techItems.reduce((sum, itemId) => {
                                  const item = menuItems.find((i) => i.id === itemId);
                                  return sum + (item ? getItemTotalPrice(item) : 0);
                                }, 0);

                                return (
                                  <div className="bg-card border border-border rounded-lg overflow-hidden" style={{ borderRadius: 'var(--radius)' }}>
                                    <div className="bg-primary/5 px-4 py-2 border-b border-border">
                                      <p className="text-foreground font-semibold" style={{ fontSize: 'var(--text-base)' }}>
                                        🔌 Technology
                                      </p>
                                      <p className="text-muted-foreground text-xs mt-0.5">
                                        Equipment and technical services
                                      </p>
                                    </div>
                                    <div className="p-4 space-y-1">
                                      {techItems.map((itemId) => {
                                        const item = menuItems.find((i) => i.id === itemId);
                                        if (!item) return null;
                                        const quantity = itemQuantities[itemId] || 1;
                                        return (
                                          <div key={itemId} className="flex justify-between items-center py-1">
                                            <span className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                                              {item.name} {quantity > 1 ? `(×${quantity})` : ''}
                                            </span>
                                            <span className="text-foreground font-medium">
                                              CHF {(getItemTotalPrice(item)).toFixed(2)}
                                            </span>
                                          </div>
                                        );
                                      })}
                                      <div className="pt-2 mt-2 border-t-2 border-primary flex justify-between">
                                        <span className="text-foreground font-semibold">
                                          Subtotal Technology:
                                        </span>
                                        <span className="text-foreground font-semibold">
                                          CHF {techSubtotal.toFixed(2)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })()}

                              {/* Decoration Section */}
                              {(() => {
                                const decorationItems = selectedItems.filter((itemId) => {
                                  const item = menuItems.find((i) => i.id === itemId);
                                  return item?.category === 'Decoration' && !isConsumption(item);
                                });

                                if (decorationItems.length === 0) return null;

                                const decorationSubtotal = decorationItems.reduce((sum, itemId) => {
                                  const item = menuItems.find((i) => i.id === itemId);
                                  return sum + (item ? getItemTotalPrice(item) : 0);
                                }, 0);

                                return (
                                  <div className="bg-card border border-border rounded-lg overflow-hidden" style={{ borderRadius: 'var(--radius)' }}>
                                    <div className="bg-primary/5 px-4 py-2 border-b border-border">
                                      <p className="text-foreground font-semibold" style={{ fontSize: 'var(--text-base)' }}>
                                        🎀 Decoration
                                      </p>
                                      <p className="text-muted-foreground text-xs mt-0.5">
                                        Decorative items and accessories
                                      </p>
                                    </div>
                                    <div className="p-4 space-y-1">
                                      {decorationItems.map((itemId) => {
                                        const item = menuItems.find((i) => i.id === itemId);
                                        if (!item) return null;
                                        const quantity = itemQuantities[itemId] || 1;
                                        return (
                                          <div key={itemId} className="flex justify-between items-center py-1">
                                            <span className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                                              {item.name} {quantity > 1 ? `(×${quantity})` : ''}
                                            </span>
                                            <span className="text-foreground font-medium">
                                              CHF {(getItemTotalPrice(item)).toFixed(2)}
                                            </span>
                                          </div>
                                        );
                                      })}
                                      <div className="pt-2 mt-2 border-t-2 border-primary flex justify-between">
                                        <span className="text-foreground font-semibold">
                                          Subtotal Decoration:
                                        </span>
                                        <span className="text-foreground font-semibold">
                                          CHF {decorationSubtotal.toFixed(2)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })()}

                              {/* Furniture Section */}
                              {(() => {
                                const furnitureItems = selectedItems.filter((itemId) => {
                                  const item = menuItems.find((i) => i.id === itemId);
                                  return item?.category === 'Furniture' && !isConsumption(item);
                                });

                                if (furnitureItems.length === 0) return null;

                                const furnitureSubtotal = furnitureItems.reduce((sum, itemId) => {
                                  const item = menuItems.find((i) => i.id === itemId);
                                  return sum + (item ? getItemTotalPrice(item) : 0);
                                }, 0);

                                return (
                                  <div className="bg-card border border-border rounded-lg overflow-hidden" style={{ borderRadius: 'var(--radius)' }}>
                                    <div className="bg-primary/5 px-4 py-2 border-b border-border">
                                      <p className="text-foreground font-semibold" style={{ fontSize: 'var(--text-base)' }}>
                                        🪑 Furniture
                                      </p>
                                      <p className="text-muted-foreground text-xs mt-0.5">
                                        Rental furniture and fixtures
                                      </p>
                                    </div>
                                    <div className="p-4 space-y-1">
                                      {furnitureItems.map((itemId) => {
                                        const item = menuItems.find((i) => i.id === itemId);
                                        if (!item) return null;
                                        const quantity = itemQuantities[itemId] || 1;
                                        return (
                                          <div key={itemId} className="flex justify-between items-center py-1">
                                            <span className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                                              {item.name} {quantity > 1 ? `(×${quantity})` : ''}
                                            </span>
                                            <span className="text-foreground font-medium">
                                              CHF {(getItemTotalPrice(item)).toFixed(2)}
                                            </span>
                                          </div>
                                        );
                                      })}
                                      <div className="pt-2 mt-2 border-t-2 border-primary flex justify-between">
                                        <span className="text-foreground font-semibold">
                                          Subtotal Furniture:
                                        </span>
                                        <span className="text-foreground font-semibold">
                                          CHF {furnitureSubtotal.toFixed(2)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })()}

                              {/* Miscellaneous Section */}
                              {(() => {
                                const miscItems = selectedItems.filter((itemId) => {
                                  const item = menuItems.find((i) => i.id === itemId);
                                  return item?.category === 'Miscellaneous' && !isConsumption(item);
                                });

                                if (miscItems.length === 0) return null;

                                const miscSubtotal = miscItems.reduce((sum, itemId) => {
                                  const item = menuItems.find((i) => i.id === itemId);
                                  return sum + (item ? getItemTotalPrice(item) : 0);
                                }, 0);

                                return (
                                  <div className="bg-card border border-border rounded-lg overflow-hidden" style={{ borderRadius: 'var(--radius)' }}>
                                    <div className="bg-primary/5 px-4 py-2 border-b border-border">
                                      <p className="text-foreground font-semibold" style={{ fontSize: 'var(--text-base)' }}>
                                        📦 Miscellaneous
                                      </p>
                                      <p className="text-muted-foreground text-xs mt-0.5">
                                        Other items and services
                                      </p>
                                    </div>
                                    <div className="p-4 space-y-1">
                                      {miscItems.map((itemId) => {
                                        const item = menuItems.find((i) => i.id === itemId);
                                        if (!item) return null;
                                        const quantity = itemQuantities[itemId] || 1;
                                        return (
                                          <div key={itemId} className="flex justify-between items-center py-1">
                                            <span className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                                              {item.name} {quantity > 1 ? `(×${quantity})` : ''}
                                            </span>
                                            <span className="text-foreground font-medium">
                                              CHF {(getItemTotalPrice(item)).toFixed(2)}
                                            </span>
                                          </div>
                                        );
                                      })}
                                      <div className="pt-2 mt-2 border-t-2 border-primary flex justify-between">
                                        <span className="text-foreground font-semibold">
                                          Subtotal Miscellaneous:
                                        </span>
                                        <span className="text-foreground font-semibold">
                                          CHF {miscSubtotal.toFixed(2)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })()}

                              {/* Grand Total */}
                              <div className="bg-[#EAECEF] border-[3px] border-[#374151] rounded-lg p-5 shadow-sm" style={{ borderRadius: 'var(--radius)' }}>
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className="text-[#374151] font-bold uppercase tracking-wide" style={{ fontSize: 'var(--text-h4)' }}>
                                      TOTAL ESTIMATE
                                    </p>
                                    <p className="text-gray-500 text-sm mt-1">
                                      For {eventDetails.guestCount || '0'} guests
                                    </p>
                                  </div>
                                  <p className="text-[#8da78d]" style={{ fontSize: 'var(--text-h2)', fontWeight: 'var(--font-weight-bold)' }}>
                                    CHF {getTotalPriceWithAddOns().toFixed(2)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Deposit Requirement Alert - Only show if total > 5000 CHF */}
                      {getTotalPriceWithAddOns() > 5000 && (
                        <div className="bg-secondary border border-secondary rounded-lg p-5" style={{ borderRadius: 'var(--radius-card)' }}>
                          <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <AlertTriangle className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-white mb-2" style={{ fontSize: 'var(--text-h4)', fontWeight: 'var(--font-weight-semibold)' }}>
                                Deposit Requirement
                              </h4>
                              <p className="text-white/80 mb-3" style={{ fontSize: 'var(--text-base)' }}>
                                A deposit is required for orders above <span className="text-primary font-semibold">CHF 5,000.00</span>. This deposit will be deducted from the final invoice.
                              </p>
                              <div className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                                <p className="text-white/70" style={{ fontSize: 'var(--text-small)' }}>
                                  Our team will connect you once order is locked and confirmed.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Terms and Conditions */}
                      <div className="bg-card border border-border rounded-lg p-5" style={{ borderRadius: 'var(--radius-card)' }}>
                        <label className={`flex items-center gap-3 ${isLocked ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} group`}>
                          <NativeCheckbox
                            checked={termsAccepted}
                            onChange={(e) => setTermsAccepted(e.target.checked)}
                            disabled={isLocked}
                          />
                          <span className="text-foreground" style={{ fontSize: 'var(--text-base)' }}>
                            I agree to the{' '}
                            <span className="text-primary" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                              Terms and Conditions
                            </span>
                            {' '}and confirm that all information is correct.
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
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
                      Back
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
                        Proceed to menu selection
                      </Button>
                    )}

                    {currentStep === 2 && (
                      <Button
                        variant="primary"
                        onClick={handleNext}
                        icon={ChevronRight}
                        iconPosition="right"
                        disabled={isLastCategory() && !allCategoriesVisited()}
                        size="sm"
                      >
                        {isLastCategory() && allCategoriesVisited()
                          ? "Continue to Summary"
                          : "Next Category"}
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
                          ? 'Booking Locked'
                          : isSubmitting
                            ? 'Submitting...'
                            : isEditMode
                              ? 'Update Request'
                              : 'Submit Request'}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div >

        {/* Details Modal */}
        {
          detailsModalItem && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={closeDetailsModal}>
              <div
                className="bg-card rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                style={{ borderRadius: 'var(--radius-card)' }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between z-10">
                  <div className="flex items-center gap-3">
                    <DietaryIcon type={detailsModalItem.dietaryType} size="md" />
                    <div>
                      <h3 className="text-foreground" style={{ fontSize: 'var(--text-h4)', fontWeight: 'var(--font-weight-semibold)' }}>
                        {detailsModalItem.name}
                      </h3>
                      <p className="text-primary mt-1" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>
                        CHF {detailsModalItem.price.toFixed(2)}
                        {detailsModalItem.pricingType === 'billed_by_consumption' && (
                          <span className="text-muted-foreground ml-2" style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-normal)' }}>
                            (Billed by consumption)
                          </span>
                        )}
                        {detailsModalItem.pricingType === 'flat_fee' && (
                          <span className="text-muted-foreground ml-2" style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-normal)' }}>
                            (Flat fee)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={closeDetailsModal}
                    className="w-8 h-8 flex items-center justify-center hover:bg-muted rounded-lg transition-colors"
                    style={{ borderRadius: 'var(--radius)' }}
                  >
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-6">
                  {/* Item Image */}
                  <div className="mb-6 rounded-lg overflow-hidden" style={{ borderRadius: 'var(--radius-card)' }}>
                    <img
                      src={detailsModalItem.image}
                      alt={detailsModalItem.name}
                      className="w-full h-64 object-cover"
                    />
                  </div>

                  {/* Description */}
                  <div className="mb-6">
                    <p className="text-muted-foreground" style={{ fontSize: 'var(--text-base)' }}>
                      {detailsModalItem.description}
                    </p>
                  </div>

                  {/* Recommendation for consumption-based items */}
                  {isConsumption(detailsModalItem) && (() => {
                    const avgConsumption = (() => {
                      // Get variant's average consumption if available
                      if (tempVariant && detailsModalItem.variants) {
                        const variant = detailsModalItem.variants.find(v => v.id === tempVariant);
                        if (variant?.averageConsumption) return variant.averageConsumption;
                      }
                      return detailsModalItem.averageConsumption;
                    })();
                    if (!avgConsumption) return null;
                    const guestCount = parseInt(eventDetails.guestCount) || 0;
                    if (guestCount === 0) return null;
                    const recommended = Math.ceil(guestCount / avgConsumption);
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
                              Based on {avgConsumption} people per unit
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Size/Variant Selection */}
                  {detailsModalItem.variants && detailsModalItem.variants.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-foreground mb-3" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>
                        Choose Size
                      </h4>
                      <div className="space-y-3">
                        {detailsModalItem.variants.map((variant) => {
                          const isSelected = tempVariant === variant.id;
                          return (
                            <label
                              key={variant.id}
                              className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-border/80'
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
                              <span className="text-foreground ml-3" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>
                                CHF {variant.price.toFixed(2)}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Dietary Information Tags */}
                  {detailsModalItem.dietaryTags && detailsModalItem.dietaryTags.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-foreground mb-3" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>
                        Dietary Information
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {detailsModalItem.dietaryTags.map((tag) => (
                          <span
                            key={tag}
                            className="px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20"
                            style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Allergen Information */}
                  {((detailsModalItem.allergens && detailsModalItem.allergens.length > 0) || (detailsModalItem.additives && detailsModalItem.additives.length > 0)) && (
                    <div className="mb-6 p-4 bg-destructive/5 border border-destructive/20 rounded-lg flex gap-3" style={{ borderRadius: 'var(--radius)' }}>
                      <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-foreground mb-1" style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-semibold)' }}>
                          Allergen & Additive Information
                        </p>
                        {detailsModalItem.allergens && detailsModalItem.allergens.length > 0 && (
                          <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                            Contains: {detailsModalItem.allergens.join(', ')}
                          </p>
                        )}
                        {detailsModalItem.additives && detailsModalItem.additives.length > 0 && (
                          <p className="text-muted-foreground mt-1" style={{ fontSize: 'var(--text-small)' }}>
                            Additives: {detailsModalItem.additives.join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Addon Groups */}
                  {(() => {
                    const requiredGroups = detailsModalItem.addonGroups?.filter(g => g.isRequired) || [];
                    const optionalGroups = detailsModalItem.addonGroups?.filter(g => !g.isRequired) || [];

                    return (
                      <>
                        {/* Required Groups */}
                        {requiredGroups.length > 0 && (
                          <div className="mb-6">
                            <h4 className="text-foreground mb-4" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>
                              Choices
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
                                            <span className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                                              {addOn.name}
                                            </span>
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

                        {/* Optional Groups */}
                        {optionalGroups.length > 0 && (
                          <div className="mb-6">
                            <h4 className="text-foreground mb-4" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>
                              Addons
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
                                            <span className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                                              {addOn.name}
                                            </span>
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
                  {!(detailsModalItem.addonGroups && detailsModalItem.addonGroups.length > 0) && (
                    detailsModalItem.addOns && detailsModalItem.addOns.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-foreground mb-3" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>
                          Addons
                        </h4>
                        <div className="space-y-3">
                          {detailsModalItem.addOns.map((addOn) => {
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
                                  <span className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                                    {addOn.name}
                                  </span>
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
                      Additional Comments
                      {/* <span className="text-muted-foreground ml-1" style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-normal)' }}>
                        (Optional)
                      </span> */}
                    </h4>
                    <ValidatedTextarea
                      value={tempComment}
                      onChange={(e) => setTempComment(e.target.value)}
                      placeholder="Any special instructions or dietary requirements..."
                      rows={3}
                      maxLength={500}
                      showCharacterCount
                      helperText="Optional"
                    />
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="sticky bottom-0 bg-card border-t border-border px-6 py-4">
                  <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-4">
                    {/* Left: Quantity and Guest Count Selectors */}
                    <div className="flex items-center gap-6">
                      {/* Per-person items: Only guest count stepper */}
                      {detailsModalItem && isPerPerson(detailsModalItem) ? (
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
                            <span className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>Guests:</span>
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
                                  } else if (e.target.value === '') {
                                    // Allow empty string temporarily for typing
                                  }
                                }}
                                className="w-16 sm:w-20 h-10 text-center border-2 border-border text-foreground rounded-lg focus:border-primary focus:outline-none transition-colors bg-card"
                                style={{
                                  borderRadius: 'var(--radius)',
                                  fontSize: 'var(--text-base)',
                                  fontWeight: 'var(--font-weight-medium)',
                                  appearance: 'textfield',
                                  MozAppearance: 'textfield'
                                }}
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
                                Guests exceed total event guests ({parseInt(eventDetails.guestCount) || 1})
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <>
                          {/* Flat-rate/Consumption items: Quantity selector */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setTempQuantity(Math.max(1, tempQuantity - 1))}
                              className="w-10 h-10 flex items-center justify-center border-2 border-border text-foreground rounded-lg hover:border-primary hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-border disabled:hover:text-foreground bg-card"
                              style={{ borderRadius: 'var(--radius)' }}
                              disabled={tempQuantity <= 1}
                            >
                              <Minus className="w-5 h-5" />
                            </button>
                            <span className="text-foreground min-w-[2rem] text-center" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>
                              {tempQuantity}
                            </span>
                            <button
                              onClick={() => setTempQuantity(tempQuantity + 1)}
                              className="w-10 h-10 flex items-center justify-center border-2 border-border text-foreground rounded-lg hover:border-primary hover:text-primary transition-colors bg-card"
                              style={{ borderRadius: 'var(--radius)' }}
                            >
                              <Plus className="w-5 h-5" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Right: Add to Cart Button with Total */}
                    <button
                      onClick={addToCartFromModal}
                      className="flex-shrink-0 w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                      style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-base)' }}
                    >
                      <ShoppingCart className="w-5 h-5" />
                      <span style={{ fontWeight: 'var(--font-weight-medium)' }}>Add to Cart</span>
                      <span style={{ fontWeight: 'var(--font-weight-bold)' }}>
                        {(() => {
                          let basePrice = detailsModalItem.price;
                          if (tempVariant && detailsModalItem.variants) {
                            const variant = detailsModalItem.variants.find(v => v.id === tempVariant);
                            if (variant) basePrice = variant.price;
                          }
                          let addOnsTotal = 0;

                          if (detailsModalItem.addonGroups && detailsModalItem.addonGroups.length > 0) {
                            // Calculate from addonGroups
                            tempAddOns.forEach(addOnId => {
                              for (const group of detailsModalItem.addonGroups!) {
                                const groupAddOn = group.items.find(i => i.id === addOnId);
                                if (groupAddOn) {
                                  addOnsTotal += groupAddOn.price;
                                  break; // Found it in this group, no need to check others for this ID
                                }
                              }
                            });
                          } else if (detailsModalItem.addOns && detailsModalItem.addOns.length > 0) {
                            // Calculate from legacy addOns
                            tempAddOns.forEach(addOnId => {
                              const addOn = detailsModalItem.addOns?.find(ao => ao.id === addOnId);
                              if (addOn) addOnsTotal += addOn.price;
                            });
                          }

                          // Calculate total based on pricing type
                          const multiplier = isPerPerson(detailsModalItem) ? (tempGuestCount || parseInt(eventDetails.guestCount) || 1) : tempQuantity;
                          return ((basePrice + addOnsTotal) * multiplier).toFixed(2);
                        })()}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        }
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
                <span className="opacity-80" style={{ fontSize: '11px', fontWeight: 'var(--font-weight-medium)' }}>
                  Per person
                </span>
                <span style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-semibold)', lineHeight: '1' }}>
                  CHF {getPerPersonSubtotal().toFixed(2)}
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
                {/* Drawer Handle */}
                <div className="flex justify-center pt-3 pb-1">
                  <div className="w-10 h-1.5 bg-muted rounded-full" />
                </div>
                {/* Drawer Header */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-primary" />
                    <h4 className="text-foreground" style={{ fontSize: 'var(--text-h4)', fontWeight: 'var(--font-weight-semibold)' }}>
                      Your Selection
                    </h4>
                    <span className="px-2 py-0.5 bg-primary text-primary-foreground rounded-full text-xs">
                      {selectedItems.length}
                    </span>
                  </div>
                  <button onClick={() => setIsMobileDrawerOpen(false)} className="w-8 h-8 flex items-center justify-center hover:bg-muted rounded-lg transition-colors" style={{ borderRadius: 'var(--radius)' }}>
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
                {/* Drawer Content */}
                <div className="flex-1 overflow-y-auto px-5 py-4">
                  <p className="text-muted-foreground mb-4" style={{ fontSize: 'var(--text-small)' }}>
                    Per-person items for {eventDetails.guestCount || '0'} {parseInt(eventDetails.guestCount) === 1 ? 'guest' : 'guests'}
                  </p>
                  <div className="space-y-3 mb-4">
                    {selectedItems.map((itemId) => {
                      const item = menuItems.find(i => i.id === itemId);
                      if (!item) return null;
                      const quantity = itemQuantities[itemId] || 1;
                      // const isBeverage = item.category === 'Beverages';
                      const isPerPersonItemValue = isPerPerson(item);
                      return (
                        <div key={itemId} className="bg-card border border-border rounded-lg p-2.5" style={{ borderRadius: 'var(--radius)' }}>
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <div className="flex-1 min-w-0">
                              <h6 className="text-foreground flex items-center gap-2 flex-wrap" style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}>
                                {item.dietaryType !== 'none' && (
                                  <DietaryIcon type={item.dietaryType} size="sm" />
                                )}
                                <span>{item.name}</span>
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
                                <span className="text-muted-foreground font-normal flex items-center flex-wrap">
                                  <span className="mx-1">•</span>{item.category}
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
                              </h6>
                            </div>
                            <div className="flex items-start gap-1 flex-shrink-0">
                              <button onClick={() => { setIsMobileDrawerOpen(false); openDetailsModal(item); }} className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors" style={{ borderRadius: 'var(--radius)' }}>
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => removeFromCart(itemId)} className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors" style={{ borderRadius: 'var(--radius)' }}>
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          {isConsumption(item) ? (
                            <div className="pt-2 border-t border-border mt-2">
                              <div className="flex flex-col gap-1.5">
                                {/* Recommended quantity display - MOVED TO TOP */}
                                {(() => {
                                  const recommendedQty = calculateRecommendedQuantity(item, itemId);
                                  const avgConsumption = (() => {
                                    // Get variant's average consumption if available
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
                              <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded text-xs">
                                {isPerPersonItemValue
                                  ? `${itemGuestCounts[itemId] || parseInt(eventDetails.guestCount) || 1} guests × CHF ${getItemPerPersonPrice(item).toFixed(2)}`
                                  : (quantity > 1 ? `Qty: ${quantity} × CHF ${getItemPerPersonPrice(item).toFixed(2)}` : `CHF ${getItemPerPersonPrice(item).toFixed(2)}`)
                                }
                              </span>
                              <p className="text-foreground" style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-semibold)' }}>
                                CHF {(getItemPerPersonPrice(item) * (isPerPersonItemValue ? (itemGuestCounts[itemId] || parseInt(eventDetails.guestCount) || 1) : quantity)).toFixed(2)}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {/* Subtotals */}
                  <div className="border-t border-border pt-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>Per-person items</p>
                      <p className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>CHF {getPerPersonSubtotal().toFixed(2)}</p>
                    </div>
                    {getFlatRateSubtotal() > 0 && (
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>Additional items</p>
                        <p className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>CHF {getFlatRateSubtotal().toFixed(2)}</p>
                      </div>
                    )}
                    {getConsumptionSubtotal() > 0 && (
                      <div className="flex items-center justify-between mb-4 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg" style={{ borderRadius: 'var(--radius)' }}>
                        <div className="flex items-center gap-2">
                          <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>Billed by consumption</p>
                          <span className="text-amber-600 dark:text-amber-400 text-xs">🍷</span>
                        </div>
                        <p className="text-amber-700 dark:text-amber-300 font-medium" style={{ fontSize: 'var(--text-base)' }}>CHF {getConsumptionSubtotal().toFixed(2)}</p>
                      </div>
                    )}
                  </div>
                </div>
                {/* Drawer Footer */}
                <div className="px-5 py-4 border-t border-border">
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
                  <Button
                    onClick={() => { setIsMobileDrawerOpen(false); handleNext(); }}
                    variant="primary"
                    size="md"
                    icon={ChevronRight}
                    iconPosition="right"
                    fullWidth
                  >
                    Continue to Review
                  </Button>
                </div>
              </div>
            </div>
          )
        }
      </div >

      {/* Date & Time Picker Modal */}
      <DateTimePickerModal
        isOpen={isDateTimePickerOpen}
        onClose={() => setIsDateTimePickerOpen(false)}
        onSelectDate={(date) => {
          setEventDetails({ ...eventDetails, eventDate: date });
          if (errors.eventDate) setErrors({ ...errors, eventDate: undefined });
        }}
        onSelectTime={(time) => {
          setEventDetails({ ...eventDetails, eventTime: time });
          if (errors.eventTime) setErrors({ ...errors, eventTime: undefined });
        }}
        initialDate={eventDetails.eventDate}
        initialTime={eventDetails.eventTime}
      />
    </>
  );
}
