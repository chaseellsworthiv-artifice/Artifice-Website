# Artifice Site v2

Immersive Artifice site built with Next.js.

## Local Development

```bash
npm install
npm run dev
```

## Deploy on Vercel

- Framework preset: `Next.js`
- Root directory: this folder

## Inquiry Flow

Phase 1 inquiry capture is implemented through `app/api/invitation/route.js`.

Supported modes:

- `INQUIRY_STORE_MODE=auto`
  - uses Supabase when configured
  - otherwise falls back to local file storage outside production
- `INQUIRY_STORE_MODE=file`
  - stores inquiries in `data/inquiries.json`
- `INQUIRY_STORE_MODE=supabase`
  - requires hosted Supabase configuration

Environment variables are documented in `.env.example`.

### Supabase setup

1. Create the `inquiries` table using [supabase/inquiries.sql](/Users/Artifice/Desktop/Artifice%20Site%20v2/supabase/inquiries.sql)
2. Create the `bookings` table using [supabase/bookings.sql](/Users/Artifice/Desktop/Artifice%20Site%20v2/supabase/bookings.sql)
3. Internal review routes:
   - `/studio/inquiries`
   - `/studio/availability`
   - `/studio/bookings`
4. Set:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - optional `INQUIRY_TABLE_NAME`
   - optional `BOOKING_TABLE_NAME`
5. Optional: set `BOOKING_WEBHOOK_URL` to forward inquiries and booking records
6. Optional: set:
   - `RESEND_API_KEY`
   - `BOOKING_TO_EMAIL`
   - `BOOKING_FROM_EMAIL`
   to deliver inquiry and booking notifications by email
7. Optional: set Google Calendar env vars from [.env.example](/Users/Artifice/Desktop/Artifice%20Site%20v2/.env.example) to activate hosted availability review

## Notes

- This repo now includes server routes and is no longer the old static-only setup.
- Public experience detail pages now hand off to custom inquiry; Stripe checkout/deposit code has been removed from the app.
- Local QA inquiry and booking data are ignored via `.gitignore`.
