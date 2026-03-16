# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
```bash
npm run dev          # Start development server (Next.js 16)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npx tsc --noEmit     # Type check without emitting files
```

### Database (Drizzle ORM + PostgreSQL/NeonDB)
```bash
npm run db:generate  # Generate migrations from schema changes
npm run db:migrate   # Run pending migrations
npm run db:push      # Push schema directly to database (development)
npm run db:studio    # Open Drizzle Studio for database inspection
npm run db:seed      # Seed database with initial data
npm run db:reset-admin    # Reset admin user to default credentials
npm run db:verify    # Verify database connection and admin user
npm run db:create-user    # Create a new admin user interactively
npm run db:recalculate-totals  # Recalculate booking totals
```

### Email & Reminders
```bash
npm run email:test   # Test email configuration
npm run email:test-dummy  # Test email with dummy data
npm run email:send-reminders  # Send booking reminders for next 24 hours
```

### Development Utilities
```bash
npm run db:seed-dummy-bookings  # Seed test bookings for development
npm run db:add-settings  # Add settings table if missing
```

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 16 with App Router
- **Database**: PostgreSQL (NeonDB serverless) with Drizzle ORM
- **Authentication**: Better Auth with custom RBAC middleware
- **Styling**: Tailwind CSS 4.x with Radix UI components
- **Internationalization**: next-intl (English/German)

### Project Structure

```
app/
├── admin/              # Admin panel routes (protected)
│   ├── bookings/       # Booking management
│   ├── menu-config/    # Menu configuration
│   ├── user-management/# User/role management
│   ├── reports/        # Analytics & reports
│   └── settings/       # System settings
├── wizard/             # Client-facing booking wizard
├── booking/[id]/edit/[secret]/  # Client edit page with secret
├── api/                # API routes
│   ├── auth/           # Better Auth endpoints
│   ├── bookings/       # Booking CRUD & status updates
│   ├── data/           # Data API (bookings, menu, stats)
│   └── cron/           # Scheduled tasks (reminders)
└── layout.tsx          # Root layout with i18n provider

components/
├── admin/              # Admin-specific components
├── user/               # User-facing components
└── ui/                 # Reusable UI components (Radix wrappers)

lib/
├── actions/            # Server actions (bookings, menu, stats, wizard, etc.)
│   ├── bookings.ts     # Booking CRUD operations
│   ├── leads.ts        # Lead management
│   ├── menu.ts         # Menu category/item/addon CRUD
│   ├── users.ts        # Admin user management
│   ├── wizard.ts       # Booking wizard form submission
│   ├── stats.ts        # Dashboard statistics
│   ├── reminders.ts    # Email reminder system
│   ├── email.ts        # Email sending utilities
│   └── fetch-bookings.ts  # Booking data fetching
├── auth/               # Better Auth config & RBAC middleware
├── db/
│   ├── schema.ts       # Drizzle schema (all tables)
│   └── index.ts        # Database connection
├── email/              # Email templates & ZeptoMail integration
├── i18n/               # Internationalization utilities
└── validation/         # Zod schemas

messages/
├── en.json             # English translations
└── de.json             # German translations
```

### Database Schema Key Tables

- **admin_user**: Admin users with roles (super_admin, admin, moderator, read_only)
- **leads**: Customer leads/inquiries
- **bookings**: Event bookings with status, pricing, assignment
- **booking_items**: Menu items and addons per booking
- **menu_categories** & **menu_items**: Menu structure with i18n support
- **booking_audit_log**: Tracks all booking changes (admin + client edits)
- **email_logs**: Email sent history

### Important Patterns

#### neon-http Driver Limitations
The project uses `neon-http` driver which doesn't support some Drizzle query builders. Use raw SQL for complex queries:

```typescript
// ❌ Doesn't work with neon-http
await db.select().from(bookings).orderBy(desc(bookings.createdAt));

// ✅ Use raw SQL instead
await db.execute(sql`SELECT ... FROM bookings ORDER BY created_at DESC`);
```

Always handle response format:
```typescript
const result = await db.execute(sql`...`);
const rows = 'rows' in result ? result.rows : result;
```

#### Authentication & Authorization
- Better Auth handles sessions (7-day expiry)
- RBAC defined in `lib/auth/rbac.ts` - check before allowing actions
- Public sign-up disabled; users created by admin only
- Middleware at root allows `/admin/login`, page-level checks elsewhere

#### Booking Status Values
Valid statuses: `new`, `touchbase`, `pending`, `confirmed`, `completed`, `cancelled`, `no_show`, `declined`

#### Client Booking Editing
- Bookings have `edit_secret` for secure client access
- `is_locked` prevents concurrent edits
- Audit log tracks both admin and client changes

#### Internationalization
- Use `useTranslations()` hook in components
- All user-facing text should be in `messages/en.json` and `messages/de.json`
- Database has `nameDe`, `descriptionDe` fields for German content

## Code Style Rules

- Always prefer **reusable components** instead of duplicating code
- Extract repeated UI or logic into reusable components, hooks, or utility functions
- Maintain clear separation of concerns (components, hooks, utilities, services)
- Follow the existing project structure
- Do not duplicate logic across files

## Security & Validation

- **Every form field** should have proper validation using Zod schemas
- **Every database model field** should have proper validation
- All user inputs must be validated before database operations
- Use `lib/validation/` for Zod schemas that define input constraints

## Default Credentials

After running `npm run db:seed`, the default admin account is:
- **Email:** admin@oliv-restaurant.ch
- **Password:** admin123

**Important:** Change this password immediately in production environments!

## Pre-Completion Checklist

Before marking a task complete:
1. Run `npx tsc --noEmit` to check for TypeScript errors
