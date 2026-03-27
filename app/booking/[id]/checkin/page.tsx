'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { CheckCircle2, AlertCircle, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

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

// --- STYLES ---
const COLORS = {
  background: '#f0ede6',
  surface: '#ffffff',
  primary: '#3d4a2e',
  text: '#1a1a1a',
  mutedText: '#666666',
  border: '#e0e0e0',
  error: '#ef4444',
};

// --- COMPONENTS ---
const Card = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white rounded-[12px] shadow-sm p-6 sm:p-8 w-full max-w-md mx-auto ${className}`}>
    {children}
  </div>
);

const ProgressBar = ({ currentStep, totalSteps }: { currentStep: number, totalSteps: number }) => (
  <div className="w-full h-1 bg-gray-200 rounded-full mb-8 overflow-hidden">
    <motion.div
      className="h-full bg-[#3d4a2e]"
      initial={{ width: 0 }}
      animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
      transition={{ duration: 0.5 }}
    />
  </div>
);

const Button = ({
  children,
  onClick,
  disabled,
  variant = 'primary',
  className = ""
}: {
  children: React.ReactNode,
  onClick?: () => void,
  disabled?: boolean,
  variant?: 'primary' | 'secondary' | 'outline',
  className?: string
}) => {
  const baseStyles = "px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-[#3d4a2e] text-white hover:bg-[#2d3a1e] disabled:opacity-50 disabled:cursor-not-allowed",
    secondary: "bg-gray-100 text-gray-800 hover:bg-gray-200",
    outline: "border border-[#3d4a2e] text-[#3d4a2e] hover:bg-[#3d4a2e]/5"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export default function EventCheckinPage() {
  const params = useParams();
  const bookingId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState<BookingData | null>(null);

  // Form State
  const [currentStep, setCurrentStep] = useState<Step>('MAIN');
  const [history, setHistory] = useState<Step[]>([]);
  const [formData, setFormData] = useState({
    has_changes: false,
    guest_count_changed: false,
    new_guest_count: 0,
    vegetarian_count: 0,
    non_vegetarian_count: 0,
    menu_changes: '',
    additional_details: '',
  });


  // Fetch Booking Data
  useEffect(() => {
    if (!bookingId) return;

    const fetchBooking = async () => {
      try {
        const response = await fetch(`/api/bookings/${bookingId}`);
        if (!response.ok) throw new Error('Booking not found');
        const data = await response.json();
        setBooking(data);
        setFormData(prev => ({
          ...prev,
          new_guest_count: data.guests,
          vegetarian_count: Math.floor(data.guests / 2), // Reasonable start
          non_vegetarian_count: data.guests - Math.floor(data.guests / 2),
        }));
      } catch (err) {
        console.error(err);
        setError('Unable to load booking details. Please check the link or contact us.');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

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
  const isSplitValid = formData.vegetarian_count + formData.non_vegetarian_count === (formData.has_changes ? formData.new_guest_count : booking?.guests);


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
        guest_count_changed: formData.has_changes, // Assume changed if in changes flow
        new_guest_count: formData.has_changes ? formData.new_guest_count : booking?.guests,
        vegetarian_count: formData.vegetarian_count,
        non_vegetarian_count: formData.non_vegetarian_count,
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

  if (loading) return (
    <div className="min-h-screen bg-[#f0ede6] flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-[#3d4a2e]" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[#f0ede6] flex items-center justify-center p-4">
      <Card>
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h1 className="text-xl font-semibold">Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f0ede6] py-12 px-4 sm:px-6">
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
              <Card>
                <div className="mb-6 pb-6 border-b border-gray-100">
                  <p className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-2">Booking Summary</p>
                  <p className="text-[#3d4a2e] font-semibold">{booking?.customer.name}</p>
                  <div className="flex justify-between text-sm text-gray-600 mt-1">
                    <span>{booking?.event.date}</span>
                    <span>{booking?.guests} Guests</span>
                  </div>
                  {/* <p className="text-[10px] text-gray-400 mt-2">ID: {bookingId}</p> */}
                </div>

                <h2 className="text-xl font-semibold text-gray-900 mb-8">Do you have any changes to your event?</h2>

                <div className="space-y-4">
                  <Button
                    onClick={() => {
                      setFormData({ ...formData, has_changes: true });
                      goToStep('GUEST_COUNT');
                    }}
                    variant="outline"
                    className="w-full py-4"
                  >
                    Yes, I have changes
                  </Button>
                  <Button
                    onClick={() => {
                      setFormData({ ...formData, has_changes: false });
                      goToStep('CONFIRM_SPLIT');
                    }}
                    className="w-full py-4"
                  >
                    No, everything is confirmed
                  </Button>
                </div>
              </Card>
            )}

            {/* STEP 2A: CONFIRM SPLIT */}
            {currentStep === 'CONFIRM_SPLIT' && (
              <Card>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Great!</h2>
                <p className="text-gray-600 mb-8">Please confirm your guest split:</p>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Vegetarian guests</label>
                    <input
                      type="number"
                      value={formData.vegetarian_count}
                      onChange={(e) => setFormData({ ...formData, vegetarian_count: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#3d4a2e]/20 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Non-vegetarian guests</label>
                    <input
                      type="number"
                      value={formData.non_vegetarian_count}
                      onChange={(e) => setFormData({ ...formData, non_vegetarian_count: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#3d4a2e]/20 outline-none"
                    />
                  </div>

                  <div className={`p-4 rounded-lg flex items-center justify-between ${isSplitValid ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                    <span className="text-sm">Total guests: {booking?.guests}</span>
                    <span className="text-sm font-bold">Sum: {formData.vegetarian_count + formData.non_vegetarian_count}</span>
                  </div>

                  {!isSplitValid && (
                    <p className="text-red-500 text-xs text-center flex items-center justify-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Sum must equal {booking?.guests}
                    </p>
                  )}

                  <div className="flex gap-4 pt-4">
                    <Button onClick={goBack} variant="secondary" className="flex-1">Back</Button>
                    <Button
                      onClick={() => goToStep('REVIEW')}
                      disabled={!isSplitValid}
                      className="flex-1"
                    >
                      Continue
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* STEP 3B-1: GUEST COUNT */}
            {currentStep === 'GUEST_COUNT' && (
              <Card>
                <h2 className="text-xl font-semibold text-gray-900 mb-8">What is your updated guest count?</h2>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">New total guest count</label>
                    <input
                      type="number"
                      value={formData.new_guest_count}
                      onChange={(e) => setFormData({ ...formData, new_guest_count: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#3d4a2e]/20 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Vegetarian</label>
                      <input
                        type="number"
                        value={formData.vegetarian_count}
                        onChange={(e) => setFormData({ ...formData, vegetarian_count: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#3d4a2e]/20 outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Non-Veg</label>
                      <input
                        type="number"
                        value={formData.non_vegetarian_count}
                        onChange={(e) => setFormData({ ...formData, non_vegetarian_count: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#3d4a2e]/20 outline-none"
                      />
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg flex items-center justify-between ${isSplitValid ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                    <span className="text-sm">New Total: {formData.new_guest_count}</span>
                    <span className="text-sm font-bold">Sum: {formData.vegetarian_count + formData.non_vegetarian_count}</span>
                  </div>

                  <div className="flex gap-4">
                    <Button onClick={goBack} variant="secondary" className="flex-1">Back</Button>
                    <Button
                      onClick={() => goToStep(getNextChangeStep('GUEST_COUNT'))}
                      disabled={!isSplitValid || formData.new_guest_count <= 0}
                      className="flex-1"
                    >
                      Continue
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* STEP 3B-2: MENU CHANGES */}
            {currentStep === 'MENU_CHANGES' && (
              <Card>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Please describe your menu changes:</h2>

                <div className="space-y-4">
                  <textarea
                    value={formData.menu_changes}
                    onChange={(e) => setFormData({ ...formData, menu_changes: e.target.value.substring(0, 1000) })}
                    placeholder="e.g. Remove the Raclette Combo, add 10x Chocolate Fondue, replace wine with soft drinks..."
                    className="w-full h-40 px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#3d4a2e]/20 outline-none resize-none"
                  />
                  <div className="flex justify-end">
                    <span className="text-xs text-gray-400">{formData.menu_changes.length}/1000</span>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button onClick={goBack} variant="secondary" className="flex-1">Back</Button>
                    <Button
                      onClick={() => goToStep(getNextChangeStep('MENU_CHANGES'))}
                      className="flex-1"
                    >
                      Continue
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* STEP 3B-3: ADDITIONAL DETAILS */}
            {currentStep === 'ADDITIONAL_DETAILS' && (
              <Card>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Any additional details or special requests?</h2>

                <div className="space-y-4">
                  <textarea
                    value={formData.additional_details}
                    onChange={(e) => setFormData({ ...formData, additional_details: e.target.value.substring(0, 1000) })}
                    placeholder="e.g. Allergy updates, seating preferences, decoration requests, timing changes..."
                    className="w-full h-40 px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#3d4a2e]/20 outline-none resize-none"
                  />
                  <div className="flex justify-end">
                    <span className="text-xs text-gray-400">{formData.additional_details.length}/1000</span>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button onClick={goBack} variant="secondary" className="flex-1">Back</Button>
                    <Button
                      onClick={() => goToStep(getNextChangeStep('ADDITIONAL_DETAILS'))}
                      className="flex-1"
                    >
                      Continue
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* FINAL STEP: REVIEW */}
            {currentStep === 'REVIEW' && (
              <Card>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Review & Submit</h2>

                <div className="space-y-4 mb-8">
                  <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                    <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                      <span className="text-gray-500">Status</span>
                      <span className={`font-bold ${formData.has_changes ? 'text-amber-600' : 'text-green-600'}`}>
                        {formData.has_changes ? 'Has Changes' : 'Everything Confirmed'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                      <span className="text-gray-500">Guest Count</span>
                      <span className="font-bold">
                        {formData.has_changes ? formData.new_guest_count : booking?.guests} ({formData.vegetarian_count} Veg / {formData.non_vegetarian_count} Non-Veg)
                      </span>
                    </div>

                    {formData.menu_changes.trim() && (
                      <div className="space-y-1 border-b border-gray-100 pb-2">
                        <span className="text-xs text-gray-500 font-bold uppercase">Menu Changes</span>
                        <p className="text-sm text-gray-700 italic">"{formData.menu_changes}"</p>
                      </div>
                    )}

                    {formData.additional_details.trim() && (
                      <div className="space-y-1 pb-2">
                        <span className="text-xs text-gray-500 font-bold uppercase">Additional Details</span>
                        <p className="text-sm text-gray-700 italic">"{formData.additional_details}"</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button onClick={goBack} variant="secondary" className="flex-1">Edit</Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex-1"
                  >
                    {submitting ? 'Submitting...' : 'Submit Confirmation'}
                  </Button>
                </div>
              </Card>
            )}

            {/* SUCCESS SCREEN */}
            {currentStep === 'SUCCESS' && (
              <Card>
                <div className="text-center space-y-6 py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900">Thank you, {booking?.customer.name}!</h1>
                  <p className="text-gray-600">
                    Your updates have been received. Our team will review and confirm within 24 hours.
                  </p>
                  <div className="pt-4">
                    <Button onClick={() => window.location.href = "/"} variant="outline" className="w-full">
                      Done
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <style jsx global>{`
        body {
          background-color: #f0ede6;
        }
      `}</style>
    </div>
  );
}
