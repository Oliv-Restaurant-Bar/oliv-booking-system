import { jsPDF } from 'jspdf';
import { toReadableDate, getSystemTimezoneSync } from './date';

// --- Configuration & Constants ---
const COLORS = {
  primary: [157, 174, 145] as [number, number, number], // #9DAE91 (System Primary)
  secondary: [38, 45, 57] as [number, number, number],  // #262D39 (System Secondary)
  text: [51, 65, 85] as [number, number, number],      // slate-700
  title: [15, 23, 42] as [number, number, number],     // slate-900
  muted: [148, 163, 184] as [number, number, number],   // slate-400
  background: [248, 250, 252] as [number, number, number], // slate-50
  border: [226, 232, 240] as [number, number, number],   // slate-200
  accent: [115, 128, 106] as [number, number, number],     // darker primary
};

export interface PdfBookingItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unitPrice?: number;
  totalPrice?: number;
  notes?: string;
  pricingType: string;
  customerComment?: string;
}

export interface PdfBookingData {
  id: string;
  customerName: string;
  business?: string;
  eventDate: string;
  eventTime: string;
  guestCount: number;
  occasion?: string;
  location?: string;
  items: PdfBookingItem[];
  estimatedTotal?: number;
  specialRequests?: string;
  allergies?: string;
  kitchenNotes?: string;
  billingAddress?: string;
}

export type PdfGenerationMode = 'offer' | 'kitchen';

/**
 * Unified PDF Generation for both Customer Offers and Internal Kitchen Sheets.
 */
export async function generateBookingPdf(
  data: PdfBookingData, 
  mode: PdfGenerationMode = 'offer'
): Promise<jsPDF> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  let yPos = 0;

  // --- Helper Functions ---
  const drawHeader = (isContinuation = false) => {
    const isKitchen = mode === 'kitchen';
    
    if (isContinuation && !isKitchen) {
      // Minimal Continuation Header for Offers
      doc.setDrawColor(...COLORS.primary);
      doc.setLineWidth(0.5);
      doc.line(margin, 15, pageWidth - margin, 15);
      
      doc.setFontSize(8);
      doc.setTextColor(...COLORS.muted);
      doc.text(`KUNDENANGEBOT (FORTS.) - ANFRAGE-NR: ${data.id.substring(data.id.length - 8).toUpperCase()}`, margin, 12);
      doc.text(`Datum: ${new Date().toLocaleDateString('de-CH')}`, pageWidth - margin, 12, { align: 'right' });
      
      yPos = 25;
      return;
    }

    // Primary Header Banner
    doc.setFillColor(...COLORS.primary);
    doc.rect(0, 0, pageWidth, 45, 'F');

    // Logo
    try {
      const x = margin;
      const y = 10;
      if (typeof window === 'undefined') {
        const fs = require('fs');
        const path = require('path');
        const logoPath = path.join(process.cwd(), 'public', 'assets', 'oliv-logo.png');
        if (fs.existsSync(logoPath)) {
          doc.addImage(fs.readFileSync(logoPath), 'PNG', x, y, 35, 12);
        }
      } else {
        doc.addImage('/assets/oliv-logo.png', 'PNG', x, y, 35, 12);
      }
    } catch (e) {
      // Fallback
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(...COLORS.secondary);
      doc.text("o l í v", margin, 20);
    }

    // Title
    doc.setFontSize(22);
    doc.setTextColor(...COLORS.secondary);
    doc.setFont("helvetica", "bold");
    const title = mode === 'kitchen' ? "KITCHEN SHEET" : "KUNDENANGEBOT";
    doc.text(title + (isContinuation ? " (FORTS.)" : ""), margin, 34);

    // Meta (Right side)
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.secondary);
    if (mode === 'kitchen') {
      doc.setFont("helvetica", "bold");
      doc.text("INTERNAL USE ONLY", pageWidth - margin, 20, { align: 'right' });
    } else {
      doc.text(`ANFRAGE-NR: ${data.id.substring(data.id.length - 8).toUpperCase()}`, pageWidth - margin, 20, { align: 'right' });
    }

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const dateStr = mode === 'kitchen' ? `Generated: ${new Date().toLocaleDateString('de-CH')}` : `Datum: ${new Date().toLocaleDateString('de-CH')}`;
    doc.text(dateStr, pageWidth - margin, 34, { align: 'right' });

    yPos = 60;
  };

  const checkPageBreak = (neededHeight: number, showTableHeaders = false) => {
    if (yPos + neededHeight > pageHeight - 20) {
      doc.addPage();
      drawHeader(true);
      if (showTableHeaders) {
        renderTableHeaders();
      }
      return true;
    }
    return false;
  };

  const renderTableHeaders = () => {
    doc.setFillColor(241, 245, 249); // slate-100
    doc.rect(margin, yPos - 6, contentWidth, 10, 'F');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105); // slate-600
    doc.setFont("helvetica", "bold");

    if (mode === 'kitchen') {
      doc.text("ITEM NAME", margin + 3, yPos);
      doc.text("GUESTS", margin + 130, yPos, { align: 'center' });
      doc.text("DONE", margin + 160, yPos, { align: 'center' });
    } else {
      doc.text("ARTIKEL", margin + 3, yPos);
      // Removed Kategorie - now handled by category headers
      doc.text("ANZAHL", margin + 105, yPos);
      doc.text("PREIS", pageWidth - margin - 3, yPos, { align: 'right' });
    }
    yPos += 10;
  };

  // --- Initial Render ---
  drawHeader();

  // Two Column Info Section
  const colW = (contentWidth / 2) - 5;
  const leftX = margin;
  const rightX = pageWidth / 2 + 5;
  const detailLineHeight = 5;
  
  doc.setFontSize(14);
  doc.setTextColor(...COLORS.title);
  doc.setFont("helvetica", "bold");
  doc.text(mode === 'kitchen' ? "CUSTOMER DETAILS" : "KUNDENDATEN", leftX, yPos);
  doc.text(mode === 'kitchen' ? "EVENT DETAILS" : "EVENTDATEN", rightX, yPos);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  let leftY = yPos + 8;
  let rightY = yPos + 8;

  // Helper to render multi-line field and return new Y
  const renderField = (label: string, value: string | number, x: number, y: number, width: number) => {
    const text = `${label}: ${value}`;
    const lines = doc.splitTextToSize(text, width);
    doc.text(lines, x + 2, y);
    return y + (lines.length * detailLineHeight) + 1;
  };

  // Customer Side
  leftY = renderField(mode === 'kitchen' ? 'Name' : 'Kunde', data.customerName, leftX, leftY, colW);
  if (data.business) {
    const bizLines = doc.splitTextToSize(data.business, colW);
    doc.text(bizLines, leftX + 2, leftY);
    leftY += (bizLines.length * detailLineHeight) + 1;
  }
  leftY = renderField(mode === 'kitchen' ? 'Guests' : 'Personen', data.guestCount, leftX, leftY, colW);
  if (data.billingAddress) {
    leftY = renderField(mode === 'kitchen' ? 'Address' : 'Adresse', data.billingAddress, leftX, leftY, colW);
  }

  // Event Side
  rightY = renderField(mode === 'kitchen' ? 'Date' : 'Datum', data.eventDate, rightX, rightY, colW);
  rightY = renderField(mode === 'kitchen' ? 'Time' : 'Zeit', data.eventTime, rightX, rightY, colW);
  rightY = renderField(mode === 'kitchen' ? 'Occasion' : 'Anlass', data.occasion || '-', rightX, rightY, colW);
  rightY = renderField(mode === 'kitchen' ? 'Venue' : 'Ort', data.location || 'Restaurant Oliv', rightX, rightY, colW);

  yPos = Math.max(leftY, rightY) + 8;

  // Table
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(mode === 'kitchen' ? "MENU SELECTION" : "IHRE AUSWAHL", margin, yPos);
  yPos += 8;

  renderTableHeaders();

  // Sorting
  const categoryOrder = ["Vorspeisen", "Hauptgänge", "Desserts", "Snacks", "Apéro", "Menü", "Drink", "Softdrinks", "Wein", "Bier", "Kaffee", "Drinks"];
  const sortedItems = [...data.items].sort((a, b) => {
    const idxA = categoryOrder.indexOf(a.category);
    const idxB = categoryOrder.indexOf(b.category);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    return a.category.localeCompare(b.category);
  });

  let lastCategory = "";
  sortedItems.forEach(item => {
    const itemMaxWidth = mode === 'kitchen' ? 120 : 95;
    const nameLines = doc.splitTextToSize(item.name, itemMaxWidth);
    const rowH = Math.max(nameLines.length * 5, 8);
    
    // Check if category changed to draw header
    if (item.category !== lastCategory) {
      checkPageBreak(15, true);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(...COLORS.title);
      yPos += 8;
      doc.text(item.category.toUpperCase(), margin + 3, yPos);
      yPos += 4; // Tighter gap
      lastCategory = item.category;
    }

    checkPageBreak(rowH + 5, true);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.title);

    if (mode === 'kitchen') {
      doc.text(nameLines, margin + 10, yPos + 4);
      
      doc.text(String(item.quantity), margin + 130, yPos + 4, { align: 'center' });
      doc.setDrawColor(203, 213, 225);
      doc.rect(margin + 160 - 3, yPos + 4 - 3.5, 6, 6);
    } else {
      // Offer mode: items clearly indented under category
      doc.text(nameLines, margin + 10, yPos + 4);

      doc.setTextColor(...COLORS.text);
      const qtyLabel = item.pricingType === 'per_person' ? 'guests' : '';
      const qtyTxt = `${item.quantity} ${qtyLabel} x ${Number(item.unitPrice).toFixed(0)} CHF`.replace(/\s+/g, ' ').trim();
      doc.text(qtyTxt, margin + 105, yPos + 4);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(...COLORS.title);
      doc.text(`CHF ${item.totalPrice?.toFixed(2)}`, pageWidth - margin - 3, yPos + 4, { align: 'right' });
    }

    yPos += rowH + (mode === 'kitchen' ? 5 : 2);
    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(0.1);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 3;

    // Customer Comment (Special)
    const comment = item.customerComment || item.notes;
    if (comment) {
      const commentLines = doc.splitTextToSize(`Note: ${comment}`, contentWidth - 20);
      const commentH = (commentLines.length * 4) + 2;
      checkPageBreak(commentH + 2);
      doc.setTextColor(180, 83, 9); // amber-700
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8.5);
      doc.text(commentLines, margin + 10, yPos - 1);
      yPos += commentH;
      doc.setTextColor(...COLORS.title);
      yPos += 2;
    }
  });

  // Helper for Notes Sections
  const renderNoteSection = (title: string, text?: string, isWarning = false) => {
    if (!text || !text.trim()) return;
    yPos += 10;
    const lines = doc.splitTextToSize(text, contentWidth - 10);
    const boxH = (lines.length * 5) + 15;
    checkPageBreak(boxH + 5);

    if (isWarning) {
      doc.setFillColor(254, 242, 242); // red-50
      doc.setDrawColor(252, 165, 165); // red-300
    } else {
      doc.setFillColor(241, 245, 249); // slate-100
      doc.setDrawColor(203, 213, 225); // slate-300
    }
    doc.rect(margin, yPos, contentWidth, boxH, 'F');
    doc.rect(margin, yPos, contentWidth, boxH, 'S');

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    if (isWarning) {
      doc.setTextColor(185, 28, 28);
    } else {
      doc.setTextColor(...COLORS.title);
    }
    doc.text(title.toUpperCase(), margin + 5, yPos + 7);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    if (isWarning) {
      doc.setTextColor(153, 27, 27);
    } else {
      doc.setTextColor(...COLORS.text);
    }
    doc.text(lines, margin + 5, yPos + 14);
    yPos += boxH;
  };

  // Render Notes BEFORE Footer for Customer Offer
  if (mode === 'offer') {
    renderNoteSection("Allergien & Diätetisch", data.allergies, true);
    renderNoteSection("Besondere Wünsche", data.specialRequests);
  } else {
    // For Kitchen, still at the end
    renderNoteSection("Allergies & Dietary", data.allergies, true);
    renderNoteSection("Special Requests", data.specialRequests);
  }

  // Footer / Totals (Final piece for Customer)
  if (mode === 'offer') {
    checkPageBreak(30);
    yPos += 15;
    doc.setDrawColor(...COLORS.primary);
    doc.setLineWidth(1);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 15;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...COLORS.secondary);
    doc.text("Gesamtbetrag", margin, yPos);
    doc.text(`CHF ${data.estimatedTotal?.toFixed(2)}`, pageWidth - margin, yPos, { align: 'right' });

    yPos += 10;
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(...COLORS.muted);
    doc.text(`Kalkulation für ${data.guestCount} Personen (exkl. Service & Getränke nach Aufwand)`, margin, yPos);
  }
  if (mode === 'kitchen') {
    renderNoteSection("Staff Notes", data.kitchenNotes);
  }

  // Page Numbers
  const total = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.muted);
    doc.text(
      `Oliv Restaurant | Page ${i} of ${total} | Generated on ${new Date().toLocaleDateString()}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  return doc;
}

// Backward compatibility (optional)
export async function generateCustomerOfferPdf(data: PdfBookingData): Promise<jsPDF> {
  return generateBookingPdf(data, 'offer');
}
