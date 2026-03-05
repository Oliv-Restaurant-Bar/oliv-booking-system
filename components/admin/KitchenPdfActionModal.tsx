'use client';

import { useState } from 'react';
import { Mail, Download, Users, X, Loader2, CheckSquare, ChevronLeft, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { jsPDF } from 'jspdf';

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
    menuItems?: Array<{
      item: string;
      category: string;
      quantity: string;
      price: string;
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
  const [expandedSection, setExpandedSection] = useState<'email' | null>(null);
  const [externalEmails, setExternalEmails] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  // Use last 8 characters of UUID for a shorter ID
  const shortId = booking.id.slice(-8);
  const documentName = `Booking #${shortId} – Kitchen Sheet`;

  const toggleSection = (section: 'email') => {
    setExpandedSection(prev => prev === section ? null : section);
  };


  const generatePdf = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    let yPos = 0;

    // --- Helper for Rects and Backgrounds ---
    const drawHeader = () => {
      // Primary Header Bar
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, pageWidth, 40, 'F');

      doc.setFontSize(24);
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.text("KITCHEN SHEET", margin, 20);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text(`Document: ${documentName}`, margin, 32);

      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.text("FOR INTERNAL KITCHEN USE", pageWidth - margin, 18, { align: 'right' });

      yPos = 55;
    };

    drawHeader();

    // --- Two Column Info Section ---
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");

    // Left Column: Customer
    doc.text("CUSTOMER DETAILS", margin, yPos);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    yPos += 8;
    doc.text(`Name: ${booking.customer.name}`, margin + 5, yPos);
    yPos += 6;
    doc.text(`Guests: ${booking.guests}`, margin + 5, yPos);

    // Right Column: Event (Reset yPos for same row)
    const rightColX = pageWidth / 2 + 5;
    let eventYPos = yPos - 14;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("EVENT DETAILS", rightColX, eventYPos);

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    eventYPos += 8;
    doc.text(`Date: ${booking.event.date}`, rightColX + 5, eventYPos);
    eventYPos += 6;
    doc.text(`Time: ${booking.event.time}`, rightColX + 5, eventYPos);
    eventYPos += 6;
    doc.text(`Occasion: ${booking.event.occasion}`, rightColX + 5, eventYPos);
    if (booking.event.location) {
      eventYPos += 6;
      doc.text(`Location: ${booking.event.location}`, rightColX + 5, eventYPos);
    }

    yPos = Math.max(yPos, eventYPos) + 15;

    // --- Menu Selection Table ---
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("MENU SELECTION", margin, yPos);

    yPos += 10;

    // Table Header
    doc.setFillColor(241, 245, 249); // slate-100
    doc.rect(margin, yPos - 6, contentWidth, 10, 'F');

    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105); // slate-600
    doc.setFont("helvetica", "bold");
    doc.text("ITEM NAME", margin + 2, yPos);
    doc.text("CATEGORY", margin + 85, yPos);
    doc.text("QTY", margin + 135, yPos);
    doc.text("STATUS", margin + 155, yPos);

    yPos += 8;
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    const menuItems = booking.menuItems || [];
    if (menuItems.length > 0) {
      menuItems.forEach((item, index) => {
        // Page break logic
        if (yPos > 260) {
          doc.addPage();
          drawHeader();
          yPos += 10;
          // Re-draw table header on new page
          doc.setFillColor(241, 245, 249);
          doc.rect(margin, yPos - 6, contentWidth, 10, 'F');
          doc.setFontSize(9);
          doc.setTextColor(71, 85, 105);
          doc.setFont("helvetica", "bold");
          doc.text("ITEM NAME", margin + 2, yPos);
          doc.text("CATEGORY", margin + 85, yPos);
          doc.text("QTY", margin + 135, yPos);
          doc.text("STATUS", margin + 155, yPos);
          yPos += 10;
          doc.setTextColor(15, 23, 42);
          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
        }

        doc.text(item.item, margin + 2, yPos);
        doc.text(item.category, margin + 85, yPos);
        doc.text(String(item.quantity), margin + 135, yPos);

        // Checkbox box (Now at the end)
        doc.setDrawColor(203, 213, 225); // slate-300
        doc.rect(margin + 158, yPos - 4, 4, 4);

        // Row separator
        doc.setDrawColor(241, 245, 249);
        doc.line(margin, yPos + 2, margin + contentWidth, yPos + 2);

        yPos += 8;
      });
    } else {
      doc.setFont("helvetica", "italic");
      doc.text("No menu items specified", margin + 5, yPos);
      yPos += 8;
    }

    yPos += 12;

    // --- Allergies Section ---
    if (yPos > 240) { doc.addPage(); drawHeader(); yPos += 10; }

    // Warning background for allergies
    doc.setFillColor(254, 242, 242); // red-50
    const allergyLines = doc.splitTextToSize(booking.allergies || 'None specified', contentWidth - 10);
    const allergyBoxHeight = (allergyLines.length * 6) + 15;

    doc.setDrawColor(252, 165, 165); // red-300
    doc.rect(margin, yPos - 6, contentWidth, allergyBoxHeight, 'F');
    doc.rect(margin, yPos - 6, contentWidth, allergyBoxHeight, 'S');

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(185, 28, 28); // red-700
    doc.text("ALLERGIES & DIETARY NOTES", margin + 5, yPos + 2);

    yPos += 10;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(153, 27, 27); // red-800
    doc.text(allergyLines, margin + 8, yPos);

    yPos += allergyBoxHeight - 5;

    // --- Additional Notes ---
    if (yPos > 240) { doc.addPage(); drawHeader(); yPos += 10; }
    yPos += 10;
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text("ADDITIONAL NOTES", margin, yPos);

    yPos += 8;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const noteLines = doc.splitTextToSize(booking.notes || 'None', contentWidth - margin);
    doc.text(noteLines, margin + 5, yPos);

    // --- Kitchen Notes Section ---
    if (booking.kitchenNotes) {
      yPos += (noteLines.length * 6) + 10;
      if (yPos > 240) { doc.addPage(); drawHeader(); yPos += 10; }

      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text("NOTES FOR KITCHEN TEAM", margin, yPos);

      yPos += 8;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const kitchenNoteLines = doc.splitTextToSize(booking.kitchenNotes, contentWidth - margin);

      // Highlight background for kitchen notes
      doc.setFillColor(248, 250, 252); // slate-50
      doc.rect(margin, yPos - 4, contentWidth, (kitchenNoteLines.length * 6) + 8, 'F');

      doc.setTextColor(51, 65, 85); // slate-700
      doc.text(kitchenNoteLines, margin + 5, yPos + 2);
    }

    // --- Footer & Page Numbering ---
    const totalPages = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Generated on ${new Date().toLocaleString('de-CH')} | Page ${i} of ${totalPages} | Oliv Booking System`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }

    return doc;
  };

  const handleDownload = async () => {
    setIsProcessing(true);
    try {
      const doc = generatePdf();
      doc.save(`${documentName}.pdf`);

      onActionComplete('download');
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (action: 'email') => {
    setIsProcessing(true);
    try {
      let emails: string[] = [];
      if (!externalEmails.trim()) {
        alert('Please enter at least one email address');
        setIsProcessing(false);
        return;
      }
      emails = externalEmails.split(',').map(e => e.trim()).filter(e => e);
      if (emails.length === 0) {
        alert('Please enter a valid email address');
        setIsProcessing(false);
        return;
      }

      // Generate PDF as Base64 for sending
      const doc = generatePdf();
      const pdfBase64 = doc.output('datauristring');

      // Persist the send log and trigger email via API
      const response = await fetch('/api/kitchen-pdf/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': `kitchen-pdf-${booking.id}-${Date.now()}`,
        },
        body: JSON.stringify({
          bookingId: booking.id,
          documentName,
          sentBy: 'Admin',
          emails,
          pdfBase64,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send kitchen PDF');
      }

      onActionComplete('download', { emails });
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
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
            <div className="space-y-4">
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
                      {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      Send Emails
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
                {isProcessing && expandedSection === null ? (
                  <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
                ) : (
                  <Download className="w-5 h-5 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                )}
              </button>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
