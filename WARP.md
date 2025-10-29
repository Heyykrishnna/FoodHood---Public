# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Foodhood Rush is a food delivery web application built with React, TypeScript, and Supabase. It provides a complete food ordering system with user authentication, menu management, shopping cart functionality, and admin dashboard capabilities.

## Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: shadcn/ui components with Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **State Management**: React Context + TanStack Query
- **Routing**: React Router v6
- **Build Tool**: Vite
- **Package Manager**: npm

## Essential Development Commands

### Setup and Installation
```bash
npm install                    # Install dependencies
```

### Development
```bash
npm run dev                    # Start development server (http://localhost:5173)
npm run build                  # Production build
npm run build:dev             # Development build
npm run preview               # Preview production build
npm run lint                  # Run ESLint
```

### Supabase Management
```bash
supabase login                 # Login to Supabase CLI
supabase start                # Start local Supabase (requires Docker)
supabase stop                 # Stop local Supabase
supabase db push              # Push migrations to remote database
supabase db pull              # Pull schema changes from remote
supabase db reset             # Reset local database
supabase gen types typescript --project-ref mxlciulnchgdodoacdwk --schema public > src/integrations/supabase/types.ts
```

### Single Test Commands
```bash
npm run lint -- --fix        # Auto-fix linting issues
npm run build -- --mode development  # Development mode build
```

## Architecture Overview

### Directory Structure
```
src/
├── components/           # Reusable UI components
│   ├── ui/              # shadcn/ui components
│   └── Navbar.tsx       # Main navigation
├── contexts/            # React contexts for state management
│   └── CartContext.tsx  # Shopping cart state
├── hooks/               # Custom React hooks
├── integrations/        # External service integrations
│   └── supabase/        # Supabase client and types
├── pages/               # Route components
│   ├── Index.tsx        # Homepage
│   ├── Menu.tsx         # Menu browsing
│   ├── Cart.tsx         # Shopping cart
│   ├── Checkout.tsx     # Order checkout
│   ├── Auth.tsx         # Authentication
│   ├── Profile.tsx      # User profile
│   └── Admin.tsx        # Admin dashboard
└── lib/                 # Utility functions
```

### Database Schema

The application uses a PostgreSQL database with the following key entities:

- **profiles**: User profile information
- **categories**: Food categories for menu organization
- **menu_items**: Individual food items with pricing
- **pricing_rules**: Time-based pricing (morning/afternoon/evening/night)
- **orders**: Customer orders with status tracking
- **order_items**: Line items within orders
- **messages**: Admin-customer communication
- **user_roles**: Role-based access control (admin/user)

### Authentication & Authorization

- Uses Supabase Auth with Row Level Security (RLS)
- Role-based permissions: `admin` and `user` roles
- Public access for menu browsing, authenticated access for ordering
- Admin-only access for dashboard and management features

### Key Features

1. **User Management**: Registration, login, profile management
2. **Menu System**: Categorized menu items with dynamic pricing
3. **Shopping Cart**: Persistent cart with quantity management
4. **Order Management**: Order placement, status tracking, history
5. **Admin Dashboard**: Menu management, order processing, customer communication
6. **Real-time Updates**: Live order status updates via Supabase realtime

### State Management Pattern

- **Global State**: CartContext for shopping cart across components
- **Server State**: TanStack Query for API data caching and synchronization
- **Local State**: React useState for component-specific state
- **Form State**: React Hook Form with Zod validation

### Supabase Configuration

The project is configured to use your own Supabase instance:
- **Project ID**: mxlciulnchgdodoacdwk
- **URL**: https://mxlciulnchgdodoacdwk.supabase.co
- **Database**: PostgreSQL with migrations in `supabase/migrations/`

### Environment Variables

Required environment variables in `.env`:
```
VITE_SUPABASE_PROJECT_ID="mxlciulnchgdodoacdwk"
VITE_SUPABASE_PUBLISHABLE_KEY="[your-anon-key]"
VITE_SUPABASE_URL="https://mxlciulnchgdodoacdwk.supabase.co"
```

### Component Patterns

- Uses shadcn/ui for consistent design system
- Follows compound component pattern for complex UI elements
- Implements custom hooks for business logic separation
- Uses TypeScript interfaces for prop validation

### Performance Considerations

- Implements code splitting with React.lazy (when needed)
- Uses TanStack Query for efficient data fetching and caching
- Optimizes images and assets for web delivery
- Implements proper loading states and error boundaries

### Development Workflow

1. **Database Changes**: Create migrations in `supabase/migrations/`
2. **Type Generation**: Run `supabase gen types` after schema changes
3. **Feature Development**: Create components in appropriate directories
4. **Testing**: Use development server for testing features
5. **Deployment**: Build and deploy through preferred hosting platform

### Debugging Tips

- Use `/oauth-debug` page for authentication troubleshooting
- Check browser console for client-side errors
- Monitor Supabase logs for database/auth issues
- Use React DevTools for component state inspection

### Database Migration Workflow

1. Make schema changes locally or via Supabase Dashboard
2. Generate migration: `supabase db diff --file <name>`
3. Test migration: `supabase db reset` (local)
4. Push to production: `supabase db push`
5. Update types: `supabase gen types typescript`

### Admin Access

- Default admin setup requires manual role assignment in database
- Admin users can access `/admin` route
- Admin features include order management, menu editing, customer messaging

### Common Development Tasks

- **Adding new menu items**: Use Admin dashboard or direct database insert
- **Modifying order status**: Update through Admin dashboard
- **Adding new pages**: Create in `src/pages/` and add to App.tsx routes
- **Styling changes**: Use Tailwind classes or modify component styles
- **Database queries**: Use Supabase client with TypeScript types