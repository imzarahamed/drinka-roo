# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Monorepo Management (Turborepo)**
- `npm run dev` - Start all apps in development mode (hub:3000, myaccount:3001, site:3002)
- `npm run build` - Build all apps
- `npm run lint` - Lint all packages
- `npm run format` - Format all files with Prettier
- `npm run check-types` - TypeScript type checking across all packages

**Single App Development**
- `npx turbo dev --filter=hub` - Run only the hub app
- `npx turbo dev --filter=myaccount` - Run only the myaccount app
- `npx turbo dev --filter=site` - Run only the site app

**Supabase Database Management**
- `npx supabase db push` - Push database migrations to Supabase
- `npx supabase functions deploy <function-name>` - Deploy Edge Functions
- `npx supabase secrets set KEY=value` - Set Edge Function secrets

## Architecture Overview

This is a **Turborepo monorepo** for a wholesale platform with three Next.js applications and shared packages.

### Applications Structure

**apps/hub/** - Internal admin dashboard (Next.js App Router)
- Authentication required for all routes under `(auth)/`
- Role-based access control (super_admin, manager, order_viewer, staff)
- Manages: products, categories, customers, orders, staff accounts
- Uses route groups: `(auth)/` for authenticated pages, `/login` for auth

**apps/myaccount/** - Customer-facing portal (Next.js App Router)
- Customer authentication via Supabase Auth
- Route structure: `(account)/` for authenticated customer pages
- Features: order history, account details, new order placement

**apps/site/** - Public product catalog (Next.js App Router)
- Static product browsing
- SEO-optimized product pages with dynamic routes: `/products/[slug]`

### Shared Packages

**packages/supabase/** - Centralized database layer
- `@drinka-roo/supabase` package name
- Exports: typed Supabase clients, database types, storage helpers
- Key files: `client.ts`, `server.ts`, `types.ts`, `storage.ts`
- Database schema includes: categories, products, hub_profiles, customer_profiles, orders, order_items

**packages/ui/** - Shared React components
- `@repo/ui` package name
- Component exports from `src/*.tsx`
- Shared across all three apps

**packages/eslint-config/** & **packages/typescript-config/** - Shared tooling configs

### Database Schema

Core tables managed via Supabase:
- `categories` - Product categorization with slugs and sort ordering
- `products` - Product catalog with pricing, stock, images, SEO fields
- `hub_profiles` - Internal staff accounts with role-based permissions
- `customer_profiles` - Customer accounts linked to Supabase Auth
- `orders` & `order_items` - Order management and line items
- Storage bucket: `product-images` (public)

### Key Tech Stack

- **Next.js 16.x** (App Router) - All three apps use modern Next.js with breaking changes from older versions
- **React 19.x** - Latest React features
- **Supabase** - Database, authentication, storage, Edge Functions
- **TypeScript 5.x** - Full type safety across monorepo
- **Tailwind CSS 4.x** - Styling (with shadcn/ui components in hub)
- **Turbo** - Monorepo build system and dev orchestration
- **Zustand** - State management in hub app
- **React Query** - Data fetching in hub app
- **React Hook Form + Zod** - Form handling and validation

### Authentication Architecture

**Hub App**: Custom role-based auth with `hub_profiles` table
- Roles: `super_admin`, `manager`, `order_viewer`, `staff`
- Route protection via `(auth)` route groups

**MyAccount App**: Supabase Auth integration
- Customer profiles linked via `customer_profiles` table
- Route protection via `(account)` route groups

**Site App**: No authentication (public catalog)

### Important Notes

- **Environment Variables**: Single `.env.local` at root shared by all apps, or per-app `.env.local` files
- **Database Migrations**: Use `npx supabase db push` to apply schema changes
- **Edge Functions**: Located in `supabase/functions/` for user provisioning
- **Next.js Version**: Uses Next.js 16.x with breaking changes from previous versions - always check `node_modules/next/dist/docs/` for current API documentation
- **Package Dependencies**: Apps reference shared packages via workspace aliases (`@drinka-roo/supabase`, `@repo/ui`)

### Development Workflow

1. Install dependencies: `npm install` (from root)
2. Set up `.env.local` with Supabase credentials
3. Push database schema: `npx supabase db push`
4. Create admin user manually in Supabase dashboard + `hub_profiles` table
5. Start development: `npm run dev`
6. Deploy Edge Functions if needed: `npx supabase functions deploy <name>`