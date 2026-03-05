# OLIV Restaurant & Bar - Group Booking System

A production-ready group booking system built with Next.js, Better Auth, and PostgreSQL (NeonDB).

## Features

### Public User Side (No Authentication Required)
- **Landing Page** (German) - Beautiful, accessible landing page
- **Multi-step Booking Wizard** - Complete group booking flow with:
  - Allergy check
  - Contact & event details
  - Menu configuration (dependencies & addons)
  - Summary & confirmation

### Admin Panel (Authentication Required)
- **Role-based Access Control** - Super Admin, Admin, Moderator, Read-only
- **Dashboard** - KPI cards, charts, and analytics
- **Bookings Management** - View, manage, and convert leads to bookings
- **Menu Configuration** - Manage categories, items, dependencies, and addons
- **User Management** - Admin user management
- **Settings** - Application configuration
- **Reports** - Analytics and performance reports

## Tech Stack

| Technology | Version |
|------------|---------|
| Next.js | 16.1.6 (App Router) |
| React | 19.0.0 |
| TypeScript | 5 |
| Tailwind CSS | 4.1.12 |
| Drizzle ORM | 0.36.4 |
| PostgreSQL | NeonDB |
| Better Auth | 1.1.12 |
| Node.js | 22.22.0 |

## Project Structure

```
D:\OLIV\New folder\
├── app/
│   ├── admin/                    # Admin panel (protected routes)
│   │   ├── layout.tsx           # Admin layout
│   │   ├── page.tsx             # Dashboard
│   │   ├── login/               # Admin login
│   │   ├── bookings/            # Bookings management
│   │   ├── reports/             # Reports & analytics
│   │   ├── menu-config/         # Menu configuration
│   │   ├── user-management/     # User management
│   │   ├── settings/            # Settings
│   │   └── profile/             # User profile
│   ├── api/
│   │   ├── auth/[...all]/       # Better Auth API handler
│   │   └── data/                # Data API endpoints
│   ├── wizard/                   # Booking wizard (public)
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Landing page (public)
├── components/
│   ├── admin/                   # Admin-specific components
│   ├── user/                    # Public user components
│   ├── ui/                      # Shared shadcn/ui components
│   └── figma/                   # Shared utilities
├── lib/
│   ├── actions/                 # Server Actions
│   │   ├── bookings.ts         # Booking CRUD
│   │   ├── leads.ts            # Lead management
│   │   ├── menu.ts             # Menu CRUD
│   │   ├── users.ts            # User management
│   │   └── wizard.ts           # Wizard form submission
│   ├── auth/                    # Better Auth configuration
│   │   ├── index.ts            # Auth client
│   │   └── server.ts           # Server-side auth helpers
│   └── db/                      # Database
│       ├── schema.ts           # Drizzle schema
│       ├── index.ts            # Database connection
│       ├── seed.ts             # Database seeding
│       └── migrations/         # Database migrations
├── middleware.ts                # Auth middleware
├── drizzle.config.ts           # Drizzle configuration
├── tailwind.config.ts          # Tailwind CSS configuration
└── tsconfig.json               # TypeScript configuration
```

## Database Schema

The database consists of 14 tables:

### Authentication
- `admin_user` - Admin users with role-based access
- `session` - User sessions
- `account` - OAuth accounts (optional)
- `verification` - Email verification tokens

### Booking Management
- `leads` - Potential bookings from public form
- `bookings` - Confirmed bookings
- `booking_items` - Menu items and addons per booking
- `booking_contact_history` - Contact history logs
- `email_logs` - Email tracking

### Menu Management
- `menu_categories` - Menu categories (Appetizers, Mains, Desserts)
- `menu_items` - Individual menu items
- `menu_item_dependencies` - Item dependencies (requires, excludes, suggests)
- `addons` - Additional items (drinks, decorations, etc.)

### Content Management
- `landing_page_content` - Dynamic content for landing page

## Getting Started

### Prerequisites
- Node.js 22.22.0 or higher
- npm or yarn
- PostgreSQL database (NeonDB recommended)

### Installation

1. **Clone or navigate to the project directory:**
   ```bash
   cd D:\OLIV\New folder
   ```

2. **Install dependencies:**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Set up environment variables:**
   Copy `.env` and update the values:
   ```env
   DATABASE_URL="postgresql://..."
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   BETTER_AUTH_SECRET="your-secret-key"
   BETTER_AUTH_URL="http://localhost:3000"
   ```

4. **Set up the database:**
   ```bash
   # Generate and push schema to database
   npm run db:push

   # Seed initial data (admin user, menu items, etc.)
   npm run db:seed
   ```

### Default Admin Credentials

After seeding, you can log in with:
- **Email:** admin@oliv-restaurant.ch
- **Password:** admin123

**Important:** Change the password in production!

### Running the Development Server

```bash
npm run dev
```

Visit:
- **Landing Page:** http://localhost:3000
- **Booking Wizard:** http://localhost:3000/wizard
- **Admin Panel:** http://localhost:3000/admin

### Build for Production

```bash
npm run build
npm start
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:push` | Push schema to database |
| `npm run db:studio` | Open Drizzle Studio |
| `npm run db:seed` | Seed database with initial data |

## Server Actions

The application uses Next.js Server Actions for data mutations:

### Booking Actions (`lib/actions/bookings.ts`)
- `createBooking(input)` - Create new booking
- `convertLeadToBooking(leadId, data)` - Convert lead to booking
- `updateBookingStatus(id, status)` - Update booking status
- `getBookings(filters?)` - Get all bookings
- `addBookingItem(input)` - Add item to booking
- `logContactHistory(input)` - Log contact interaction

### Menu Actions (`lib/actions/menu.ts`)
- `createMenuCategory(input)` - Create category
- `createMenuItem(input)` - Create menu item
- `createAddon(input)` - Create addon
- `getMenuItems(categoryId?)` - Get menu items
- `getAddons()` - Get all addons

### User Actions (`lib/actions/users.ts`)
- `createAdminUser(input)` - Create new admin
- `updateAdminUser(id, updates)` - Update admin
- `getAdminUsers()` - Get all admins

### Lead Actions (`lib/actions/leads.ts`)
- `createLead(input)` - Create new lead
- `updateLeadStatus(id, status)` - Update lead status
- `getLeads(filters?)` - Get all leads

## User Roles

| Role | Permissions |
|------|-------------|
| `super_admin` | Full access, including user management |
| `admin` | Full access to bookings, menu, reports |
| `moderator` | Manage bookings and view reports |
| `read_only` | View-only access to all sections |

## API Endpoints

### Authentication
- `POST /api/auth/sign-in/email` - Email/password login
- `POST /api/auth/sign-out` - Logout

### Data
- `GET /api/data/bookings` - Get bookings data
- `GET /api/data/menu` - Get menu data
- `GET /api/data/stats` - Get dashboard statistics

## Deployment

### Environment Variables for Production

```env
DATABASE_URL="your-production-database-url"
NEXT_PUBLIC_APP_URL="https://your-domain.com"
BETTER_AUTH_SECRET="your-production-secret"
BETTER_AUTH_URL="https://your-domain.com"

# Email (optional)
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="your-email@example.com"
SMTP_PASSWORD="your-email-password"
SMTP_FROM="noreply@oliv-restaurant.ch"
```

### Deployment Platforms

This project is designed for deployment on:
- **Vercel** (recommended for Next.js)
- **Railway**
- **Render**
- Any Node.js hosting platform

## Support & Maintenance

### Database Management
```bash
# View database in Drizzle Studio
npm run db:studio

# Create new migration
npm run db:generate
```

### Creating a New Admin User

Use the `createAdminUser` Server Action or manually insert into the database:
```sql
INSERT INTO admin_user (id, name, email, role, email_verified)
VALUES ('uuid', 'Name', 'email@example.com', 'admin', true);
```

## License

Proprietary - OLIV Restaurant & Bar

## Credits

- **Design:** Created with Figma Make
- **Development:** Built with Next.js and Better Auth
