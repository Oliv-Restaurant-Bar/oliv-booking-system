export interface MenuItemData {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  internalCost?: number;
  pricingType?: 'per_person' | 'flat_fee' | 'billed_by_consumption';
  averageConsumption?: number;
  isActive: boolean;
  variants: VariantOption[];
  dietaryType: 'veg' | 'non-veg' | 'vegan' | 'none';
  dietaryTags: string[];
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
  assignedVisibilitySchedules?: string[];
  isRecommended: boolean;
}

export interface VariantOption {
  id: string;
  name: string;
  price: number;
  internalCost?: number;
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
  isSpecialCategory?: boolean;
  useSpecialCalculation?: boolean;
  items: MenuItemData[];
  assignedAddonGroups?: string[]; // IDs of assigned addon groups
  assignedVisibilitySchedules?: string[];
}

export interface AddonItem {
  id: string;
  name: string;
  price: number;
  internalCost?: number;
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

export interface VisibilitySchedule {
  id: string;
  name: string;
  description: string | null;
  startDate: Date | string; // Dates can come from DB as Date objects or JSON as string
  endDate: Date | string;
  isActive: boolean;
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

export interface EventDetails {
  name: string;
  business: string;
  email: string;
  telephone: string;
  street: string;
  plz: string;
  location: string;
  eventDate: string;
  eventTime: string;
  guestCount: string;
  occasion: string;
  specialRequests: string;
  reference: string;
  paymentMethod: string;
  useSameAddressForBilling: boolean;
  billingStreet: string;
  billingPlz: string;
  billingLocation: string;
  billingLocationError?: string;
  billingBusiness: string;
  billingBusinessError?: string;
  billingEmail: string;
  billingEmailError?: string;
  billingReference: string;
  billingReferenceError?: string;
  room: string;
  roomError?: string;
  bookingId?: string;
}