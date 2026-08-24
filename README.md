# Northstar Academy — School Management System

Premium modern school management dummy SaaS (Next.js 15 + Tailwind v4). Ready for **Cloudflare Pages** via Git.

## Connect GitHub → Cloudflare Pages

1. Open [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
2. Authorize GitHub and select this repo: `adnanfree131-bit/northstar-academy`
3. Build settings:
   - **Framework preset:** Next.js (Static HTML Export) or None
   - **Build command:** `npm run build`
   - **Build output directory:** `out`
   - **Root directory:** `/` (leave empty)
4. Deploy. Every push to `main` will auto-rebuild.

## Local

```bash
npm install
npm run build
npx wrangler pages dev out
```

## Modules

- Dashboard
- Students (list + full profile tabs)
- Fees & Payments
- Attendance (daily / period-wise / bulk)
- Exams & Results
- Timetable (substitutions + conflicts)
- Staff

D1 / R2 bindings are stubbed in `wrangler.toml` for later (real databases + file storage).
