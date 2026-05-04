export interface PricingItem {
  category: string;
  price: number;
  pricingType: string;
  dietaryType: string;
  useSpecialCalculation: boolean;
  isSpecialCategory?: boolean;
  guestCount?: number;
}

/**
 * Calculates the per-person total for vegetarian and non-vegetarian tracks.
 * Handles "special calculation" (Max price) and "special category" (Avg price/Total contribution) logic.
 */
export function calculateDietaryTotals(items: PricingItem[], totalEventGuests: number = 0) {
  const foodItems = items.filter(
    (item) => item.pricingType === 'per_person' || item.pricingType === 'per-person'
  );

  let vegTotal = 0;
  let nonVegTotal = 0;
  const G = totalEventGuests || 1;

  const itemsByCat: Record<string, typeof foodItems> = {};
  foodItems.forEach((item) => {
    const cat = item.category || 'Uncategorized';
    if (!itemsByCat[cat]) itemsByCat[cat] = [];
    itemsByCat[cat].push(item);
  });

  Object.entries(itemsByCat).forEach(([catName, catItems]) => {
    const isSpecialMax = catItems.some((i) => i.useSpecialCalculation);
    const isSpecialAvg = catItems.some((i) => i.isSpecialCategory);

    if (isSpecialAvg) {
      // Shared category: take sum of contributions per guest
      // item_total = price * quantity
      // item_contribution = item_total / G
      // total_contribution = sum of all item_contributions
      const totalContribution = catItems.reduce(
        (sum, i) => sum + (i.price * (i.guestCount ?? G)) / G, 
        0
      );
      
      vegTotal += totalContribution;
      nonVegTotal += totalContribution;
    } else if (isSpecialMax) {
      // Shared category (Max): take highest contribution per guest
      const maxContribution = Math.max(
        ...catItems.map((i) => (i.price * (i.guestCount ?? G)) / G)
      );
      vegTotal += maxContribution;
      nonVegTotal += maxContribution;
    } else {
      // Normal category: separate by dietary type and take max of each
      const vegItems = catItems.filter((i) =>
        ['veg', 'vegan', 'none'].includes(i.dietaryType || 'none')
      );
      const nonVegItems = catItems.filter((i) =>
        ['non-veg', 'none'].includes(i.dietaryType || 'none')
      );

      const vegMaxContribution = vegItems.length > 0 
        ? Math.max(...vegItems.map((i) => (i.price * (i.guestCount ?? G)) / G)) 
        : 0;
        
      const nonVegMaxContribution = nonVegItems.length > 0 
        ? Math.max(...nonVegItems.map((i) => (i.price * (i.guestCount ?? G)) / G)) 
        : 0;

      vegTotal += vegMaxContribution;
      nonVegTotal += nonVegMaxContribution;
    }
  });

  return { veg: vegTotal, nonVeg: nonVegTotal };
}
