import {
  pgTable,
  text,
  uuid,
  boolean,
  timestamp,
  date,
  time,
  integer,
  jsonb,
  decimal,
  index,
} from "drizzle-orm/pg-core";

// Better Auth tables
export const session = pgTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => adminUser.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => adminUser.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  expiresAt: timestamp("expires_at"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Enums
export const userRoleEnum = [
  "super_admin",
  "admin",
  "moderator",
  "read_only",
] as const;
export type UserRole = (typeof userRoleEnum)[number];

export const leadStatusEnum = [
  "new",
  "contacted",
  "qualified",
  "converted",
  "lost",
] as const;
export type LeadStatus = (typeof leadStatusEnum)[number];

export const bookingStatusEnum = [
  "new",
  "touchbase",
  "pending",
  "confirmed",
  "completed",
  "cancelled",
  "no_show",
  "declined",
] as const;
export type BookingStatus = (typeof bookingStatusEnum)[number];

export const dependencyTypeEnum = ["requires", "excludes", "suggests"] as const;
export type DependencyType = (typeof dependencyTypeEnum)[number];

export const pricingTypeEnum = ["per_person", "flat_fee", "billed_by_consumption"] as const;
export type PricingType = (typeof pricingTypeEnum)[number];

export const bookingItemTypeEnum = ["menu_item", "addon"] as const;
export type BookingItemType = (typeof bookingItemTypeEnum)[number];

export const contactTypeEnum = [
  "email",
  "phone",
  "in_person",
  "other",
] as const;
export type ContactType = (typeof contactTypeEnum)[number];

export const emailTypeEnum = [
  "confirmation",
  "thank_you",
  "reminder",
  "follow_up",
  "cancellation",
  "no_show",
  "declined",
  "custom",
  "unlock_requested",
  "unlock_granted",
  "unlock_declined",
] as const;
export type EmailType = (typeof emailTypeEnum)[number];

export const emailStatusEnum = [
  "pending",
  "sent",
  "failed",
  "bounced",
] as const;
export type EmailStatus = (typeof emailStatusEnum)[number];

// ADMIN_USER table
export const adminUser = pgTable(
  "admin_user",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").notNull().default(false),
    image: text("image"),
    role: text("role", { enum: userRoleEnum }).notNull().default("admin"),
    password: text("password"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    emailIdx: index("admin_user_email_idx").on(table.email),
  }),
);

// LEADS table
export const leads = pgTable(
  "leads",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    contactName: text("contact_name").notNull(),
    contactEmail: text("contact_email").notNull(),
    contactPhone: text("contact_phone").notNull(),
    eventDate: date("event_date").notNull(),
    eventTime: time("event_time").notNull(),
    guestCount: integer("guest_count").notNull(),
    source: text("source").notNull().default("website"),
    status: text("status", { enum: leadStatusEnum }).notNull().default("new"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    statusIdx: index("leads_status_idx").on(table.status),
    dateIdx: index("leads_date_idx").on(table.eventDate),
  }),
);

// BOOKINGS table
export const bookings = pgTable(
  "bookings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    leadId: uuid("lead_id").references(() => leads.id, {
      onDelete: "set null",
    }),
    eventDate: date("event_date").notNull(),
    eventTime: time("event_time").notNull(),
    guestCount: integer("guest_count").notNull(),
    allergyDetails: jsonb("allergy_details").$type<string[]>(),
    specialRequests: text("special_requests"),
    estimatedTotal: decimal("estimated_total", { precision: 10, scale: 2 }),
    requiresDeposit: boolean("requires_deposit").notNull().default(false),
    status: text("status", { enum: bookingStatusEnum })
      .notNull()
      .default("pending"),
    location: text("location"),
    internalNotes: text("internal_notes"),
    termsAccepted: boolean("terms_accepted").notNull().default(false),
    termsAcceptedAt: timestamp("terms_accepted_at"),
    // Client edit fields
    editSecret: text("edit_secret").unique(),
    isLocked: boolean("is_locked").notNull().default(false),
    lockedBy: text("locked_by").references(() => adminUser.id),
    lockedAt: timestamp("locked_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    leadIdIdx: index("bookings_lead_id_idx").on(table.leadId),
    statusIdx: index("bookings_status_idx").on(table.status),
    dateIdx: index("bookings_date_idx").on(table.eventDate),
    editSecretIdx: index("bookings_edit_secret_idx").on(table.editSecret),
  }),
);

// MENU_CATEGORIES table
export const menuCategories = pgTable(
  "menu_categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    nameDe: text("name_de").notNull(),
    description: text("description"),
    descriptionDe: text("description_de"),
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    guestCount: boolean("guest_count").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    sortOrderIdx: index("menu_categories_sort_order_idx").on(table.sortOrder),
  }),
);

// MENU_ITEMS table
export const menuItems = pgTable(
  "menu_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    categoryId: uuid("category_id").references(() => menuCategories.id, {
      onDelete: "cascade",
    }),
    name: text("name").notNull(),
    nameDe: text("name_de").notNull(),
    description: text("description"),
    descriptionDe: text("description_de"),
    pricePerPerson: decimal("price_per_person", {
      precision: 10,
      scale: 2,
    }).notNull(),
    pricingType: text("pricing_type", { enum: pricingTypeEnum }).notNull().default("per_person"),
    imageUrl: text("image_url"),
    isVegetarian: boolean("is_vegetarian").notNull().default(false),
    isVegan: boolean("is_vegan").notNull().default(false),
    isGlutenFree: boolean("is_gluten_free").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    categoryIdIdx: index("menu_items_category_id_idx").on(table.categoryId),
    sortOrderIdx: index("menu_items_sort_order_idx").on(table.sortOrder),
    pricingTypeIdx: index("menu_items_pricing_type_idx").on(table.pricingType),
  }),
);

// MENU_ITEM_DEPENDENCIES table
export const menuItemDependencies = pgTable(
  "menu_item_dependencies",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    parentItemId: uuid("parent_item_id").references(() => menuItems.id, {
      onDelete: "cascade",
    }),
    dependentItemId: uuid("dependent_item_id").references(() => menuItems.id, {
      onDelete: "cascade",
    }),
    dependencyType: text("dependency_type", {
      enum: dependencyTypeEnum,
    }).notNull(),
    isRequired: boolean("is_required").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    parentItemIdIdx: index("menu_item_deps_parent_idx").on(table.parentItemId),
    dependentItemIdIdx: index("menu_item_deps_dependent_idx").on(
      table.dependentItemId,
    ),
  }),
);

// ADDONS table
export const addons = pgTable(
  "addons",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    nameDe: text("name_de").notNull(),
    description: text("description"),
    descriptionDe: text("description_de"),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    pricingType: text("pricing_type", { enum: pricingTypeEnum }).notNull(),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    pricingTypeIdx: index("addons_pricing_type_idx").on(table.pricingType),
  }),
);

// ADDON_GROUPS table - for organizing addon choices into groups
export const addonGroups = pgTable(
  "addon_groups",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    nameDe: text("name_de").notNull(),
    subtitle: text("subtitle"),
    subtitleDe: text("subtitle_de"),
    minSelect: integer("min_select").notNull().default(0),
    maxSelect: integer("max_select").notNull().default(1),
    isRequired: boolean("is_required").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    sortOrderIdx: index("addon_groups_sort_order_idx").on(table.sortOrder),
  }),
);

// ADDON_ITEMS table - individual items within addon groups
export const addonItems = pgTable(
  "addon_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    addonGroupId: uuid("addon_group_id").references(() => addonGroups.id, {
      onDelete: "cascade",
    }),
    name: text("name").notNull(),
    nameDe: text("name_de").notNull(),
    description: text("description"),
    descriptionDe: text("description_de"),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    pricingType: text("pricing_type", { enum: pricingTypeEnum }).notNull().default("per_person"),
    dietaryType: text("dietary_type"), // vegetarian, vegan, gluten-free, etc.
    isActive: boolean("is_active").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    addonGroupIdIdx: index("addon_items_addon_group_id_idx").on(table.addonGroupId),
    sortOrderIdx: index("addon_items_sort_order_idx").on(table.sortOrder),
  }),
);

// CATEGORY_ADDON_GROUPS table - junction table for linking categories to addon groups
export const categoryAddonGroups = pgTable(
  "category_addon_groups",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    categoryId: uuid("category_id").references(() => menuCategories.id, {
      onDelete: "cascade",
    }),
    addonGroupId: uuid("addon_group_id").references(() => addonGroups.id, {
      onDelete: "cascade",
    }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    categoryIdIdx: index("category_addon_groups_category_id_idx").on(table.categoryId),
    addonGroupIdIdx: index("category_addon_groups_addon_group_id_idx").on(table.addonGroupId),
  }),
);

// ITEM_ADDON_GROUPS table - junction table for linking individual menu items to addon groups
export const itemAddonGroups = pgTable(
  "item_addon_groups",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    itemId: uuid("item_id").references(() => menuItems.id, {
      onDelete: "cascade",
    }),
    addonGroupId: uuid("addon_group_id").references(() => addonGroups.id, {
      onDelete: "cascade",
    }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    itemIdIdx: index("item_addon_groups_item_id_idx").on(table.itemId),
    addonGroupIdIdx: index("item_addon_groups_addon_group_id_idx").on(table.addonGroupId),
  }),
);

// BOOKING_ITEMS table
export const bookingItems = pgTable(
  "booking_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    bookingId: uuid("booking_id").references(() => bookings.id, {
      onDelete: "cascade",
    }),
    itemType: text("item_type", { enum: bookingItemTypeEnum }).notNull(),
    itemId: uuid("item_id").notNull(),
    quantity: integer("quantity").notNull(),
    unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    bookingIdIdx: index("booking_items_booking_id_idx").on(table.bookingId),
  }),
);

// BOOKING_CONTACT_HISTORY table
export const bookingContactHistory = pgTable(
  "booking_contact_history",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    bookingId: uuid("booking_id").references(() => bookings.id, {
      onDelete: "cascade",
    }),
    adminUserId: text("admin_user_id").references(() => adminUser.id),
    contactType: text("contact_type", { enum: contactTypeEnum }).notNull(),
    subject: text("subject").notNull(),
    content: text("content").notNull(),
    isReminder: boolean("is_reminder").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    bookingIdIdx: index("booking_contact_history_booking_id_idx").on(
      table.bookingId,
    ),
    adminUserIdIdx: index("booking_contact_history_admin_user_id_idx").on(
      table.adminUserId,
    ),
    createdAtIdx: index("booking_contact_history_created_at_idx").on(
      table.createdAt,
    ),
  }),
);

// EMAIL_LOGS table
export const emailLogs = pgTable(
  "email_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    bookingId: uuid("booking_id").references(() => bookings.id, {
      onDelete: "cascade",
    }),
    emailType: text("email_type", { enum: emailTypeEnum }).notNull(),
    recipient: text("recipient").notNull(),
    subject: text("subject").notNull(),
    status: text("status", { enum: emailStatusEnum })
      .notNull()
      .default("pending"),
    sentAt: timestamp("sent_at"),
  },
  (table) => ({
    bookingIdIdx: index("email_logs_booking_id_idx").on(table.bookingId),
    statusIdx: index("email_logs_status_idx").on(table.status),
  }),
);

// BOOKING_AUDIT_LOG table
export const bookingAuditLog = pgTable(
  "booking_audit_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    bookingId: uuid("booking_id")
      .notNull()
      .references(() => bookings.id, { onDelete: "cascade" }),
    adminUserId: text("admin_user_id").references(() => adminUser.id),
    actorType: text("actor_type")
      .notNull()
      .$type<"admin" | "client">(),
    actorLabel: text("actor_label").notNull(),
    changes: jsonb("changes").notNull().$type<Array<{
      field: string;
      from: any;
      to: any;
    }>>(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    bookingIdIdx: index("booking_audit_log_booking_id_idx").on(
      table.bookingId
    ),
    createdAtIdx: index("booking_audit_log_created_at_idx").on(
      table.createdAt
    ),
  }),
);

// LANDING_PAGE_CONTENT table
export const landingPageContent = pgTable(
  "landing_page_content",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sectionKey: text("section_key").notNull().unique(),
    title: text("title").notNull(),
    titleDe: text("title_de").notNull(),
    content: text("content"),
    contentDe: text("content_de"),
    imageUrl: text("image_url"),
    ctaText: text("cta_text"),
    ctaTextDe: text("cta_text_de"),
    ctaLink: text("cta_link"),
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    sectionKeyIdx: index("landing_page_content_section_key_idx").on(
      table.sectionKey,
    ),
    sortOrderIdx: index("landing_page_content_sort_order_idx").on(
      table.sortOrder,
    ),
  }),
);

// Venues
export const venues = pgTable(
  "venues",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull().unique(),
    description: text("description"),
    isActive: boolean("is_active").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    nameIdx: index("venues_name_idx").on(table.name),
    sortOrderIdx: index("venues_sort_order_idx").on(table.sortOrder),
  }),
);

// Kitchen PDF Logs
export const kitchenPdfLogs = pgTable(
  "kitchen_pdf_logs",
  {
    id: text("id").primaryKey(),
    bookingId: uuid("booking_id")
      .notNull()
      .references(() => bookings.id, { onDelete: "cascade" }),
    documentName: text("document_name").notNull(),
    sentAt: timestamp("sent_at").notNull(),
    sentBy: text("sent_by").notNull(),
    recipientEmail: text("recipient_email").notNull(),
    status: text("status").notNull(), // 'sent' | 'failed'
    errorMessage: text("error_message"),
    idempotencyKey: text("idempotency_key").unique(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    bookingIdIdx: index("kitchen_pdf_logs_booking_id_idx").on(
      table.bookingId
    ),
    idempotencyKeyIdx: index("kitchen_pdf_logs_idempotency_key_idx").on(
      table.idempotencyKey
    ),
    sentAtIdx: index("kitchen_pdf_logs_sent_at_idx").on(table.sentAt),
  }),
);

// Better Auth type exports
export type Session = typeof session.$inferSelect;
export type NewSession = typeof session.$inferInsert;
export type Account = typeof account.$inferSelect;
export type NewAccount = typeof account.$inferInsert;
export type Verification = typeof verification.$inferSelect;
export type NewVerification = typeof verification.$inferInsert;

// Type exports for use in the app
export type AdminUser = typeof adminUser.$inferSelect;
export type NewAdminUser = typeof adminUser.$inferInsert;
export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;
export type MenuCategory = typeof menuCategories.$inferSelect;
export type NewMenuCategory = typeof menuCategories.$inferInsert;
export type MenuItem = typeof menuItems.$inferSelect;
export type NewMenuItem = typeof menuItems.$inferInsert;
export type Addon = typeof addons.$inferSelect;
export type NewAddon = typeof addons.$inferInsert;
export type AddonGroup = typeof addonGroups.$inferSelect;
export type NewAddonGroup = typeof addonGroups.$inferInsert;
export type AddonItem = typeof addonItems.$inferSelect;
export type NewAddonItem = typeof addonItems.$inferInsert;
export type CategoryAddonGroup = typeof categoryAddonGroups.$inferSelect;
export type NewCategoryAddonGroup = typeof categoryAddonGroups.$inferInsert;
export type ItemAddonGroup = typeof itemAddonGroups.$inferSelect;
export type NewItemAddonGroup = typeof itemAddonGroups.$inferInsert;
export type BookingItem = typeof bookingItems.$inferSelect;
export type NewBookingItem = typeof bookingItems.$inferInsert;
export type BookingContactHistory = typeof bookingContactHistory.$inferSelect;
export type NewBookingContactHistory =
  typeof bookingContactHistory.$inferInsert;
export type EmailLog = typeof emailLogs.$inferSelect;
export type NewEmailLog = typeof emailLogs.$inferInsert;
export type BookingAuditLog = typeof bookingAuditLog.$inferSelect;
export type NewBookingAuditLog = typeof bookingAuditLog.$inferInsert;
export type Venue = typeof venues.$inferSelect;
export type NewVenue = typeof venues.$inferInsert;
export type KitchenPdfLog = typeof kitchenPdfLogs.$inferSelect;
export type NewKitchenPdfLog = typeof kitchenPdfLogs.$inferInsert;
export type LandingPageContent = typeof landingPageContent.$inferSelect;
export type NewLandingPageContent = typeof landingPageContent.$inferInsert;
