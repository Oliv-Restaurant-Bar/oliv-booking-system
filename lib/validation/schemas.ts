import { z } from 'zod';

/**
 * Validation schemas for the booking system
 * All schemas include character limits and proper validation rules
 */

// User validation schemas
export const userNameSchema = z.string()
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name cannot exceed 50 characters')
  .trim();

export const userFirstNameSchema = z.string()
  .min(2, 'First name must be at least 2 characters')
  .max(20, 'First name cannot exceed 20 characters')
  .trim();

export const userLastNameSchema = z.string()
  .min(2, 'Last name must be at least 2 characters')
  .max(20, 'Last name cannot exceed 20 characters')
  .trim();

export const userEmailSchema = z.string()
  .email('Please enter a valid email address (e.g., user@example.com)')
  .max(255, 'Email cannot exceed 255 characters')
  .toLowerCase()
  .trim();

export const userPasswordSchema = z.string()
  .min(12, 'Password must be at least 12 characters long')
  .max(100, 'Password cannot exceed 100 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter (A-Z)')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter (a-z)')
  .regex(/[0-9]/, 'Password must contain at least one number (0-9)')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)')
  .refine(
    (password) => !/(.)\1{2,}/.test(password),
    'Password cannot contain the same character repeated 3 or more times in a row'
  )
  .refine(
    (password) => !/password|123456|qwerty|admin/i.test(password),
    'Password cannot contain common or predictable patterns'
  );

export const userPhoneSchema = z.string()
  .max(20, 'Phone number cannot exceed 20 characters')
  .optional()
  .transform(val => val?.trim() || '');

export const userRoleSchema = z.enum(['super_admin', 'admin', 'moderator', 'read_only'], {
  errorMap: () => ({ message: 'Invalid role selected' })
});

export const userStatusSchema = z.enum(['Active', 'Inactive'], {
  errorMap: () => ({ message: 'Invalid status selected' }
)});

// Venue validation schemas
export const venueNameSchema = z.string()
  .min(2, 'Venue name must be at least 2 characters')
  .max(100, 'Venue name cannot exceed 100 characters')
  .trim();

export const venueDescriptionSchema = z.string()
  .max(500, 'Description cannot exceed 500 characters')
  .transform(val => val.trim());

// Booking validation schemas
export const bookingNotesSchema = z.string()
  .max(1000, 'Notes cannot exceed 1000 characters')
  .transform(val => val.trim());

export const bookingAllergiesSchema = z.string()
  .max(500, 'Allergy details cannot exceed 500 characters')
  .transform(val => val.trim());

export const bookingSpecialRequestsSchema = z.string()
  .max(1000, 'Special requests cannot exceed 1000 characters')
  .transform(val => val.trim());

export const bookingKitchenNotesSchema = z.string()
  .max(1000, 'Kitchen notes cannot exceed 1000 characters')
  .transform(val => val.trim());

export const bookingGuestCountSchema = z.number()
  .min(1, 'Guest count must be at least 1')
  .max(10000, 'Guest count cannot exceed 10000');

export const bookingBillingAddressSchema = z.string()
  .max(500, 'Billing address cannot exceed 500 characters')
  .optional()
  .transform(val => val?.trim() || '');

export const bookingCommentSchema = z.string()
  .min(1, 'Comment cannot be empty')
  .max(500, 'Comment cannot exceed 500 characters')
  .trim();

// Complete form schemas
export const createUserSchema = z.object({
  name: userNameSchema,
  email: userEmailSchema,
  password: userPasswordSchema,
  role: userRoleSchema,
  status: userStatusSchema,
});

export const updateUserSchema = z.object({
  name: userNameSchema,
  email: userEmailSchema,
  role: userRoleSchema,
  status: userStatusSchema,
});

export const updateProfileSchema = z.object({
  firstName: userFirstNameSchema,
  lastName: userLastNameSchema,
  email: userEmailSchema,
  phone: userPhoneSchema,
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: userPasswordSchema,
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const createVenueSchema = z.object({
  name: venueNameSchema,
  description: venueDescriptionSchema.optional(),
});

export const updateVenueSchema = createVenueSchema;

export const updateBookingSchema = z.object({
  notes: bookingNotesSchema.optional(),
  allergies: bookingAllergiesSchema.optional(),
  kitchenNotes: bookingKitchenNotesSchema.optional(),
  specialRequests: bookingSpecialRequestsSchema.optional(),
  guestCount: bookingGuestCountSchema.optional(),
});

export const addBookingCommentSchema = z.object({
  comment: bookingCommentSchema,
});

// Type exports
export type CreateUserData = z.infer<typeof createUserSchema>;
export type UpdateUserData = z.infer<typeof updateUserSchema>;
export type UpdateProfileData = z.infer<typeof updateProfileSchema>;
export type ChangePasswordData = z.infer<typeof changePasswordSchema>;
export type CreateVenueData = z.infer<typeof createVenueSchema>;
export type UpdateVenueData = z.infer<typeof updateVenueSchema>;
export type UpdateBookingData = z.infer<typeof updateBookingSchema>;
export type AddBookingCommentData = z.infer<typeof addBookingCommentSchema>;

// Wizard/Customer form validation schemas
export const customerNameSchema = z.string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name cannot exceed 100 characters')
  .trim();

export const customerBusinessSchema = z.string()
  .max(100, 'Business name cannot exceed 100 characters')
  .transform(val => val.trim());

export const customerPhoneSchema = z.string()
  .min(10, 'Phone number must be at least 10 characters')
  .max(20, 'Phone number cannot exceed 20 characters')
  .regex(/^[0-9+\s]+$/, 'Phone number can only contain numbers, spaces, and +')
  .trim();

export const customerStreetSchema = z.string()
  .min(5, 'Street address must be at least 5 characters')
  .max(100, 'Street address cannot exceed 100 characters')
  .trim();

export const customerPlzSchema = z.string()
  .min(4, 'Postal code must be at least 4 characters')
  .max(10, 'Postal code cannot exceed 10 characters')
  .regex(/^\d+$/, 'Postal code must contain only numbers')
  .trim();

export const customerLocationSchema = z.string()
  .min(2, 'Location must be at least 2 characters')
  .max(50, 'Location cannot exceed 50 characters')
  .trim();

export const customerOccasionSchema = z.string()
  .max(100, 'Occasion cannot exceed 100 characters')
  .transform(val => val.trim());

export const customerSpecialRequestsSchema = z.string()
  .max(1000, 'Special requests cannot exceed 1000 characters')
  .transform(val => val.trim());

export const wizardEventDetailsSchema = z.object({
  contactName: customerNameSchema,
  business: customerBusinessSchema.optional(),
  contactEmail: userEmailSchema,
  contactPhone: customerPhoneSchema,
  street: customerStreetSchema,
  plz: customerPlzSchema,
  location: customerLocationSchema,
  eventDate: z.string().min(1, 'Event date is required'),
  eventTime: z.string().min(1, 'Event time is required'),
  guestCount: z.number().min(1, 'Guest count must be at least 1').max(10000, 'Guest count cannot exceed 10000'),
  occasion: customerOccasionSchema.optional(),
  specialRequests: customerSpecialRequestsSchema.optional(),
  paymentMethod: z.enum(['on_bill', 'invoice', 'cash', 'card', 'cash_card', '']),
  useSameAddressForBilling: z.boolean().optional(),
  billingStreet: customerStreetSchema.optional(),
  billingPlz: customerPlzSchema.optional(),
  billingLocation: customerLocationSchema.optional(),
  reference: z.string().max(100, 'Reference cannot exceed 100 characters').optional(),
  billingReference: z.string().max(100, 'Billing reference cannot exceed 100 characters').optional(),
});

export type WizardEventDetails = z.infer<typeof wizardEventDetailsSchema>;

// Menu validation schemas
export const menuCategoryNameSchema = z.string()
  .min(2, 'Category name must be at least 2 characters')
  .max(100, 'Category name cannot exceed 100 characters')
  .trim();

export const menuCategoryDescriptionSchema = z.string()
  .max(500, 'Description cannot exceed 500 characters')
  .transform(val => val.trim());

export const menuItemNameSchema = z.string()
  .min(2, 'Item name must be at least 2 characters')
  .max(100, 'Item name cannot exceed 100 characters')
  .trim();

export const menuItemDescriptionSchema = z.string()
  .max(500, 'Description cannot exceed 500 characters')
  .transform(val => val.trim());

export const menuItemPriceSchema = z.number()
  .min(0, 'Price must be at least 0')
  .max(100000, 'Price cannot exceed 100,000');

export const menuItemIngredientsSchema = z.string()
  .max(1000, 'Ingredients cannot exceed 1000 characters')
  .transform(val => val.trim());

export const menuItemVariantNameSchema = z.string()
  .min(1, 'Variant name is required')
  .max(100, 'Variant name cannot exceed 100 characters')
  .trim();

export const menuItemVariantPriceSchema = z.number()
  .min(0, 'Variant price must be at least 0')
  .max(100000, 'Variant price cannot exceed 100,000');

export const nutritionalInfoValueSchema = z.string()
  .max(50, 'Value cannot exceed 50 characters')
  .transform(val => val.trim());

export const addonGroupNameSchema = z.string()
  .min(2, 'Addon group name must be at least 2 characters')
  .max(100, 'Addon group name cannot exceed 100 characters')
  .trim();

export const addonItemNameSchema = z.string()
  .min(2, 'Addon item name must be at least 2 characters')
  .max(100, 'Addon item name cannot exceed 100 characters')
  .trim();

export const addonItemPriceSchema = z.number()
  .min(0, 'Addon price must be at least 0')
  .max(100000, 'Addon price cannot exceed 100,000');

