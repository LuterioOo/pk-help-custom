# Deploy PK-HELP Custom (Vercel + Neon)

Temporary preview: [https://pkcustompredfinal.vercel.app](https://pkcustompredfinal.vercel.app)  
PC builder: [https://pkcustompredfinal.vercel.app/#builder](https://pkcustompredfinal.vercel.app/#builder)

Do **not** commit `.env`, `.env.local`, `node_modules`, or `.next`.

---

## Local development

```bash
copy .env.example .env.local
# Edit .env.local: DATABASE_URL (Neon pooled), JWT_SECRET, ADMIN_*, optional Telegram

npm install
npm run db:setup
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (set `NEXT_PUBLIC_SITE_URL=http://localhost:3000` in `.env.local`).

Production-like build locally:

```bash
npm run build
npm run start
```

| Script | What it does |
|--------|----------------|
| `npm run db:push` | Apply Prisma schema to Postgres |
| `npm run db:seed` | Seed settings, admin, reviews + PC components (idempotent) |
| `npm run db:setup` | `db:push` + `db:seed` |
| `npm run vercel-build` | Same as Vercel: generate → push → seed → `next build` |

---

## Vercel setup

1. Import the GitHub repo on [vercel.com](https://vercel.com).
2. Framework: **Next.js** (auto). `vercel.json` sets `buildCommand` to `npm run vercel-build`.
3. **Storage → Blob** (for admin component/showcase uploads) — connects `BLOB_READ_WRITE_TOKEN`.
4. **Environment variables** (Production + Preview):

| Variable | Required | Value (preview) |
|----------|----------|-----------------|
| `DATABASE_URL` | Yes | Neon **pooled** URL with `?sslmode=require` |
| `JWT_SECRET` | Yes | 32+ random characters |
| `ADMIN_USERNAME` | Yes | e.g. `admin` |
| `ADMIN_PASSWORD` | Yes | strong password |
| `NEXT_PUBLIC_SITE_URL` | Yes | `https://pkcustompredfinal.vercel.app` |
| `NEXT_PUBLIC_MAIN_DOMAIN` | Yes | `pk-help.pl` |
| `NEXT_PUBLIC_POLISH_DOMAIN` | Yes | `pk-help-pl.pl` |
| `TELEGRAM_BOT_TOKEN` | Recommended | from @BotFather |
| `TELEGRAM_CHAT_ID` | Recommended | group/channel id |
| `BLOB_READ_WRITE_TOKEN` | Yes on Vercel | auto if Blob connected |
| `NEXT_PUBLIC_TELEGRAM_URL` | Optional | public Telegram link |
| `NEXT_PUBLIC_INSTAGRAM_URL` | Optional | Instagram link |
| `NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL` | Optional | Maps embed URL |

5. Deploy. Each build runs `prisma db push` + idempotent seed so the PC builder has components.

### Admin

- URL: `/admin` (locale prefix may apply, e.g. `/pl/admin` on Polish domain).
- Login uses `ADMIN_USERNAME` / `ADMIN_PASSWORD` from env (and DB user created on first seed).
- `JWT_SECRET` must be set on Vercel (min 16 chars).

### Orders / Telegram

- Form posts to `POST /api/orders` → saved in Neon `Order` table.
- If `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID` are set, a Telegram message is sent (order is still saved if Telegram fails).

### Database

- **Postgres (Neon)** — not SQLite. Data persists across deploys.
- Catalog: `prisma/data/components-pl.json` (50 PL-market parts, markup in `src/lib/pricing.ts`).

---

## Custom domains (later)

| Domain | Locales |
|--------|---------|
| `pk-help.pl` | ru, uk, en |
| `pk-help-pl.pl` | pl only |

Set `NEXT_PUBLIC_SITE_URL` to the canonical HTTPS URL when switching domains.

---

## Post-deploy checklist

- [ ] Home, `#builder`, `#advantages`, `#order` anchors work
- [ ] PC builder loads all categories (CPU, GPU, RAM, …)
- [ ] Order form → success toast → row in Neon `Order`
- [ ] Telegram notification (if configured)
- [ ] `/admin` login and component CRUD
- [ ] Image upload in admin (Blob token present)
- [ ] `/robots.txt`, `/sitemap.xml`

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Empty PC builder | Check `DATABASE_URL` on Vercel; redeploy (seed runs on build) |
| `Database schema missing` | `DATABASE_URL` wrong or `db push` failed — check build logs |
| Admin 401 | Set `JWT_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD` on Vercel |
| Upload fails in admin | Connect Vercel Blob; set `BLOB_READ_WRITE_TOKEN` |
| Prisma uses localhost | Use `.env.local` for Neon; remove localhost `DATABASE_URL` from `.env` |
| Build EPERM (Windows) | Stop `npm run dev` before `prisma generate` / `npm run build` |

Region: `fra1` (Frankfurt) in `vercel.json`.
