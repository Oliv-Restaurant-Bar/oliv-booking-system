'use client';

import { useMemo } from 'react';
import {
  menuCategoryNameSchema,
  menuCategoryDescriptionSchema,
  menuItemNameSchema,
  menuItemDescriptionSchema,
  menuItemPriceSchema,
  menuItemIngredientsSchema,
  menuItemVariantNameSchema,
  menuItemVariantPriceSchema,
  nutritionalInfoValueSchema,
  addonGroupNameSchema,
  addonItemNameSchema,
  addonItemPriceSchema,
} from '@/lib/validation/schemas';

interface ValidationProps {
  newCategory: any;
  categoryTouched: any;
  categoryErrors: any;
  newMenuItem: any;
  menuItemTouched: any;
  menuItemErrors: any;
  newGroup: any;
  addonGroupTouched: any;
  addonGroupErrors: any;
  newAddonItem: any;
  addonItemTouched: any;
  addonItemErrors: any;
}

export function useMenuValidation({
  newCategory,
  categoryTouched,
  categoryErrors,
  newMenuItem,
  menuItemTouched,
  menuItemErrors,
  newGroup,
  addonGroupTouched,
  addonGroupErrors,
  newAddonItem,
  addonItemTouched,
  addonItemErrors,
}: ValidationProps) {
  // Real-time validation for category form
  const categoryRealtimeErrors = useMemo(() => {
    const newErrors: any = {};

    if (categoryTouched.name) {
      const nameResult = menuCategoryNameSchema.safeParse(newCategory.name);
      if (!nameResult.success) newErrors.name = nameResult.error.errors[0].message;
    }

    if (categoryTouched.description) {
      const descResult = menuCategoryDescriptionSchema.safeParse(newCategory.description);
      if (!descResult.success) newErrors.description = descResult.error.errors[0].message;
    }

    return newErrors;
  }, [categoryTouched, newCategory]);

  const displayCategoryErrors = useMemo(() => {
    return { ...categoryRealtimeErrors, ...categoryErrors };
  }, [categoryRealtimeErrors, categoryErrors]);

  // Real-time validation for menu item form
  const menuItemRealtimeErrors = useMemo(() => {
    const newErrors: any = {};

    if (menuItemTouched.name) {
      const nameResult = menuItemNameSchema.safeParse(newMenuItem.name);
      if (!nameResult.success) newErrors.name = nameResult.error.errors[0].message;
    }

    if (menuItemTouched.description) {
      const descResult = menuItemDescriptionSchema.safeParse(newMenuItem.description);
      if (!descResult.success) newErrors.description = descResult.error.errors[0].message;
    }

    if (menuItemTouched.price && newMenuItem.price !== '') {
      const priceNum = parseFloat(newMenuItem.price);
      const priceResult = menuItemPriceSchema.safeParse(priceNum);
      if (!priceResult.success) newErrors.price = priceResult.error.errors[0].message;
    }

    if (menuItemTouched.ingredients) {
      const ingredientsResult = menuItemIngredientsSchema.safeParse(newMenuItem.ingredients);
      if (!ingredientsResult.success) newErrors.ingredients = ingredientsResult.error.errors[0].message;
    }

    // Validate variants
    if (menuItemTouched.variants) {
      const variantErrors: any = {};
      newMenuItem.variants.forEach((variant: any, index: number) => {
        if (menuItemTouched.variants?.[index]?.name) {
          const nameResult = menuItemVariantNameSchema.safeParse(variant.name);
          if (!nameResult.success) {
            variantErrors[index] = { ...variantErrors[index], name: nameResult.error.errors[0].message };
          }
        }
        if (menuItemTouched.variants?.[index]?.price) {
          const priceResult = menuItemVariantPriceSchema.safeParse(variant.price);
          if (!priceResult.success) {
            variantErrors[index] = { ...variantErrors[index], price: priceResult.error.errors[0].message };
          }
        }
      });
      if (Object.keys(variantErrors).length > 0) {
        newErrors.variants = variantErrors;
      }
    }

    // Validate nutritional info
    if (menuItemTouched.nutritionalInfo) {
      const nutritionErrors: any = {};
      if (menuItemTouched.nutritionalInfo?.servingSize) {
        const result = nutritionalInfoValueSchema.safeParse(newMenuItem.nutritionalInfo.servingSize);
        if (!result.success) nutritionErrors.servingSize = result.error.errors[0].message;
      }
      if (menuItemTouched.nutritionalInfo?.calories) {
        const result = nutritionalInfoValueSchema.safeParse(newMenuItem.nutritionalInfo.calories);
        if (!result.success) nutritionErrors.calories = result.error.errors[0].message;
      }
      if (menuItemTouched.nutritionalInfo?.protein) {
        const result = nutritionalInfoValueSchema.safeParse(newMenuItem.nutritionalInfo.protein);
        if (!result.success) nutritionErrors.protein = result.error.errors[0].message;
      }
      if (menuItemTouched.nutritionalInfo?.carbs) {
        const result = nutritionalInfoValueSchema.safeParse(newMenuItem.nutritionalInfo.carbs);
        if (!result.success) nutritionErrors.carbs = result.error.errors[0].message;
      }
      if (menuItemTouched.nutritionalInfo?.fat) {
        const result = nutritionalInfoValueSchema.safeParse(newMenuItem.nutritionalInfo.fat);
        if (!result.success) nutritionErrors.fat = result.error.errors[0].message;
      }
      if (menuItemTouched.nutritionalInfo?.fiber) {
        const result = nutritionalInfoValueSchema.safeParse(newMenuItem.nutritionalInfo.fiber);
        if (!result.success) nutritionErrors.fiber = result.error.errors[0].message;
      }
      if (menuItemTouched.nutritionalInfo?.sugar) {
        const result = nutritionalInfoValueSchema.safeParse(newMenuItem.nutritionalInfo.sugar);
        if (!result.success) nutritionErrors.sugar = result.error.errors[0].message;
      }
      if (menuItemTouched.nutritionalInfo?.sodium) {
        const result = nutritionalInfoValueSchema.safeParse(newMenuItem.nutritionalInfo.sodium);
        if (!result.success) nutritionErrors.sodium = result.error.errors[0].message;
      }
      if (Object.keys(nutritionErrors).length > 0) {
        newErrors.nutritionalInfo = nutritionErrors;
      }
    }

    return newErrors;
  }, [menuItemTouched, newMenuItem]);

  const displayMenuItemErrors = useMemo(() => {
    return { ...menuItemRealtimeErrors, ...menuItemErrors };
  }, [menuItemRealtimeErrors, menuItemErrors]);

  // Real-time validation for addon group form
  const addonGroupRealtimeErrors = useMemo(() => {
    const newErrors: any = {};

    if (addonGroupTouched.name) {
      const nameResult = addonGroupNameSchema.safeParse(newGroup.name);
      if (!nameResult.success) newErrors.name = nameResult.error.errors[0].message;
    }

    return newErrors;
  }, [addonGroupTouched, newGroup]);

  const displayAddonGroupErrors = useMemo(() => {
    return { ...addonGroupRealtimeErrors, ...addonGroupErrors };
  }, [addonGroupRealtimeErrors, addonGroupErrors]);

  // Real-time validation for addon item form
  const addonItemRealtimeErrors = useMemo(() => {
    const newErrors: any = {};

    if (addonItemTouched.name) {
      const nameResult = addonItemNameSchema.safeParse(newAddonItem.name);
      if (!nameResult.success) newErrors.name = nameResult.error.errors[0].message;
    }

    if (addonItemTouched.price && newAddonItem.price !== '') {
      const priceNum = parseFloat(newAddonItem.price);
      const priceResult = addonItemPriceSchema.safeParse(priceNum);
      if (!priceResult.success) newErrors.price = priceResult.error.errors[0].message;
    }

    return newErrors;
  }, [addonItemTouched, newAddonItem]);

  const displayAddonItemErrors = useMemo(() => {
    return { ...addonItemRealtimeErrors, ...addonItemErrors };
  }, [addonItemRealtimeErrors, addonItemErrors]);

  return {
    displayCategoryErrors,
    displayMenuItemErrors,
    displayAddonGroupErrors,
    displayAddonItemErrors,
  };
}
