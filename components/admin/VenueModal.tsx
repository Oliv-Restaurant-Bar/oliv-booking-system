'use client';

import { useState, useEffect } from 'react';
import { MapPin, X, Check, Loader2 } from 'lucide-react';
import type { Venue } from '@/services/venue.service';

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
    }
  }, [isOpen, venue]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      alert('Please enter a venue name');
      return;
    }

    setIsSaving(true);
    try {
      await onSave({ name: name.trim(), description: description.trim() });
      // Reset form on success
      setName('');
      setDescription('');
    } catch (error) {
      console.error('Error saving venue:', error);
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
            {/* Name Field */}
            <div>
              <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-label)', fontWeight: 'var(--font-weight-medium)' }}>
                Venue Name <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="e.g., Main Hall, Garden Terrace"
                className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                style={{ fontSize: 'var(--text-base)' }}
                autoFocus
                disabled={isSaving || isLoading}
              />
            </div>

            {/* Description Field */}
            <div>
              <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-label)', fontWeight: 'var(--font-weight-medium)' }}>
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe this venue location..."
                rows={3}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                style={{ fontSize: 'var(--text-base)' }}
                disabled={isSaving || isLoading}
              />
              <p className="text-muted-foreground text-sm mt-1">
                Optional: Add details about capacity, ambiance, or features
              </p>
            </div>
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
