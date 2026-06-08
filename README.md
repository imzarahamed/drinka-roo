# Drinka-Roo — Turborepo Monorepo

A wholesale platform built with Next.js, Supabase, and Turborepo. Includes three apps:

- **`hub`** — Internal admin dashboard for managing products, orders, customers, and staff
- **`myaccount`** — Customer-facing portal for viewing orders and account details
- **`site`** — Public-facing product catalog

---

## Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [npm](https://www.npmjs.com/) >= 10
- A [Supabase](https://supabase.com/) project (free tier works)

---

## Getting Started

### 1. Clone the repository

```sh
git clone <your-repo-url>
cd drinka-roo
```

### 2. Install dependencies

This installs all packages including `turbo`, which is required to run the monorepo.

```sh
npm install
```

> If you get an error like `'turbo' is not recognized`, it means dependencies haven't been installed yet. Running `npm install` from the project root will fix this. Alternatively, install Turbo globally: `npm install -g turbo`

### 3. Set up environment variables

Copy the example env file and fill in your Supabase credentials:

```sh
cp .env.local.example .env.local
```

Then open `.env.local` and add your values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Optional — for server-side/admin usage
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Used by the create-customer Edge Function to send email credentials
MYACCOUNT_URL=http://localhost:3001
RESEND_API_KEY=your-resend-api-key
```

You can find `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in your Supabase project under **Settings → API**.

> Each app (`hub`, `myaccount`, `site`) reads from the same `.env.local` at the root. You can also create per-app `.env.local` files inside each `apps/*` folder if you need different values.

### 4. Set up the database

#### a. Connect Supabase CLI to your project

Install the [Supabase CLI](https://supabase.com/docs/guides/cli) if you haven't already, then link your project:

```sh
npx supabase login
npx supabase link --project-ref your-project-ref
```

Your project ref is the subdomain in your Supabase URL (e.g. `xcwgsuluidkjlwmshkem`).

#### b. Run migrations

Push the database schema to your Supabase project:

```sh
npx supabase db push
```

This will create the following tables in your database:

| Table | Description |
|---|---|
| `categories` | Product categories with slug and sort order |
| `products` | Product catalog with pricing, stock, images, and SEO fields |
| `hub_profiles` | Internal staff accounts with role-based access (`super_admin`, `manager`, `order_viewer`, `staff`) |
| `customer_profiles` | Customer accounts linked to Supabase Auth |
| `orders` | Customer orders with status tracking |
| `order_items` | Line items within each order |

#### c. Set up Storage (for product images)

In your Supabase dashboard, go to **Storage** and create a public bucket named `product-images`.

#### d. Create your first admin user

In the Supabase dashboard, go to **Authentication → Users** and create a new user manually. Then in the **Table Editor**, open `hub_profiles` and insert a row with that user's `id` (UUID from Auth), a `full_name`, and `role` set to `super_admin`.

#### e. Deploy Edge Functions (optional)

The `create-customer` and `create-hub-user` Supabase Edge Functions handle provisioning new user accounts. To deploy them:

```sh
npx supabase functions deploy create-customer
npx supabase functions deploy create-hub-user
```

Set the required secrets in your Supabase project under **Settings → Edge Functions**:

```sh
npx supabase secrets set RESEND_API_KEY=your-resend-api-key
npx supabase secrets set MYACCOUNT_URL=https://your-myaccount-domain.com
```

### 5. Run the development server

```sh
npm run dev
```

This starts all three apps simultaneously using Turbo:

| App | Default URL |
|---|---|
| `hub` | http://localhost:3000 |
| `myaccount` | http://localhost:3001 |
| `site` | http://localhost:3002 |

To run a specific app only:

```sh
npx turbo dev --filter=hub
npx turbo dev --filter=myaccount
npx turbo dev --filter=site
```

---

## Project Structure

```
drinka-roo/
├── apps/
│   ├── hub/          # Admin dashboard (Next.js)
│   ├── myaccount/    # Customer portal (Next.js)
│   └── site/         # Public catalog (Next.js)
├── packages/
│   ├── supabase/     # Shared Supabase client and TypeScript types
│   ├── ui/           # Shared React component library
│   ├── eslint-config/
│   └── typescript-config/
├── supabase/
│   └── functions/    # Supabase Edge Functions
├── .env.local.example
└── turbo.json
```

---

## Available Scripts

Run from the project root:

| Command | Description |
|---|---|
| `npm run dev` | Start all apps in development mode |
| `npm run build` | Build all apps |
| `npm run lint` | Lint all packages |
| `npm run format` | Format all files with Prettier |
| `npm run check-types` | TypeScript type checking across all packages |

---

## Useful Links

- [Turborepo Docs](https://turborepo.dev/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Supabase CLI Reference](https://supabase.com/docs/guides/cli/getting-started)