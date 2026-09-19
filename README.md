# REGEAR

A one-of-one secondhand marketplace built with Next.js, Supabase, Stripe, and Tailwind CSS.

## Local setup

1. Copy `.env.example` to `.env.local` and provide the Supabase publishable/secret keys plus Stripe test keys.
2. Apply `supabase/migrations/20260919000000_regear_initial_schema.sql` to project `xelhqjaplyjqpeanzmri`.
3. In Stripe, point a webhook at `/api/stripe/webhook` for `checkout.session.completed`.
4. Run `npm install`, then `npm run dev`.

Without environment variables, the storefront runs against curated demo inventory; authentication, uploads, and live payment remain disabled until their keys are configured.

To make the first seller an admin, update their row in `public.profiles` with `is_admin = true` from the Supabase SQL editor.
