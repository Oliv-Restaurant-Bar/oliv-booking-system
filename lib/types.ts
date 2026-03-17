export interface MenuItemData {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  pricingType?: 'per_person' | 'flat_fee' | 'billed_by_consumption';
  averageConsumption?: number;
  isActive: boolean;
  variants: VariantOption[];
  dietaryType: 'veg' | 'non-veg' | 'vegan' | 'none';
  dietaryTags: string[];
  isCombo?: boolean;
  ingredients: string;
  allergens: string[];
  additives: string[];
  nutritionalInfo: {
    servingSize: string;
    calories: string;
    protein: string;
    carbs: string;
    fat: string;
    fiber: string;
    sugar: string;
    sodium: string;
  };
  assignedAddonGroups?: string[];
}

export interface VariantOption {
  id: string;
  name: string;
  price: number;
  averageConsumption?: number;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  isActive: boolean;
  isExpanded: boolean;
  guestCount: boolean;
  items: MenuItemData[];
  assignedAddonGroups?: string[]; // IDs of assigned addon groups
}

export interface AddonItem {
  id: string;
  name: string;
  price: number;
  isActive: boolean;
  dietaryType: 'veg' | 'non-veg' | 'vegan' | 'none';
}

export interface AddonGroup {
  id: string;
  name: string;
  subtitle?: string;
  minSelect: number;
  maxSelect: number;
  items: AddonItem[];
  isExpanded: boolean;
  isRequired: boolean;
  isActive?: boolean;
}


export interface NutritionalInfo {
  servingSize: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  fiber: string;
  sugar: string;
  sodium: string;
}
