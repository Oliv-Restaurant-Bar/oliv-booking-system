'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { Calendar, Users, Mail, Phone, User, Check, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Send, Eye, Edit2, ClipboardList, Building2, MapPin, Clock, Sparkles, ShoppingCart, X, Plus, Minus, AlertTriangle, Lock } from 'lucide-react';
import { Button } from './Button';
import { MenuItem, MenuItemVariant } from './menuItemsData';
import { DietaryIcon } from './DietaryIcon';
import { ThankYouScreen } from './ThankYouScreen';
import { WizardHeader } from './WizardHeader';
import { submitWizardForm } from '@/lib/actions/wizard';

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
}

export function CustomMenuWizard() {
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
  });
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({});
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

  // Refs for category pill auto-scroll
  const categoryRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const lastScrollY = useRef(0);
  const [showPreview, setShowPreview] = useState(false);
  const [detailsModalItem, setDetailsModalItem] = useState<MenuItem | null>(null);
  const [tempQuantity, setTempQuantity] = useState(1);
  const [tempAddOns, setTempAddOns] = useState<string[]>([]);
  const [tempVariant, setTempVariant] = useState<string>('');
  const [tempComment, setTempComment] = useState<string>('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [signature, setSignature] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [inquiryNumber, setInquiryNumber] = useState('');
  const [step2Error, setStep2Error] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loadingMenu, setLoadingMenu] = useState(true);

  // Fetch menu data from database
  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        const response = await fetch('/api/menu');
        if (response.ok) {
          const data = await response.json();

          // Filter to only include ACTIVE categories
          const activeCategories = data.categories.filter((cat: any) => cat.isActive);

          // Transform database data to MenuItem format - only include items from active categories
          const items: MenuItem[] = data.items
            .filter((item: any) => item.isActive)
            .filter((item: any) => {
              // Only include items whose category is active
              const category = activeCategories.find((cat: any) => cat.id === item.categoryId);
              return category !== undefined;
            })
            .map((item: any) => {
              const category = activeCategories.find((cat: any) => cat.id === item.categoryId);
              return {
                id: item.id,
                name: item.name,
                description: item.description || '',
                category: category?.name || 'Other',
                price: Number(item.pricePerPerson) || 0,
                pricingType: item.pricingType || 'per_person',
                image: item.imageUrl || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=400&fit=crop',
                dietaryType: item.isVegan ? 'vegan' : item.isVegetarian ? 'vegetarian' : (!item.isVegetarian && !item.isVegan && !item.isGlutenFree) ? 'none' : 'non-vegetarian',
              };
            });

          // Get unique category names from active categories
          const categoryNames = activeCategories.map((cat: any) => cat.name);

          setMenuItems(items);
          setCategories(categoryNames);
          if (categoryNames.length > 0) {
            setSelectedCategory(categoryNames[0]);
            setVisitedCategories([categoryNames[0]]);
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

  // Handle category change and track visited categories
  const handleCategoryChange = (category: string) => {
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

  const validateStep1 = () => {
    const newErrors: Partial<EventDetails> = {};
    
    if (!eventDetails.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!eventDetails.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(eventDetails.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!eventDetails.telephone.trim()) {
      newErrors.telephone = 'Phone number is required';
    }
    
    if (!eventDetails.eventDate) {
      newErrors.eventDate = 'Event date is required';
    }
    
    if (!eventDetails.guestCount) {
      newErrors.guestCount = 'Number of guests is required';
    } else if (parseInt(eventDetails.guestCount) < 1) {
      newErrors.guestCount = 'Must have at least 1 guest';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Memoized validation states for better reactivity
  const isContactTabValid = useMemo(() => {
    return (
      eventDetails.name.trim() !== '' &&
      eventDetails.email.trim() !== '' &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(eventDetails.email) &&
      eventDetails.telephone.trim() !== ''
    );
  }, [eventDetails.name, eventDetails.email, eventDetails.telephone]);

  const isEventTabValid = useMemo(() => {
    return (
      eventDetails.eventDate !== '' &&
      eventDetails.guestCount !== '' &&
      parseInt(eventDetails.guestCount) >= 1
    );
  }, [eventDetails.eventDate, eventDetails.guestCount]);

  const isStep1Valid = useMemo(() => {
    return (
      eventDetails.name.trim() !== '' &&
      eventDetails.email.trim() !== '' &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(eventDetails.email) &&
      eventDetails.telephone.trim() !== '' &&
      eventDetails.eventDate !== '' &&
      eventDetails.guestCount !== '' &&
      parseInt(eventDetails.guestCount) >= 1
    );
  }, [eventDetails.name, eventDetails.email, eventDetails.telephone, eventDetails.eventDate, eventDetails.guestCount]);

  const isCurrentTabValid = useMemo(() => {
    switch (activeTab) {
      case 'contact':
        return isContactTabValid;
      case 'address':
        return true; // No required fields on address tab
      case 'event':
        return isEventTabValid;
      case 'requests':
        return isStep1Valid; // Validate all required fields before proceeding to step 2
      default:
        return true;
    }
  }, [activeTab, isContactTabValid, isEventTabValid, isStep1Valid]);

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
    if (!isLastTab()) {
      // Move to next tab
      const nextTab = getNextTab();
      if (nextTab) {
        setActiveTab(nextTab);
      }
    } else {
      // On last tab, validate all step 1 fields and move to step 2
      if (validateStep1()) {
        setCurrentStep(2);
      }
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

  const handleNext = () => {
    if (currentStep === 1) {
      if (validateStep1()) {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
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

  const handleSubmit = async () => {
    setIsSubmitting(true);

    console.log('Event Details:', eventDetails);
    console.log('Selected Menu Items:', selectedItems);

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
      selectedItems,
      itemQuantities,
      allergyDetails: [],
    });

    setIsSubmitting(false);

    if (result.success) {
      // Use the inquiry number from the server response
      setInquiryNumber(result.data?.inquiryNumber || `INQ-${Math.floor(Math.random() * 9000) + 1000}`);
      setIsSubmitted(true);
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
      const guestCount = parseInt(eventDetails.guestCount) || 1;

      // For flat-fee items (billed by consumption), don't multiply by guest count
      if (item.pricingType === 'flat_fee') {
        return total + item.price * quantity;
      }

      // For per-person items, multiply by guest count
      return total + item.price * quantity * guestCount;
    }, 0);
  };

  const getSelectedItemsByCategory = (category: string) => {
    return menuItems.filter(item => 
      item.category === category && selectedItems.includes(item.id)
    );
  };

  const openDetailsModal = (item: MenuItem) => {
    const isAlreadySelected = selectedItems.includes(item.id);
    setDetailsModalItem(item);
    setTempQuantity(isAlreadySelected ? (itemQuantities[item.id] || 1) : 1);
    setTempAddOns(isAlreadySelected ? (itemAddOns[item.id] || []) : []);
    // Set variant - use existing selection or default to first variant
    setTempVariant(isAlreadySelected ? (itemVariants[item.id] || (item.variants?.[0]?.id || '')) : (item.variants?.[0]?.id || ''));
    setTempComment(isAlreadySelected ? (itemComments[item.id] || '') : '');
  };

  const closeDetailsModal = () => {
    setDetailsModalItem(null);
    setTempQuantity(1);
    setTempAddOns([]);
    setTempVariant('');
    setTempComment('');
  };

  const toggleTempAddOn = (addOnId: string) => {
    setTempAddOns(prev => 
      prev.includes(addOnId) 
        ? prev.filter(id => id !== addOnId)
        : [...prev, addOnId]
    );
  };

  const addToCartFromModal = () => {
    if (!detailsModalItem) return;

    const itemId = detailsModalItem.id;
    
    // Add to selected items if not already there
    if (!selectedItems.includes(itemId)) {
      setSelectedItems(prev => [...prev, itemId]);
    }
    
    // Update quantity
    setItemQuantities(prev => ({ ...prev, [itemId]: tempQuantity }));
    
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
    const guestCount = parseInt(eventDetails.guestCount) || 1;
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

    // For flat-fee items (billed by consumption), don't multiply by guest count
    if (item.pricingType === 'flat_fee') {
      return (basePrice + addOnsPrice) * quantity;
    }

    // For per-person items, multiply by guest count
    return (basePrice + addOnsPrice) * quantity * guestCount;
  };

  const getTotalPriceWithAddOns = () => {
    return selectedItems.reduce((total, itemId) => {
      const item = menuItems.find(i => i.id === itemId);
      if (!item) return total;
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

  // Per-person subtotal (food items that are per_person, excluding beverages)
  const getPerPersonSubtotal = () => {
    return selectedItems.reduce((total, itemId) => {
      const item = menuItems.find(i => i.id === itemId);
      if (!item || item.pricingType !== 'per_person' || item.category === 'Beverages') return total;
      return total + getItemPerPersonPrice(item);
    }, 0);
  };

  // Flat-rate subtotal (non-beverage flat_fee items like Technology, Decoration etc.)
  const getFlatRateSubtotal = () => {
    return selectedItems.reduce((total, itemId) => {
      const item = menuItems.find(i => i.id === itemId);
      if (!item || item.pricingType === 'per_person' || item.category === 'Beverages') return total;
      return total + getItemPerPersonPrice(item);
    }, 0);
  };

  // Consumption-based subtotal (beverages billed by consumption)
  const getConsumptionSubtotal = () => {
    return selectedItems.reduce((total, itemId) => {
      const item = menuItems.find(i => i.id === itemId);
      if (!item || item.category !== 'Beverages') return total;
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
          setIsSubmitted(false);
          setCurrentStep(1);
          setSelectedItems([]);
          setItemQuantities({});
          setItemAddOns({});
          setItemVariants({});
          setItemComments({});
          setTermsAccepted(false);
          setInquiryNumber('');
        }}
        onEditOrder={() => {
          setIsSubmitted(false);
          setCurrentStep(3);
        }}
        onGoHome={() => {
          // Navigation is handled by the WizardHeader back button
          // User can also use browser back or the header logo
        }}
      />
    );
  }

  return (
    <>
      <WizardHeader />
      <div className="min-h-screen bg-background flex flex-col">
      {/* Mobile Step Indicator - Only visible on mobile */}
      <div className="lg:hidden bg-primary text-primary-foreground px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {/* Current Step Title */}
          <div className="mb-4">
            <p className="text-primary-foreground opacity-80 mb-1" style={{ fontSize: 'var(--text-small)' }}>
              Step {currentStep} of 3
            </p>
            <h2 className="text-primary-foreground" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
              {steps[currentStep - 1].title}
            </h2>
          </div>

          {/* Horizontal Progress Bar */}
          <div className="flex items-center gap-2 mb-3">
            {steps.map((step) => {
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;
              
              return (
                <div key={step.number} className="flex-1">
                  <div className={`h-2 rounded-full transition-all duration-300 ${
                    isCompleted || isActive
                      ? 'bg-primary-foreground'
                      : 'bg-primary-foreground/20'
                  }`} style={{ borderRadius: 'var(--radius)' }} />
                </div>
              );
            })}
          </div>

          {/* Step Labels */}
          <div className="flex justify-between">
            {steps.map((step) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;
              
              return (
                <div key={step.number} className="flex items-center gap-1.5">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                    isCompleted
                      ? 'bg-primary-foreground text-primary'
                      : isActive
                      ? 'bg-primary-foreground text-primary'
                      : 'bg-transparent border border-primary-foreground/30'
                  }`}>
                    {isCompleted ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <Icon className="w-3 h-3 text-primary-foreground" />
                    )}
                  </div>
                  <span className={`text-primary-foreground ${isActive || isCompleted ? 'opacity-100' : 'opacity-60'}`} style={{ fontSize: 'var(--text-small)' }}>
                    {step.number}
                  </span>
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
                  <div key={step.number} className="relative">
                    <div className="flex items-start gap-3">
                      {/* Step Circle with connecting line */}
                      <div className="relative flex flex-col items-center flex-shrink-0">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 relative z-10 ${
                            isCompleted
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
                        {/* Connecting Line */}
                        {index < steps.length - 1 && (
                          <div 
                            className="absolute top-10 w-0.5 transition-all duration-500"
                            style={{ 
                              backgroundColor: isCompleted 
                                ? 'var(--color-secondary)'
                                : 'rgba(255, 255, 255, 0.2)',
                              height: 'calc(100% + 1.5rem)'
                            }}
                          />
                        )}
                      </div>

                      {/* Step Content */}
                      <div className="flex-1 pt-0.5">
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
              {/* Step 1: Event Details - VARIANT 1: TABBED LAYOUT */}
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
                      Fill out the information across the tabs below
                    </p>
                    <p className="text-muted-foreground mt-2 sm:hidden" style={{ fontSize: 'var(--text-small)' }}>
                      👉 Swipe left to see more tabs
                    </p>
                  </div>

                  {/* Tab Navigation */}
                  <div className="flex overflow-x-auto gap-2 mb-6 pb-4 border-b border-border scrollbar-hide -mx-2 px-2 sm:mx-0 sm:px-0">
                    {tabs.map((tab) => {
                      const TabIcon = tab.icon;
                      const isActive = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-lg transition-all flex-shrink-0 ${
                            isActive
                              ? 'bg-primary text-primary-foreground hover:bg-secondary hover:text-secondary-foreground'
                              : 'bg-muted/30 text-muted-foreground hover:bg-muted hover:text-foreground'
                          }`}
                          style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}
                        >
                          <TabIcon className="w-4 h-4 flex-shrink-0" />
                          <span className="whitespace-nowrap">{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Tab Content */}
                  <div className="space-y-5">
                    {/* Contact Tab */}
                    {activeTab === 'contact' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Name */}
                        <div>
                          <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-label)', fontWeight: 'var(--font-weight-medium)' }}>
                            Name *
                          </label>
                          <input
                            type="text"
                            value={eventDetails.name}
                            onChange={(e) => setEventDetails({ ...eventDetails, name: e.target.value })}
                            className={`w-full px-4 py-2.5 bg-input-background border rounded-lg transition-colors ${
                              errors.name ? 'border-destructive' : 'border-border focus:border-primary'
                            }`}
                            placeholder="Max Mustermann"
                            style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-base)' }}
                          />
                          {errors.name && (
                            <p className="text-destructive mt-1" style={{ fontSize: 'var(--text-small)' }}>
                              {errors.name}
                            </p>
                          )}
                        </div>

                        {/* Business */}
                        <div>
                          <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-label)', fontWeight: 'var(--font-weight-medium)' }}>
                            Business
                          </label>
                          <input
                            type="text"
                            value={eventDetails.business}
                            onChange={(e) => setEventDetails({ ...eventDetails, business: e.target.value })}
                            className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg transition-colors focus:border-primary"
                            placeholder="Musterfirma AG"
                            style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-base)' }}
                          />
                        </div>

                        {/* Email */}
                        <div>
                          <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-label)', fontWeight: 'var(--font-weight-medium)' }}>
                            Email *
                          </label>
                          <input
                            type="email"
                            value={eventDetails.email}
                            onChange={(e) => setEventDetails({ ...eventDetails, email: e.target.value })}
                            className={`w-full px-4 py-2.5 bg-input-background border rounded-lg transition-colors ${
                              errors.email ? 'border-destructive' : 'border-border focus:border-primary'
                            }`}
                            placeholder="max@firma.ch"
                            style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-base)' }}
                          />
                          {errors.email && (
                            <p className="text-destructive mt-1" style={{ fontSize: 'var(--text-small)' }}>
                              {errors.email}
                            </p>
                          )}
                        </div>

                        {/* Telephone */}
                        <div>
                          <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-label)', fontWeight: 'var(--font-weight-medium)' }}>
                            Telephone *
                          </label>
                          <input
                            type="tel"
                            value={eventDetails.telephone}
                            onChange={(e) => setEventDetails({ ...eventDetails, telephone: e.target.value })}
                            className={`w-full px-4 py-2.5 bg-input-background border rounded-lg transition-colors ${
                              errors.telephone ? 'border-destructive' : 'border-border focus:border-primary'
                            }`}
                            placeholder="+41 31 123 45 67"
                            style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-base)' }}
                          />
                          {errors.telephone && (
                            <p className="text-destructive mt-1" style={{ fontSize: 'var(--text-small)' }}>
                              {errors.telephone}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Address Tab */}
                    {activeTab === 'address' && (
                      <div className="space-y-5">
                        <div>
                          <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-label)', fontWeight: 'var(--font-weight-medium)' }}>
                            Strasse & Nr.
                          </label>
                          <input
                            type="text"
                            value={eventDetails.street}
                            onChange={(e) => setEventDetails({ ...eventDetails, street: e.target.value })}
                            className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg transition-colors focus:border-primary"
                            placeholder="Musterstrasse 123"
                            style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-base)' }}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div>
                            <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-label)', fontWeight: 'var(--font-weight-medium)' }}>
                              PLZ
                            </label>
                            <input
                              type="text"
                              value={eventDetails.plz}
                              onChange={(e) => setEventDetails({ ...eventDetails, plz: e.target.value })}
                              className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg transition-colors focus:border-primary"
                              placeholder="3000"
                              style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-base)' }}
                            />
                          </div>

                          <div>
                            <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-label)', fontWeight: 'var(--font-weight-medium)' }}>
                              Location
                            </label>
                            <input
                              type="text"
                              value={eventDetails.location}
                              onChange={(e) => setEventDetails({ ...eventDetails, location: e.target.value })}
                              className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg transition-colors focus:border-primary"
                              placeholder="Bern"
                              style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-base)' }}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Event Tab */}
                    {activeTab === 'event' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-label)', fontWeight: 'var(--font-weight-medium)' }}>
                            Datum *
                          </label>
                          <input
                            type="date"
                            value={eventDetails.eventDate}
                            onChange={(e) => setEventDetails({ ...eventDetails, eventDate: e.target.value })}
                            className={`w-full px-4 py-2.5 bg-input-background border rounded-lg transition-colors ${
                              errors.eventDate ? 'border-destructive' : 'border-border focus:border-primary'
                            }`}
                            min={new Date().toISOString().split('T')[0]}
                            style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-base)' }}
                          />
                          {errors.eventDate && (
                            <p className="text-destructive mt-1" style={{ fontSize: 'var(--text-small)' }}>
                              {errors.eventDate}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-label)', fontWeight: 'var(--font-weight-medium)' }}>
                            time
                          </label>
                          <input
                            type="time"
                            value={eventDetails.eventTime}
                            onChange={(e) => setEventDetails({ ...eventDetails, eventTime: e.target.value })}
                            className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg transition-colors focus:border-primary"
                            style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-base)' }}
                          />
                        </div>

                        <div>
                          <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-label)', fontWeight: 'var(--font-weight-medium)' }}>
                            Number of guests *
                          </label>
                          <input
                            type="number"
                            value={eventDetails.guestCount}
                            onChange={(e) => setEventDetails({ ...eventDetails, guestCount: e.target.value })}
                            className={`w-full px-4 py-2.5 bg-input-background border rounded-lg transition-colors ${
                              errors.guestCount ? 'border-destructive' : 'border-border focus:border-primary'
                            }`}
                            placeholder="10"
                            min="1"
                            style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-base)' }}
                          />
                          {errors.guestCount && (
                            <p className="text-destructive mt-1" style={{ fontSize: 'var(--text-small)' }}>
                              {errors.guestCount}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-label)', fontWeight: 'var(--font-weight-medium)' }}>
                            Occasion
                          </label>
                          <input
                            type="text"
                            value={eventDetails.occasion}
                            onChange={(e) => setEventDetails({ ...eventDetails, occasion: e.target.value })}
                            className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg transition-colors focus:border-primary"
                            placeholder="e.g. company party"
                            style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-base)' }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Requests Tab */}
                    {activeTab === 'requests' && (
                      <div>
                        <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-label)', fontWeight: 'var(--font-weight-medium)' }}>
                          Allergies, dietary requirements or other comments
                        </label>
                        <textarea
                          value={eventDetails.specialRequests}
                          onChange={(e) => setEventDetails({ ...eventDetails, specialRequests: e.target.value })}
                          className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg transition-colors focus:border-primary resize-none"
                          placeholder="e.g. 2 people vegetarian, 1 person gluten-free..."
                          rows={6}
                          style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-base)' }}
                        />
                      </div>
                    )}
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
                  </div>

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
                        const categoryItemCount = getSelectedItemsByCategory(category).length;
                        
                        return (
                          <button
                            key={category}
                            ref={(el) => { categoryRefs.current[category] = el; }}
                            onClick={() => handleCategoryChange(category)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all flex-shrink-0 whitespace-nowrap ${
                              isActive
                                ? 'bg-primary text-primary-foreground hover:bg-secondary hover:text-secondary-foreground'
                                : isVisited
                                ? 'bg-muted/50 text-foreground hover:bg-muted hover:text-foreground border border-border'
                                : 'bg-muted/30 text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`}
                            style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}
                          >
                            {isVisited && !isActive && <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
                            <span>{category}</span>
                            {categoryItemCount > 0 && (
                              <span className={`px-2 py-0.5 rounded-full text-xs ${
                                isActive ? 'bg-secondary-foreground/20 text-secondary-foreground' : 'bg-primary/10 text-primary'
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
                            <h4 className="text-white mb-1" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
                              {selectedCategory}
                            </h4>
                            <p className="text-white/90" style={{ fontSize: 'var(--text-small)' }}>
                              {menuItems.filter(item => item.category === selectedCategory).length} items available
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items Grid - Vertical card layout */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {menuItems
                          .filter(item => item.category === selectedCategory)
                          .map((item) => {
                            const isSelected = selectedItems.includes(item.id);

                            return (
                              <div
                                key={item.id}
                                className={`bg-card border rounded-lg overflow-hidden transition-all flex flex-col ${
                                  isSelected ? 'border-primary shadow-sm' : 'border-border hover:border-primary/50'
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
                                    <div className="flex-shrink-0 mt-0.5">
                                      <DietaryIcon type={item.dietaryType} size="sm" />
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <h5 className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>
                                          {item.name}
                                        </h5>
                                        {/* Amber "Pay by consumption" badge for beverages */}
                                        {item.category === 'Beverages' && (
                                          <span className="px-2 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 rounded text-xs font-medium">
                                            Pay by consumption
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <p className="text-muted-foreground mb-3 flex-1" style={{ fontSize: 'var(--text-small)' }}>
                                    {item.description}
                                  </p>
                                  <div className="flex flex-col gap-0.5 mb-3">
                                    <p className="text-primary" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>
                                      {item.category === 'Beverages'
                                        ? `CHF ${item.price.toFixed(2)}/bottle`
                                        : (item.variants && item.variants.length > 0 ? 'From ' : '') + `CHF ${item.price.toFixed(2)}`}
                                    </p>
                                    <span className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                                      {item.category === 'Beverages' ? 'billed by consumption' :
                                       item.pricingType === 'flat_fee' ? 'flat fee' : 'per person'}
                                    </span>
                                  </div>

                                  {!isSelected ? (
                                    <button
                                      onClick={() => openDetailsModal(item)}
                                      className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-secondary hover:text-secondary-foreground transition-colors w-full"
                                      style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}
                                    >
                                      <Plus className="w-4 h-4" />
                                      Add
                                    </button>
                                  ) : (
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => openDetailsModal(item)}
                                        className="flex-1 px-3 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
                                        style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}
                                      >
                                        Edit
                                      </button>
                                      <button
                                        onClick={() => removeFromCart(item.id)}
                                        className="w-10 h-10 flex items-center justify-center bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-colors flex-shrink-0"
                                        style={{ borderRadius: 'var(--radius)' }}
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                      </div>
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
                              <div className="mb-4 pt-2 border-t border-border">
                                <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                                  Per-person items calculated for {eventDetails.guestCount || '0'} {parseInt(eventDetails.guestCount) === 1 ? 'guest' : 'guests'}
                                </p>
                              </div>

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
                                      const isBeverage = item.category === 'Beverages';
                                      const isPerPerson = item.pricingType === 'per_person';

                                      return (
                                        <div key={itemId} className="bg-card border border-border rounded-lg p-2.5" style={{ borderRadius: 'var(--radius)' }}>
                                          {/* Header Row */}
                                          <div className="flex items-start justify-between gap-2 mb-1.5">
                                            <div className="flex-1 min-w-0">
                                              <div className="flex items-center gap-2 flex-wrap">
                                                <p className="text-foreground truncate" style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-semibold)' }}>
                                                  {item.name}
                                                </p>
                                                {isBeverage && (
                                                  <span className="px-2 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 rounded text-xs font-medium">
                                                    Pay by consumption
                                                  </span>
                                                )}
                                              </div>
                                              <p className="text-muted-foreground truncate" style={{ fontSize: 'var(--text-small)' }}>
                                                {item.category}
                                                {itemVariants[itemId] && item.variants && (() => {
                                                  const variant = item.variants.find(v => v.id === itemVariants[itemId]);
                                                  return variant ? ` • ${variant.name}` : '';
                                                })()}
                                                {itemAddOns[itemId] && itemAddOns[itemId].length > 0 && ` • +${itemAddOns[itemId].length}`}
                                              </p>
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
                                          {isBeverage ? (
                                            <div className="pt-1.5 border-t border-border">
                                              <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1.5">
                                                  <span className="px-1.5 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 rounded text-xs font-medium">
                                                    Available
                                                  </span>
                                                  <span className="text-muted-foreground text-xs">for your event</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                  <span className="text-muted-foreground text-xs">Pricing: CHF {item.price.toFixed(2)}/bottle</span>
                                                  <span className="text-amber-600 dark:text-amber-400 text-xs">(billed by consumption)</span>
                                                </div>
                                              </div>
                                            </div>
                                          ) : (
                                            <div className="flex items-center justify-between pt-1.5 border-t border-border">
                                              <div className="flex items-center gap-1.5">
                                                {isPerPerson && (
                                                  <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded text-xs" style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}>
                                                    {quantity}× pp
                                                  </span>
                                                )}
                                                {!isPerPerson && (
                                                  <span className="px-1.5 py-0.5 bg-muted text-muted-foreground rounded text-xs" style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}>
                                                    {quantity > 1 ? `${quantity}×` : 'Flat rate'}
                                                  </span>
                                                )}
                                              </div>
                                              <p className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>
                                                CHF {getItemPerPersonPrice(item).toFixed(2)}
                                                {isPerPerson && <span className="text-muted-foreground text-sm">/person</span>}
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
                                      <div className="flex items-center justify-between mb-4 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg" style={{ borderRadius: 'var(--radius)' }}>
                                        <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                                          Billed by consumption
                                        </p>
                                        <p className="text-amber-700 dark:text-amber-300 font-medium" style={{ fontSize: 'var(--text-base)' }}>
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
                      <h3 className="text-foreground" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
                        Review your request
                      </h3>
                    </div>
                    <p className="text-muted-foreground" style={{ fontSize: 'var(--text-base)' }}>
                      Check all details before submitting
                    </p>
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
                        </div>
                        <p className="text-foreground" style={{ fontSize: 'var(--text-base)' }}>
                          {eventDetails.specialRequests}
                        </p>
                      </div>
                    )}

                    {/* Selected Menu Items */}
                    <div className="bg-muted/30 border border-border rounded-lg p-5" style={{ borderRadius: 'var(--radius-card)' }}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0" style={{ borderRadius: 'var(--radius)' }}>
                            <ShoppingCart className="w-4 h-4 text-primary" />
                          </div>
                          <h4 className="text-foreground" style={{ fontSize: 'var(--text-h4)', fontWeight: 'var(--font-weight-semibold)' }}>
                            Selected Menu ({selectedItems.length} {selectedItems.length === 1 ? 'item' : 'items'})
                          </h4>
                        </div>
                        <button
                          onClick={() => setCurrentStep(2)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-card border border-border rounded-lg hover:bg-muted transition-colors"
                          style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          Edit
                        </button>
                      </div>

                      {selectedItems.length === 0 ? (
                        <div className="text-center py-8">
                          <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
                          <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                            No items selected
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="space-y-3">
                            {selectedItems.map((itemId) => {
                              const item = menuItems.find(i => i.id === itemId);
                              if (!item) return null;
                              const quantity = itemQuantities[itemId] || 1;

                              return (
                                <div
                                  key={itemId}
                                  className="bg-card border border-border rounded-lg overflow-hidden"
                                  style={{ borderRadius: 'var(--radius-card)' }}
                                >
                                  <div className="flex gap-4">
                                    {/* Item Image */}
                                    <div className="w-28 h-28 flex-shrink-0">
                                      <img 
                                        src={item.image} 
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>

                                    {/* Item Content */}
                                    <div className="flex-1 p-3 pl-0">
                                      <div className="flex items-center gap-2 mb-1">
                                        <DietaryIcon type={item.dietaryType} size="sm" />
                                        <h5 className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>
                                          {item.name}
                                        </h5>
                                      </div>
                                      
                                      {/* Additional Details */}
                                      {itemVariants[itemId] && item.variants && (() => {
                                        const variant = item.variants.find(v => v.id === itemVariants[itemId]);
                                        return variant ? (
                                          <p className="text-muted-foreground mt-2" style={{ fontSize: 'var(--text-small)' }}>
                                            <span className="font-medium">Variant:</span> {variant.name}
                                          </p>
                                        ) : null;
                                      })()}
                                      {itemAddOns[itemId] && itemAddOns[itemId].length > 0 && (
                                        <div className="mt-1">
                                          <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                                            <span className="font-medium">Add-ons:</span> {itemAddOns[itemId].map(addOnId => {
                                              const addOn = item.addOns?.find(ao => ao.id === addOnId);
                                              return addOn ? addOn.name : null;
                                            }).filter(Boolean).join(', ')}
                                          </p>
                                        </div>
                                      )}
                                      {itemComments[itemId] && (
                                        <p className="text-muted-foreground italic mt-1" style={{ fontSize: 'var(--text-small)' }}>
                                          <span className="font-medium not-italic">Note:</span> {itemComments[itemId]}
                                        </p>
                                      )}
                                    </div>

                                    {/* Price and Quantity */}
                                    <div className="p-3 text-right flex flex-col justify-between">
                                      <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                                        Qty: {quantity}
                                      </p>
                                      <p className="text-primary" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>
                                        CHF {getItemTotalPrice(item).toFixed(2)}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Total Summary */}
                          <div className="border-t border-border pt-4 mt-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-foreground mb-1" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>
                                  Estimated Total
                                </p>
                                <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                                  {selectedItems.reduce((total, itemId) => total + (itemQuantities[itemId] || 1), 0)} items • {eventDetails.guestCount || '0'} guests
                                </p>
                              </div>
                              <p className="text-primary" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
                                CHF {getTotalPriceWithAddOns().toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Deposit Requirement Alert */}
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
                            A deposit is required for orders above <span className="text-primary font-semibold">CHF 2,000.00</span>. This deposit will be deducted from the final invoice.
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

                    {/* Terms and Conditions */}
                    <div className="bg-card border border-border rounded-lg p-5" style={{ borderRadius: 'var(--radius-card)' }}>
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={termsAccepted}
                          onChange={(e) => setTermsAccepted(e.target.checked)}
                          className="w-5 h-5 rounded border-border text-primary focus:ring-2 focus:ring-primary/20 flex-shrink-0"
                          style={{ accentColor: 'var(--color-primary)' }}
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
                {/* Back button - Show when: 1) on Step 2 or 3, OR 2) on Step 1 but not on first tab */}
                {(currentStep > 1 || (currentStep === 1 && activeTab !== 'contact')) && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (currentStep === 1) {
                        // Navigate to previous tab
                        const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
                        if (currentIndex > 0) {
                          setActiveTab(tabs[currentIndex - 1].id);
                        }
                      } else {
                        // Navigate to previous step
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
                      disabled={!isCurrentTabValid}
                      size="sm"
                    >
                      {isLastTab() ? 'Proceed to menu selection' : 'Next'}
                    </Button>
                  )}

                  {currentStep === 2 && (
                    <Button
                      variant="primary"
                      onClick={handleNext}
                      icon={ChevronRight}
                      iconPosition="right"
                      disabled={selectedItems.length === 0}
                      size="sm"
                    >
                      Continue
                    </Button>
                  )}

                  {currentStep === 3 && (
                    <Button
                      variant="primary"
                      onClick={handleSubmit}
                      icon={Send}
                      iconPosition="right"
                      disabled={!termsAccepted || isSubmitting}
                      size="sm"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Request'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Details Modal */}
      {detailsModalItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={closeDetailsModal}>
          <div 
            className="bg-card rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
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
                          className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-border/80'
                          }`}
                          style={{ borderRadius: 'var(--radius)' }}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className="relative flex items-center justify-center">
                              <input
                                type="radio"
                                name="variant"
                                checked={isSelected}
                                onChange={() => setTempVariant(variant.id)}
                                className="w-5 h-5 appearance-none border-2 border-border rounded-full checked:border-primary checked:border-[6px] transition-all cursor-pointer"
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

              {/* Allergen Information */}
              {detailsModalItem.allergens && detailsModalItem.allergens.length > 0 && (
                <div className="mb-6 p-4 bg-destructive/5 border border-destructive/20 rounded-lg flex gap-3" style={{ borderRadius: 'var(--radius)' }}>
                  <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-foreground mb-1" style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-semibold)' }}>
                      Allergen Information
                    </p>
                    <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                      Contains: {detailsModalItem.allergens.join(', ')}
                    </p>
                  </div>
                </div>
              )}

              {/* Optional Add-ons */}
              {detailsModalItem.addOns && detailsModalItem.addOns.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-foreground mb-3" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>
                    Optional Add-ons
                  </h4>
                  <div className="space-y-3">
                    {detailsModalItem.addOns.map((addOn) => {
                      const isChecked = tempAddOns.includes(addOn.id);
                      return (
                        <label
                          key={addOn.id}
                          className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            isChecked ? 'border-primary bg-primary/5' : 'border-border hover:border-border/80'
                          }`}
                          style={{ borderRadius: 'var(--radius)' }}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className="relative flex items-center justify-center">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleTempAddOn(addOn.id)}
                                className="w-5 h-5 appearance-none border-2 border-border rounded checked:bg-primary checked:border-primary transition-all cursor-pointer"
                              />
                              {isChecked && (
                                <Check className="w-3 h-3 text-white absolute pointer-events-none" style={{ strokeWidth: 3 }} />
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
              )}

              {/* Additional Comments */}
              <div className="mb-6">
                <h4 className="text-foreground mb-3" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>
                  Additional Comments
                  <span className="text-muted-foreground ml-1" style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-normal)' }}>
                    (Optional)
                  </span>
                </h4>
                <textarea
                  value={tempComment}
                  onChange={(e) => setTempComment(e.target.value)}
                  placeholder="Any special instructions or dietary requirements..."
                  rows={3}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                  style={{ 
                    borderRadius: 'var(--radius)',
                    fontSize: 'var(--text-base)'
                  }}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-card border-t border-border px-6 py-4">
              <div className="flex items-center justify-between gap-4">
                {/* Left: Quantity Selector */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setTempQuantity(Math.max(1, tempQuantity - 1))}
                    className="w-10 h-10 flex items-center justify-center border-2 border-border text-foreground rounded-lg hover:border-primary hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-border disabled:hover:text-foreground"
                    style={{ borderRadius: 'var(--radius)' }}
                    disabled={tempQuantity <= 1}
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="text-foreground min-w-[3rem] text-center" style={{ fontSize: 'var(--text-h4)', fontWeight: 'var(--font-weight-semibold)' }}>
                    {tempQuantity}
                  </span>
                  <button
                    onClick={() => setTempQuantity(tempQuantity + 1)}
                    className="w-10 h-10 flex items-center justify-center border-2 border-border text-foreground rounded-lg hover:border-primary hover:text-primary transition-colors"
                    style={{ borderRadius: 'var(--radius)' }}
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                {/* Right: Add to Cart Button with Total */}
                <button
                  onClick={addToCartFromModal}
                  className="flex items-center gap-3 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Add to Cart</span>
                  <span style={{ fontWeight: 'var(--font-weight-bold)' }}>
                    CHF {(() => {
                      let basePrice = detailsModalItem.price;
                      if (tempVariant && detailsModalItem.variants) {
                        const variant = detailsModalItem.variants.find(v => v.id === tempVariant);
                        if (variant) basePrice = variant.price;
                      }
                      const addOnsTotal = tempAddOns.reduce((total, addOnId) => {
                        const addOn = detailsModalItem.addOns?.find(ao => ao.id === addOnId);
                        return total + (addOn?.price || 0);
                      }, 0);
                      const guestCount = parseInt(eventDetails.guestCount) || 1;

                      // For flat-fee and billed-by-consumption items, don't multiply by guest count
                      if (detailsModalItem.pricingType === 'flat_fee' || detailsModalItem.pricingType === 'billed_by_consumption') {
                        return ((basePrice + addOnsTotal) * tempQuantity).toFixed(2);
                      }

                      // For per-person items, multiply by guest count
                      return ((basePrice + addOnsTotal) * tempQuantity * guestCount).toFixed(2);
                    })()}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Mobile Cart FAB - side-attached style, only on step 2 with items selected */}
      {currentStep === 2 && selectedItems.length > 0 && showCartFab && (
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
      )}

      {/* Mobile Cart Drawer */}
      {isMobileDrawerOpen && (
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
                  const isBeverage = item.category === 'Beverages';
                  const isPerPerson = item.pricingType === 'per_person';
                  return (
                    <div key={itemId} className="bg-card border border-border rounded-lg p-2.5" style={{ borderRadius: 'var(--radius)' }}>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-foreground truncate" style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-semibold)' }}>
                              {item.name}
                            </p>
                            {isBeverage && (
                              <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 rounded text-xs">Pay by consumption</span>
                            )}
                          </div>
                          <p className="text-muted-foreground truncate" style={{ fontSize: 'var(--text-small)' }}>
                            {item.category}
                            {itemVariants[itemId] && item.variants && (() => {
                              const variant = item.variants.find(v => v.id === itemVariants[itemId]);
                              return variant ? ` • ${variant.name}` : '';
                            })()}
                          </p>
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
                      {isBeverage ? (
                        <div className="pt-1.5 border-t border-border">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5">
                              <span className="px-1.5 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 rounded text-xs font-medium">
                                Available
                              </span>
                              <span className="text-muted-foreground text-xs">for your event</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground text-xs">Pricing: CHF {item.price.toFixed(2)}/bottle</span>
                              <span className="text-amber-600 dark:text-amber-400 text-xs">(billed by consumption)</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between pt-1.5 border-t border-border">
                          <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded text-xs">
                            {isPerPerson ? `${quantity}× pp` : (quantity > 1 ? `${quantity}×` : 'Flat rate')}
                          </span>
                          <p className="text-foreground" style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-semibold)' }}>
                            CHF {getItemPerPersonPrice(item).toFixed(2)}{isPerPerson && <span className="text-muted-foreground text-xs">/person</span>}
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
              <button
                onClick={() => { setIsMobileDrawerOpen(false); handleNext(); }}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-secondary hover:text-secondary-foreground transition-colors"
                style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}
              >
                <ChevronRight className="w-5 h-5" />
                Continue to Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
