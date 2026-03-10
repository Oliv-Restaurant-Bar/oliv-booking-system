'use client';

import { useState, useEffect } from 'react';
import { MapPin, X, Check, Loader2 } from 'lucide-react';
import type { Venue } from '@/services/venue.service';
import { toast } from 'sonner';
import { ValidatedInput } from '@/components/ui/validated-input';
import { ValidatedTextarea } from '@/components/ui/validated-textarea';
import { venueNameSchema, venueDescriptionSchema } from '@/lib/validation/schemas';

interface VenueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (venue: { name: string; description: string }) => Promise<void>;
  venue?: Venue | null;
  isLoading?: boolean;
}

export function VenueModal({
  isOpen,
  onClose,
  onSave,
  venue,
  isLoading = false,
}: VenueModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState<{
    name?: string;
    description?: string;
  }>({});

  // Reset form when modal opens or venue changes
  useEffect(() => {
    if (isOpen) {
      if (venue) {
        setName(venue.name);
        setDescription(venue.description || '');
      } else {
        setName('');
        setDescription('');
      }
      setErrors({});
    }
  }, [isOpen, venue]);

  // Validate form fields
  const validateForm = () => {
    const newErrors: typeof errors = {};

    // Validate name
    const nameResult = venueNameSchema.safeParse(name);
    if (!nameResult.success) {
      newErrors.name = nameResult.error.errors[0].message;
    }

    // Validate description (optional, but validate if provided)
    if (description) {
      const descResult = venueDescriptionSchema.safeParse(description);
      if (!descResult.success) {
        newErrors.description = descResult.error.errors[0].message;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      await onSave({ name: name.trim(), description: description.trim() });
      toast.success(venue ? 'Venue updated successfully' : 'Venue added successfully');
      // Reset form on success
      setName('');
      setDescription('');
      setErrors({});
    } catch (error) {
      console.error('Error saving venue:', error);
      toast.error('Failed to save venue');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
        onClick={handleBackdropClick}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-foreground" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
                {venue ? 'Edit Venue' : 'Add New Venue'}
              </h3>
            </div>
            <button
              onClick={onClose}
              disabled={isSaving || isLoading}
              className="p-2 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            <ValidatedInput
              label="Venue Name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors({ ...errors, name: undefined });
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="e.g., Main Hall, Garden Terrace"
              maxLength={100}
              showCharacterCount
              error={errors.name}
              required
              disabled={isSaving || isLoading}
              autoFocus
            />

            <ValidatedTextarea
              label="Description"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) setErrors({ ...errors, description: undefined });
              }}
              placeholder="Describe this venue location..."
              rows={3}
              maxLength={500}
              showCharacterCount
              error={errors.description}
              helperText="Optional: Add details about capacity, ambiance, or features"
              disabled={isSaving || isLoading}
            />
          </div>

          {/* Footer */}
          <div className="border-t border-border px-6 py-4 bg-muted/20 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              disabled={isSaving || isLoading}
              className="px-4 py-2 bg-background border border-border text-foreground rounded-lg hover:bg-accent transition-colors flex items-center gap-2 disabled:opacity-50"
              style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!name.trim() || isSaving || isLoading}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  {venue ? 'Update' : 'Add'} Venue
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
