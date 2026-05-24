# Database & Prisma guide

PostgreSQL via **Prisma ORM**. Production uses **Neon** (serverless Postgres). Data persists across Vercel deploys — not SQLite.

---

## Connection

### Environment variable

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/neondb?sslmode=require"
```

- Use Neon **pooled** connection string for serverless (Vercel).  
- Add `?sslmode=require` if missing.  
- Store in `.env.local` locally; in Vercel dashboard for production.  

### Loading env for CLI

Prisma commands use:

```bash
npm run db:push    # → node scripts/with-env.mjs npx prisma db push
```

`scripts/with-env.mjs` loads `.env` then `.env.local` (local wins).

---

## Schema overview

File: `prisma/schema.prisma`

| Model | Purpose |
|-------|---------|
| `Component` | PC parts for builder (category, prices, specs, image) |
| `Order` | Customer form submissions |
| `Review` | Homepage testimonials |
| `ShowcaseBuild` | Gallery / for-sale builds |
| `SiteSettings` | Contact info, hero text (id: `main`) |
| `AdminUser` | Admin login (bcrypt password hash) |

### Component categories (`ComponentCategory`)

`CPU`, `GPU`, `MOTHERBOARD`, `RAM`, `PSU`, `CASE`, `SSD`, `HDD`, `COOLER`, `AIO`, `FANS`

### Pricing fields on `Component`

| Field | Description |
|-------|-------------|
| `baseMarketPricePLN` | Market / purchase price |
| `markupPLN` | Service margin |
| `price` | Final customer price (builder uses this) |

Logic: `src/lib/pricing.ts` — markup typically **100–150 PLN**.

---

## Commands

| Command | When to use |
|---------|-------------|
| `npm run db:push` | After changing `schema.prisma` |
| `npm run db:seed` | Full seed: settings + admin + reviews + components |
| `npm run db:setup` | First-time local setup (`push` + `seed`) |
| `npm run seed:components` | Update catalog from JSON only |
| `npm run db:reset` | **Wipes data** — reset schema + seed |

### Vercel

`npm run vercel-build` runs `db push` + both seeds on every deploy.

---

## Seed system

### 1. `prisma/seed.ts` (core data)

- `SiteSettings` (upsert `main`)  
- `AdminUser` (upsert by username from `ADMIN_USERNAME` / `ADMIN_PASSWORD`)  
- `Review` (upsert by name — no mass delete)  

Does **not** wipe the component catalog.

### 2. `prisma/seed-components.ts` (PC catalog)

Reads `prisma/data/components-pl.json` (~65 popular parts, PL market prices).

**Idempotent upsert** via `prisma/seed-utils.ts`:

- Match key: `category` + `brand` + `name` + `model`  
- Existing row → **update** prices/specs  
- New row → **create**  
- No duplicate inserts on repeated runs  

### 3. `prisma/seed-utils.ts`

Shared helpers: `upsertSeedComponent`, `normalizeSeedRow`, uses `pricing.ts` for markup.

---

## Editing the catalog (JSON)

1. Open `prisma/data/components-pl.json`  
2. Add/edit objects:

```json
{
  "category": "GPU",
  "name": "NVIDIA GeForce RTX 4060",
  "brand": "NVIDIA",
  "model": "RTX 4060",
  "baseMarketPricePLN": 1299,
  "specs": { "tdp": 115, "length": 240, "pcie": "4.0" },
  "featured": true,
  "popularityScore": 95
}
```

3. Run:

```bash
npm run seed:components
```

Omit `markupPLN` / `price` to auto-calculate from base price.

---

## Changing database (Neon)

### New Neon project

1. Create project → copy pooled `DATABASE_URL`  
2. Update `.env.local` and Vercel env  
3. `npm run db:setup`  

### New branch (staging)

Use a separate `DATABASE_URL` for Preview env on Vercel.

### Schema changes

1. Edit `prisma/schema.prisma`  
2. `npm run db:push` (or deploy — Vercel runs push on build)  
3. Adjust seed/API if needed  

For destructive local reset only: `npm run db:reset`.

---

## Prisma Studio (optional GUI)

```bash
node scripts/with-env.mjs npx prisma studio
```

Browse/edit tables in the browser.

---

## Migrations note

This project uses `prisma db push` (schema sync) rather than migration files — suitable for a single deployed database. For team workflows with migration history, consider switching to `prisma migrate`.

---

## Component images in DB

`Component.imageUrl` may be:

- `/uploads/components/{id}.ext` — local public folder  
- `https://….blob.vercel-storage.com/...` — Vercel Blob  

Builder and admin use Next.js `Image` with remote patterns in `next.config.ts`.

---

## Related

- [README_ADMIN.md](./README_ADMIN.md) — CRUD in UI  
- [README_DEPLOY.md](./README_DEPLOY.md) — Neon + Vercel  
- [FINAL_REPORT.md](./FINAL_REPORT.md) — handoff checklist
