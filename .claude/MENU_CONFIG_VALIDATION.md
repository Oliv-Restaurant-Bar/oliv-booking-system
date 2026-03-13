# Menu Configuration Page Real-Time Validation

## Overview
Real-time validation has been added to the Menu Configuration page for category and menu item forms.

## Validation Schemas Added

New schemas added to `lib/validation/schemas.ts`:

```typescript
// Category validation
menuCategoryNameSchema - Min 2 chars, max 100 chars
menuCategoryDescriptionSchema - Max 500 chars

// Menu Item validation
menuItemNameSchema - Min 2 chars, max 100 chars
menuItemDescriptionSchema - Max 500 chars
menuItemPriceSchema - Min 0, max 100,000
menuItemIngredientsSchema - Max 1000 chars
menuItemVariantNameSchema - Min 1 char, max 100 chars
menuItemVariantPriceSchema - Min 0, max 100,000
nutritionalInfoValueSchema - Max 50 chars per field

// Addon validation
addonGroupNameSchema - Min 2 chars, max 100 chars
addonItemNameSchema - Min 2 chars, max 100 chars
addonItemPriceSchema - Min 0, max 100,000
```

## Implementation Status

### ✅ Completed
- **Category Form** - Name and description fields with real-time validation
- **Menu Item Form** - Name and description fields with real-time validation
- **Validation Architecture** - All validation states and memoized validation logic
- **Zod Schemas** - Complete validation schemas for all menu-related fields

### 🔄 Partial Implementation
The following validation logic is ready but needs to be connected to the form fields:

1. **Menu Item Price** - Validation schema implemented, needs onBlur + error display
2. **Menu Item Ingredients** - Validation schema implemented, needs onBlur + error display
3. **Menu Item Variants** - Validation logic implemented for arrays
4. **Nutritional Info** - All 8 fields validated (servingSize, calories, protein, carbs, fat, fiber, sugar, sodium)
5. **Addon Groups** - Name validation ready
6. **Addon Items** - Name and price validation ready

## Files Modified

### ✅ Updated Files
- `lib/validation/schemas.ts` - Added menu validation schemas
- `components/admin/MenuConfigPageV3Complete.tsx` - Added:
  - Validation state declarations
  - Real-time validation with useMemo
  - Category form fields (name, description)
  - Menu item form fields (name, description)

## Code Pattern Used

```typescript
// State declarations
const [categoryErrors, setCategoryErrors] = useState<{
  name?: string;
  description?: string;
}>({});

const [categoryTouched, setCategoryTouched] = useState<{
  name?: boolean;
  description?: boolean;
}>({});

// Real-time validation (memoized)
const categoryRealtimeErrors = useMemo(() => {
  const newErrors: typeof categoryErrors = {};

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

// Display errors (merge)
const displayCategoryErrors = useMemo(() => {
  return { ...categoryRealtimeErrors, ...categoryErrors };
}, [categoryRealtimeErrors, categoryErrors]);

// Form field
<input
  type="text"
  value={newCategory.name}
  onChange={(e) => {
    setNewCategory({ ...newCategory, name: e.target.value });
    if (categoryErrors.name) setCategoryErrors({ ...categoryErrors, name: undefined });
  }}
  onBlur={() => {
    if (!categoryTouched.name) setCategoryTouched({ ...categoryTouched, name: true });
  }}
  className={displayCategoryErrors.name ? 'border-destructive' : 'border-border'}
/>
```

## Remaining Work (Optional)

To complete full validation coverage, the following form fields need to be updated with the same pattern:

### Menu Item Form
1. Price field - Add validation for numeric value and range
2. Ingredients field - Add maxLength validation
3. Variants section - Add name/price validation per variant
4. Nutritional info section - Add validation for all 8 fields

### Addon Group Form
1. Name field - Add validation

### Addon Item Form
1. Name field - Add validation
2. Price field - Add numeric validation

## Benefits

1. **Immediate Feedback** - Admins see validation errors as soon as they leave a field
2. **Better UX** - Errors clear while typing, re-appear on blur if still invalid
3. **Consistent Pattern** - Same three-tier validation as other admin forms
4. **Data Integrity** - Ensures menu data meets quality standards
5. **Character Limits** - Visual feedback with character counters
6. **TypeScript Safe** - All schemas properly typed with Zod

## Testing Checklist

**Category Form:**
- ✅ Name validates min 2 characters
- ✅ Name validates max 100 characters
- ✅ Description validates max 500 characters
- ✅ Character counters display correctly
- ✅ Errors show on blur
- ✅ Errors clear while typing
- ✅ TypeScript compilation passes

**Menu Item Form:**
- ✅ Name validates min 2 characters
- ✅ Name validates max 100 characters
- ✅ Description validates max 500 characters
- ✅ Character counters display correctly
- ✅ Errors show on blur
- ✅ Errors clear while typing
- ✅ TypeScript compilation passes

## Integration

This implementation follows the same validation pattern used across the application:
- **Public Wizard**: Customer booking forms
- **Admin User Management**: User CRUD forms
- **Admin Profile**: Profile editing and password change
- **Admin Menu Config**: Category and menu item forms (partial)

All validation uses the same:
- Zod schemas for consistent validation rules
- Three-tier architecture (touched → realtimeErrors → errors → displayErrors)
- Memoized validation for performance
- Clear-while-typing UX pattern
