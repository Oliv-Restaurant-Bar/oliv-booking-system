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
  dietaryType?: 'veg' | 'non-veg' | 'vegan' | 'none';
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
      doc.text(`BOOKING (CONT.)`, margin, 12);
      doc.text(`Datum: ${new Date().toLocaleDateString('de-CH')} ${new Date().toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' })}`, pageWidth - margin, 12, { align: 'right' });

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
    const title = String(mode === 'kitchen' ? "KÜCHENPAPIER" : "");
    doc.text(title + (isContinuation ? " (FORTS.)" : ""), margin, 34);

    // Meta (Right side)
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.secondary);
    const safeId = String(data.id || 'Unknown');
    const shortId = safeId.length > 8 ? safeId.substring(safeId.length - 8).toUpperCase() : safeId.toUpperCase();
    
    if (mode === 'kitchen') {
      doc.setFont("helvetica", "bold");
      doc.text(`INTERNAL USE ONLY | ID: ${shortId}`, pageWidth - margin, 20, { align: 'right' });
    } else {
      // Inquiry ID removed at user request
    }

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const dateStr = mode === 'kitchen' 
      ? `Generated: ${new Date().toLocaleDateString('de-CH')} ${new Date().toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' })}` 
      : `Datum: ${new Date().toLocaleDateString('de-CH')} ${new Date().toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' })}`;
    doc.text(String(dateStr), pageWidth - margin, 34, { align: 'right' });

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
  doc.text("KUNDENDATEN", leftX, yPos);
  doc.text("EVENTDATEN", rightX, yPos);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  let leftY = yPos + 8;
  let rightY = yPos + 8;

  // Helper to render multi-line field and return new Y
  const renderField = (label: string, value: string | number, x: number, y: number, width: number) => {
    doc.setFont("helvetica", "bold");
    const labelText = `${label}: `;
    doc.text(labelText, x + 2, y);

    const labelWidth = doc.getTextWidth(labelText);
    doc.setFont("helvetica", "normal");

    const valueText = String(value);
    const availableWidth = width - labelWidth - 2;
    const lines = doc.splitTextToSize(valueText, availableWidth);

    // First line after the label
    doc.text(lines[0], x + 2 + labelWidth, y);

    // Subsequent lines (if any)
    if (lines.length > 1) {
      for (let i = 1; i < lines.length; i++) {
        doc.text(lines[i], x + 2, y + (i * detailLineHeight));
      }
    }

    return y + (lines.length * detailLineHeight) + 1;
  };

  // Customer Side
  leftY = renderField('Kunde', String(data.customerName || 'Gast'), leftX, leftY, colW);
  if (data.business) {
    doc.setFont("helvetica", "bold");
    const bizLines = doc.splitTextToSize(String(data.business), colW);
    doc.text(bizLines, leftX + 2, leftY);
    leftY += (bizLines.length * detailLineHeight) + 1;
    doc.setFont("helvetica", "normal");
  }
  leftY = renderField('Personen', String(data.guestCount || 0), leftX, leftY, colW);
  const billingParts = [data.billingStreet, data.billingPlz, data.billingLocation].filter(Boolean);
  if (billingParts.length > 0) {
    leftY = renderField('Adresse', billingParts.join(', '), leftX, leftY, colW);
  }

  // Event Side
  rightY = renderField('Datum', String(data.eventDate || 'N/A'), rightX, rightY, colW);
  rightY = renderField('Zeit', String(data.eventTime || 'N/A'), rightX, rightY, colW);
  rightY = renderField('Anlass', String(data.occasion || 'Event'), rightX, rightY, colW);
  rightY = renderField('Ort', String(data.location || 'Restaurant Oliv'), rightX, rightY, colW);
  if (data.room) {
    rightY = renderField(mode === 'kitchen' ? 'Venue' : 'Veranstaltungsort', String(data.room), rightX, rightY, colW);
  }

  yPos = Math.max(leftY, rightY) + 8;

  // Table
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("IHRE AUSWAHL", margin, yPos);
  yPos += 8;

  renderTableHeaders();

  // Helpers for grouping
  const isFlatFee = (item: PdfBookingItem) => item.pricingType === 'flat-rate' || item.pricingType === 'flat_fee';

  const foodItemsList = data.items.filter(item => item.category !== 'Beverages' && item.category !== 'Add-ons' && !isFlatFee(item) && item.category !== 'Drinks' && item.category !== 'Wine' && item.category !== 'Beer');
  const beveragesList = data.items.filter(item => item.category === 'Beverages' || item.category === 'Drink' || item.category === 'Drinks' || item.category === 'Softdrinks' || item.category === 'Wein' || item.category === 'Bier' || item.category === 'Coffee' || item.category === 'Drinks' || item.category === 'Kaffee' || item.category === 'Drink' || item.category === 'Wein' || item.category === 'Beer' || item.category === 'Wine');
  // Re-filtering as beveragesList might overlap if we are not careful
  const finalFoodItems = data.items.filter(item => {
    const isBev = item.category === 'Beverages' || item.category === 'Drink' || item.category === 'Drinks' || item.category === 'Softdrinks' || item.category === 'Wein' || item.category === 'Bier' || item.category === 'Kaffee' || item.category === 'Wine' || item.category === 'Beer';
    const isAddon = item.category === 'Add-ons' || isFlatFee(item);
    return !isBev && !isAddon;
  });
  const finalBeverages = data.items.filter(item => {
    return item.category === 'Beverages' || item.category === 'Drink' || item.category === 'Drinks' || item.category === 'Softdrinks' || item.category === 'Wein' || item.category === 'Bier' || item.category === 'Kaffee' || item.category === 'Wine' || item.category === 'Beer';
  });
  const finalAddons = data.items.filter(item => {
    const isBev = item.category === 'Beverages' || item.category === 'Drink' || item.category === 'Drinks' || item.category === 'Softdrinks' || item.category === 'Wein' || item.category === 'Bier' || item.category === 'Kaffee' || item.category === 'Wine' || item.category === 'Beer';
    return (item.category === 'Add-ons' || isFlatFee(item)) && !isBev;
  });
  // Helper to draw dietary icon (geometric representation of the UI icons)
  const drawDietaryIcon = (type: string, x: number, y: number) => {
    if (!type || type === 'none') return;
    
    const prevFill = doc.getFillColor();
    const prevDraw = doc.getDrawColor();
    
    // Switch to graphic mode
    doc.setLineWidth(0.3);
    
    if (type === 'veg') {
      doc.setDrawColor(22, 163, 74); // green-600 border
      doc.rect(x, y - 2.5, 3.5, 3.5, 'S');
      doc.setFillColor(22, 163, 74); // green-600 dot
      doc.circle(x + 1.75, y - 0.75, 1, 'F');
    } else if (type === 'non-veg') {
      doc.setDrawColor(220, 38, 38); // red-600 border
      doc.rect(x, y - 2.5, 3.5, 3.5, 'S');
      doc.setFillColor(220, 38, 38); // red-600 dot
      doc.circle(x + 1.75, y - 0.75, 1, 'F');
    } else if (type === 'vegan') {
      // Draw a vector leaf outline matching the Lucide 'Leaf' reference in the UI
      doc.setDrawColor(5, 150, 105); // emerald-600
      doc.setLineWidth(0.35);
      
      // Draw bezier leaf
      doc.lines(
        [
          [1.5, -1.2, 1.2, -2.7, 0, -3.4], 
          [-1.2, 1.5, -1.5, 2.7, 0, 3.4]
        ], 
        x + 1.75, y + 0.6, [1, 1], 'S', true
      );
      
      // Draw inner leaf vein
      doc.line(x + 1.75, y + 0.6, x + 1.75, y - 1.6);
    }
    
    // Reset colors
    doc.setFillColor(prevFill);
    doc.setDrawColor(prevDraw);
  };

  const drawUsersIcon = (x: number, y: number) => {
    const prevFill = doc.getFillColor();
    const prevDraw = doc.getDrawColor();
    
    doc.setFillColor(100, 116, 139); // slate-500
    doc.setDrawColor(100, 116, 139); 
    doc.setLineWidth(0.1);
    
    // Head - Solid
    doc.circle(x + 1.75, y - 1.8, 0.8, 'F');
    // Body - Solid rounded
    doc.roundedRect(x + 0.5, y - 0.4, 2.5, 1.4, 0.5, 0.5, 'F');
    
    doc.setFillColor(prevFill);
    doc.setDrawColor(prevDraw);
  };

  const drawPackageIcon = (x: number, y: number) => {
    const prevFill = doc.getFillColor();
    const prevDraw = doc.getDrawColor();
    
    doc.setDrawColor(100, 116, 139); // slate-500
    doc.setLineWidth(0.3);
    
    // Box outline
    doc.rect(x, y - 2.5, 3.5, 3.5, 'S');
    // Internal lines for box flap
    doc.setLineWidth(0.15);
    doc.line(x + 1.75, y - 2.5, x + 1.75, y - 1);
    doc.line(x + 0.5, y - 2.2, x + 1.75, y - 1.2);
    doc.line(x + 3, y - 2.2, x + 1.75, y - 1.2);
    
    doc.setFillColor(prevFill);
    doc.setDrawColor(prevDraw);
  };


  // Helper for multi-line item info (Add-ons/Notes)
  const renderItemInfo = (label: string, text?: string, color: [number, number, number] = [180, 83, 9]) => {
    if (!text || !text.trim()) return;
    
    doc.setTextColor(...color);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8.5);

    const maxWidth = contentWidth - 20;
    const lineH = 4;
    
    // Reorder dietary tags to be before the name they describe: "Name (Tag)" -> "(Tag) Name"
    const reorderedText = text.replace(/([^,:]+?)\s*(\(Veg\)|\(Vegan\)|\(Non-Veg\))/gi, (match, name, tag) => `${tag} ${name.trim()}`);
    
    // Split text into main parts: tags and text blocks
    const parts = (`${label}: ` + reorderedText).split(/(\(Veg\)|\(Vegan\)|\(Non-Veg\))/gi);
    
    let currentX = margin + 10;
    let currentY = yPos - 1;
    
    checkPageBreak(lineH + 2);

    for (const part of parts) {
        if (!part) continue;
        
        const lowerPart = part.toLowerCase();
        const isTag = lowerPart === '(veg)' || lowerPart === '(vegan)' || lowerPart === '(non-veg)';
        
        if (isTag) {
            const tagType = lowerPart === '(veg)' ? 'veg' : lowerPart === '(vegan)' ? 'vegan' : 'non-veg';
            
            // Check for wrapping before drawing tag
            if (currentX + 5 > margin + 10 + maxWidth) {
                currentX = margin + 10;
                currentY += lineH;
                checkPageBreak(lineH + 2);
                doc.setTextColor(...color);
                doc.setFont("helvetica", "italic");
                doc.setFontSize(8.5);
            }
            
            drawDietaryIcon(tagType, currentX + 0.5, currentY - 0.5);
            currentX += 4.5;
        } else {
            // Further tokenize text by whitespaces and non-whitespaces for proper wrapping
            const tokens = part.match(/\S+|\s+/g) || [];
            
            for (const token of tokens) {
                const tokenWidth = doc.getTextWidth(token);
                
                if (token.trim() === '') {
                    // Skip leading spaces on new lines
                    if (currentX === margin + 10) continue;
                } else if (currentX + tokenWidth > margin + 10 + maxWidth) {
                    currentX = margin + 10;
                    currentY += lineH;
                    checkPageBreak(lineH + 2);
                    doc.setTextColor(...color);
                    doc.setFont("helvetica", "italic");
                    doc.setFontSize(8.5);
                }
                
                const printToken = (currentX === margin + 10) ? token.replace(/^\s+/, '') : token;
                if (printToken) {
                    doc.text(printToken, currentX, currentY);
                    currentX += doc.getTextWidth(printToken);
                }
            }
        }
    }
    
    yPos = currentY + lineH + 1;
    doc.setTextColor(...COLORS.title);
  };

  // Calculate dietary breakdown (only for food items, not beverages or addons)
  const calculateDietaryBreakdown = () => {
    const foodItems = finalFoodItems.filter(item => {
      // Only include items with dietary type and per-person pricing
      return item.dietaryType && item.dietaryType !== 'none' && item.pricingType === 'per_person';
    });

    const breakdown: Record<string, { total: number; perPerson: number }> = {
      veg: { total: 0, perPerson: 0 },
      'non-veg': { total: 0, perPerson: 0 },
      vegan: { total: 0, perPerson: 0 }
    };

    foodItems.forEach(item => {
      if (item.dietaryType && item.dietaryType !== 'none') {
        if (!breakdown[item.dietaryType]) {
          breakdown[item.dietaryType] = { total: 0, perPerson: 0 };
        }
        const itemTotal = item.totalPrice || 0;
        breakdown[item.dietaryType].total += itemTotal;
        breakdown[item.dietaryType].perPerson += item.unitPrice || 0;
      }
    });

    return breakdown;
  };

  const dietaryBreakdown = calculateDietaryBreakdown();

  const mainGroups = [
    { name: "Food Items", items: finalFoodItems },
    { name: "Beverages", items: finalBeverages },
    { name: "Add-ons", items: finalAddons }
  ].filter(g => g.items.length > 0);

  const categoryOrder = ["Vorspeisen", "Hauptgänge", "Desserts", "Snacks", "Apéro", "Menü"];

  mainGroups.forEach(group => {
    checkPageBreak(20, true);

    // Main Group Header
    doc.setFillColor(248, 250, 252); // slate-50
    doc.rect(margin, yPos, contentWidth, 10, 'F');
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...COLORS.secondary);
    yPos += 7;
    doc.text(group.name.toUpperCase(), margin + 3, yPos);
    yPos += 8;

    const sortedItemsInGroup = [...group.items].sort((a, b) => {
      const idxA = categoryOrder.indexOf(a.category);
      const idxB = categoryOrder.indexOf(b.category);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      return a.category.localeCompare(b.category);
    });

    let lastCategory = "";
    sortedItemsInGroup.forEach(item => {
      let displayName = item.name;
      
      // Calculate layout before rendering
      const itemMaxWidth = mode === 'kitchen' ? 120 : 95;
      const textX = margin + 12;
      const iconX = margin + 6.5; 
      
      // we remove the hardcoded text since we will draw it instead
      // if (item.dietaryType === 'veg') displayName += ' (Veg)';
      // else if (item.dietaryType === 'vegan') displayName += ' (Vegan)';
      // else if (item.dietaryType === 'non-veg') displayName += ' (Non-Veg)';

      const nameLines = doc.splitTextToSize(displayName, itemMaxWidth);
      const rowH = Math.max(nameLines.length * 5, 8);

      // Check if sub-category changed
      if (item.category !== lastCategory) {
        checkPageBreak(15, true);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(...COLORS.primary);
        yPos += 6;
        doc.text(item.category.toUpperCase(), margin + 5, yPos);
        yPos += 5;
        lastCategory = item.category;
      }

      checkPageBreak(rowH + 5, true);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(...COLORS.title);

      // Draw dietary icon for main item
      if (item.dietaryType && item.dietaryType !== 'none') {
        drawDietaryIcon(item.dietaryType, iconX, yPos + 4);
      }

      if (mode === 'kitchen') {
        doc.text(nameLines, textX, yPos + 4);
        
        // Quantity with icon
        const qtyStr = String(item.quantity);
        const qtyW = doc.getTextWidth(qtyStr);
        const iconW = 3.5;
        const gap = 1.5;
        const totalW = iconW + gap + qtyW;
        const centerOffset = margin + 130;
        const startX = centerOffset - (totalW / 2);
        
        if (item.pricingType === 'per_person') {
          drawUsersIcon(startX, yPos + 4);
        } else {
          drawPackageIcon(startX, yPos + 4);
        }
        doc.text(qtyStr, startX + iconW + gap, yPos + 4);

        doc.setDrawColor(203, 213, 225);
        doc.rect(margin + 160 - 3, yPos + 4 - 3.5, 6, 6);
      } else {
        doc.text(nameLines, textX, yPos + 4);
        doc.setTextColor(...COLORS.text);
        
        const qtyLabel = item.pricingType === 'per_person' ? 'guests' : '';
        const qtyVal = String(item.quantity);
        const unitPriceTxt = ` x ${Number(item.unitPrice).toFixed(0)} CHF`.replace(/\s+/g, ' ').trim();
        const baseTxt = (qtyVal + " " + qtyLabel).trim();
        
        const iconW = 3.5;
        const gap = 1.5;
        const currentX = margin + 105;
        
        if (item.pricingType === 'per_person') {
          drawUsersIcon(currentX, yPos + 4);
        } else {
          drawPackageIcon(currentX, yPos + 4);
        }
        
        doc.text(baseTxt, currentX + iconW + gap, yPos + 4);
        const baseWidth = doc.getTextWidth(baseTxt);
        doc.text(unitPriceTxt, currentX + iconW + gap + baseWidth, yPos + 4);

        doc.setFont("helvetica", "bold");
        doc.setTextColor(...COLORS.title);
        doc.text(`CHF ${item.totalPrice?.toFixed(2)}`, pageWidth - margin - 3, yPos + 4, { align: 'right' });
      }

      yPos += rowH + (mode === 'kitchen' ? 4 : 2);

      // 1. Add-ons (from item.notes) - ABOVE the line
      renderItemInfo('Choices', item.notes, [115, 128, 106]); // darker primary

      // 2. Customer Comment (from item.customerComment) - ABOVE the line
      renderItemInfo('Note', item.customerComment, [180, 83, 9]); // amber-700

      // Seprator line at the end of item block
      doc.setDrawColor(...COLORS.border);
      doc.setLineWidth(0.1);
      doc.line(margin + 10, yPos, pageWidth - margin, yPos);
      yPos += 3;
    });
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
  const allergies = data.allergies ? String(data.allergies) : undefined;
  const requests = data.specialRequests ? String(data.specialRequests) : undefined;
  const kitchen = data.kitchenNotes ? String(data.kitchenNotes) : undefined;

  if (mode === 'offer') {
    renderNoteSection("Allergien & Diätetisch", allergies, true);
    renderNoteSection("Besondere Wünsche", requests);
  } else {
    // For Kitchen, still at the end
    renderNoteSection("Allergies & Dietary", allergies, true);
    renderNoteSection("Special Requests", requests);
    renderNoteSection("Staff Notes", kitchen);
  }

  // Footer / Totals (Final piece for Customer)
  if (mode === 'offer') {
    checkPageBreak(30);
    yPos += 10;
    doc.setDrawColor(...COLORS.primary);
    doc.setLineWidth(1);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 10;

    // Dietary Breakdown Section
    const hasDietaryData = dietaryBreakdown.veg.total > 0 ||
      dietaryBreakdown['non-veg'].total > 0 ||
      dietaryBreakdown.vegan.total > 0;

    if (hasDietaryData) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(...COLORS.secondary);
      doc.text("Preis pro Person (nach Diät)", margin, yPos);
      yPos += 10;

      const breakdownStartY = yPos;
      const lineHeight = 8;

      // Veg
      if (dietaryBreakdown.veg.perPerson > 0) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor(...COLORS.text);
        doc.text("Vegetarisch:", margin, yPos);
        doc.text(`CHF ${dietaryBreakdown.veg.perPerson.toFixed(2)}`, pageWidth - margin - 60, yPos, { align: 'right' });
        yPos += lineHeight;
      }

      // Non-Veg
      if (dietaryBreakdown['non-veg'].perPerson > 0) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor(...COLORS.text);
        doc.text("Nicht-Vegetarisch:", margin, yPos);
        doc.text(`CHF ${dietaryBreakdown['non-veg'].perPerson.toFixed(2)}`, pageWidth - margin - 60, yPos, { align: 'right' });
        yPos += lineHeight;
      }

      // Vegan
      if (dietaryBreakdown.vegan.perPerson > 0) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor(...COLORS.text);
        doc.text("Vegan:", margin, yPos);
        doc.text(`CHF ${dietaryBreakdown.vegan.perPerson.toFixed(2)}`, pageWidth - margin - 60, yPos, { align: 'right' });
        yPos += lineHeight;
      }

      yPos += 2;
      doc.setDrawColor(...COLORS.border);
      doc.setLineWidth(0.5);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 10;
    }

    // Total
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...COLORS.secondary);
    doc.text("Gesamtbetrag", margin, yPos);
    doc.text(`CHF ${data.estimatedTotal?.toFixed(2)}`, pageWidth - margin, yPos, { align: 'right' });

    yPos += 10;
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(...COLORS.muted);
    doc.text(`Kalkulation for ${data.guestCount} Personen (exkl. Service & Getränke nach Aufwand)`, margin, yPos);
  }

  // Page Numbers
  const total = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.muted);
    doc.text(
      `Oliv Restaurant | Page ${i} of ${total} | Generated on ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
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
