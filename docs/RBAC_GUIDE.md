# Role-Based Access Control (RBAC) Guide

## Overview

The OLIV Booking System implements a comprehensive Role-Based Access Control (RBAC) system to manage user permissions and restrict access to sensitive operations.

## User Roles

The system has **4 hierarchical roles**:

| Role | Level | Description |
|------|-------|-------------|
| `super_admin` | 4 | Full system access including user management |
| `admin` | 3 | Full access to bookings, menu, and reports |
| `moderator` | 2 | Can manage bookings, view reports |
| `read_only` | 1 | View-only access to all sections |

---

## Permission Categories

### Dashboard
- `VIEW_DASHBOARD` - Access the admin dashboard

### Bookings
- `VIEW_BOOKINGS` - View booking list
- `CREATE_BOOKING` - Create new bookings
- `EDIT_BOOKING` - Edit booking details
- `DELETE_BOOKING` - Delete bookings
- `UPDATE_BOOKING_STATUS` - Change booking status
- `CONVERT_LEAD_TO_BOOKING` - Convert leads to bookings
- `VIEW_BOOKING_DETAILS` - View detailed booking information

### Leads
- `VIEW_LEADS` - View lead list
- `EDIT_LEAD` - Edit lead details
- `UPDATE_LEAD_STATUS` - Change lead status
- `DELETE_LEAD` - Delete leads

### Menu Management
- `VIEW_MENU` - View menu configuration
- `CREATE_MENU_CATEGORY` - Create menu categories
- `EDIT_MENU_CATEGORY` - Edit menu categories
- `DELETE_MENU_CATEGORY` - Delete menu categories
- `CREATE_MENU_ITEM` - Create menu items
- `EDIT_MENU_ITEM` - Edit menu items
- `DELETE_MENU_ITEM` - Delete menu items
- `CREATE_ADDON` - Create addons
- `EDIT_ADDON` - Edit addons
- `DELETE_ADDON` - Delete addons

### User Management
- `VIEW_USERS` - View user list
- `CREATE_USER` - Create new admin users
- `EDIT_USER` - Edit user details
- `DELETE_USER` - Delete users
- `ASSIGN_ROLES` - Assign roles to users

### Reports
- `VIEW_REPORTS` - View reports and analytics
- `EXPORT_REPORTS` - Export report data

### Settings
- `VIEW_SETTINGS` - View system settings
- `UPDATE_SETTINGS` - Modify system settings

### Profile
- `VIEW_PROFILE` - View user profile
- `UPDATE_PROFILE` - Update own profile

---

## Role Permissions Matrix

| Permission | Super Admin | Admin | Moderator | Read Only |
|------------|-------------|-------|-----------|-----------|
| **Dashboard** |
| `VIEW_DASHBOARD` | ✅ | ✅ | ✅ | ✅ |
| **Bookings** |
| `VIEW_BOOKINGS` | ✅ | ✅ | ✅ | ✅ |
| `CREATE_BOOKING` | ✅ | ✅ | ✅ | ❌ |
| `EDIT_BOOKING` | ✅ | ✅ | ✅ | ❌ |
| `DELETE_BOOKING` | ✅ | ✅ | ❌ | ❌ |
| `UPDATE_BOOKING_STATUS` | ✅ | ✅ | ✅ | ❌ |
| `CONVERT_LEAD_TO_BOOKING` | ✅ | ✅ | ✅ | ❌ |
| `VIEW_BOOKING_DETAILS` | ✅ | ✅ | ✅ | ✅ |
| **Leads** |
| `VIEW_LEADS` | ✅ | ✅ | ✅ | ✅ |
| `EDIT_LEAD` | ✅ | ✅ | ✅ | ❌ |
| `UPDATE_LEAD_STATUS` | ✅ | ✅ | ✅ | ❌ |
| `DELETE_LEAD` | ✅ | ✅ | ❌ | ❌ |
| **Menu** |
| `VIEW_MENU` | ✅ | ✅ | ✅ | ✅ |
| `CREATE_MENU_CATEGORY` | ✅ | ✅ | ❌ | ❌ |
| `EDIT_MENU_CATEGORY` | ✅ | ✅ | ❌ | ❌ |
| `DELETE_MENU_CATEGORY` | ✅ | ✅ | ❌ | ❌ |
| `CREATE_MENU_ITEM` | ✅ | ✅ | ❌ | ❌ |
| `EDIT_MENU_ITEM` | ✅ | ✅ | ❌ | ❌ |
| `DELETE_MENU_ITEM` | ✅ | ✅ | ❌ | ❌ |
| `CREATE_ADDON` | ✅ | ✅ | ❌ | ❌ |
| `EDIT_ADDON` | ✅ | ✅ | ❌ | ❌ |
| `DELETE_ADDON` | ✅ | ✅ | ❌ | ❌ |
| **Users** |
| `VIEW_USERS` | ✅ | ✅ | ✅ | ✅ |
| `CREATE_USER` | ✅ | ❌ | ❌ | ❌ |
| `EDIT_USER` | ✅ | ❌ | ❌ | ❌ |
| `DELETE_USER` | ✅ | ❌ | ❌ | ❌ |
| `ASSIGN_ROLES` | ✅ | ❌ | ❌ | ❌ |
| **Reports** |
| `VIEW_REPORTS` | ✅ | ✅ | ✅ | ✅ |
| `EXPORT_REPORTS` | ✅ | ✅ | ❌ | ❌ |
| **Settings** |
| `VIEW_SETTINGS` | ✅ | ✅ | ✅ | ✅ |
| `UPDATE_SETTINGS` | ✅ | ✅ | ❌ | ❌ |
| **Profile** |
| `VIEW_PROFILE` | ✅ | ✅ | ✅ | ✅ |
| `UPDATE_PROFILE` | ✅ | ✅ | ✅ | ✅ |

---

## Route Access Summary

| Route | Super Admin | Admin | Moderator | Read Only |
|-------|-------------|-------|-----------|-----------|
| `/admin` | ✅ | ✅ | ✅ | ✅ |
| `/admin/bookings` | ✅ Full Access | ✅ Full Access | ✅ Full Access | 👁️ View Only |
| `/admin/reports` | ✅ Full Access | ✅ Full Access | 👁️ View Only | 👁️ View Only |
| `/admin/menu-config` | ✅ Full Access | ✅ Full Access | 👁️ View Only | 👁️ View Only |
| `/admin/user-management` | ✅ Full Access | 👁️ View Only | 👁️ View Only | 👁️ View Only |
| `/admin/settings` | ✅ Full Access | ✅ Full Access | 👁️ View Only | 👁️ View Only |
| `/admin/profile` | ✅ Full Access | ✅ Full Access | ✅ Full Access | ✅ Full Access |

---

## Usage Examples

### In Server Actions

```typescript
'use server';

import { requirePermissionWrapper } from "@/lib/auth/rbac-middleware";
import { Permission } from "@/lib/auth/rbac";

export async function deleteBooking(id: string) {
  // Check permission before proceeding
  await requirePermissionWrapper(Permission.DELETE_BOOKING);

  // Your action logic here...
  await db.delete(bookings).where(eq(bookings.id, id));

  return { success: true };
}
```

### Using Authorization Wrappers

```typescript
import { withPermission } from "@/lib/auth/rbac-middleware";
import { Permission } from "@/lib/auth/rbac";

// Wrap an action with permission check
export const secureDeleteBooking = withPermission(
  deleteBooking,
  Permission.DELETE_BOOKING
);
```

### In Page Components

```typescript
import { checkRouteAccess } from "@/lib/auth/rbac-middleware";
import { Permission } from "@/lib/auth/rbac";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  // Check access
  const { hasAccess, user, reason } = await checkRouteAccess([
    Permission.VIEW_DASHBOARD
  ]);

  if (!hasAccess) {
    if (reason === "not_authenticated") {
      redirect("/admin/login");
    } else {
      return <div>Access Denied: Insufficient permissions</div>;
    }
  }

  // Render page...
}
```

### Checking Multiple Permissions

```typescript
// Require ALL permissions
await requireAllPermissionsWrapper([
  Permission.EDIT_USER,
  Permission.ASSIGN_ROLES
]);

// Require ANY permission
await requireAnyPermissionWrapper([
  Permission.EDIT_BOOKING,
  Permission.UPDATE_BOOKING_STATUS
]);
```

---

## User Management Rules

### Creating Users
- **Only super_admin** can create users
- Cannot create users with equal or higher role

### Editing Users
- Users can always edit themselves (profile updates)
- Higher roles can edit lower roles
- Cannot promote users to equal or higher role

### Deleting Users
- Users cannot delete themselves
- Only higher roles can delete lower roles

### Role Assignment
- **Only super_admin** can assign roles
- Cannot assign roles equal to or higher than your own

---

## Security Best Practices

1. **Always check permissions** in Server Actions before modifying data
2. **Use permission wrappers** for consistent permission checking
3. **Validate on both client and server** - client checks are for UX, server checks are for security
4. **Audit sensitive operations** - log who did what and when
5. **Principle of least privilege** - users should have minimum required permissions
6. **Regular permission audits** - review and update permissions as needed

---

## Error Handling

The RBAC system throws specific errors:

```typescript
import { AuthorizationError } from "@/lib/auth/rbac";

try {
  await requirePermissionWrapper(Permission.DELETE_USER);
} catch (error) {
  if (error instanceof AuthorizationError) {
    console.error("Access denied:", error.message);
    // Show user-friendly error message
  }
}
```

---

## Extending the RBAC System

To add new permissions:

1. **Add permission enum** in `lib/auth/rbac.ts`:
```typescript
export enum Permission {
  // ... existing permissions
  NEW_PERMISSION = "new_permission",
}
```

2. **Assign to roles** in `ROLE_PERMISSIONS`:
```typescript
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: [
    // ... existing permissions
    Permission.NEW_PERMISSION,
  ],
  // ...
};
```

3. **Use in Server Actions**:
```typescript
await requirePermissionWrapper(Permission.NEW_PERMISSION);
```

---

## Troubleshooting

### "Authentication required" Error
- User is not logged in
- Session has expired
- Solution: Redirect to login page

### "Role does not have permission" Error
- User's role lacks the required permission
- Solution: Grant proper role or check permission matrix

### "Cannot modify user" Error
- Trying to modify user with equal/higher role
- Trying to delete own account
- Solution: Use appropriate user account for the operation

---

## Support

For issues or questions about RBAC:
1. Check this guide first
2. Review permission matrix
3. Check server logs for detailed error messages
4. Verify user role in database
