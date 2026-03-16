export interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  isActive: boolean;
  isExpanded: boolean;
  guestCount: boolean;
  items: MenuItemData[];
  assignedAddonGroups: string[];
}

export interface MenuItemData {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  pricingType: 'per_person' | 'flat_fee' | 'billed_by_consumption';
  isActive: boolean;
  variants: VariantOption[];
  dietaryType: 'veg' | 'non-veg' | 'vegan' | 'none';
  dietaryTags: string[];
  ingredients: string;
  allergens: string[];
  additives: string[];
  nutritionalInfo: NutritionalInfo;
  assignedAddonGroups: string[];
  isCombo?: boolean;
  averageConsumption?: number;
}

export interface VariantOption {
  id: string;
  name: string;
  price: number;
  averageConsumption?: number;
}

export interface AddonGroup {
  id: string;
  name: string;
  subtitle: string;
  minSelect: number;
  maxSelect: number;
  isRequired: boolean;
  isExpanded: boolean;
  isActive: boolean;
  items: AddonItem[];
}

export interface AddonItem {
  id: string;
  name: string;
  price: number;
  isActive: boolean;
  dietaryType: 'veg' | 'non-veg' | 'vegan' | 'none';
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
