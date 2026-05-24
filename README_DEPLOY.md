# Deployment guide (Vercel)

**Preview URL:** https://pkcustompredfinal.vercel.app  
**Builder:** https://pkcustompredfinal.vercel.app/#builder

---

## 1. Prerequisites

- Git repository connected to Vercel  
- [Neon](https://neon.tech) PostgreSQL project (or any Postgres with SSL)  
- Optional: Telegram bot for order alerts  
- **Vercel Blob** for admin image uploads on Vercel  

---

## 2. Automatic deploy flow

Each push to the linked branch triggers:

```
npm install
npm run vercel-build
```

`vercel-build` runs in order:

1. `prisma generate`
2. `prisma db push` — sync schema to `DATABASE_URL`
3. `tsx prisma/seed.ts` — site settings, admin user, reviews
4. `tsx prisma/seed-components.ts` — PC catalog (idempotent upsert)
5. `next build`

Configured in `package.json` and `vercel.json` (`buildCommand: npm run vercel-build`).

> Local `npm run build` does **not** run migrations/seed — use `npm run db:setup` locally.

---

## 3. Vercel project setup

### Import

1. [vercel.com](https://vercel.com) → **Add New** → Import Git repository  
2. Framework: **Next.js** (auto-detected)  
3. Root directory: repository root  
4. Node.js: **20.x** (see `engines` in `package.json`)  

### Environment variables

Set for **Production** and **Preview** (same keys; URLs may differ):

| Variable | Required | Example (preview) |
|----------|----------|-------------------|
| `DATABASE_URL` | Yes | Neon **pooled** URL + `?sslmode=require` |
| `JWT_SECRET` | Yes | 32+ random characters |
| `ADMIN_USERNAME` | Yes | `admin` |
| `ADMIN_PASSWORD` | Yes | strong password |
| `NEXT_PUBLIC_SITE_URL` | Yes | `https://pkcustompredfinal.vercel.app` |
| `NEXT_PUBLIC_MAIN_DOMAIN` | Yes | `pk-help.pl` |
| `NEXT_PUBLIC_POLISH_DOMAIN` | Yes | `pk-help-pl.pl` |
| `TELEGRAM_BOT_TOKEN` | Recommended | from @BotFather |
| `TELEGRAM_CHAT_ID` | Recommended | group/channel id |
| `BLOB_READ_WRITE_TOKEN` | Yes on Vercel | auto when Blob connected |
| `NEXT_PUBLIC_TELEGRAM_URL` | Optional | public link |
| `NEXT_PUBLIC_INSTAGRAM_URL` | Optional | |
| `NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL` | Optional | Maps iframe URL |

Copy templates from `.env.example` — **never commit real values**.

### Vercel Blob (image uploads)

1. Project → **Storage** → **Blob** → Create / Connect  
2. `BLOB_READ_WRITE_TOKEN` is injected automatically  
3. Without Blob, component/showcase uploads fail in production (API returns an error)

Local dev stores files under `public/uploads/components` and `public/uploads/showcase`.

---

## 4. Local vs production environment

| | Local | Vercel |
|---|--------|--------|
| File | `.env.local` (gitignored) | Dashboard → Environment Variables |
| Site URL | `http://localhost:3000` | `https://pkcustompredfinal.vercel.app` |
| DB | Neon (same or separate branch) | Neon production branch |
| Images | `public/uploads/*` | Vercel Blob URLs |
| Prisma CLI | `npm run db:*` via `scripts/with-env.mjs` | Runs during `vercel-build` |

Next.js loads `.env.local` over `.env`. Prisma scripts also prefer `.env.local` via `with-env.mjs`.

---

## 5. Custom domains

1. Vercel → **Settings** → **Domains** → add `pk-help.pl`, `pk-help-pl.pl`  
2. Configure DNS at registrar (Vercel shows records)  
3. Update `NEXT_PUBLIC_SITE_URL` to the canonical HTTPS URL  
4. Locale routing is in `src/i18n/routing.ts` + `src/lib/site.ts`  

| Domain | Default locale | Available |
|--------|----------------|-----------|
| pk-help.pl | ru | ru, uk, en |
| pk-help-pl.pl | pl | pl only |

---

## 6. Post-deploy checklist

- [ ] Homepage loads  
- [ ] `#builder` — categories populated, prices in PLN  
- [ ] `#order` — test submission → row in Neon `Order`  
- [ ] Telegram message (if configured)  
- [ ] `/admin` — login with `ADMIN_*`  
- [ ] Admin — upload component image (Blob)  
- [ ] `/robots.txt`, `/sitemap.xml`  

---

## 7. Updating production

```bash
git add .
git commit -m "Describe change"
git push
```

Vercel redeploys. Schema + catalog seed run on every build (idempotent — no duplicate components).

To change only catalog data without code changes: run locally:

```bash
npm run seed:components
```

(with production `DATABASE_URL` in `.env.local` — be careful).

---

## 8. Troubleshooting

| Problem | Solution |
|---------|----------|
| Empty PC builder | Check `DATABASE_URL`; inspect build logs for seed errors |
| `Database schema missing` | `db push` failed — verify connection string |
| Admin 401 | Set `JWT_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD` |
| Upload error in admin | Connect Vercel Blob |
| Wrong locale on preview | Normal on `*.vercel.app`; domains control production locales |
| Prisma connects to wrong DB | Remove stale `DATABASE_URL` from `.env`; use `.env.local` only |

Region: `fra1` (Frankfurt) in `vercel.json`.

---

## 9. Files reference

- `vercel.json` — build command, region  
- `package.json` — scripts, `vercel-build`  
- `.vercelignore` — excludes `.env`, `node_modules`, `.next` from upload  
- `.gitignore` — same for Git  

See also: [README_DATABASE.md](./README_DATABASE.md), [README_ADMIN.md](./README_ADMIN.md).
