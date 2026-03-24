import { jsPDF } from 'jspdf';
import { toReadableDate, getSystemTimezoneSync } from './date';

// --- Configuration & Constants ---
const COLORS = {
  primary: [157, 174, 145] as [number, number, number], // #9DAE91
  secondary: [38, 45, 57] as [number, number, number],  // #262D39
  text: [51, 65, 85] as [number, number, number],      // slate-700
  title: [15, 23, 42] as [number, number, number],     // slate-900
  muted: [148, 163, 184] as [number, number, number],   // slate-400
  background: [248, 250, 252] as [number, number, number], // slate-50
  border: [226, 232, 240] as [number, number, number],   // slate-200
  accent: [180, 83, 9] as [number, number, number],     // amber-700
};

const LOGO_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAARgAAABdCAYAAAB+bHnnAAAAAXNSR0IArs4c6QAA...'; // Placeholder, will fill with real one or use dynamic loading

interface PdfBookingItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
  pricingType: string;
}

interface PdfBookingData {
  id: string;
  customerName: string;
  business?: string;
  eventDate: string;
  eventTime: string;
  guestCount: number;
  occasion?: string;
  location?: string;
  items: PdfBookingItem[];
  estimatedTotal: number;
  specialRequests?: string;
}

/**
 * Generate a professional Customer Offer PDF based on the reference BEKB format.
 */
export async function generateCustomerOfferPdf(data: PdfBookingData): Promise<jsPDF> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  let yPos = 20;

  // --- Helper Functions ---
  const addLogo = () => {
    // Center logo at top
    const logoWidth = 50;
    const logoHeight = 15;
    const x = (pageWidth - logoWidth) / 2;
    try {
      // On client, '/assets/oliv-logo.png' works.
      // On server, we need the local filesystem path.
      if (typeof window === 'undefined') {
        const fs = require('fs');
        const path = require('path');
        const logoPath = path.join(process.cwd(), 'public', 'assets', 'oliv-logo.png');
        if (fs.existsSync(logoPath)) {
          const logoBuffer = fs.readFileSync(logoPath);
          doc.addImage(logoBuffer, 'PNG', x, yPos, logoWidth, logoHeight);
        } else {
          throw new Error('Logo file not found on server');
        }
      } else {
        doc.addImage('/assets/oliv-logo.png', 'PNG', x, yPos, logoWidth, logoHeight);
      }
    } catch (e) {
      console.error('Logo failed to load for PDF:', e);
      // Fallback text logo
      doc.setFont("helvetica", "bold");
      doc.setFontSize(24);
      doc.setTextColor(...COLORS.primary);
      doc.text("o l í v", pageWidth / 2, yPos + 10, { align: 'center' });
      doc.setFontSize(10);
      doc.text("RESTAURANT & BAR", pageWidth / 2, yPos + 16, { align: 'center' });
    }
    yPos += 30;
  };

  const addHeader = (title: string, isContinuation = false) => {
    if (isContinuation) {
      yPos = 20;
    }
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.muted);
    doc.setFont("helvetica", "normal");
    doc.text(title.toUpperCase(), pageWidth / 2, yPos, { align: 'center', charSpace: 2 });
    yPos += 12;

    if (isContinuation) {
      doc.setDrawColor(...COLORS.border);
      doc.setLineWidth(0.1);
      doc.line(margin, yPos - 5, pageWidth - margin, yPos - 5);
      yPos += 5;
    }
  };

  const checkPageBreak = (neededHeight: number) => {
    if (yPos + neededHeight > pageHeight - 30) {
      doc.addPage();
      addHeader("ANGEBOT (Fortsetzung)", true);
      return true;
    }
    return false;
  };

  const addEventBox = () => {
    const boxHeight = 25;
    checkPageBreak(boxHeight + 10);
    const boxY = yPos;

    // Background box
    doc.setFillColor(...COLORS.background);
    doc.rect(margin, boxY, contentWidth, boxHeight, 'F');

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...COLORS.title);

    const dateFormatted = new Date(data.eventDate).toLocaleDateString('de-CH', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

    doc.text(`${dateFormatted} — ${data.eventTime.substring(0, 5)}`, pageWidth / 2, boxY + 11, { align: 'center' });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.text);
    doc.text(`ca. ${data.guestCount} Personen`, pageWidth / 2, boxY + 18, { align: 'center' });

    yPos += boxHeight + 20;
  };
  const addSectionTitle = (title: string) => {
    // Themed "Menü" divider - Line --- Title --- Line
    checkPageBreak(25);
    yPos += 5;
    doc.setFont("helvetica", "italic");
    doc.setFontSize(16);
    doc.setTextColor(...COLORS.primary);

    const textWidth = doc.getTextWidth(title);
    const textX = pageWidth / 2;

    doc.text(title, textX, yPos, { align: 'center' });

    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(0.2);
    // Lines on either side of the title
    const lineY = yPos - 1.5;
    const lineOffset = (textWidth / 2) + 8;

    doc.line(margin, lineY, textX - lineOffset, lineY);
    doc.line(textX + lineOffset, lineY, pageWidth - margin, lineY);

    // Diamond in middle (optional, or just use the lines)
    doc.setFillColor(...COLORS.primary);
    doc.saveGraphicsState();
    doc.setGState(new (doc as any).GState({ opacity: 0.8 }));
    // Draw a small diamond on the lines near the text
    const diamondSize = 3;
    const drawDiamond = (x: number) => {
      doc.triangle(x, lineY - diamondSize / 2, x - diamondSize / 2, lineY, x + diamondSize / 2, lineY, 'F');
      doc.triangle(x, lineY + diamondSize / 2, x - diamondSize / 2, lineY, x + diamondSize / 2, lineY, 'F');
    };

    drawDiamond(textX - lineOffset - 2);
    drawDiamond(textX + lineOffset + 2);
    doc.restoreGraphicsState();

    yPos += 15;
  };

  // --- Rendering ---

  addLogo();
  addHeader("ANGEBOT");

  // Customer Name (Primary)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(...COLORS.title);
  
  const nameWidth = contentWidth * 0.85;
  const nameLines = doc.splitTextToSize(data.customerName, nameWidth);
  doc.text(nameLines, pageWidth / 2, yPos, { align: 'center' });
  yPos += (nameLines.length * 8.5) + 2;

  // Business Name (Secondary)
  if (data.business) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(13);
    doc.setTextColor(...COLORS.text);
    const businessLines = doc.splitTextToSize(data.business, nameWidth);
    doc.text(businessLines, pageWidth / 2, yPos, { align: 'center' });
    yPos += (businessLines.length * 6) + 5;
  }

  yPos += 5;
  addEventBox();
  addSectionTitle("Menü");

  // --- Grouping Logic ---
  const foodCategories = ["Vorspeisen", "Hauptgänge", "Desserts", "Snacks", "Apéro", "Menü"];
  const drinksCategories = ["Getränke", "Softdrinks", "Wein", "Bier", "Kaffee", "Drinks", "Beverages"];
  const techCategories = ["Technik", "Miscellaneous", "Technology", "Equipment", "DJ"];

  // 1. Beverages: strictly by category
  const drinkItems = data.items.filter(i => drinksCategories.includes(i.category));

  // 2. Add-ons (Zusatzleistungen): strictly by pricingType (flat_fee, billed_by_consumption) OR tech categories
  const addonItems = data.items.filter(i =>
    !drinksCategories.includes(i.category) &&
    (i.pricingType === 'flat_fee' || i.pricingType === 'billed_by_consumption' || techCategories.includes(i.category))
  );

  // 3. Food Items: The rest (usually per_person and in food categories)
  const beverageIds = new Set(drinkItems.map(i => i.id));
  const addonIds = new Set(addonItems.map(i => i.id));
  const foodItems = data.items.filter(i => !beverageIds.has(i.id) && !addonIds.has(i.id));

  const renderItemsGroup = (title: string, items: PdfBookingItem[], isMenu = false) => {
    if (items.length === 0) return;

    if (!isMenu) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(...COLORS.title);
      doc.text(title.toUpperCase(), margin, yPos);
      doc.setDrawColor(...COLORS.border);
      doc.line(margin, yPos + 2, pageWidth - margin, yPos + 2);
      yPos += 10;
    }

    // Grouping for category subheaders
    const categoriesInGroup = [...new Set(items.map(i => i.category))];

    categoriesInGroup.forEach(cat => {
      checkPageBreak(15); // Header + space
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(...COLORS.muted);
      doc.text(cat.toUpperCase(), margin, yPos);
      doc.setDrawColor(...COLORS.border);
      doc.setLineWidth(0.1);
      doc.line(margin, yPos + 1, pageWidth - margin, yPos + 1);
      yPos += 8;

      const catItems = items.filter(i => i.category === cat);
      catItems.forEach((item, idx) => {
        // Page break check
        const estimatedItemHeight = (item.name.length > 40 ? 12 : 6) + (item.notes ? 10 : 0);
        const didBreak = checkPageBreak(estimatedItemHeight + 5);

        if (didBreak) {
          // If we broke page, repeat category name for context
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10);
          doc.setTextColor(...COLORS.muted);
          doc.text(`${cat.toUpperCase()} (Fortsetzung)`, margin, yPos);
          doc.setDrawColor(...COLORS.border);
          doc.setLineWidth(0.1);
          doc.line(margin, yPos + 1, pageWidth - margin, yPos + 1);
          yPos += 10;
        }

        // List style for ALL items (following drinks style)
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...COLORS.title);

        const nameWidth = contentWidth * 0.65;
        const nameLines = doc.splitTextToSize(item.name, nameWidth);
        doc.text(nameLines, margin, yPos);

        const priceLabel = item.pricingType === 'per_person' ? 'Pers.' : 'stk.';
        const priceText = `CHF ${item.unitPrice.toFixed(2)} / ${priceLabel}`;
        doc.setFont("helvetica", "bold");
        doc.text(priceText, pageWidth - margin, yPos, { align: 'right' });

        yPos += (nameLines.length * 5.5);

        if (item.notes) {
          doc.setFont("helvetica", "italic");
          doc.setFontSize(9);
          doc.setTextColor(...COLORS.text);
          const noteLines = doc.splitTextToSize(item.notes, nameWidth);
          doc.text(noteLines, margin + 4, yPos - 1.5); // Slight indentation for notes
          yPos += (noteLines.length * 4.5);
        }

        yPos += 3; // Space between items
      });

      yPos += 5;
    });
  };

  // Render Sections
  renderItemsGroup("MENUANGEBOT", foodItems, true);
  renderItemsGroup("GETRÄNKE", drinkItems);
  renderItemsGroup("ZUSATZLEISTUNGEN", addonItems);

  // Footer with totals
  checkPageBreak(60);

  yPos = Math.max(yPos + 10, pageHeight - 75);
  doc.setDrawColor(...COLORS.title);
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 12;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...COLORS.title);
  doc.text("Total ca.", margin, yPos);
  doc.text(`CHF ${data.estimatedTotal.toFixed(2)}`, pageWidth - margin, yPos, { align: 'right' });

  yPos += 6;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.muted);
  doc.text(`für ${data.guestCount} Personen (exkl. Getränke)`, margin, yPos);

  yPos += 15;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  const closingText = "Wir freuen uns darauf, Sie und Ihre Gäste bei uns zu verwöhnen.\nFür Fragen stehen wir Ihnen jederzeit gerne zur Verfügung.";
  const closingLines = doc.splitTextToSize(closingText, contentWidth);
  doc.text(closingLines, pageWidth / 2, yPos, { align: 'center' });

  return doc;
}
