export interface PricingItem {
  category: string;
  price: number;
  pricingType: string;
  dietaryType: string;
  useSpecialCalculation: boolean;
}

/**
 * Calculates the vegetarian and non-vegetarian per-person totals based on the provided items.
 * Implements the core business logic where "special calculation" categories (e.g. Starters, Desserts)
 * take the absolute highest price across all items in that category and apply it to both dietary tracks,
 * whereas normal categories (e.g. Main Courses) calculate maximums per dietary track.
 */
export function calculateDietaryTotals(items: PricingItem[]) {
  const foodItems = items.filter(
    (item) => item.pricingType === 'per_person' || item.pricingType === 'per-person'
  );

  let vegTotal = 0;
  let nonVegTotal = 0;

  const itemsByCat: Record<string, typeof foodItems> = {};
  foodItems.forEach((item) => {
    const cat = item.category || 'Uncategorized';
    if (!itemsByCat[cat]) itemsByCat[cat] = [];
    itemsByCat[cat].push(item);
  });

  Object.entries(itemsByCat).forEach(([catName, catItems]) => {
    const isSpecial = catItems.some((i) => i.useSpecialCalculation);

    if (isSpecial) {
      // Shared category: take highest price and apply to both tracks
      const maxPrice = catItems.length > 0 ? Math.max(...catItems.map((i) => i.price)) : 0;
      vegTotal += maxPrice;
      nonVegTotal += maxPrice;
    } else {
      // Normal category: take highest price by dietary track
      const vegItems = catItems.filter((i) =>
        ['veg', 'vegan', 'none'].includes(i.dietaryType || 'none')
      );
      const nonVegItems = catItems.filter((i) =>
        ['non-veg', 'none'].includes(i.dietaryType || 'none')
      );

      const vegMax = vegItems.length > 0 ? Math.max(...vegItems.map((i) => i.price)) : 0;
      const nonVegMax = nonVegItems.length > 0 ? Math.max(...nonVegItems.map((i) => i.price)) : 0;

      vegTotal += vegMax;
      nonVegTotal += nonVegMax;
    }
  });

  return {
    veg: vegTotal,
    nonVeg: nonVegTotal,
  };
}
