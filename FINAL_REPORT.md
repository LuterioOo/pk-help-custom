# Final handoff report — PK-HELP Custom

**Date:** 2026  
**Preview:** https://pkcustompredfinal.vercel.app  
**Status:** Production-ready for handoff (site, admin, orders, builder, DB on Neon)

---

## What was fixed / improved

### Documentation
- **README.md** — project overview, quick start, script reference  
- **README_DEPLOY.md** — Vercel, env, Blob, domains, troubleshooting  
- **README_ADMIN.md** — admin panel, pricing, images, CRUD  
- **README_DATABASE.md** — Prisma, Neon, seed, schema  
- **FINAL_REPORT.md** — this file  

### Environment & security
- `.env.example` — placeholders only, commented local vs prod  
- `.env.local.example` — minimal local template  
- `.env` / `.env.local` excluded from Git (never commit secrets)  
- `.gitignore` / `.vercelignore` — `node_modules`, `.next`, env files  

### Deploy automation
- `vercel-build`: generate → `db push` → seeds → `next build`  
- `vercel.json` → `buildCommand: npm run vercel-build`  
- Idempotent component seed (no duplicates on redeploy)  

### PC catalog
- `prisma/data/components-pl.json` — **65** popular parts (PLN)  
- Categories: CPU, GPU, RAM, MOTHERBOARD, PSU, CASE, SSD, HDD, COOLER, AIO, FANS  
- Markup **100 / 120 / 150 PLN** in `src/lib/pricing.ts`  

### Images / UI
- Category-based **fallback icons** in builder when no photo (`ComponentImage` + `category-icons.tsx`)  
- Admin list uses same fallbacks; category filter on component list  
- Auto markup button in admin form  

### Cleanup
- Removed unused `scripts/write-deploy-docs.mjs`  
- No debug `console.log` spam in `src/`  

---

## Required environment variables

| Variable | Local | Vercel |
|----------|-------|--------|
| `DATABASE_URL` | Neon pooled URL | Same (prod DB) |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | `https://pkcustompredfinal.vercel.app` |
| `JWT_SECRET` | 32+ chars | 32+ chars |
| `ADMIN_USERNAME` | e.g. `admin` | e.g. `admin` |
| `ADMIN_PASSWORD` | strong | strong |
| `NEXT_PUBLIC_MAIN_DOMAIN` | `pk-help.pl` | `pk-help.pl` |
| `NEXT_PUBLIC_POLISH_DOMAIN` | `pk-help-pl.pl` | `pk-help-pl.pl` |
| `TELEGRAM_BOT_TOKEN` | optional | recommended |
| `TELEGRAM_CHAT_ID` | optional | recommended |
| `BLOB_READ_WRITE_TOKEN` | optional locally | **required** for uploads |
| `NEXT_PUBLIC_TELEGRAM_URL` | optional | optional |
| `NEXT_PUBLIC_INSTAGRAM_URL` | optional | optional |
| `NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL` | optional | optional |

> Note: auth uses `ADMIN_USERNAME` / `ADMIN_PASSWORD` (not `ADMIN_LOGIN`).

---

## How to run locally

```bash
npm install
copy .env.example .env.local
# edit .env.local

npm run db:setup
npm run dev
```

Production test:

```bash
npm run build
npm run start
```

---

## How to deploy

1. Push to GitHub → Vercel auto-builds.  
2. Ensure all env vars are set in Vercel.  
3. Connect **Vercel Blob** for admin uploads.  
4. Verify checklist in [README_DEPLOY.md](./README_DEPLOY.md).  

---

## How to customize

### Text / translations
- `src/messages/locales/*.ts` — UI strings (ru, uk, en, pl)  

### Site content (DB)
- Admin → Reviews, Showcase  
- `SiteSettings` via seed or future admin settings tab  

### PC builder catalog
- **Admin UI** — add/edit components  
- **Bulk:** edit `prisma/data/components-pl.json` → `npm run seed:components`  

### Prices
- Per part: base + markup → final (admin or JSON seed)  
- Global markup rules: `src/lib/pricing.ts`  

### Add a new category
1. Add enum value in `prisma/schema.prisma` → `ComponentCategory`  
2. `npm run db:push`  
3. Add icon in `src/lib/category-icons.tsx`  
4. Add to `CATEGORIES` arrays in builder + admin  
5. Update seed JSON / admin entries  

### New domain
1. Vercel → Domains  
2. DNS records  
3. Update `NEXT_PUBLIC_SITE_URL`  
4. Configure `src/i18n/routing.ts` / `src/lib/site.ts` if locale rules change  

### Telegram orders
1. @BotFather → bot token  
2. Add bot to group → `getUpdates` for `chat_id`  
3. Set `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` on Vercel  

---

## How the builder works

1. Fetches active components per category: `GET /api/components?category=CPU`  
2. User selects parts → stored in React context + `localStorage`  
3. **Compatibility** checks: socket, RAM type, PSU wattage, GPU length, etc. (`src/lib/compatibility.ts`)  
4. **Total price** = sum of `price` fields  
5. Order form can attach build → `POST /api/orders` + optional Telegram  

---

## How Prisma fits in

- Runtime: `src/lib/prisma.ts` (singleton client)  
- API routes and server components query Postgres  
- Build/deploy: `db push` syncs schema; seeds populate catalog  

See [README_DATABASE.md](./README_DATABASE.md).

---

## Git hygiene checklist

- [x] `node_modules/` in `.gitignore`  
- [x] `.next/` in `.gitignore`  
- [x] `.env`, `.env.local` in `.gitignore`  
- [x] User uploads in `public/uploads/*` ignored except `.gitkeep` + committed showcase samples  
- [x] No secrets in `.env.example`  

---

## File map for new developer

| Path | Role |
|------|------|
| `src/app/[locale]/page.tsx` | Homepage sections |
| `src/components/builder/pc-builder.tsx` | Configurator UI |
| `src/app/api/orders/route.ts` | Order submission |
| `src/app/[locale]/admin/` | Admin pages |
| `prisma/schema.prisma` | DB schema |
| `prisma/data/components-pl.json` | Default catalog |
| `src/lib/pricing.ts` | Markup rules |
| `src/lib/telegram.ts` | Order notifications |

---

## Recommended next steps (optional)

- Rotate secrets if `.env` was ever committed to Git history  
- Set up Neon **staging** branch for Preview deployments  
- Add `prisma migrate` if multiple developers need migration history  
- Custom domain SSL on `pk-help.pl` / `pk-help-pl.pl`  
- Monitoring (Vercel Analytics, Sentry)  

---

**Contact for handoff:** hand this repository + Neon + Vercel project access + env var list (via secure channel, not Git).
