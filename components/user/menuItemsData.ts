export interface MenuItemVariant {
  id: string;
  name: string;
  price: number;
  description?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  /** Supports both UI values ('per-person', 'flat-rate') and DB values ('per_person', 'flat_fee', 'billed_by_consumption') */
  pricingType: 'per-person' | 'flat-rate' | 'per_person' | 'flat_fee' | 'billed_by_consumption';
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
  dietaryType: 'vegetarian' | 'non-vegetarian' | 'vegan' | 'none';
  /** Additional dietary flag from database for gluten-free items */
  isGlutenFree?: boolean;
  /** Indicates if this item is a combo pack */
  isCombo?: boolean;
}
