export interface MenuItemVariant {
  id: string;
  name: string;
  price: number;
  description?: string;
  /** Average consumption: number of people served per unit for this variant */
  averageConsumption?: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  /** Supports both UI values ('per-person', 'flat-rate') and DB values ('per_person', 'flat_fee', 'billed_by_consumption') */
  pricingType: 'per-person' | 'flat-rate' | 'per_person' | 'flat_fee' | 'billed_by_consumption';
  /** Average consumption: number of people served per unit (e.g., 1 bottle serves 3 people) */
  averageConsumption?: number;
  image: string;
  allergens?: string[];
  addOns?: { id: string; name: string; price: number }[];
  addonGroups?: {
    id: string;
    name: string;
    isRequired: boolean;
    minSelect: number;
    maxSelect: number;
    items: { id: string; name: string; price: number }[];
  }[];
  variants?: MenuItemVariant[];
  /** 'none' is used for non-food service items (tech, furniture, etc.) from the database */
  dietaryType: 'veg' | 'non-veg' | 'vegan' | 'none';
  /** Additional dietary tags from database */
  dietaryTags?: string[];
  /** Additional dietary flag from database for gluten-free items */
  isGlutenFree?: boolean;

  additives?: string[];
  ingredients?: string;
  sortOrder?: number;
}
