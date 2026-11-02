# eknumber.in

India's sponsored leaderboard. Brands buy sponsored listings ranked by total ad spend; every listing carries an exclusive deal for visitors.

**Stack:** Next.js 15 (App Router) · Supabase (Postgres) · Razorpay (UPI checkout + webhooks) · deploy on Vercel.

## How it works

1. Visitor fills the claim form → `POST /api/orders` validates it, creates a Razorpay order and stores the listing draft in `payments`.
2. Razorpay Checkout opens with UPI first (GPay, PhonePe, Paytm, any UPI ID or QR).
3. On success the browser calls `POST /api/verify` (checks the signature) and Razorpay also calls `POST /api/webhooks/razorpay`. Both run `apply_payment()`, which applies each payment **exactly once** with a row lock — safe against double-counting and simultaneous payments.
4. A new domain becomes a listing; an existing domain gets the amount added (top-up). Top-ups keep the original name and tagline, so nobody can rename someone else's listing.
5. Outbound clicks go through `/go/<id>`, which counts the click and adds `utm_source=eknumber`.

## Setup (about 30 minutes)

### 1. Supabase
1. Create a project at supabase.com (choose the Mumbai region).
2. SQL Editor → run `supabase/schema.sql`, then `supabase/migrations/002_deals_invoices.sql`. (Already done for the live Supabase project.) Then run `supabase/migrations/003_rename_eknumber.sql`.
3. Project Settings → API: copy the **Project URL** and the **service_role** key.

### 2. Razorpay
1. Sign up at razorpay.com and finish KYC (PAN, bank account; GSTIN if you have one).
2. Settings → API Keys → generate **Test** keys first.
3. Settings → Webhooks → Add: URL `https://<your-domain>/api/webhooks/razorpay`, events `payment.captured`, `order.paid`, `payment.failed`, and a secret of your choice.
4. Razorpay will review your website before enabling live payments. Keep the Rules, Terms, Privacy, Refund and Contact information visible on the site — they check for these.

### 3. Run locally
```bash
cp .env.example .env.local   # fill in the values
npm install
npm run dev                  # http://localhost:3000
```
Test with Razorpay's test UPI ID `success@razorpay` (and `failure@razorpay` to test a failed payment). Webhooks need a public URL, so test them after deploying, or with a tunnel such as ngrok.

### 4. Deploy
1. Push this folder to a GitHub repo.
2. Import it on vercel.com → add the same environment variables → Deploy.
3. Point eknumber.in at Vercel (Domains → add → follow the DNS instructions at your registrar).
4. Update the Razorpay webhook URL to the live domain, then switch to **Live** keys.

## Before applying to Razorpay

1. Business details live in **`lib/business.ts`** (all filled in). Any value containing "TODO" is highlighted in yellow on the site.
2. Deploy, then check these pages load: `/about`, `/contact`, `/pricing`, `/terms`, `/privacy`, `/refunds`.
3. Open `/invoice/sample` → Print → Save as PDF. Upload that as the sample invoice.
4. Business category: advertising / marketing services. Describe it as: "Sponsored listings (internet advertising space) on eknumber.in, ranked by each brand's total ad spend."
5. Confirm with your CA that SAC 998365 is on your GST registration (add it as a non-core amendment if not).

## Running it

- **Remove a listing:** in Supabase → Table editor → `listings` → set `hidden = true`. Refund from the Razorpay dashboard if the rules say so.
- **Blocked words** for new listings live in `app/api/orders/route.ts` (`BLOCKED`).
- **Change minimum spend or categories:** `lib/config.ts`.
- **Ad-fund counter on the home page:** update `site_stats` → `ad_fund_spent_paise` (in paise) when you spend on promotion.
- **Invoices:** every paid payment gets a sequential number (`EN/2627/000001`) and a page at `/invoice/<payment id>`, linked after payment.
- **See revenue:** Razorpay dashboard, or `select sum(amount_paise)/100 from payments where status='paid';`

## Before going live — compliance checklist

- GST: prices are GST-inclusive (18%); the app issues tax invoices with CGST+SGST for Uttar Pradesh buyers and IGST for everyone else. File GSTR-1/3B for these sales.
- Keep the wording as advertising ("ad spend", "sponsored listing"). Razorpay prohibits bidding/auction businesses, so avoid auction language anywhere on the site or in marketing.
- Keep the `rel="sponsored"` on outbound links (it's already set) — these are paid links.

## Ideas for v2
- Email a brand when another brand moves above it (Resend + a trigger on `apply_payment`).
- Weekly reset board ("Is hafte ka king").
- City boards (`/city/pune`) — local businesses compete with local rivals.
- Hindi toggle.
- OG image per listing for sharing (`app/opengraph-image.tsx`).
