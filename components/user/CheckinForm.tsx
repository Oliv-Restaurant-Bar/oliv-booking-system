'use client';

import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, Loader2, ChevronLeft, Calendar, Users, Utensils, MessageSquare, ClipboardCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from './Button';

// --- TYPES ---
interface BookingData {
  id: string;
  customer: {
    name: string;
  };
  event: {
    date: string;
  };
  guests: number;
}

type Step = 'MAIN' | 'CONFIRM_SPLIT' | 'CHANGE_OPTIONS' | 'GUEST_COUNT' | 'MENU_CHANGES' | 'ADDITIONAL_DETAILS' | 'REVIEW' | 'SUCCESS';

const ProgressBar = ({ currentStep, totalSteps }: { currentStep: number, totalSteps: number }) => (
  <div className="w-full h-1.5 bg-muted rounded-full mb-8 overflow-hidden">
    <motion.div
      className="h-full bg-primary"
      initial={{ width: 0 }}
      animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
      transition={{ duration: 0.5 }}
    />
  </div>
);

export function CheckinForm({ bookingId, initialBooking }: { bookingId: string, initialBooking: BookingData }) {
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step>('MAIN');
  const [history, setHistory] = useState<Step[]>([]);
  const [formData, setFormData] = useState<{
    has_changes: boolean;
    guest_count_changed: boolean;
    new_guest_count: number | '';
    vegetarian_count: number | '';
    vegan_count: number | '';
    non_vegetarian_count: number | '';
    menu_changes: string;
    additional_details: string;
  }>({
    has_changes: false,
    guest_count_changed: false,
    new_guest_count: initialBooking.guests,
    vegetarian_count: 0,
    vegan_count: 0,
    non_vegetarian_count: initialBooking.guests,
    menu_changes: '',
    additional_details: '',
  });

  // Navigation Logic
  const goToStep = (nextStep: Step) => {
    setHistory([...history, currentStep]);
    setCurrentStep(nextStep);
  };

  const goBack = () => {
    const newHistory = [...history];
    const prevStep = newHistory.pop();
    if (prevStep) {
      setHistory(newHistory);
      setCurrentStep(prevStep);
    }
  };

  const currentStepNumber = () => {
    const steps: Step[] = ['MAIN', 'CONFIRM_SPLIT', 'CHANGE_OPTIONS', 'GUEST_COUNT', 'MENU_CHANGES', 'ADDITIONAL_DETAILS', 'REVIEW'];
    return steps.indexOf(currentStep) + 1;
  };

  // Validation
  // Validation helper to treat empty string as zero
  const getNum = (val: number | '') => (val === '' ? 0 : val);

  const isSplitValid = getNum(formData.vegetarian_count) + getNum(formData.vegan_count) + getNum(formData.non_vegetarian_count) === (formData.has_changes ? getNum(formData.new_guest_count) : initialBooking.guests);

  // Branching Logic for "Has Changes"
  const getNextChangeStep = (current: Step) => {
    if (current === 'GUEST_COUNT') return 'MENU_CHANGES';
    if (current === 'MENU_CHANGES') return 'ADDITIONAL_DETAILS';
    if (current === 'ADDITIONAL_DETAILS') return 'REVIEW';
    return 'REVIEW';
  };

  // Handlers
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        booking_id: bookingId,
        submitted_at: new Date().toISOString(),
        has_changes: formData.has_changes,
        guest_count_changed: formData.has_changes,
        new_guest_count: formData.has_changes ? getNum(formData.new_guest_count) : initialBooking.guests,
        vegetarian_count: getNum(formData.vegetarian_count),
        vegan_count: getNum(formData.vegan_count),
        non_vegetarian_count: getNum(formData.non_vegetarian_count),
        menu_changes: formData.menu_changes.trim() || null,
        additional_details: formData.additional_details.trim() || null,
      };

      const response = await fetch(`/api/bookings/${bookingId}/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to submit');
      setCurrentStep('SUCCESS');
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <ProgressBar currentStep={currentStep === 'SUCCESS' ? 7 : currentStepNumber()} totalSteps={7} />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {/* STEP 1: MAIN */}
          {currentStep === 'MAIN' && (
            <div className="bg-card rounded-[var(--radius-card)] shadow-sm border border-border/50 p-6 sm:p-8 w-full max-w-md mx-auto">
              <div className="mb-6 pb-6 border-b border-border/50">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground font-bold mb-3">
                  <ClipboardCheck className="w-4 h-4 text-primary" />
                  Booking Summary
                </div>
                <p className="text-foreground font-semibold text-lg">{initialBooking.customer.name}</p>
                <div className="flex justify-between text-sm text-muted-foreground mt-2 bg-muted/30 p-3 rounded-lg">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    <span>{initialBooking.event.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    <span>{initialBooking.guests} Guests</span>
                  </div>
                </div>
              </div>

              <h2 className="text-xl font-semibold text-foreground mb-8 leading-tight">Do you have any changes to your event?</h2>

              <div className="space-y-4">
                <Button
                  onClick={() => {
                    setFormData({ ...formData, has_changes: true });
                    goToStep('GUEST_COUNT');
                  }}
                  variant="outline"
                  fullWidth
                  size="md"
                >
                  Yes, I have changes
                </Button>
                <Button
                  onClick={() => {
                    setFormData({ ...formData, has_changes: false });
                    goToStep('CONFIRM_SPLIT');
                  }}
                  variant="primary"
                  fullWidth
                  size="md"
                >
                  No, everything is confirmed
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2A: CONFIRM SPLIT */}
          {currentStep === 'CONFIRM_SPLIT' && (
            <div className="bg-card rounded-[var(--radius-card)] shadow-sm border border-border/50 p-6 sm:p-8 w-full max-w-md mx-auto">
              <h2 className="text-xl font-semibold text-foreground mb-2">Great!</h2>
              <p className="text-muted-foreground mb-8">Please confirm your guest split:</p>

              <div className="space-y-5">
                {[
                  { label: 'Vegetarian guests', key: 'vegetarian_count' as const },
                  { label: 'Vegan guests', key: 'vegan_count' as const },
                  { label: 'Non-vegetarian guests', key: 'non_vegetarian_count' as const }
                ].map((input) => (
                  <div key={input.key} className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">{input.label}</label>
                    <input
                      type="number"
                      min={0}
                      value={formData[input.key]}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData({ ...formData, [input.key]: val === '' ? '' : parseInt(val) || 0 });
                      }}
                      className="w-full px-4 py-3 rounded-[var(--radius-button)] border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  </div>
                ))}

                <div className={`p-4 rounded-lg flex items-center justify-between border ${isSplitValid ? 'bg-primary/5 border-primary/20 text-primary-foreground' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
                  <span className="text-sm font-medium">Total guests: {initialBooking.guests}</span>
                  <span className="text-sm font-bold">Sum: {getNum(formData.vegetarian_count) + getNum(formData.vegan_count) + getNum(formData.non_vegetarian_count)}</span>
                </div>

                {!isSplitValid && (
                  <p className="text-destructive text-xs text-center flex items-center justify-center gap-1 animate-pulse">
                    <AlertCircle className="w-3 h-3" /> Sum must equal {initialBooking.guests}
                  </p>
                )}

                <div className="flex gap-3 pt-4">
                  <Button onClick={goBack} variant="outline" fullWidth size="md">Back</Button>
                  <Button
                    onClick={() => goToStep('REVIEW')}
                    disabled={!isSplitValid}
                    variant="primary"
                    fullWidth
                    size="md"
                  >
                    Continue
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3B-1: GUEST COUNT */}
          {currentStep === 'GUEST_COUNT' && (
            <div className="bg-card rounded-[var(--radius-card)] shadow-sm border border-border/50 p-6 sm:p-8 w-full max-w-md mx-auto">
              <h2 className="text-xl font-semibold text-foreground mb-8">What is your updated guest count?</h2>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">New total guest count</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.new_guest_count}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData({ ...formData, new_guest_count: val === '' ? '' : parseInt(val) || 0 });
                    }}
                    className="w-full px-4 py-3 rounded-[var(--radius-button)] border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Veg', key: 'vegetarian_count' as const },
                    { label: 'Vegan', key: 'vegan_count' as const },
                    { label: 'Non-Veg', key: 'non_vegetarian_count' as const }
                  ].map((input) => (
                    <div key={input.key} className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground uppercase">{input.label}</label>
                      <input
                        type="number"
                        min={0}
                        value={formData[input.key]}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData({ ...formData, [input.key]: val === '' ? '' : parseInt(val) || 0 });
                        }}
                        className="w-full px-3 py-3 rounded-[var(--radius-button)] border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      />
                    </div>
                  ))}
                </div>

                <div className={`p-4 rounded-lg flex items-center justify-between border ${isSplitValid ? 'bg-primary/5 border-primary/20 text-primary-foreground' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
                  <span className="text-sm font-medium">New Total: {formData.new_guest_count}</span>
                  <span className="text-sm font-bold">Sum: {getNum(formData.vegetarian_count) + getNum(formData.vegan_count) + getNum(formData.non_vegetarian_count)}</span>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button onClick={goBack} variant="outline" fullWidth size="md">Back</Button>
                  <Button
                    onClick={() => goToStep(getNextChangeStep('GUEST_COUNT'))}
                    disabled={!isSplitValid || getNum(formData.new_guest_count) <= 0}
                    variant="primary"
                    fullWidth
                    size="md"
                  >
                    Continue
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3B-2: MENU CHANGES */}
          {currentStep === 'MENU_CHANGES' && (
            <div className="bg-card rounded-[var(--radius-card)] shadow-sm border border-border/50 p-6 sm:p-8 w-full max-w-md mx-auto">
              <div className="flex items-center gap-2 mb-4">
                <Utensils className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">Menu changes</h2>
              </div>

              <div className="space-y-4">
                <textarea
                  value={formData.menu_changes}
                  onChange={(e) => setFormData({ ...formData, menu_changes: e.target.value.substring(0, 1000) })}
                  placeholder="e.g. Remove the Raclette Combo, add 10x Chocolate Fondue, replace wine with soft drinks..."
                  className="w-full h-40 px-4 py-3 rounded-[var(--radius-button)] border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none resize-none transition-all placeholder:text-muted-foreground/50"
                />
                <div className="flex justify-end">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">{formData.menu_changes.length}/1000</span>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button onClick={goBack} variant="outline" fullWidth size="md">Back</Button>
                  <Button
                    onClick={() => goToStep(getNextChangeStep('MENU_CHANGES'))}
                    variant="primary"
                    fullWidth
                    size="md"
                  >
                    Continue
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3B-3: ADDITIONAL DETAILS */}
          {currentStep === 'ADDITIONAL_DETAILS' && (
            <div className="bg-card rounded-[var(--radius-card)] shadow-sm border border-border/50 p-6 sm:p-8 w-full max-w-md mx-auto">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">Special requests</h2>
              </div>

              <div className="space-y-4">
                <textarea
                  value={formData.additional_details}
                  onChange={(e) => setFormData({ ...formData, additional_details: e.target.value.substring(0, 1000) })}
                  placeholder="e.g. Allergy updates, seating preferences, decoration requests, timing changes..."
                  className="w-full h-40 px-4 py-3 rounded-[var(--radius-button)] border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none resize-none transition-all placeholder:text-muted-foreground/50"
                />
                <div className="flex justify-end">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">{formData.additional_details.length}/1000</span>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button onClick={goBack} variant="outline" fullWidth size="md">Back</Button>
                  <Button
                    onClick={() => goToStep(getNextChangeStep('ADDITIONAL_DETAILS'))}
                    variant="primary"
                    fullWidth
                    size="md"
                  >
                    Continue
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* FINAL STEP: REVIEW */}
          {currentStep === 'REVIEW' && (
            <div className="bg-card rounded-[var(--radius-card)] shadow-sm border border-border/50 p-6 sm:p-8 w-full max-w-md mx-auto">
              <h2 className="text-xl font-semibold text-foreground mb-6">Review & Submit</h2>

              <div className="space-y-4 mb-8">
                <div className="p-5 bg-muted/30 border border-border/50 rounded-xl space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground font-medium">Status</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${formData.has_changes ? 'bg-amber-100 text-amber-700' : 'bg-primary/10 text-primary-foreground'}`}>
                      {formData.has_changes ? 'Has Changes' : 'Confirmed'}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 border-t border-border/50 pt-3">
                    <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Guest Split</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {[
                        { label: 'Veg', val: getNum(formData.vegetarian_count), color: 'bg-green-100 text-green-700' },
                        { label: 'Vegan', val: getNum(formData.vegan_count), color: 'bg-emerald-100 text-emerald-700' },
                        { label: 'Non-Veg', val: getNum(formData.non_vegetarian_count), color: 'bg-blue-100 text-blue-700' }
                      ].filter(x => x.val > 0 || !formData.has_changes).map(item => (
                        <span key={item.label} className={`px-2.5 py-1 rounded-md text-xs font-semibold ${item.color}`}>
                          {item.val} {item.label}
                        </span>
                      ))}
                    </div>
                  </div>

                  {formData.menu_changes.trim() && (
                    <div className="space-y-1.5 border-t border-border/50 pt-3">
                      <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Menu Changes</span>
                      <p className="text-sm text-foreground italic leading-relaxed">"{formData.menu_changes}"</p>
                    </div>
                  )}

                  {formData.additional_details.trim() && (
                    <div className="space-y-1.5 border-t border-border/50 pt-3">
                      <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Additional Details</span>
                      <p className="text-sm text-foreground italic leading-relaxed">"{formData.additional_details}"</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <Button onClick={goBack} variant="outline" fullWidth size="md">Edit</Button>
                </div>
                <div className="flex-[1.8]">
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting}
                    variant="primary"
                    fullWidth
                    size="md"
                    isLoading={submitting}
                    className="whitespace-nowrap px-4"
                  >
                    Submit Confirmation
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* SUCCESS SCREEN */}
          {currentStep === 'SUCCESS' && (
            <div className="bg-card rounded-[var(--radius-card)] shadow-sm border border-border/50 p-6 sm:p-8 w-full max-w-md mx-auto">
              <div className="text-center space-y-6 py-8">
                <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-2 transition-transform duration-300 shadow-sm border border-primary/20">
                  <CheckCircle2 className="w-12 h-12 text-primary" />
                </div>
                <div className="space-y-2">
                  <h1 className="text-2xl font-bold text-foreground">Thank you, {initialBooking.customer.name}!</h1>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Your event confirmation has been received. Our team will review your updates and get back to you within 24 hours.
                  </p>
                </div>
                <div className="pt-6">
                  <Button onClick={() => window.location.href = "/"} variant="primary" fullWidth size="md">
                    Return Home
                  </Button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
