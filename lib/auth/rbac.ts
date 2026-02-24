import { UserRole } from "@/lib/db/schema";

/**
 * Permission definitions for the OLIV Booking System
 * Each permission represents a specific action that can be performed
 */
export enum Permission {
  // Dashboard
  VIEW_DASHBOARD = "view_dashboard",

  // Bookings
  VIEW_BOOKINGS = "view_bookings",
  CREATE_BOOKING = "create_booking",
  EDIT_BOOKING = "edit_booking",
  DELETE_BOOKING = "delete_booking",
  UPDATE_BOOKING_STATUS = "update_booking_status",
  CONVERT_LEAD_TO_BOOKING = "convert_lead_to_booking",
  VIEW_BOOKING_DETAILS = "view_booking_details",

  // Leads
  VIEW_LEADS = "view_leads",
  EDIT_LEAD = "edit_lead",
  UPDATE_LEAD_STATUS = "update_lead_status",
  DELETE_LEAD = "delete_lead",

  // Menu Management
  VIEW_MENU = "view_menu",
  CREATE_MENU_CATEGORY = "create_menu_category",
  EDIT_MENU_CATEGORY = "edit_menu_category",
  DELETE_MENU_CATEGORY = "delete_menu_category",
  CREATE_MENU_ITEM = "create_menu_item",
  EDIT_MENU_ITEM = "edit_menu_item",
  DELETE_MENU_ITEM = "delete_menu_item",
  CREATE_ADDON = "create_addon",
  EDIT_ADDON = "edit_addon",
  DELETE_ADDON = "delete_addon",

  // User Management
  VIEW_USERS = "view_users",
  CREATE_USER = "create_user",
  EDIT_USER = "edit_user",
  DELETE_USER = "delete_user",
  MANAGE_USERS = "manage_users",
  ASSIGN_ROLES = "assign_roles",

  // Reports
  VIEW_REPORTS = "view_reports",
  EXPORT_REPORTS = "export_reports",

  // Settings
  VIEW_SETTINGS = "view_settings",
  UPDATE_SETTINGS = "update_settings",

  // Profile
  VIEW_PROFILE = "view_profile",
  UPDATE_PROFILE = "update_profile",
}

/**
 * Role-to-Permission mapping
 * Defines which permissions each role has
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: [
    // Dashboard
    Permission.VIEW_DASHBOARD,

    // Bookings - Full access
    Permission.VIEW_BOOKINGS,
    Permission.CREATE_BOOKING,
    Permission.EDIT_BOOKING,
    Permission.DELETE_BOOKING,
    Permission.UPDATE_BOOKING_STATUS,
    Permission.CONVERT_LEAD_TO_BOOKING,
    Permission.VIEW_BOOKING_DETAILS,

    // Leads - Full access
    Permission.VIEW_LEADS,
    Permission.EDIT_LEAD,
    Permission.UPDATE_LEAD_STATUS,
    Permission.DELETE_LEAD,

    // Menu - Full access
    Permission.VIEW_MENU,
    Permission.CREATE_MENU_CATEGORY,
    Permission.EDIT_MENU_CATEGORY,
    Permission.DELETE_MENU_CATEGORY,
    Permission.CREATE_MENU_ITEM,
    Permission.EDIT_MENU_ITEM,
    Permission.DELETE_MENU_ITEM,
    Permission.CREATE_ADDON,
    Permission.EDIT_ADDON,
    Permission.DELETE_ADDON,

    // User Management - Full access including role assignment
    Permission.VIEW_USERS,
    Permission.CREATE_USER,
    Permission.EDIT_USER,
    Permission.DELETE_USER,
    Permission.MANAGE_USERS,
    Permission.ASSIGN_ROLES,

    // Reports
    Permission.VIEW_REPORTS,
    Permission.EXPORT_REPORTS,

    // Settings
    Permission.VIEW_SETTINGS,
    Permission.UPDATE_SETTINGS,

    // Profile
    Permission.VIEW_PROFILE,
    Permission.UPDATE_PROFILE,
  ],

  admin: [
    // Dashboard
    Permission.VIEW_DASHBOARD,

    // Bookings - Full access
    Permission.VIEW_BOOKINGS,
    Permission.CREATE_BOOKING,
    Permission.EDIT_BOOKING,
    Permission.DELETE_BOOKING,
    Permission.UPDATE_BOOKING_STATUS,
    Permission.CONVERT_LEAD_TO_BOOKING,
    Permission.VIEW_BOOKING_DETAILS,

    // Leads - Full access
    Permission.VIEW_LEADS,
    Permission.EDIT_LEAD,
    Permission.UPDATE_LEAD_STATUS,
    Permission.DELETE_LEAD,

    // Menu - Full access
    Permission.VIEW_MENU,
    Permission.CREATE_MENU_CATEGORY,
    Permission.EDIT_MENU_CATEGORY,
    Permission.DELETE_MENU_CATEGORY,
    Permission.CREATE_MENU_ITEM,
    Permission.EDIT_MENU_ITEM,
    Permission.DELETE_MENU_ITEM,
    Permission.CREATE_ADDON,
    Permission.EDIT_ADDON,
    Permission.DELETE_ADDON,

    // User Management - View only (cannot create/edit/delete users)
    Permission.VIEW_USERS,

    // Reports
    Permission.VIEW_REPORTS,
    Permission.EXPORT_REPORTS,

    // Settings
    Permission.VIEW_SETTINGS,
    Permission.UPDATE_SETTINGS,

    // Profile
    Permission.VIEW_PROFILE,
    Permission.UPDATE_PROFILE,
  ],

  moderator: [
    // Dashboard
    Permission.VIEW_DASHBOARD,

    // Bookings - Full access
    Permission.VIEW_BOOKINGS,
    Permission.CREATE_BOOKING,
    Permission.EDIT_BOOKING,
    Permission.UPDATE_BOOKING_STATUS,
    Permission.CONVERT_LEAD_TO_BOOKING,
    Permission.VIEW_BOOKING_DETAILS,
    Permission.DELETE_BOOKING,

    // Leads - Full access
    Permission.VIEW_LEADS,
    Permission.EDIT_LEAD,
    Permission.UPDATE_LEAD_STATUS,
    Permission.DELETE_LEAD,

    // Menu - View only
    Permission.VIEW_MENU,

    // User Management - View only
    Permission.VIEW_USERS,

    // Reports - View only
    Permission.VIEW_REPORTS,

    // Settings - View only
    Permission.VIEW_SETTINGS,

    // Profile
    Permission.VIEW_PROFILE,
    Permission.UPDATE_PROFILE,
  ],

  read_only: [
    // Dashboard - View only
    Permission.VIEW_DASHBOARD,

    // Bookings - View only
    Permission.VIEW_BOOKINGS,
    Permission.VIEW_BOOKING_DETAILS,

    // Leads - View only
    Permission.VIEW_LEADS,

    // Menu - View only
    Permission.VIEW_MENU,

    // User Management - View only
    Permission.VIEW_USERS,

    // Reports - View only
    Permission.VIEW_REPORTS,

    // Settings - View only
    Permission.VIEW_SETTINGS,

    // Profile - View only
    Permission.VIEW_PROFILE,
    Permission.UPDATE_PROFILE, // Can update own profile
  ],
};

/**
 * Check if a user role has a specific permission
 * @param role - The user's role
 * @param permission - The permission to check
 * @returns true if the role has the permission, false otherwise
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}

/**
 * Check if a user role has any of the specified permissions
 * @param role - The user's role
 * @param permissions - Array of permissions to check
 * @returns true if the role has at least one of the permissions
 */
export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(role, permission));
}

/**
 * Check if a user role has all of the specified permissions
 * @param role - The user's role
 * @param permissions - Array of permissions to check
 * @returns true if the role has all of the permissions
 */
export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(role, permission));
}

/**
 * Get all permissions for a role
 * @param role - The user's role
 * @returns Array of permissions for the role
 */
export function getRolePermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Authorization error class
 */
export class AuthorizationError extends Error {
  constructor(message: string = "You don't have permission to perform this action") {
    super(message);
    this.name = "AuthorizationError";
  }
}

/**
 * Check permissions and throw an error if not authorized
 * Use this in Server Actions to enforce RBAC
 * @param role - The user's role
 * @param permission - The required permission
 * @throws AuthorizationError if the role doesn't have the permission
 */
export function requirePermission(role: UserRole, permission: Permission): void {
  if (!hasPermission(role, permission)) {
    throw new AuthorizationError(
      `Role '${role}' does not have permission '${permission}'`
    );
  }
}

/**
 * Check multiple permissions (require all) and throw an error if not authorized
 * @param role - The user's role
 * @param permissions - Array of required permissions
 * @throws AuthorizationError if the role doesn't have all permissions
 */
export function requireAllPermissions(role: UserRole, permissions: Permission[]): void {
  if (!hasAllPermissions(role, permissions)) {
    throw new AuthorizationError(
      `Role '${role}' does not have all required permissions: ${permissions.join(", ")}`
    );
  }
}

/**
 * Check multiple permissions (require any) and throw an error if not authorized
 * @param role - The user's role
 * @param permissions - Array of permissions (at least one required)
 * @throws AuthorizationError if the role doesn't have any of the permissions
 */
export function requireAnyPermission(role: UserRole, permissions: Permission[]): void {
  if (!hasAnyPermission(role, permissions)) {
    throw new AuthorizationError(
      `Role '${role}' does not have any of the required permissions: ${permissions.join(", ")}`
    );
  }
}

/**
 * Role hierarchy for elevated actions
 * Higher roles can perform actions of lower roles
 */
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  super_admin: 4,
  admin: 3,
  moderator: 2,
  read_only: 1,
};

/**
 * Check if a role can manage another role (only higher roles can manage lower roles)
 * @param managerRole - The role attempting to manage
 * @param targetRole - The role being managed
 * @returns true if the manager role is higher in hierarchy
 */
export function canManageRole(managerRole: UserRole, targetRole: UserRole): boolean {
  return ROLE_HIERARCHY[managerRole] > ROLE_HIERARCHY[targetRole];
}

/**
 * Check if a role can modify another user
 * Users can always modify themselves, and higher roles can modify lower roles
 * @param managerRole - The role attempting to modify
 * @param targetUserId - The ID of the user being modified
 * @param currentUserId - The ID of the current user
 * @param targetUserRole - The role of the user being modified
 * @returns true if the modification is allowed
 */
export function canModifyUser(
  managerRole: UserRole,
  targetUserId: string,
  currentUserId: string,
  targetUserRole: UserRole
): boolean {
  // Users can always modify themselves
  if (targetUserId === currentUserId) {
    return true;
  }

  // Check role hierarchy
  return canManageRole(managerRole, targetUserRole);
}
