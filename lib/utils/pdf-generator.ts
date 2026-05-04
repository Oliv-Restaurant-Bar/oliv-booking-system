import { jsPDF } from 'jspdf';
import { toReadableDate, getSystemTimezoneSync, getSystemDateFormat, formatWithSystemFormat } from './date';
import { calculateDietaryTotals } from './pricing';

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
  dietaryType?: 'veg' | 'non-veg' | 'vegan' | 'none';
  useSpecialCalculation?: boolean;
  isSpecialCategory?: boolean;
  showQuantity?: boolean;
  categorySortOrder?: number;
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
  billingStreet?: string;
  billingPlz?: string;
  billingLocation?: string;
  room?: string;
}

export type PdfGenerationMode = 'offer' | 'kitchen' | 'inquiry';

/**
 * Unified PDF Generation for both Customer Offers and Internal Kitchen Sheets.
 */
export async function generateBookingPdf(
  data: PdfBookingData,
  mode: PdfGenerationMode = 'offer'
): Promise<jsPDF> {
  const doc = new jsPDF();
  const dateFormat = await getSystemDateFormat();
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const contentMaxWidth = 160;
  const margin = (pageWidth - contentMaxWidth) / 2;
  const contentWidth = contentMaxWidth;
  let yPos = 0;

  // ─── Column positions for kitchen item rows ─────────────────────────────────
  // Name area:  margin+6  …  margin+115
  // Qty centre: margin+130 (same as before)
  // Done box:   margin+157  (right-aligned, 6×6 box)
  const KITCHEN_NAME_MAX_W = 105;
  const KITCHEN_QTY_CENTER = margin + 124;
  const KITCHEN_DONE_X = margin + 151;

  // ─── drawInfoColumns — shared for all modes ───────────────────────────────
  const drawInfoColumns = (startY: number): number => {
    const colW = (contentWidth / 2) - 4;
    const leftX = margin;
    const rightX = margin + contentWidth / 2 + 4;
    const gridPad = 3.5;
    const lineH = 5.5;

    const getSectionHeight = (fields: { label: string; value: string | number | undefined }[]): number => {
      let h = 7; // header height
      fields.forEach(({ value }) => {
        const valStr = value !== undefined && value !== null ? String(value).trim() : '';
        if (valStr === '') return;
        const valueLines = doc.splitTextToSize(valStr, colW - gridPad - 20 - 2);
        h += Math.max(valueLines.length * lineH, 6.5);
      });
      return h;
    };

    const drawInfoSection = (
      title: string,
      fields: { label: string; value: string | number | undefined }[],
      x: number,
      sY: number,
      forcedHeight?: number
    ): number => {
      let localY = sY;
      const headerH = 7;
      
      // Header background
      doc.setFillColor(...COLORS.background);
      doc.rect(x, localY, colW, headerH, 'F');
      
      // Header text
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(...COLORS.primary);
      doc.setCharSpace(1.2);
      doc.text(title.toUpperCase(), x + gridPad, localY + 4.8);
      doc.setCharSpace(0);
      
      localY += headerH;

      fields.forEach(({ label, value }) => {
        const valStr = value !== undefined && value !== null ? String(value).trim() : '';
        if (valStr === '') return;
        
        // Row line
        doc.setDrawColor(...COLORS.border);
        doc.setLineWidth(0.1);
        doc.line(x, localY, x + colW, localY);
        
        // Label
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(...COLORS.text);
        const labelColW = 20; 
        doc.text(`${label}:`, x + gridPad, localY + 4.5);
        
        // Value
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...COLORS.title);
        const valueLines = doc.splitTextToSize(
          valStr,
          colW - gridPad - labelColW - 2
        );
        doc.text(valueLines, x + gridPad + labelColW, localY + 4.5);
        
        const rowH = Math.max(valueLines.length * lineH, 6.5);
        localY += rowH;
      });

      const finalHeight = forcedHeight ? Math.max(localY - sY, forcedHeight) : localY - sY;

      // Outer border
      doc.setDrawColor(...COLORS.border);
      doc.setLineWidth(0.2);
      doc.rect(x, sY, colW, finalHeight, 'S');

      return sY + finalHeight;
    };

    const kundendatenFields = [
      { label: 'Kunde', value: data.customerName || 'Gast' },
      { label: 'Firma', value: data.business },
      { label: 'Personen', value: data.guestCount },
      {
        label: 'Adresse',
        value:
          [data.billingStreet, data.billingPlz, data.billingLocation]
            .filter(Boolean)
            .join(', ') || undefined,
      },
    ];

    const eventdatenFields = [
      { label: 'Datum', value: formatWithSystemFormat(data.eventDate, dateFormat) },
      { label: 'Zeit', value: data.eventTime },
      { label: 'Anlass', value: data.occasion || 'Event' },
      { label: 'Ort', value: data.location || 'Restaurant Oliv' },
      { label: 'Venue', value: data.room },
      {
        label: 'Erstellt',
        value: `${formatWithSystemFormat(new Date(), dateFormat)} ${new Date().toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' })}`,
      },
    ];

    const h1 = getSectionHeight(kundendatenFields);
    const h2 = getSectionHeight(eventdatenFields);
    const maxH = Math.max(h1, h2);

    drawInfoSection('Kundendaten', kundendatenFields, leftX, startY, maxH);
    drawInfoSection('Eventdaten', eventdatenFields, rightX, startY, maxH);

    return startY + maxH + 8;
  };

  // ─── drawHeader ──────────────────────────────────────────────────────────────
  const drawHeader = (isContinuation = false) => {
    const isKitchen = mode === 'kitchen';

    // ── Kitchen continuation page — minimal header only ───────────────────────
    if (isContinuation && isKitchen) {
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.4);
      doc.rect(10, 10, pageWidth - 20, pageHeight - 20, 'S');
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(160, 160, 160);
      doc.setCharSpace(2.5);
      doc.text('KÜCHENPAPIER (FORTS.)', pageWidth / 2, 18, { align: 'center' });
      doc.setCharSpace(0);
      doc.setDrawColor(...COLORS.border);
      doc.setLineWidth(0.2);
      doc.line(margin, 21, margin + contentWidth, 21);
      yPos = 28;
      return;
    }

    // ── Offer / Inquiry continuation page ────────────────────────────────────
    if (isContinuation && !isKitchen) {
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.4);
      doc.rect(10, 10, pageWidth - 20, pageHeight - 20, 'S');
      doc.setDrawColor(...COLORS.border);
      doc.setLineWidth(0.3);
      doc.line(margin, 15, pageWidth - margin, 15);
      doc.setFontSize(8);
      doc.setTextColor(...COLORS.muted);
      doc.text(mode === 'offer' ? 'ANGEBOT (FORTS.)' : 'ANFRAGE (FORTS.)', pageWidth / 2, 12, { align: 'center' });
      yPos = 25;
      return;
    }

    // ── Shared first-page top section (logo + title + subtitle + event pill) ──
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.4);
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20, 'S');

    yPos = 22;

    // Logo (centred)
    try {
      const logoW = 38;
      const logoH = 14;
      const logoX = (pageWidth - logoW) / 2;
      if (typeof window === 'undefined') {
        const fs = require('fs');
        const path = require('path');
        const logoPath = path.join(process.cwd(), 'public', 'assets', 'oliv-logo.png');
        if (fs.existsSync(logoPath)) {
          doc.addImage(fs.readFileSync(logoPath), 'PNG', logoX, yPos, logoW, logoH);
        }
      } else {
        doc.addImage('/assets/oliv-logo.png', 'PNG', logoX, yPos, logoW, logoH);
      }
    } catch {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(...COLORS.secondary);
      doc.text('o l í v', pageWidth / 2, yPos + 8, { align: 'center' });
    }
    yPos += 14;

    // Mode label & ID row (Balanced header row for all modes)
    const safeId = String(data.id || 'Unknown');
    const shortId =
      safeId.length > 8
        ? safeId.substring(safeId.length - 8).toUpperCase()
        : safeId.toUpperCase();

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...COLORS.primary);
    doc.setCharSpace(1.2);
    const modeLabel = isKitchen ? 'KÜCHENPAPIER' : mode === 'offer' ? 'ANGEBOT' : 'ANFRAGE';
    doc.text(modeLabel, margin, yPos);
    doc.setCharSpace(0);

    doc.setTextColor(...COLORS.muted);
    const idSuffix = isKitchen ? '  |  INTERNAL USE ONLY' : '';
    doc.text(`ID: ${shortId}${idSuffix}`, pageWidth - margin, yPos, {
      align: 'right',
    });
    yPos += 8;

    // ── Two-column info grid (shared for ALL modes) ───────────────────────────
    yPos = drawInfoColumns(yPos);

    // Thin divider before items
    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(0.3);
    doc.line(margin, yPos, margin + contentWidth, yPos);
    yPos += 6;
  };

  // ─── checkPageBreak ───────────────────────────────────────────────────────
  const checkPageBreak = (neededHeight: number, showTableHeaders = false) => {
    if (yPos + neededHeight > pageHeight - 25) {
      doc.addPage();
      drawHeader(true);
      if (showTableHeaders) renderTableHeaders();
      return true;
    }
    return false;
  };

  // ─── renderTableHeaders (kitchen items header row) ────────────────────────
  const renderTableHeaders = () => {
    if (mode !== 'kitchen') return;

    doc.setFillColor(...COLORS.background);
    doc.rect(margin, yPos - 5, contentWidth, 9, 'F');

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.setCharSpace(0.8);
    doc.text('ITEM', margin + 12, yPos);
    // CHANGE 1: "QTY" → "QTY/GUEST"
    doc.text('QTY/GUEST', KITCHEN_QTY_CENTER, yPos, { align: 'center' });
    doc.text('DONE', KITCHEN_DONE_X + 3, yPos, { align: 'center' });
    doc.setCharSpace(0);

    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(0.2);
    doc.line(margin, yPos + 2, margin + contentWidth, yPos + 2);
    yPos += 8;
  };

  // ─── drawDietaryIcon ──────────────────────────────────────────────────────
  const drawDietaryIcon = (type: string, x: number, y: number) => {
    if (!type || type === 'none') return;
    const prevFill = doc.getFillColor();
    const prevDraw = doc.getDrawColor();
    doc.setLineWidth(0.3);
    if (type === 'veg' || type === 'vegan') {
      doc.setDrawColor(22, 163, 74);
      doc.rect(x, y - 2.5, 3.5, 3.5, 'S');
      doc.setFillColor(22, 163, 74);
      doc.circle(x + 1.75, y - 0.75, 1, 'F');
    } else if (type === 'non-veg') {
      doc.setDrawColor(220, 38, 38);
      doc.rect(x, y - 2.5, 3.5, 3.5, 'S');
      doc.setFillColor(220, 38, 38);
      doc.circle(x + 1.75, y - 0.75, 1, 'F');
    }
    doc.setFillColor(prevFill);
    doc.setDrawColor(prevDraw);
  };

  // ─── Icon helpers ─────────────────────────────────────────────────────────
  const drawUsersIcon = (x: number, y: number) => {
    const prevFill = doc.getFillColor();
    const prevDraw = doc.getDrawColor();
    doc.setFillColor(100, 116, 139);
    doc.setDrawColor(100, 116, 139);
    doc.setLineWidth(0.1);
    doc.circle(x + 1.75, y - 1.8, 0.8, 'F');
    doc.roundedRect(x + 0.5, y - 0.4, 2.5, 1.4, 0.5, 0.5, 'F');
    doc.setFillColor(prevFill);
    doc.setDrawColor(prevDraw);
  };

  const drawPackageIcon = (x: number, y: number) => {
    const prevFill = doc.getFillColor();
    const prevDraw = doc.getDrawColor();
    doc.setDrawColor(100, 116, 139);
    doc.setLineWidth(0.3);
    doc.rect(x, y - 2.5, 3.5, 3.5, 'S');
    doc.setLineWidth(0.15);
    doc.line(x + 1.75, y - 2.5, x + 1.75, y - 1);
    doc.line(x + 0.5, y - 2.2, x + 1.75, y - 1.2);
    doc.line(x + 3, y - 2.2, x + 1.75, y - 1.2);
    doc.setFillColor(prevFill);
    doc.setDrawColor(prevDraw);
  };

  const drawWineIcon = (x: number, y: number) => {
    const prevFill = doc.getFillColor();
    const prevDraw = doc.getDrawColor();
    doc.setDrawColor(100, 116, 139);
    doc.setLineWidth(0.3);
    doc.line(x + 0.5, y + 1.2, x + 3, y + 1.2);
    doc.line(x + 1.75, y - 0.5, x + 1.75, y + 1.2);
    doc.setLineWidth(0.35);
    doc.line(x + 0.5, y - 3, x + 3, y - 3);
    doc.lines(
      [[0, 1.2, 0.5, 2.5, 1.25, 2.5], [0.75, 0, 1.25, -1.3, 1.25, -2.5]],
      x + 0.5,
      y - 3,
      [1, 1],
      'S',
      false
    );
    doc.setFillColor(prevFill);
    doc.setDrawColor(prevDraw);
  };

  // ─── renderItemInfo (choices / notes sub-line) ────────────────────────────
  const renderItemInfo = (
    label: string,
    text?: string,
    color: [number, number, number] = [180, 83, 9]
  ) => {
    if (!text || !text.trim()) return;
    doc.setTextColor(...color);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    const maxWidth = mode === 'kitchen' ? KITCHEN_NAME_MAX_W : contentWidth - 30;
    const lineH = 4.5;
    const indentX = mode === 'kitchen' ? margin + 12 : margin + 7;
    
    let cleanText = text.trim();
    const possibleLabels = [label, 'Choices', 'Add-ons', 'Note', 'Variant', 'Option'];
    let changed = true;
    while (changed) {
      changed = false;
      for (const l of possibleLabels) {
        const prefix = `${l}: `;
        if (cleanText.toLowerCase().startsWith(prefix.toLowerCase())) {
          cleanText = cleanText.substring(prefix.length).trim();
          changed = true;
        }
      }
    }
    if (!cleanText) return;

    let processedText = cleanText.replace(
      /([^,:]+?)\s*(\(Veg\)|\(Vegan\)|\(Non-Veg\))/gi,
      (_match, name, tag) => `${tag} ${name.trim()}`
    );
    const tagMatchRegex = /(\(Veg\)|\(Vegan\)|\(Non-Veg\)|[🟢🔴⚪⚫])/gi;

    const parts = (`${label}: ` + processedText).split(tagMatchRegex);
    let currentX = indentX;
    let currentY = yPos + 1.5;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (!part) continue;
      const lowerPart = part.trim().toLowerCase();
      let tagType: 'veg' | 'non-veg' | 'vegan' | null = null;
      if (lowerPart === '(veg)' || lowerPart === '🟢') tagType = 'veg';
      else if (lowerPart === '(vegan)' || lowerPart === '⚪') tagType = 'vegan';
      else if (lowerPart === '(non-veg)' || lowerPart === '🔴') tagType = 'non-veg';
      if (tagType) {
        const nextText = parts[i + 1] || '';
        const nextWord = (nextText.match(/\S+/) || [''])[0];
        const nextWordWidth = doc.getTextWidth(nextWord);
        if (currentX + 6 + nextWordWidth > indentX + maxWidth) {
          currentX = indentX;
          currentY += lineH;
          checkPageBreak(lineH + 2);
          doc.setTextColor(...color);
          doc.setFont('helvetica', 'italic');
          doc.setFontSize(8.5);
        }
        drawDietaryIcon(tagType, currentX + 0.5, currentY - 0.5);
        currentX += 5.5;
      } else {
        const tokens = part.match(/\S+|\s+/g) || [];
        for (const token of tokens) {
          const tokenWidth = doc.getTextWidth(token);
          if (token.trim() === '') {
            if (currentX === indentX) continue;
          } else if (currentX + tokenWidth > indentX + maxWidth) {
            currentX = indentX;
            currentY += lineH;
            checkPageBreak(lineH + 2);
            doc.setTextColor(...color);
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(8.5);
          }
          const printToken = currentX === indentX ? token.replace(/^\s+/, '') : token;
          if (printToken) {
            doc.text(printToken, currentX, currentY);
            currentX += doc.getTextWidth(printToken);
          }
        }
      }
    }
    yPos = currentY + lineH + 0.5;
    doc.setTextColor(...COLORS.title);
  };

  // ─── Item grouping ────────────────────────────────────────────────────────
  const isFlatFee = (item: PdfBookingItem) =>
    item.pricingType === 'flat-rate' || item.pricingType === 'flat_fee';

  const finalFoodItems = data.items.filter((item) => {
    const isBev = ['Beverages', 'Drink', 'Drinks', 'Softdrinks', 'Wein', 'Bier', 'Kaffee', 'Wine', 'Beer'].includes(item.category);
    const isAddon = item.category === 'Add-ons' || isFlatFee(item);
    return !isBev && !isAddon;
  });
  const finalBeverages = data.items.filter((item) =>
    ['Beverages', 'Drink', 'Drinks', 'Softdrinks', 'Wein', 'Bier', 'Kaffee', 'Wine', 'Beer'].includes(item.category)
  );
  const finalAddons = data.items.filter((item) => {
    const isBev = ['Beverages', 'Drink', 'Drinks', 'Softdrinks', 'Wein', 'Bier', 'Kaffee', 'Wine', 'Beer'].includes(item.category);
    return (item.category === 'Add-ons' || isFlatFee(item)) && !isBev;
  });

  const dietaryTotals = calculateDietaryTotals(
    finalFoodItems.map(item => ({
      category: item.category,
      price: item.unitPrice || 0,
      pricingType: item.pricingType,
      dietaryType: item.dietaryType || 'none',
      useSpecialCalculation: item.useSpecialCalculation || false,
      isSpecialCategory: item.isSpecialCategory || false,
      guestCount: item.quantity
    })),
    data.guestCount
  );

  // Category order is now handled via database sort order passed in PdfBookingItem
  // Fallback to alphabetical if sort order is missing or identical


  const mainGroups = [
    { name: 'Food Items', items: finalFoodItems },
    { name: 'Beverages', items: finalBeverages },
    { name: 'Add-ons', items: finalAddons },
  ].filter((g) => g.items.length > 0);

  // ─── Draw header ──────────────────────────────────────────────────────────
  drawHeader();

  // ═════════════════════════════════════════════════════════════════════════════
  // KITCHEN MODE — item rendering
  // ═════════════════════════════════════════════════════════════════════════════
  if (mode === 'kitchen') {
    mainGroups.forEach((group) => {
      // Group header bar
      checkPageBreak(18, false);
      doc.setFillColor(...COLORS.background);
      doc.rect(margin, yPos, contentWidth, 9, 'F');
      doc.setDrawColor(...COLORS.border);
      doc.setLineWidth(0.2);
      doc.rect(margin, yPos, contentWidth, 9, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...COLORS.secondary);
      doc.setCharSpace(1.2);
      doc.text(group.name.toUpperCase(), margin + 5, yPos + 6);
      doc.setCharSpace(0);

      // Column headers on the right side of the group bar
      // CHANGE 1: "QTY" → "QTY/GUEST" in group bar header too
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text('QTY/GUEST', KITCHEN_QTY_CENTER, yPos + 6, { align: 'center' });
      doc.text('DONE', KITCHEN_DONE_X + 3, yPos + 6, { align: 'center' });
      yPos += 8;

      // Sort items
      const sortedItems = [...group.items].sort((a, b) => {
        const orderA = a.categorySortOrder !== undefined && a.categorySortOrder !== null ? a.categorySortOrder : 999;
        const orderB = b.categorySortOrder !== undefined && b.categorySortOrder !== null ? b.categorySortOrder : 999;

        if (orderA !== orderB) {
          return orderA - orderB;
        }

        const catA = (a.category || '').trim();
        const catB = (b.category || '').trim();
        return catA.localeCompare(catB);
      });

      let lastCategory = '';
      sortedItems.forEach((item) => {
        const gName = group.name.toLowerCase().replace(' items', '').trim();
        const cName = (item.category || '').toLowerCase().trim();
        const isRedundant = cName === gName || gName.startsWith(cName) || cName.startsWith(gName);

        if (item.category !== lastCategory && !isRedundant) {
          checkPageBreak(18, false);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7.5);
          doc.setTextColor(...COLORS.primary);
          doc.setCharSpace(1);
          doc.text(item.category.toUpperCase(), margin + 3, yPos + 2);
          doc.setCharSpace(0);
          yPos += 3;
          doc.setDrawColor(210, 210, 210);
          doc.setLineWidth(0.15);
          doc.line(margin, yPos, margin + contentWidth, yPos);
          yPos += 4;
          lastCategory = item.category;
        } else if (item.category !== lastCategory) {
          lastCategory = item.category;
        }

        const nameLines = doc.splitTextToSize(item.name, KITCHEN_NAME_MAX_W);
        const rowH = Math.max(nameLines.length * 5, 8);
        let estimatedH = rowH + 6;
        if (item.notes) estimatedH += 6;
        if (item.customerComment) estimatedH += 6;
        checkPageBreak(estimatedH, false);

        const rowTopY = yPos;
        const iconX = margin + 3;
        const textX = margin + (item.dietaryType && item.dietaryType !== 'none' ? 12 : 6);

        if (item.dietaryType && item.dietaryType !== 'none') {
          drawDietaryIcon(item.dietaryType, iconX, rowTopY + 4);
        }

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(...COLORS.title);
        doc.text(nameLines, textX, rowTopY + 4);

        yPos = rowTopY + nameLines.length * 5 + 2;

        renderItemInfo('Choices', item.notes, [115, 128, 106]);
        renderItemInfo('Note', item.customerComment, [180, 83, 9]);

        // ── Quantity column ────────────────────────────────────────────────
        const qtyStr = String(item.quantity);
        const qtyW = doc.getTextWidth(qtyStr);
        const iconW = 3.5;
        const gap = 1.5;
        const totalW = iconW + gap + qtyW;
        const qtyStartX = KITCHEN_QTY_CENTER - totalW / 2;

        if (item.pricingType === 'per_person') drawUsersIcon(qtyStartX, rowTopY + 4);
        else if (item.category === 'Beverages' || item.pricingType === 'consumption')
          drawWineIcon(qtyStartX, rowTopY + 4);
        else drawPackageIcon(qtyStartX, rowTopY + 4);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(...COLORS.title);
        doc.text(qtyStr, qtyStartX + iconW + gap, rowTopY + 4);



        // ── Done checkbox ─────────────────────────────────────────────────
        doc.setDrawColor(...COLORS.primary);
        doc.setLineWidth(0.5);
        doc.roundedRect(KITCHEN_DONE_X, rowTopY + 0.5, 6, 6, 0.5, 0.5, 'S');

        doc.setDrawColor(...COLORS.border);
        doc.setLineWidth(0.1);
        doc.line(margin + 6, yPos, margin + contentWidth, yPos);
        yPos += 4;
      });
      yPos += 6;
    });
  }

  // ═════════════════════════════════════════════════════════════════════════════
  // OFFER / INQUIRY MODE — item rendering
  // ═════════════════════════════════════════════════════════════════════════════
  if (mode === 'offer' || mode === 'inquiry') {
    mainGroups.forEach((group) => {
      // Group header bar (Synchronized with kitchen style for a premium look)
      checkPageBreak(18, false);
      doc.setFillColor(...COLORS.background);
      doc.rect(margin, yPos, contentWidth, 9, 'F');
      doc.setDrawColor(...COLORS.border);
      doc.setLineWidth(0.2);
      doc.rect(margin, yPos, contentWidth, 9, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...COLORS.secondary);
      doc.setCharSpace(1.2);
      doc.text(group.name.toUpperCase(), margin + 5, yPos + 6);
      doc.setCharSpace(0);

      // Column headers
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      if (mode !== 'inquiry') {
        doc.text('QTY x PRICE', margin + 85 + 2, yPos + 6);
      } else {
        const hasQuantity = group.items.some(item => item.showQuantity);
        if (hasQuantity) {
          doc.text('QTY / GUESTS', margin + 85 + 2, yPos + 6);
        }
      }
      doc.text(mode === 'inquiry' ? 'PRICE' : 'TOTAL', margin + contentWidth - 5, yPos + 6, { align: 'right' });
      yPos += 8;

      const sortedItems = [...group.items].sort((a, b) => {
        const orderA = a.categorySortOrder !== undefined && a.categorySortOrder !== null ? a.categorySortOrder : 999;
        const orderB = b.categorySortOrder !== undefined && b.categorySortOrder !== null ? b.categorySortOrder : 999;

        if (orderA !== orderB) {
          return orderA - orderB;
        }

        const catA = (a.category || '').trim();
        const catB = (b.category || '').trim();
        return catA.localeCompare(catB);
      });

      let lastCategory = '';
      sortedItems.forEach((item) => {
        if (item.category !== lastCategory) {
          checkPageBreak(15);
          yPos += 3;
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.setTextColor(140, 140, 140);
          doc.setCharSpace(2);
          doc.text(item.category.toUpperCase(), margin, yPos);
          doc.setCharSpace(0);
          yPos += 2;
          doc.setDrawColor(215, 215, 215);
          doc.setLineWidth(0.2);
          doc.line(margin, yPos, margin + contentWidth, yPos);
          yPos += 4;
          lastCategory = item.category;
        }

        const itemMaxWidth = 95;
        const nameLines = doc.splitTextToSize(item.name, itemMaxWidth);
        const nameHeight = nameLines.length * 4.5;

        let estimatedHeight = nameHeight + 10;
        if (item.notes) estimatedHeight += 5;
        if (item.customerComment) estimatedHeight += 5;
        checkPageBreak(estimatedHeight);

        const itemTextX = margin + (item.dietaryType && item.dietaryType !== 'none' ? 7 : 0);
        if (item.dietaryType && item.dietaryType !== 'none') {
          drawDietaryIcon(item.dietaryType, margin, yPos + 3);
        }

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(...COLORS.title);
        doc.text(nameLines, itemTextX, yPos + 4);

        const priceY = yPos + 4;
        yPos += nameHeight + 2;

        renderItemInfo('Choices', item.notes, [115, 128, 106]);
        renderItemInfo('Note', item.customerComment, [180, 83, 9]);

        if (mode === 'inquiry') {
          if (item.showQuantity) {
            const qtyVal = String(item.quantity);
            const iconW = 3.5;
            const gap = 1.5;
            const currentX = margin + 85;

            if (item.pricingType === 'per_person') drawUsersIcon(currentX, priceY);
            else if (item.category === 'Beverages' || item.pricingType === 'consumption')
              drawWineIcon(currentX, priceY);
            else drawPackageIcon(currentX, priceY);

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9.5);
            doc.setTextColor(...COLORS.text);
            doc.text(qtyVal, currentX + iconW + gap, priceY);
          }

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9.5);
          doc.setTextColor(...COLORS.title);
          doc.text(
            `CHF ${Number(item.unitPrice).toFixed(2)}`,
            margin + contentWidth,
            priceY,
            { align: 'right' }
          );
        } else {
          // OFFER mode
          const qtyVal = String(item.quantity);
          const unitPriceTxt = ` x ${Number(item.unitPrice).toFixed(0)} CHF`;
          const baseTxt = (qtyVal + ' ').trim();
          const iconW = 3.5;
          const gap = 1.5;
          const currentX = margin + 85;

          if (item.pricingType === 'per_person') drawUsersIcon(currentX, priceY);
          else if (item.category === 'Beverages' || item.pricingType === 'consumption')
            drawWineIcon(currentX, priceY);
          else drawPackageIcon(currentX, priceY);

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9.5);
          doc.setTextColor(...COLORS.text);
          doc.text(baseTxt, currentX + iconW + gap, priceY);
          doc.text(
            unitPriceTxt,
            currentX + iconW + gap + doc.getTextWidth(baseTxt),
            priceY
          );



          doc.setFont('helvetica', 'bold');
          doc.setTextColor(...COLORS.title);
          doc.text(
            `CHF ${item.totalPrice?.toFixed(2)}`,
            margin + contentWidth,
            priceY,
            { align: 'right' }
          );
        }

        yPos += 3;
        doc.setDrawColor(235, 235, 235);
        doc.setLineWidth(0.15);
        doc.line(margin, yPos, margin + contentWidth, yPos);
        yPos += 5;
      });
      yPos += 8;
    });
  }

  // ─── Note sections ────────────────────────────────────────────────────────
  const renderNoteSection = (title: string, text?: string, isWarning = false) => {
    if (!text || !text.trim()) return;
    yPos += 10;
    const lines = doc.splitTextToSize(text, contentWidth - 10);
    const boxH = lines.length * 5 + 15;
    checkPageBreak(boxH + 5);
    if (isWarning) {
      doc.setFillColor(254, 242, 242);
      doc.setDrawColor(252, 165, 165);
    } else {
      doc.setFillColor(241, 245, 249);
      doc.setDrawColor(203, 213, 225);
    }
    doc.rect(margin, yPos, contentWidth, boxH, 'F');
    doc.rect(margin, yPos, contentWidth, boxH, 'S');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(
      isWarning ? 185 : COLORS.title[0],
      isWarning ? 28 : COLORS.title[1],
      isWarning ? 28 : COLORS.title[2]
    );
    doc.text(title.toUpperCase(), margin + 5, yPos + 7);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(
      isWarning ? 153 : COLORS.text[0],
      isWarning ? 27 : COLORS.text[1],
      isWarning ? 27 : COLORS.text[2]
    );
    doc.text(lines, margin + 5, yPos + 14);
    yPos += boxH;
  };

  const allergies = data.allergies ? String(data.allergies) : undefined;
  const requests = data.specialRequests ? String(data.specialRequests) : undefined;
  const kitchen = data.kitchenNotes ? String(data.kitchenNotes) : undefined;

  if (mode === 'offer' || mode === 'inquiry') {
    renderNoteSection('Allergien & Diätetisch', allergies, true);
    renderNoteSection('Besondere Wünsche', requests);
  } else {
    renderNoteSection('Allergien & Diätetisch', allergies, true);
    renderNoteSection('Besondere Wünsche', requests);
    renderNoteSection('Staff Notes', kitchen);
  }

  // ─── Pricing summary (offer / inquiry only) ───────────────────────────────
  if (mode === 'offer' || mode === 'inquiry') {
    checkPageBreak(80);
    yPos += 10;
    doc.setDrawColor(...COLORS.primary);
    doc.setLineWidth(0.8);
    doc.line(margin, yPos, margin + contentWidth, yPos);
    yPos += 10;
    const hasDietaryData = dietaryTotals.veg > 0 || dietaryTotals.nonVeg > 0;
    if (hasDietaryData) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(...COLORS.secondary);
      doc.text('Preis pro Person (nach Diät)', margin, yPos);
      yPos += 9;
      const lineHeight = 7;
      if (dietaryTotals.veg > 0) {
        drawDietaryIcon('veg', margin, yPos - 0.5);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(...COLORS.text);
        doc.text('Vegetarische Variante', margin + 6, yPos);
        doc.setFont('helvetica', 'bold');
        doc.text(`CHF ${dietaryTotals.veg.toFixed(2)}`, margin + contentWidth, yPos, {
          align: 'right',
        });
        yPos += lineHeight;
      }
      if (dietaryTotals.nonVeg > 0) {
        drawDietaryIcon('non-veg', margin, yPos - 0.5);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(...COLORS.text);
        doc.text('Fleischvariante', margin + 6, yPos);
        doc.setFont('helvetica', 'bold');
        doc.text(`CHF ${dietaryTotals.nonVeg.toFixed(2)}`, margin + contentWidth, yPos, {
          align: 'right',
        });
        yPos += lineHeight;
      }
      yPos += 2;
      doc.setDrawColor(...COLORS.border);
      doc.setLineWidth(0.3);
      doc.line(margin, yPos, margin + contentWidth, yPos);
      yPos += 10;
    }

    let displayTotal = data.estimatedTotal;
    if (mode === 'inquiry') {
      const maxTotalPP = Math.max(dietaryTotals.veg, dietaryTotals.nonVeg);
      const foodTotal = maxTotalPP * (data.guestCount || 1);
      const otherItemsTotal = data.items
        .filter(
          (item) =>
            ['Beverages', 'Drink', 'Drinks', 'Softdrinks', 'Wein', 'Bier', 'Kaffee', 'Wine', 'Beer'].includes(item.category) ||
            item.category === 'Add-ons' ||
            isFlatFee(item)
        )
        .reduce((sum, item) => sum + (item.totalPrice || 0), 0);
      displayTotal = foodTotal + otherItemsTotal;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(180, 83, 9);
      doc.text(
        'Die abgebildeten Kosten wurden auf Basis der jeweils teuersten Auswahl pro Kategorie berechnet.',
        margin,
        yPos,
        { maxWidth: contentWidth }
      );
      yPos += 8;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(...COLORS.secondary);
    doc.text('Gesamtbetrag', margin, yPos);
    doc.text(`CHF ${displayTotal?.toFixed(2)}`, margin + contentWidth, yPos, {
      align: 'right',
    });
    yPos += 7;
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.muted);
    doc.text(
      `Kalkulation für ${data.guestCount} Personen (exkl. Service & Getränke nach Aufwand)`,
      margin,
      yPos
    );
    yPos += 10;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(160, 160, 160);
    const footerNote =
      'Definitive Anzahl Menüs bitte mind. 4 Tage vor dem Event melden. Abrechnung nach bestätigter Anzahl.';
    const footerLines = doc.splitTextToSize(footerNote, contentWidth);
    doc.text(footerLines, pageWidth / 2, yPos, { align: 'center' });
  }

  // ─── Page footer ──────────────────────────────────────────────────────────
  const total = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.muted);
    doc.text(
      `Oliv Restaurant | Page ${i} of ${total} | Generated on ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      pageWidth / 2,
      pageHeight - 6,
      { align: 'center' }
    );
  }

  return doc;
}

export async function generateCustomerOfferPdf(data: PdfBookingData): Promise<jsPDF> {
  return generateBookingPdf(data, 'offer');
}