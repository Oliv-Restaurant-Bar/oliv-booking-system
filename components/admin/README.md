# Reusable Admin Components

This directory contains reusable components for the admin interface.

## Page Layout Consistency

All admin pages now use the `AdminPageLayout` component for consistent spacing and layout.

### AdminPageLayout

A wrapper component that provides consistent padding and spacing across all admin pages.

#### Usage

```tsx
import { AdminPageLayout } from '@/components/admin/AdminPageLayout';

export default function MyAdminPage() {
  return (
    <AdminPageLayout>
      {/* Your page content */}
    </AdminPageLayout>
  );
}

// With additional className
export default function MyAdminPage() {
  return (
    <AdminPageLayout className="space-y-6">
      {/* Your page content */}
    </AdminPageLayout>
  );
}
```

#### Benefits

- **Consistent spacing**: `px-4 md:px-8 pt-3 pb-8` across all pages
- **Maintainable**: Update spacing in one place
- **Responsive**: Mobile and desktop padding
- **Extensible**: Optional `className` prop for additional styles

#### Current Implementation

All admin pages use this layout:
- `/admin` - Dashboard
- `/admin/bookings` - Bookings management
- `/admin/menu-config` - Menu configuration
- `/admin/user-management` - User management
- `/admin/reports` - Reports
- `/admin/settings` - Settings
- `/admin/profile` - User profile

## BookingCard

A flexible booking card component that can be used in both compact and detailed views.

### Usage

```tsx
import { BookingCard } from '@/components/admin/BookingCard';

// Compact version (for sidebars/lists)
<BookingCard
  booking={bookingData}
  onClick={() => handleBookingClick(bookingData.id)}
  compact
/>

// Full version (for modals/detailed views)
<BookingCard
  booking={bookingData}
  onClick={() => handleBookingClick(bookingData.id)}
  showViewButton={true}
/>
```

### Props

- `booking`: BookingCardData - The booking object to display
- `onClick`: () => void - Click handler
- `compact`: boolean - Whether to show compact version (default: false)
- `showViewButton`: boolean - Whether to show the view button (default: true)

### Example Booking Data

```tsx
const bookingData = {
  id: 'booking-123',
  customer: {
    name: 'John Doe',
    avatar: 'JD',
    avatarColor: '#9DAE91'
  },
  event: {
    date: 'Jun 15, 2026',
    time: '18:00',
    occasion: 'Birthday Party',
    location: 'Main Hall'
  },
  guests: 50,
  amount: 'CHF 2,500',
  status: 'confirmed',
  kitchenPdf: {
    sentStatus: 'sent',
    lastSentAt: '2025-01-15T10:30:00Z'
  }
};
```

## AssignUserModal

A generic, reusable user assignment modal that follows the consistent modal design pattern and uses the reusable Button component.

### Usage

```tsx
import { AssignUserModal } from '@/components/admin/AssignUserModal';

// Basic usage for booking assignment
<AssignUserModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  users={users}
  assignedTo={currentUserId}
  onAssign={(userId) => handleUserAssignment(userId)}
/>

// Customized for different use cases
<AssignUserModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  users={users}
  assignedTo={currentUserId}
  onAssign={(userId) => handleUserAssignment(userId)}
  title="Assign Manager"
  description="Select a manager to approve this request"
  buttonText="Approve"
  showUnassigned={false}
/>
```

### Props

- `isOpen`: boolean - Whether the modal is open
- `onClose`: () => void - Close handler
- `users`: User[] - Array of users to display
- `assignedTo`: string - ID of currently assigned user
- `onAssign`: (userId: string) => void - Assignment handler
- `isLoading`: boolean - Loading state (default: false)
- `title`: string - Modal title (default: "Assign User")
- `description`: string - Modal description (default: "Select a user to assign.")
- `buttonText`: string - Submit button text (default: "Apply")
- `showUnassigned`: boolean - Show "Unassigned" option (default: true)
- `icon`: React.ReactNode - Custom icon (default: UserPlus icon)

### Example User Data

```tsx
const users = [
  {
    id: 'user-1',
    name: 'John Smith',
    email: 'john@example.com',
    role: 'admin'
  },
  {
    id: 'user-2',
    name: 'Jane Doe',
    email: 'jane@example.com',
    role: 'manager'
  }
];
```

## Features

- **Consistent Design**: Both components follow the same design system
- **Responsive**: Works well on different screen sizes
- **Accessible**: Proper keyboard navigation and screen reader support
- **Customizable**: Easy to customize for different use cases
- **Type-Safe**: Full TypeScript support with proper type definitions
