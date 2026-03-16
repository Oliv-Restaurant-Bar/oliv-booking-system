'use client';

import { useState } from 'react';
import { Mail, Download, Users, X, Loader2, CheckSquare, ChevronLeft, Send } from 'lucide-react';
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
  const [expandedSection, setExpandedSection] = useState<'email' | null>(null);
  const [externalEmails, setExternalEmails] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  // Use last 8 characters of UUID for a shorter ID
  const shortId = booking.id.slice(-8);
  const documentName = `Booking - ${booking.customer.name}`; // Format: Booking - Customer Name

  const toggleSection = (section: 'email') => {
    setExpandedSection(prev => prev === section ? null : section);
  };


  const generatePdf = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    const logoUrl = "/assets/oliv-logo.png";
    let yPos = 0;

    // --- Helper for Rects and Backgrounds ---
    const drawHeader = () => {
      // Primary Header Bar
      doc.setFillColor(157, 174, 145); //(System Primary)
      doc.rect(0, 0, pageWidth, 45, 'F');

      // Add Logo (if possible)
      try {
        doc.addImage(logoUrl, 'PNG', margin, 10, 35, 12);
      } catch (e) {
        console.error("Logo failed to load for PDF");
      }

      doc.setFontSize(22);
      doc.setTextColor(38, 45, 57);
      doc.setFont("helvetica", "bold");
      doc.text("KITCHEN SHEET", margin, 34);

      doc.setFontSize(11);
      doc.setTextColor(38, 45, 57);
      doc.setFont("helvetica", "bold");
      doc.text("INTERNAL USE ONLY", pageWidth - margin, 20, { align: 'right' });

      doc.setFontSize(9);
      doc.setTextColor(38, 45, 57);
      doc.setFont("helvetica", "normal");
      doc.text(`Generated: ${new Date().toLocaleDateString('de-CH')}`, pageWidth - margin, 34, { align: 'right' });

      yPos = 60;
    };

    drawHeader();

    // --- Two Column Info Section ---
    const columnWidth = (contentWidth / 2) - 5;
    const leftColX = margin;
    const rightColX = pageWidth / 2 + 5;
    
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    
    // Headers on the same line
    doc.text("CUSTOMER DETAILS", leftColX, yPos);
    doc.text("EVENT DETAILS", rightColX, yPos);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const detailLineHeight = 6;
    let customerY = yPos + 8;
    let eventY = yPos + 8;

    // --- Left Column Content ---
    const nameLines = doc.splitTextToSize(`Name: ${booking.customer.name}`, columnWidth);
    doc.text(nameLines, leftColX + 2, customerY);
    customerY += (nameLines.length * detailLineHeight);
    
    doc.text(`Guests: ${booking.guests}`, leftColX + 2, customerY);
    customerY += detailLineHeight;
    
    if (booking.billingAddress) {
      const addressLines = doc.splitTextToSize(`Billing Address: ${booking.billingAddress}`, columnWidth);
      doc.text(addressLines, leftColX + 2, customerY);
      customerY += (addressLines.length * detailLineHeight);
    }

    // --- Right Column Content ---
    doc.text(`Date: ${booking.event.date}`, rightColX + 2, eventY);
    eventY += detailLineHeight;
    doc.text(`Time: ${booking.event.time}`, rightColX + 2, eventY);
    eventY += detailLineHeight;
    
    const occasionLines = doc.splitTextToSize(`Occasion: ${booking.event.occasion}`, columnWidth);
    doc.text(occasionLines, rightColX + 2, eventY);
    eventY += (occasionLines.length * detailLineHeight);
    
    const locationLines = doc.splitTextToSize(`Venue: ${booking.event.location || 'Restaurant Oliv'}`, columnWidth);
    doc.text(locationLines, rightColX + 2, eventY);
    eventY += (locationLines.length * detailLineHeight);

    // Synchronize Y position for next section
    yPos = Math.max(customerY, eventY) + 15;

    // --- Menu Selection Table ---
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("MENU SELECTION", margin, yPos);

    yPos += 10;

    // Table Header Settings (3-column layout)
    const colX_Item = margin + 2;
    const colX_Guests = margin + 130;
    const colX_Done = margin + 160;

    // Header Background
    doc.setFillColor(241, 245, 249); // slate-100
    doc.rect(margin, yPos - 6, contentWidth, 10, 'F');

    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105); // slate-600
    doc.setFont("helvetica", "bold");
    doc.text("ITEM NAME", colX_Item, yPos);
    doc.text("GUESTS", colX_Guests, yPos, { align: 'center' });
    doc.text("DONE", colX_Done, yPos, { align: 'center' });

    yPos += 10;
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    const menuItems = booking.menuItems || [];
    
    // Group items by category
    const groupedItems: Record<string, typeof menuItems> = {};
    menuItems.forEach(item => {
      const cat = item.category || 'Other';
      if (!groupedItems[cat]) groupedItems[cat] = [];
      groupedItems[cat].push(item);
    });

    const drawTableHeader = (title: string) => {
      doc.addPage();
      drawHeader();
      yPos = 60;
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(title, margin, yPos);
      yPos += 10;
      
      doc.setFillColor(241, 245, 249);
      doc.rect(margin, yPos - 6, contentWidth, 10, 'F');
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      doc.setFont("helvetica", "bold");
      doc.text("ITEM NAME", colX_Item, yPos);
      doc.text("GUESTS", colX_Guests, yPos, { align: 'center' });
      doc.text("DONE", colX_Done, yPos, { align: 'center' });
      yPos += 10;
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
    };

    if (Object.keys(groupedItems).length > 0) {
      Object.entries(groupedItems).forEach(([category, items]) => {
        // Category Header
        if (yPos + 15 > 275) {
          drawTableHeader("MENU SELECTION (CONT.)");
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(15, 23, 42);
        doc.text(category.toUpperCase(), colX_Item, yPos);
        yPos += 7;
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);

        items.forEach((item) => {
          const itemMaxWidth = 120;
          const itemLines = doc.splitTextToSize(item.item, itemMaxWidth);
          const lineHeight = 5;
          const rowHeight = Math.max(itemLines.length * lineHeight, 10);

          // Page break logic
          if (yPos + rowHeight > 275) {
            drawTableHeader("MENU SELECTION (CONT.)");
            // Re-draw category if we broke page right after category header or mid-items
            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
            doc.text(`${category.toUpperCase()} (CONT.)`, colX_Item, yPos);
            yPos += 7;
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
          }

          // Draw Item Name (Indented)
          doc.text(itemLines, colX_Item + 5, yPos);

          // Draw Guests (Center aligned)
          doc.text(String(booking.guests), colX_Guests, yPos, { align: 'center' });

          // Checkbox box (Center aligned)
          doc.setDrawColor(203, 213, 225);
          doc.rect(colX_Done - 3, yPos - 3.5, 6, 6); // slightly larger checkbox

          // Row separator
          doc.setDrawColor(241, 245, 249);
          doc.line(margin, yPos + rowHeight - 6, margin + contentWidth, yPos + rowHeight - 6);

          yPos += rowHeight;

          // Display customer comment if present
          if (item.customerComment && item.customerComment.trim()) {
            if (yPos + 10 > 275) {
              drawTableHeader("MENU SELECTION (CONT.)");
              // Re-draw category if we broke page
              doc.setFont("helvetica", "bold");
              doc.setFontSize(11);
              doc.text(`${category.toUpperCase()} (CONT.)`, colX_Item, yPos);
              yPos += 7;
              doc.setFont("helvetica", "normal");
              doc.setFontSize(10);
            }

            // Integrated customer note (indented and subtle)
            const commentLines = doc.splitTextToSize(`Notes: ${item.customerComment}`, itemMaxWidth - 10);
            const commentHeight = (commentLines.length * 4) + 2;

            doc.setTextColor(180, 83, 9); // amber-700 (slightly darker for PDF readability)
            doc.setFont("helvetica", "italic");
            doc.setFontSize(8.5);
            doc.text(commentLines, colX_Item + 10, yPos - 1); // Indent more and move up

            yPos += commentHeight;
            doc.setTextColor(15, 23, 42); // Reset color
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
          }
        });
        
        yPos += 5; // Spacing between categories
      });
    } else {
      doc.setFont("helvetica", "italic");
      doc.text("No menu items specified", margin + 5, yPos);
      yPos += 8;
    }

    yPos += 5;

    // --- Allergies Section (Conditional) ---
    if (booking.allergies && booking.allergies.trim().toLowerCase() !== 'none' && booking.allergies.trim()) {
      if (yPos > 230) { doc.addPage(); drawHeader(); yPos += 10; }
      yPos += 5;

      doc.setFillColor(254, 242, 242); // red-50
      const allergyLines = doc.splitTextToSize(booking.allergies, contentWidth - 10);
      const allergyBoxHeight = (allergyLines.length * 6) + 16;

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
    }

    // --- Customer Additional Notes (Conditional) ---
    if (booking.notes && booking.notes.trim()) {
      yPos += 10;
      if (yPos > 240) { doc.addPage(); drawHeader(); yPos += 10; }

      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text("ADDITIONAL CUSTOMER NOTES", margin, yPos);

      yPos += 8;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const noteLines = doc.splitTextToSize(booking.notes, contentWidth - margin);
      doc.text(noteLines, margin + 5, yPos);
      yPos += (noteLines.length * 6) + 4;
    }

    // --- Internal Kitchen Notes Section (Conditional) ---
    if (booking.kitchenNotes && booking.kitchenNotes.trim()) {
      yPos += 8;
      if (yPos > 240) { doc.addPage(); drawHeader(); yPos += 10; }

      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text("INTERNAL STAFF NOTES", margin, yPos);

      yPos += 8;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const kitchenNoteLines = doc.splitTextToSize(booking.kitchenNotes, contentWidth - margin);

      // Highlight background for kitchen notes
      doc.setFillColor(248, 250, 252); // slate-50
      doc.rect(margin, yPos - 5, contentWidth, (kitchenNoteLines.length * 6) + 10, 'F');
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.rect(margin, yPos - 5, contentWidth, (kitchenNoteLines.length * 6) + 10, 'S');

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
        `Generated on ${toReadableDate(new Date(), getSystemTimezoneSync())} | Page ${i} of ${totalPages} | Oliv Booking System`,
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
      const doc = generatePdf();

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
