# REGEAR — Build Prompt

Use this as a spec/prompt for an AI coding assistant (e.g. Claude Code) or as your own working spec.

---

## Project Overview

Build **REGEAR**, a secondhand/thrift e-commerce web application where each item is a **unique, one-of-a-kind product** (quantity is always 1 — once sold, it's gone). The site should feel modern, fast, and trustworthy, similar in spirit to Depop or Grailed but simpler in scope.

**Tech stack:**
- Frontend: Next.js (App Router, TypeScript)
- Styling: Tailwind CSS
- Backend/DB/Auth/Storage: Supabase (Postgres, Supabase Auth, Supabase Storage, Row Level Security)
- Payments: Stripe Checkout (or PayMongo if targeting Philippines market)
- Hosting: Vercel

---

## Core User Roles
1. **Guest/Buyer** — browses catalog, views item details, adds to cart, checks out
2. **Registered Buyer** — same as above + order history, saved/favorited items
3. **Admin (seller)** — uploads new items, edits/removes listings, views orders, marks items as sold/reserved

---

## Data Models (Supabase/Postgres)

**`items`**
- id (uuid, pk)
- title (text)
- description (text)
- category (text) — e.g. "Jackets", "Shirts", "Accessories"
- price (numeric)
- condition (text) — e.g. "Like New", "Good", "Fair"
- size (text, nullable)
- images (text[]) — array of Supabase Storage URLs
- status (enum: `available`, `reserved`, `sold`)
- reserved_until (timestamptz, nullable) — for cart-hold logic
- created_at (timestamptz, default now())

**`orders`**
- id (uuid, pk)
- user_id (uuid, fk → auth.users, nullable for guest checkout)
- item_id (uuid, fk → items)
- buyer_email (text)
- buyer_name (text)
- shipping_address (jsonb)
- total_price (numeric)
- payment_status (enum: `pending`, `paid`, `failed`)
- stripe_session_id (text, nullable)
- created_at (timestamptz, default now())

**`favorites`** (optional, for registered users)
- id (uuid, pk)
- user_id (uuid, fk → auth.users)
- item_id (uuid, fk → items)
- created_at (timestamptz)

---

## Key Features to Build

### 1. Public Catalog
- Grid view of all `available` items with image, title, price, condition
- Filter by category, size, price range, condition
- Sort by newest, price low-high, price high-low
- Search bar (title/description match)

### 2. Item Detail Page
- Image gallery/carousel
- Full description, condition, size, price
- "Add to Cart" button — disabled/hidden if status is `sold`
- If `reserved`, show "Someone's checking out this item" with live status

### 3. Cart & Reservation Logic
- Since items are one-of-a-kind: when added to cart, set `status = reserved` and `reserved_until = now() + 15 minutes`
- A scheduled Supabase Edge Function (or cron) reverts expired reservations back to `available`
- Cart persists via session/local storage for guests, or DB-linked for logged-in users

### 4. Checkout
- Collect shipping info + email
- Stripe Checkout session created via a Next.js API route (`/api/checkout`)
- On successful payment (Stripe webhook), create an `orders` row and set item `status = sold`
- Order confirmation page + email receipt (Supabase Edge Function or Resend/SendGrid integration)

### 5. Auth (Supabase Auth)
- Email/password + optional Google OAuth
- Registered users can view order history and favorites
- Row Level Security: users can only read their own orders/favorites; admin role can read/write all items

### 6. Admin Dashboard (protected route, admin role only)
- Upload new item (multi-image upload to Supabase Storage, form for title/price/condition/etc.)
- Edit/delete existing items
- View all orders with status
- Manually mark item as sold/available (for in-person sales)

### 7. Performance & Polish
- Next.js Image component for all item photos (responsive, lazy-loaded)
- SEO metadata per item page (title, description, OG image) for shareability
- Empty states (no items in category, empty cart, no search results)
- Loading and error states throughout
- Mobile-first responsive design

---

## Suggested Build Order
1. Supabase project setup: tables, RLS policies, storage bucket for item images
2. Next.js project scaffold + Tailwind + Supabase client setup
3. Public catalog page (static fetch from Supabase)
4. Item detail page
5. Auth (sign up/login/logout)
6. Admin upload form + admin-only route protection
7. Cart + reservation logic
8. Stripe Checkout integration + webhook handling
9. Order confirmation + order history page
10. Polish: search/filter, favorites, SEO, responsive QA

---

## Notes / Constraints
- Treat every item as qty = 1 — no quantity selectors anywhere in the UI
- Prioritize RLS policies in Supabase over trusting client-side checks for anything involving `status` changes or order creation
- Keep the design simple, clean, and photo-forward — the item photos are the main visual element
