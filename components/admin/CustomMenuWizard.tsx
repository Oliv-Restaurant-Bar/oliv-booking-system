'use client';

import { useState } from 'react';
import { Calendar, Users, Mail, Phone, User, Check, ChevronLeft, ChevronRight, Send, Eye, Edit2, ClipboardList } from 'lucide-react';
import { Button } from '../user/Button';

interface EventDetails {
  fullName: string;
  email: string;
  phone: string;
  eventDate: string;
  guestCount: string;
  specialRequests: string;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: string;
}

const menuItems: MenuItem[] = [
  // Appetizers
  { id: '1', name: 'Bruschetta', description: 'Toasted bread with tomatoes, garlic, and basil', category: 'Appetizers' },
  { id: '2', name: 'Caprese Salad', description: 'Fresh mozzarella, tomatoes, and basil', category: 'Appetizers' },
  { id: '3', name: 'Stuffed Mushrooms', description: 'Baked mushrooms with herbs and cheese', category: 'Appetizers' },
  { id: '4', name: 'Spring Rolls', description: 'Crispy vegetable rolls with dipping sauce', category: 'Appetizers' },

  // Mains
  { id: '5', name: 'Grilled Salmon', description: 'Fresh salmon with lemon butter sauce', category: 'Mains' },
  { id: '6', name: 'Chicken Parmesan', description: 'Breaded chicken with marinara and mozzarella', category: 'Mains' },
  { id: '7', name: 'Beef Tenderloin', description: 'Premium beef with red wine reduction', category: 'Mains' },
  { id: '8', name: 'Vegetable Risotto', description: 'Creamy arborio rice with seasonal vegetables', category: 'Mains' },

  // Sides
  { id: '9', name: 'Garlic Mashed Potatoes', description: 'Creamy potatoes with roasted garlic', category: 'Sides' },
  { id: '10', name: 'Grilled Vegetables', description: 'Seasonal vegetables with balsamic glaze', category: 'Sides' },
  { id: '11', name: 'Caesar Salad', description: 'Romaine lettuce with Caesar dressing', category: 'Sides' },
  { id: '12', name: 'Garlic Bread', description: 'Toasted bread with garlic butter', category: 'Sides' },

  // Desserts
  { id: '13', name: 'Tiramisu', description: 'Classic Italian coffee-flavored dessert', category: 'Desserts' },
  { id: '14', name: 'Chocolate Lava Cake', description: 'Warm chocolate cake with molten center', category: 'Desserts' },
  { id: '15', name: 'Panna Cotta', description: 'Italian cream dessert with berry compote', category: 'Desserts' },
  { id: '16', name: 'Fruit Tart', description: 'Fresh seasonal fruits on pastry cream', category: 'Desserts' },

  // Beverages
  { id: '17', name: 'Fresh Lemonade', description: 'House-made lemonade with mint', category: 'Beverages' },
  { id: '18', name: 'Iced Tea', description: 'Refreshing black tea with lemon', category: 'Beverages' },
  { id: '19', name: 'Sparkling Water', description: 'Premium sparkling mineral water', category: 'Beverages' },
  { id: '20', name: 'Coffee & Tea Service', description: 'Selection of premium coffee and teas', category: 'Beverages' },
];

const categories = ['Appetizers', 'Mains', 'Sides', 'Desserts', 'Beverages'];

export function CustomMenuWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [eventDetails, setEventDetails] = useState<EventDetails>({
    fullName: '',
    email: '',
    phone: '',
    eventDate: '',
    guestCount: '',
    specialRequests: '',
  });
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [errors, setErrors] = useState<Partial<EventDetails>>({});
  const [showPreview, setShowPreview] = useState(false);

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

  const validateStep1 = () => {
    const newErrors: Partial<EventDetails> = {};

    if (!eventDetails.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!eventDetails.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(eventDetails.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!eventDetails.phone.trim()) {
      newErrors.phone = 'Phone number is required';
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

  const handleNext = () => {
    if (currentStep === 1) {
      if (validateStep1()) {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    console.log('Event Details:', eventDetails);
    console.log('Selected Menu Items:', selectedItems);
    alert('Your custom menu request has been submitted! We will contact you shortly.');
    setCurrentStep(1);
    setEventDetails({
      fullName: '',
      email: '',
      phone: '',
      eventDate: '',
      guestCount: '',
      specialRequests: '',
    });
    setSelectedItems([]);
  };

  const toggleMenuItem = (itemId: string) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const getSelectedItemsByCategory = (category: string) => {
    return menuItems.filter(item =>
      item.category === category && selectedItems.includes(item.id)
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header with Logo - Center Aligned */}
      <header className="bg-card border-b border-border py-6 px-4">
        <div className="max-w-screen-2xl mx-auto flex justify-center">
          <div className="text-center">
            <img
              src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=200&h=80&fit=crop"
              alt="Restaurant Logo"
              className="h-16 w-auto mx-auto object-contain"
            />
            <h1 className="text-primary mt-2" style={{ fontSize: 'var(--text-h4)', fontWeight: 'var(--font-weight-semibold)' }}>
              Oliv Restaurant & Bar
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content - Two Column Layout */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left Sidebar - 30% width with primary background */}
        <aside className="lg:w-[30%] bg-primary text-primary-foreground p-8 lg:p-12">
          <div className="max-w-md mx-auto lg:mx-0">
            {/* Title */}
            <div className="mb-12">
              <h2 className="text-primary-foreground mb-3" style={{ fontSize: 'var(--text-h2)', fontWeight: 'var(--font-weight-semibold)' }}>
                Custom Menu Wizard
              </h2>
              <p className="text-primary-foreground opacity-90" style={{ fontSize: 'var(--text-base)' }}>
                Create your perfect event menu in three simple steps
              </p>
            </div>

            {/* Vertical Steps */}
            <div className="space-y-8">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = currentStep === step.number;
                const isCompleted = currentStep > step.number;

                return (
                  <div key={step.number} className="relative">
                    {/* Connecting Line */}
                    {index < steps.length - 1 && (
                      <div className="absolute left-6 top-16 w-0.5 h-16 bg-primary-foreground opacity-20">
                        {isCompleted && (
                          <div className="w-full bg-primary-foreground opacity-100 h-full transition-all duration-500" />
                        )}
                      </div>
                    )}

                    <div className="flex items-start gap-4">
                      {/* Step Circle */}
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${isCompleted
                            ? 'bg-primary-foreground text-primary'
                            : isActive
                              ? 'bg-primary-foreground text-primary ring-4 ring-primary-foreground/20'
                              : 'bg-transparent text-primary-foreground border-2 border-primary-foreground/30'
                          }`}
                      >
                        {isCompleted ? (
                          <Check className="w-6 h-6" />
                        ) : (
                          <Icon className="w-5 h-5" />
                        )}
                      </div>

                      {/* Step Content */}
                      <div className="flex-1 pt-1">
                        <p
                          className={`mb-2 text-primary-foreground ${isActive || isCompleted ? 'opacity-100' : 'opacity-60'}`}
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
            <div className="mt-12 p-6 bg-primary-foreground/10 rounded-lg" style={{ borderRadius: 'var(--radius-card)' }}>
              <p className="text-primary-foreground opacity-80 mb-3" style={{ fontSize: 'var(--text-small)' }}>
                Overall Progress
              </p>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-3 bg-primary-foreground/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-foreground transition-all duration-500"
                    style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
                  />
                </div>
                <span className="text-primary-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>
                  {currentStep}/3
                </span>
              </div>
              <p className="text-primary-foreground opacity-90 mt-3" style={{ fontSize: 'var(--text-small)' }}>
                {Math.round(((currentStep - 1) / 2) * 100)}% Complete
              </p>
            </div>
          </div>
        </aside>

        {/* Right Content Area - 70% width */}
        <main className="lg:w-[70%] bg-background p-4 lg:p-12">
          <div className="max-w-4xl mx-auto">
            <div className="bg-card rounded-lg p-6 lg:p-10 border border-border" style={{ borderRadius: 'var(--radius-card)' }}>
              {/* Step 1: Event Details */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="mb-8">
                    <h3 className="text-foreground mb-2" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
                      Tell us about your event
                    </h3>
                    <p className="text-muted-foreground" style={{ fontSize: 'var(--text-base)' }}>
                      Share your contact details, event date, and number of guests with us.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Full Name */}
                    <div>
                      <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-label)', fontWeight: 'var(--font-weight-medium)' }}>
                        Full Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                          type="text"
                          value={eventDetails.fullName}
                          onChange={(e) => setEventDetails({ ...eventDetails, fullName: e.target.value })}
                          className={`w-full pl-11 pr-4 py-2.5 bg-input-background border rounded-lg transition-colors ${errors.fullName ? 'border-destructive' : 'border-border focus:border-primary'
                            }`}
                          placeholder="John Doe"
                          style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-base)' }}
                        />
                      </div>
                      {errors.fullName && (
                        <p className="text-destructive mt-1" style={{ fontSize: 'var(--text-small)' }}>
                          {errors.fullName}
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-label)', fontWeight: 'var(--font-weight-medium)' }}>
                        Email Address *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                          type="email"
                          value={eventDetails.email}
                          onChange={(e) => setEventDetails({ ...eventDetails, email: e.target.value })}
                          className={`w-full pl-11 pr-4 py-2.5 bg-input-background border rounded-lg transition-colors ${errors.email ? 'border-destructive' : 'border-border focus:border-primary'
                            }`}
                          placeholder="john@example.com"
                          style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-base)' }}
                        />
                      </div>
                      {errors.email && (
                        <p className="text-destructive mt-1" style={{ fontSize: 'var(--text-small)' }}>
                          {errors.email}
                        </p>
                      )}
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-label)', fontWeight: 'var(--font-weight-medium)' }}>
                        Phone Number *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                          type="tel"
                          value={eventDetails.phone}
                          onChange={(e) => {
                            // Only allow numbers, spaces, plus sign, and hyphens
                            const value = e.target.value.replace(/[^0-9+\s-]/g, '');
                            setEventDetails({ ...eventDetails, phone: value });
                          }}
                          className={`w-full pl-11 pr-4 py-2.5 bg-input-background border rounded-lg transition-colors ${errors.phone ? 'border-destructive' : 'border-border focus:border-primary'
                            }`}
                          placeholder="+1 (555) 123-4567"
                          style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-base)' }}
                        />
                      </div>
                      {errors.phone && (
                        <p className="text-destructive mt-1" style={{ fontSize: 'var(--text-small)' }}>
                          {errors.phone}
                        </p>
                      )}
                    </div>

                    {/* Event Date */}
                    <div>
                      <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-label)', fontWeight: 'var(--font-weight-medium)' }}>
                        Event Date *
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                          type="date"
                          value={eventDetails.eventDate}
                          onChange={(e) => setEventDetails({ ...eventDetails, eventDate: e.target.value })}
                          className={`w-full pl-11 pr-4 py-2.5 bg-input-background border rounded-lg transition-colors ${errors.eventDate ? 'border-destructive' : 'border-border focus:border-primary'
                            }`}
                          min={new Date().toISOString().split('T')[0]}
                          style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-base)' }}
                        />
                      </div>
                      {errors.eventDate && (
                        <p className="text-destructive mt-1" style={{ fontSize: 'var(--text-small)' }}>
                          {errors.eventDate}
                        </p>
                      )}
                    </div>

                    {/* Guest Count */}
                    <div className="md:col-span-2">
                      <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-label)', fontWeight: 'var(--font-weight-medium)' }}>
                        Number of Guests *
                      </label>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                          type="number"
                          value={eventDetails.guestCount}
                          onChange={(e) => setEventDetails({ ...eventDetails, guestCount: e.target.value })}
                          className={`w-full pl-11 pr-4 py-2.5 bg-input-background border rounded-lg transition-colors ${errors.guestCount ? 'border-destructive' : 'border-border focus:border-primary'
                            }`}
                          placeholder="50"
                          min="1"
                          style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-base)' }}
                        />
                      </div>
                      {errors.guestCount && (
                        <p className="text-destructive mt-1" style={{ fontSize: 'var(--text-small)' }}>
                          {errors.guestCount}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Special Requests */}
                  <div>
                    <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-label)', fontWeight: 'var(--font-weight-medium)' }}>
                      Special Requests (Optional)
                    </label>
                    <textarea
                      value={eventDetails.specialRequests}
                      onChange={(e) => setEventDetails({ ...eventDetails, specialRequests: e.target.value })}
                      className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg transition-colors focus:border-primary resize-none"
                      placeholder="Any dietary restrictions, allergies, or special requirements..."
                      rows={4}
                      style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-base)' }}
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Menu Selection */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="mb-8">
                    <h3 className="text-foreground mb-2" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
                      Choose your menu items
                    </h3>
                    <p className="text-muted-foreground" style={{ fontSize: 'var(--text-base)' }}>
                      Select from our curated offerings - from appetizers to desserts.
                    </p>
                  </div>

                  {categories.map((category) => {
                    const categoryItems = menuItems.filter(item => item.category === category);
                    return (
                      <div key={category}>
                        <h4 className="text-foreground mb-4 pb-2 border-b border-border" style={{ fontSize: 'var(--text-h4)', fontWeight: 'var(--font-weight-semibold)' }}>
                          {category}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {categoryItems.map((item) => (
                            <button
                              key={item.id}
                              onClick={() => toggleMenuItem(item.id)}
                              className={`text-left p-4 rounded-lg border-2 transition-all ${selectedItems.includes(item.id)
                                  ? 'border-primary bg-primary/5'
                                  : 'border-border bg-card hover:border-primary/50 hover:bg-accent'
                                }`}
                              style={{ borderRadius: 'var(--radius)' }}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <h5 className="text-foreground mb-1" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>
                                    {item.name}
                                  </h5>
                                  <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                                    {item.description}
                                  </p>
                                </div>
                                <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 ${selectedItems.includes(item.id)
                                    ? 'bg-primary text-primary-foreground'
                                    : 'border-2 border-border'
                                  }`}>
                                  {selectedItems.includes(item.id) && <Check className="w-3 h-3" />}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  {selectedItems.length === 0 && (
                    <div className="text-center py-8 bg-muted/30 rounded-lg" style={{ borderRadius: 'var(--radius)' }}>
                      <p className="text-muted-foreground" style={{ fontSize: 'var(--text-base)' }}>
                        No items selected yet. Choose at least one item to continue.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Review & Submit */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="mb-8">
                    <h3 className="text-foreground mb-2" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
                      Review your request
                    </h3>
                    <p className="text-muted-foreground" style={{ fontSize: 'var(--text-base)' }}>
                      We'll contact you to review your request and confirm availability.
                    </p>
                  </div>

                  {/* Event Details Summary */}
                  <div className="bg-muted/30 rounded-lg p-6" style={{ borderRadius: 'var(--radius)' }}>
                    <h4 className="text-foreground mb-4" style={{ fontSize: 'var(--text-h4)', fontWeight: 'var(--font-weight-semibold)' }}>
                      Event Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-muted-foreground mb-1" style={{ fontSize: 'var(--text-small)' }}>Full Name</p>
                        <p className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                          {eventDetails.fullName}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1" style={{ fontSize: 'var(--text-small)' }}>Email</p>
                        <p className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                          {eventDetails.email}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1" style={{ fontSize: 'var(--text-small)' }}>Phone</p>
                        <p className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                          {eventDetails.phone}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1" style={{ fontSize: 'var(--text-small)' }}>Event Date</p>
                        <p className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                          {new Date(eventDetails.eventDate).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1" style={{ fontSize: 'var(--text-small)' }}>Number of Guests</p>
                        <p className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                          {eventDetails.guestCount} guests
                        </p>
                      </div>
                      {eventDetails.specialRequests && (
                        <div className="md:col-span-2">
                          <p className="text-muted-foreground mb-1" style={{ fontSize: 'var(--text-small)' }}>Special Requests</p>
                          <p className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                            {eventDetails.specialRequests}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Menu Selection Summary */}
                  <div className="bg-muted/30 rounded-lg p-6" style={{ borderRadius: 'var(--radius)' }}>
                    <h4 className="text-foreground mb-4" style={{ fontSize: 'var(--text-h4)', fontWeight: 'var(--font-weight-semibold)' }}>
                      Selected Menu Items ({selectedItems.length})
                    </h4>
                    {categories.map((category) => {
                      const categoryItems = getSelectedItemsByCategory(category);
                      if (categoryItems.length === 0) return null;

                      return (
                        <div key={category} className="mb-4 last:mb-0">
                          <h5 className="text-foreground mb-2" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>
                            {category}
                          </h5>
                          <ul className="space-y-2">
                            {categoryItems.map((item) => (
                              <li key={item.id} className="flex items-start gap-2">
                                <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                                <div>
                                  <p className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                                    {item.name}
                                  </p>
                                  <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                                    {item.description}
                                  </p>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-border gap-3">
                {currentStep > 1 && (
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    icon={ChevronLeft}
                    iconPosition="left"
                  >
                    Back
                  </Button>
                )}

                <div className="flex items-center gap-3 ml-auto">
                  {currentStep === 2 && selectedItems.length > 0 && (
                    <Button
                      variant="outline"
                      onClick={() => setShowPreview(true)}
                      icon={Eye}
                      iconPosition="left"
                    >
                      Preview
                    </Button>
                  )}

                  {currentStep < 3 && (
                    <Button
                      variant="primary"
                      onClick={handleNext}
                      icon={ChevronRight}
                      iconPosition="right"
                      disabled={currentStep === 2 && selectedItems.length === 0}
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
                    >
                      Submit Request
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-secondary/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowPreview(false)}>
          <div className="bg-card rounded-lg border border-border max-w-3xl w-full max-h-[80vh] overflow-y-auto" style={{ borderRadius: 'var(--radius-card)' }} onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between" style={{ borderRadius: 'var(--radius-card) var(--radius-card) 0 0' }}>
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-primary" />
                <h3 className="text-foreground" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
                  Menu Preview
                </h3>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-accent rounded-lg"
                style={{ borderRadius: 'var(--radius)' }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Selected Items Count */}
              <div className="text-center py-4 bg-primary/10 rounded-lg" style={{ borderRadius: 'var(--radius)' }}>
                <p className="text-primary" style={{ fontSize: 'var(--text-h2)', fontWeight: 'var(--font-weight-semibold)' }}>
                  {selectedItems.length}
                </p>
                <p className="text-muted-foreground mt-1" style={{ fontSize: 'var(--text-base)' }}>
                  Item{selectedItems.length !== 1 ? 's' : ''} Selected
                </p>
              </div>

              {/* Selected Items by Category */}
              {categories.map((category) => {
                const categoryItems = getSelectedItemsByCategory(category);
                if (categoryItems.length === 0) return null;

                return (
                  <div key={category} className="border-b border-border pb-6 last:border-0 last:pb-0">
                    <h4 className="text-foreground mb-4 flex items-center gap-2" style={{ fontSize: 'var(--text-h4)', fontWeight: 'var(--font-weight-semibold)' }}>
                      <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center" style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-semibold)' }}>
                        {categoryItems.length}
                      </span>
                      {category}
                    </h4>
                    <div className="space-y-3">
                      {categoryItems.map((item) => (
                        <div key={item.id} className="bg-muted/30 rounded-lg p-4" style={{ borderRadius: 'var(--radius)' }}>
                          <div className="flex items-start gap-3">
                            <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-foreground mb-1" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>
                                {item.name}
                              </p>
                              <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                                {item.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Edit Note */}
              <div className="bg-accent rounded-lg p-4 flex items-start gap-3" style={{ borderRadius: 'var(--radius)' }}>
                <Edit2 className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                  You can continue selecting items after closing this preview. Click "Continue" when you're ready to proceed to the review step.
                </p>
              </div>
            </div>

            <div className="sticky bottom-0 bg-card border-t border-border px-6 py-4" style={{ borderRadius: '0 0 var(--radius-card) var(--radius-card)' }}>
              <Button
                variant="primary"
                onClick={() => setShowPreview(false)}
                fullWidth
              >
                Close Preview
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
