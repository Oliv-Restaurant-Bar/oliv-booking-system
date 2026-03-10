'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Calendar, Clock, Users, FileText, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/user/Button';
import { SkeletonForm } from '@/components/ui/skeleton-loaders';
import { ValidatedTextarea } from '@/components/ui/validated-textarea';
import { bookingAllergiesSchema, bookingSpecialRequestsSchema, bookingGuestCountSchema } from '@/lib/validation/schemas';

interface BookingData {
  id: string;
  eventDate: string;
  eventTime: string;
  guestCount: number;
  allergyDetails?: string[];
  specialRequests?: string;
  isLocked: boolean;
}

interface ApiResponse {
  success: boolean;
  data?: BookingData;
  error?: string;
  locked?: boolean;
}

export function ClientBookingEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const secret = params.secret as string;

  const [booking, setBooking] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [formData, setFormData] = useState({
    eventDate: '',
    eventTime: '',
    guestCount: 0,
    allergyDetails: [] as string[],
    specialRequests: '',
  });

  // Validation errors
  const [errors, setErrors] = useState<{
    allergyDetails?: string;
    specialRequests?: string;
  }>({});

  // Contact info for locked bookings
  const contactEmail = 'info@oliv-restaurant.ch';
  const contactPhone = '+41 44 123 45 67';

  useEffect(() => {
    fetchBooking();
  }, [id, secret]);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/booking/${id}/edit/${secret}`);

      if (!response.ok) {
        if (response.status === 403) {
          const data: ApiResponse = await response.json();
          if (data.locked) {
            setError('booking_locked');
          } else {
            setError('invalid_link');
          }
        } else {
          setError('fetch_failed');
        }
        return;
      }

      const result: ApiResponse = await response.json();

      if (!result.success || !result.data) {
        setError('not_found');
        return;
      }

      setBooking(result.data);
      setFormData({
        eventDate: result.data.eventDate ? result.data.eventDate.split('T')[0] : '',
        eventTime: result.data.eventTime || '',
        guestCount: result.data.guestCount || 0,
        allergyDetails: result.data.allergyDetails || [],
        specialRequests: result.data.specialRequests || '',
      });
    } catch (err) {
      console.error('Error fetching booking:', err);
      setError('fetch_failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking) return;

    // Validate form
    const newErrors: typeof errors = {};

    // Validate allergies
    const allergiesString = formData.allergyDetails.join(', ');
    if (allergiesString) {
      const allergiesResult = bookingAllergiesSchema.safeParse(allergiesString);
      if (!allergiesResult.success) {
        newErrors.allergyDetails = allergiesResult.error.errors[0].message;
      }
    }

    // Validate special requests
    if (formData.specialRequests) {
      const specialRequestsResult = bookingSpecialRequestsSchema.safeParse(formData.specialRequests);
      if (!specialRequestsResult.success) {
        newErrors.specialRequests = specialRequestsResult.error.errors[0].message;
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    setSaveSuccess(false);

    try {
      const response = await fetch(`/api/booking/${id}/edit/${secret}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result: ApiResponse = await response.json();

      if (!response.ok || !result.success) {
        if (result.locked) {
          setError('booking_locked');
          setBooking({ ...booking, isLocked: true });
        } else {
          setError('update_failed');
        }
        return;
      }

      setSaveSuccess(true);
      setBooking(result.data || booking);
      setErrors({});

      // Clear success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error updating booking:', err);
      setError('update_failed');
    } finally {
      setSaving(false);
    }
  };

  const handleGuestCountChange = (delta: number) => {
    const newValue = Math.max(1, formData.guestCount + delta);
    setFormData(prev => ({ ...prev, guestCount: newValue }));
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Error states
  if (error === 'invalid_link') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-md w-full bg-card border border-border rounded-lg p-8 text-center">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Invalid Link</h1>
          <p className="text-muted-foreground mb-6">
            This edit link is invalid or has expired. Please contact us if you need to make changes to your booking.
          </p>
          <Button href="/">Return to Homepage</Button>
        </div>
      </div>
    );
  }

  if (error === 'not_found' || error === 'fetch_failed') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-md w-full bg-card border border-border rounded-lg p-8 text-center">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Booking Not Found</h1>
          <p className="text-muted-foreground mb-6">
            We couldn't find your booking. Please contact us for assistance.
          </p>
          <Button href="/">Return to Homepage</Button>
        </div>
      </div>
    );
  }

  // Locked booking state
  if (booking?.isLocked || error === 'booking_locked') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-md w-full bg-card border border-border rounded-lg p-8 text-center">
          <Lock className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Booking Locked</h1>
          <p className="text-muted-foreground mb-6">
            This booking has been locked and cannot be edited online. This usually happens close to the event date to ensure everything is properly prepared.
          </p>
          <div className="bg-muted rounded-lg p-4 mb-6 text-left">
            <p className="text-sm font-medium text-foreground mb-2">Need to make changes?</p>
            <p className="text-sm text-muted-foreground mb-1">
              <strong>Email:</strong>{' '}
              <a href={`mailto:${contactEmail}`} className="text-primary hover:underline">
                {contactEmail}
              </a>
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Phone:</strong>{' '}
              <a href={`tel:${contactPhone}`} className="text-primary hover:underline">
                {contactPhone}
              </a>
            </p>
          </div>
          <Button href="/">Return to Homepage</Button>
        </div>
      </div>
    );
  }

  if (!booking) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Edit Your Booking</h1>
          <p className="text-muted-foreground">
            Make changes to your event details below
          </p>
        </div>

        {/* Success Message */}
        {saveSuccess && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
            <p className="text-green-800 dark:text-green-200">Your booking has been updated successfully!</p>
          </div>
        )}

        {/* Error Message */}
        {error === 'update_failed' && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
            <p className="text-destructive">Failed to update booking. Please try again or contact us.</p>
          </div>
        )}

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date */}
          <div className="bg-card border border-border rounded-lg p-6">
            <label className="flex items-center gap-2 text-foreground font-medium mb-3">
              <Calendar className="w-5 h-5 text-primary" />
              Event Date
            </label>
            <input
              type="date"
              value={formData.eventDate}
              onChange={(e) => setFormData(prev => ({ ...prev, eventDate: e.target.value }))}
              className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          {/* Time */}
          <div className="bg-card border border-border rounded-lg p-6">
            <label className="flex items-center gap-2 text-foreground font-medium mb-3">
              <Clock className="w-5 h-5 text-primary" />
              Event Time
            </label>
            <input
              type="time"
              value={formData.eventTime}
              onChange={(e) => setFormData(prev => ({ ...prev, eventTime: e.target.value }))}
              className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          {/* Guest Count */}
          <div className="bg-card border border-border rounded-lg p-6">
            <label className="flex items-center gap-2 text-foreground font-medium mb-3">
              <Users className="w-5 h-5 text-primary" />
              Number of Guests
            </label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => handleGuestCountChange(-1)}
                className="w-12 h-12 flex items-center justify-center bg-secondary text-secondary-foreground rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                -
              </button>
              <span className="flex-1 text-center text-2xl font-semibold text-foreground">
                {formData.guestCount}
              </span>
              <button
                type="button"
                onClick={() => handleGuestCountChange(1)}
                className="w-12 h-12 flex items-center justify-center bg-secondary text-secondary-foreground rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Allergies/Dietary Requirements */}
          <div className="bg-card border border-border rounded-lg p-6">
            <ValidatedTextarea
              label="Allergies & Dietary Requirements"
              value={formData.allergyDetails.join(', ')}
              onChange={(e) => {
                setFormData(prev => ({
                  ...prev,
                  allergyDetails: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                }));
                if (errors.allergyDetails) setErrors({ ...errors, allergyDetails: undefined });
              }}
              placeholder="Please list any allergies or dietary requirements (e.g., vegetarian, gluten-free, nut allergy)"
              rows={4}
              maxLength={500}
              showCharacterCount
              error={errors.allergyDetails}
              helperText="Optional: Separate multiple items with commas"
            />
          </div>

          {/* Special Requests */}
          <div className="bg-card border border-border rounded-lg p-6">
            <ValidatedTextarea
              label="Special Requests"
              value={formData.specialRequests}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, specialRequests: e.target.value }));
                if (errors.specialRequests) setErrors({ ...errors, specialRequests: undefined });
              }}
              placeholder="Any special requests for your event (e.g., window seat, birthday celebration)"
              rows={4}
              maxLength={1000}
              showCharacterCount
              error={errors.specialRequests}
              helperText="Optional"
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={saving}
              className="flex-1"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => router.push('/')}
              disabled={saving}
            >
              Cancel
            </Button>
          </div>
        </form>

        {/* Help Text */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Need help? Contact us at{' '}
            <a href={`mailto:${contactEmail}`} className="text-primary hover:underline">
              {contactEmail}
            </a>
            {' '}or{' '}
            <a href={`tel:${contactPhone}`} className="text-primary hover:underline">
              {contactPhone}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
