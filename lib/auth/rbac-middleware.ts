import { getSession } from "./server";
import { Permission, requirePermission, requireAnyPermission, requireAllPermissions, AuthorizationError } from "./rbac";

/**
 * Get the current user's session with role
 * @returns The session with user role, or null if not authenticated
 */
export async function getCurrentUser() {
  const session = await getSession();
  if (!session || !session.user) {
    return null;
  }
  return session;
}

/**
 * Require authentication - throws error if not logged in
 * @returns The session with user role
 * @throws Error if not authenticated
 */
export async function requireAuth() {
  const session = await getCurrentUser();
  if (!session) {
    throw new Error("Authentication required. Please log in.");
  }
  return session;
}

/**
 * Require a specific permission
 * @param permission - The required permission
 * @throws AuthorizationError if user lacks permission
 * @throws Error if not authenticated
 */
export async function requirePermissionWrapper(permission: Permission) {
  const session = await requireAuth();
  const role = session.user.role as any;

  requirePermission(role, permission);
  return session;
}

/**
 * Require any of the specified permissions
 * @param permissions - Array of permissions (at least one required)
 * @throws AuthorizationError if user lacks all permissions
 * @throws Error if not authenticated
 */
export async function requireAnyPermissionWrapper(permissions: Permission[]) {
  const session = await requireAuth();
  const role = session.user.role as any;

  requireAnyPermission(role, permissions);
  return session;
}

/**
 * Require all of the specified permissions
 * @param permissions - Array of permissions (all required)
 * @throws AuthorizationError if user lacks any permission
 * @throws Error if not authenticated
 */
export async function requireAllPermissionsWrapper(permissions: Permission[]) {
  const session = await requireAuth();
  const role = session.user.role as any;

  requireAllPermissions(role, permissions);
  return session;
}

/**
 * Check if current user has a specific permission (doesn't throw)
 * @param permission - The permission to check
 * @returns true if user has permission, false otherwise
 */
export async function checkPermission(permission: Permission): Promise<boolean> {
  try {
    await requirePermissionWrapper(permission);
    return true;
  } catch {
    return false;
  }
}

/**
 * Create an authorized Server Action wrapper
 * Wraps a Server Action with permission checks
 *
 * @param action - The Server Action to wrap
 * @param permission - The required permission
 * @returns Wrapped Server Action with permission check
 *
 * @example
 * ```ts
 * export const createBookingAction = withPermission(
 *   createBooking,
 *   Permission.CREATE_BOOKING
 * );
 * ```
 */
export function withPermission<T extends (...args: any[]) => any>(
  action: T,
  permission: Permission
): T {
  return (async (...args: Parameters<T>) => {
    await requirePermissionWrapper(permission);
    return action(...args);
  }) as T;
}

/**
 * Create an authorized Server Action wrapper with multiple permissions (require all)
 *
 * @param action - The Server Action to wrap
 * @param permissions - Array of required permissions (all required)
 * @returns Wrapped Server Action with permission check
 */
export function withAllPermissions<T extends (...args: any[]) => any>(
  action: T,
  permissions: Permission[]
): T {
  return (async (...args: Parameters<T>) => {
    await requireAllPermissionsWrapper(permissions);
    return action(...args);
  }) as T;
}

/**
 * Create an authorized Server Action wrapper with multiple permissions (require any)
 *
 * @param action - The Server Action to wrap
 * @param permissions - Array of permissions (at least one required)
 * @returns Wrapped Server Action with permission check
 */
export function withAnyPermission<T extends (...args: any[]) => any>(
  action: T,
  permissions: Permission[]
): T {
  return (async (...args: Parameters<T>) => {
    await requireAnyPermissionWrapper(permissions);
    return action(...args);
  }) as T;
}

/**
 * Role-based route access check
 * Use this in page components to check access before rendering
 *
 * @param requiredPermissions - Array of permissions required to access the route
 * @returns Object with hasAccess boolean and user info
 */
export async function checkRouteAccess(requiredPermissions: Permission[]) {
  const session = await getCurrentUser();

  if (!session) {
    return {
      hasAccess: false,
      user: null,
      reason: "not_authenticated"
    };
  }

  const role = session.user.role as any;
  const hasAccess = requiredPermissions.some(permission =>
    role && checkPermissionSync(role, permission)
  );

  return {
    hasAccess,
    user: session.user,
    role,
    reason: hasAccess ? null : "insufficient_permissions"
  };
}

/**
 * Synchronous permission check (for use in components)
 * Note: This assumes role is already known
 */
function checkPermissionSync(role: string, permission: Permission): boolean {
  // Import the hasPermission function directly
  const { hasPermission: checkPerm } = require("./rbac");
  return checkPerm(role as any, permission);
}
