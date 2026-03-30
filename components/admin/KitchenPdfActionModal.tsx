'use client';

import { useState, useEffect } from 'react';
import { Mail, Download, Users, X, Loader2, CheckSquare, ChevronLeft, Send, MessageSquare, Save } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ValidatedTextarea } from '@/components/ui/validated-textarea';
import { cn } from '@/lib/utils';
import { jsPDF } from 'jspdf';
import { toast } from 'sonner';
import { toReadableDate, getSystemTimezoneSync } from '@/lib/utils/date';

interface KitchenPdfActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onActionComplete: (action: 'email' | 'download', data?: { emails?: string[]; notes?: string }) => void;
  booking: {
    id: string;
    customer: {
      name: string;
    };
    event: {
      date: string;
      time: string;
      occasion: string;
      location?: string;
    };
    guests: number;
    billingAddress?: string;
    menuItems?: Array<{
      item: string;
      category: string;
      quantity: string;
      price: string;
      notes?: string;
      customerComment?: string;
    }>;
    allergies?: string;
    notes?: string;
    kitchenNotes?: string;
  };
}

export function KitchenPdfActionModal({
  isOpen,
  onClose,
  onActionComplete,
  booking
}: KitchenPdfActionModalProps) {
  const tAdmin = useTranslations('admin.bookings');
  const tWizard = useTranslations('wizard');
  const [expandedSection, setExpandedSection] = useState<'email' | null>(null);
  const [externalEmails, setExternalEmails] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [kitchenNotes, setKitchenNotes] = useState(booking.kitchenNotes || '');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [hasUnsavedNotes, setHasUnsavedNotes] = useState(false);

  // Update notes if booking changes
  useEffect(() => {
    setKitchenNotes(booking.kitchenNotes || '');
    setHasUnsavedNotes(false);
  }, [booking.kitchenNotes]);

  const handleNotesChange = (value: string) => {
    setKitchenNotes(value);
    setHasUnsavedNotes(value !== (booking.kitchenNotes || ''));
  };

  const handleSaveNotes = async () => {
    if (!hasUnsavedNotes) return;
    setIsSavingNotes(true);
    try {
      const response = await fetch(`/api/bookings/${booking.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ kitchenNotes }),
      });

      if (!response.ok) throw new Error('Failed to save notes');

      setHasUnsavedNotes(false);
      toast.success(tAdmin('toast.saveSuccess'));
      window.location.reload();
    } catch (error) {
      console.error('Error saving kitchen notes:', error);
      toast.error(tAdmin('toast.saveFailed'));
    } finally {
      setIsSavingNotes(false);
    }
  };

  if (!isOpen) return null;

  // Use last 8 characters of UUID for a shorter ID
  const shortId = booking.id.slice(-8);
  const documentName = `Booking - ${booking.customer.name}`; // Format: Booking - Customer Name

  const toggleSection = (section: 'email') => {
    setExpandedSection(prev => prev === section ? null : section);
  };


  const generatePdf = async () => {
    const { generateBookingPdf } = await import('@/lib/utils/pdf-generator');

    return generateBookingPdf({
      id: booking.id,
      customerName: booking.customer.name,
      eventDate: booking.event.date,
      eventTime: booking.event.time,
      guestCount: booking.guests,
      occasion: booking.event.occasion,
      location: booking.event.location,
      billingAddress: booking.billingAddress,
      items: (booking.menuItems || []).map((item: any, idx: number) => {
        const qty = parseInt(item.quantity) || booking.guests;
        const uPrice = Number(item.unitPrice) || 0;
        return {
          id: `item-${idx}`,
          name: item.item,
          category: item.category,
          quantity: qty,
          unitPrice: uPrice,
          totalPrice: qty * uPrice,
          pricingType: item.pricingType || 'per_person',
          notes: item.notes,
          customerComment: item.customerComment,
          dietaryType: item.dietaryType || 'none',
        };
      }),
      allergies: booking.allergies,
      specialRequests: booking.notes,
      kitchenNotes: kitchenNotes // Use current local notes
    }, 'kitchen');
  };

  const handleDownload = async () => {
    setIsProcessing(true);
    try {
      const doc = await generatePdf();

      // Verify PDF is valid by checking if we can get its data
      const pdfData = doc.output('arraybuffer');
      if (!pdfData || pdfData.byteLength < 100) {
        throw new Error('Generated PDF is too small or invalid');
      }

      // Convert to Uint8Array to check PDF header
      const pdfBytes = new Uint8Array(pdfData);
      const header = String.fromCharCode(...pdfBytes.slice(0, 5));
      if (header !== '%PDF-') {
        console.error('Invalid PDF header:', header);
        throw new Error('Generated file is not a valid PDF');
      }

      console.log('✅ Download PDF validation:', {
        size: pdfData.byteLength,
        header: header,
        filename: `${documentName}.pdf`
      });

      doc.save(`${documentName}.pdf`);

      onActionComplete('download');
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to download PDF. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (action: 'email') => {
    setIsProcessing(true);
    try {
      let emails: string[] = [];
      if (!externalEmails.trim()) {
        toast.error('Please enter at least one email address');
        setIsProcessing(false);
        return;
      }
      emails = externalEmails.split(',').map(e => e.trim()).filter(e => e);
      if (emails.length === 0) {
        toast.error('Please enter a valid email address');
        setIsProcessing(false);
        return;
      }

      // Generate PDF as Base64 for sending
      const doc = await generatePdf();

      // Debug: Log what we got
      console.log('📄 PDF Generation Debug:');
      console.log(`   - Document: ${documentName}`);

      let base64Content: string;

      try {
        // Try using arraybuffer instead of datauristring (more reliable)
        const arrayBuffer = doc.output('arraybuffer');

        // Convert ArrayBuffer to base64
        const uint8Array = new Uint8Array(arrayBuffer);
        let binary = '';
        for (let i = 0; i < uint8Array.length; i++) {
          binary += String.fromCharCode(uint8Array[i]);
        }
        base64Content = btoa(binary);

        console.log(`   - Output type: arraybuffer → base64`);
        console.log(`   - ArrayBuffer size: ${arrayBuffer.byteLength} bytes`);
        console.log(`   - Base64 length: ${base64Content.length}`);

        // Verify PDF header
        const pdfHeader = String.fromCharCode(...uint8Array.slice(0, 5));
        if (pdfHeader !== '%PDF-') {
          console.error('❌ Invalid PDF header in ArrayBuffer:', pdfHeader);
          throw new Error('Generated PDF has invalid header');
        }
        console.log(`   - PDF header: ${pdfHeader} ✅`);

      } catch (error) {
        console.error('❌ Error generating PDF as arraybuffer:', error);
        throw new Error('Failed to generate PDF - arraybuffer method failed');
      }

      // Validate base64 content
      if (!base64Content || base64Content.length < 100) {
        throw new Error('PDF base64 content is empty or too short');
      }

      // Remove any whitespace that might have been introduced
      base64Content = base64Content.replace(/\s/g, '');

      // FINAL TEST: Try to decode the base64 back to verify it's valid
      try {
        const testDecoded = atob(base64Content.substring(0, 100));
        const testHeader = testDecoded.substring(0, 5);
        if (testHeader !== '%PDF-') {
          throw new Error(`Decoded base64 does not contain valid PDF header. Got: ${testHeader}`);
        }
        console.log('   ✅ Base64 decode test passed');
      } catch (testError) {
        console.error('❌ Base64 validation failed:', testError);
        const errorMessage = testError instanceof Error ? testError.message : String(testError);
        throw new Error(`Generated base64 is invalid: ${errorMessage}`);
      }

      console.log('✅ PDF Validation Complete:');
      console.log(`   - Final base64 length: ${base64Content.length}`);
      console.log(`   - Sending to: ${emails.join(', ')}`);
      console.log(`   - Filename: ${documentName}.pdf`);

      // Persist the send log and trigger email via API
      const response = await fetch('/api/kitchen-pdf/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': `kitchen-pdf-${booking.id}-${Date.now()}`,
        },
        body: JSON.stringify({
          bookingId: booking.id,
          documentName: documentName.replace(/[^\w\s-]/gi, ''), // Remove special chars
          sentBy: 'Admin',
          emails,
          pdfBase64: base64Content, // Send clean base64 without data URI prefix
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send kitchen PDF');
      }

      onActionComplete('email', { emails });
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to send kitchen PDF. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40 transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <div className="bg-card/95 backdrop-blur-xl border border-border/80 rounded-2xl shadow-[0_24px_48px_-12px_rgba(0,0,0,0.18)] w-full max-w-[800px] overflow-hidden relative flex flex-col max-h-[90vh]">

          <div className="px-6 py-5 border-b border-border/50 bg-muted/20 flex items-center justify-between flex-shrink-0">
            <div>
              <h2 className="text-foreground tracking-tight" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
                Kitchen Sheet Routing
              </h2>
              <p className="text-muted-foreground text-sm mt-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                {documentName}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 w-9 h-9 flex items-center justify-center hover:bg-black/5 rounded-full transition-colors cursor-pointer text-muted-foreground hover:text-foreground"
              disabled={isProcessing}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Kitchen Notes Section - MOVED FROM MAIN PAGE */}
              <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                <h4 className="text-foreground mb-3 flex items-center gap-2" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>
                  <MessageSquare className="w-5 h-5 text-primary" />
                  {tAdmin('kitchenNotes')}
                  <span className="text-muted-foreground font-normal ml-1">({tWizard('labels.optional')})</span>
                  <div className="flex justify-end ml-auto">
                    <button
                      onClick={handleSaveNotes}
                      disabled={isSavingNotes || !hasUnsavedNotes}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-all font-medium text-sm cursor-pointer shadow-sm"
                    >
                      <span className="flex items-center gap-2" translate="no">
                        {isSavingNotes ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                      </span>
                      <span>Save Changes</span>
                    </button>
                  </div>
                </h4>
                <div className="space-y-3">
                  <ValidatedTextarea
                    value={kitchenNotes}
                    onChange={(e) => handleNotesChange(e.target.value)}
                    rows={4}
                    placeholder={tAdmin('kitchenNotesPlaceholder')}
                    maxLength={1000}
                    showCharacterCount
                  />
                </div>
              </div>

              <div className="h-px bg-border/50" />

              <p className="text-muted-foreground text-sm mb-2 font-medium">
                Select destination for this document:
              </p>

              {/* Email Sharing Accordion */}
              <div className="relative">
                <button
                  onClick={() => toggleSection('email')}
                  className={cn(
                    "w-full p-4 bg-background border rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-4 text-left group",
                    expandedSection === 'email' ? "border-purple-500 shadow-sm" : "border-border/60 hover:border-purple-500/50 hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.08)]"
                  )}
                  disabled={isProcessing}
                >
                  <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-100 transition-all duration-200 text-purple-600">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="text-foreground font-semibold mb-0.5">Share via Email</div>
                    <div className="text-muted-foreground text-sm">Send sheet directly to any email address</div>
                  </div>
                  <ChevronLeft className={cn("w-5 h-5 text-muted-foreground transition-transform duration-200", expandedSection === 'email' ? "-rotate-90" : "rotate-180")} />
                </button>

                {expandedSection === 'email' && (
                  <div className="mt-3 p-4 bg-muted/20 border border-border/50 rounded-xl space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Recipient Emails</label>
                      <p className="text-xs text-muted-foreground">To send to multiple people, add their emails comma separated.</p>
                      <div className="relative mt-1">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="kitchen@example.com, chef@example.com"
                          value={externalEmails}
                          onChange={(e) => setExternalEmails(e.target.value)}
                          className="w-full pl-9 pr-4 py-2.5 bg-background border border-border/60 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all font-medium"
                          autoFocus
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => handleSubmit('email')}
                      disabled={isProcessing || !externalEmails.trim()}
                      className="w-full py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <span className="flex items-center gap-2" translate="no">
                        {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      </span>
                      <span>Send Emails</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Download Option - Direct Action */}
              <button
                onClick={handleDownload}
                className="w-full p-4 bg-background border border-border/60 rounded-xl hover:border-emerald-500/50 hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.08)] transition-all duration-200 cursor-pointer flex items-center gap-4 text-left group"
                disabled={isProcessing}
              >
                <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-100 transition-all duration-200 text-emerald-600">
                  <Download className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="text-foreground font-semibold mb-0.5">Download PDF</div>
                  <div className="text-muted-foreground text-sm">Save directly to your system</div>
                </div>
                <span translate="no">
                  {isProcessing && expandedSection === null ? (
                    <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
                  ) : (
                    <Download className="w-5 h-5 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                  )}
                </span>
              </button>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
