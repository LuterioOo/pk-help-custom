# PK-HELP Custom

Premium custom PC build service — marketing site, PC configurator, order form, admin panel.

**Live preview:** https://pkcustompredfinal.vercel.app  
**PC builder:** https://pkcustompredfinal.vercel.app/#builder

---

## Documentation map

| File | For whom | Contents |
|------|----------|----------|
| [README.md](./README.md) | Everyone | Overview, quick start |
| [README_DEPLOY.md](./README_DEPLOY.md) | DevOps / deploy | Vercel, env, domains, Blob |
| [README_ADMIN.md](./README_ADMIN.md) | Content / shop manager | Admin panel, prices, images |
| [README_DATABASE.md](./README_DATABASE.md) | Backend / DB | Prisma, Neon, seed, schema |
| [README_I18N.md](./README_I18N.md) | Content / i18n | Locales RU/UK/EN/PL, domains, SEO |
| [FINAL_REPORT.md](./FINAL_REPORT.md) | Handoff | What was done, checklist |

---

## Requirements

- **Node.js** 20+
- **PostgreSQL** (recommended: [Neon](https://neon.tech) serverless)
- **npm** (comes with Node)

---

## Quick start (local)

```bash
# 1. Install dependencies
npm install

# 2. Environment (never commit .env.local)
copy .env.example .env.local
# or: copy .env.local.example .env.local
# Edit .env.local — at minimum DATABASE_URL, JWT_SECRET, ADMIN_*

# 3. Database schema + seed data
npm run db:setup

# 4. Development server
npm run dev
```

Open:

- Site: http://localhost:3000  
- Admin: http://localhost:3000/admin  
- Builder: http://localhost:3000/#builder  

Polish-only on localhost (optional): add `NEXT_PUBLIC_FORCE_LOCALE=pl` to `.env.local`.

---

## Production build (local test)

```bash
npm run build
npm run start
```

Uses the same `.env.local` as development.

---

## npm scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Next.js dev server (Turbopack) |
| `npm run build` | `prisma generate` + production Next.js build |
| `npm run start` | Run production server (after `build`) |
| `npm run lint` | ESLint |
| `npm run db:push` | Apply `schema.prisma` to database |
| `npm run db:seed` | Seed settings, admin, reviews + PC catalog |
| `npm run db:setup` | `db:push` + `db:seed` |
| `npm run db:reset` | **Destructive** — reset schema + seed |
| `npm run seed:components` | Re-sync PC catalog from JSON only |
| `npm run vercel-build` | Used on Vercel: push + seed + build |

---

## Stack

- **Next.js 15** (App Router), TypeScript, Tailwind CSS 4  
- **next-intl** — RU / UK / EN / PL, domain-based routing  
- **Prisma** + **PostgreSQL** (Neon)  
- **Telegram** — order notifications  
- **Vercel Blob** — image uploads in production  

---

## Project structure (high level)

```
prisma/           Schema, migrations via db push, seed scripts, components JSON
src/app/          Pages, API routes, admin
src/components/   UI, builder, sections
src/lib/          Prisma, auth, pricing, compatibility, Telegram
public/uploads/   Local image storage (dev); production uses Blob
scripts/          with-env.mjs — loads .env.local for Prisma CLI
```

---

## Domains (production target)

| Domain | Locales |
|--------|---------|
| `pk-help.pl` | ru (default), uk, en |
| `pk-help-pl.pl` | pl only |

Preview on `*.vercel.app` exposes all locales — see [README_DEPLOY.md](./README_DEPLOY.md).

---

## Updating the live site

1. Change code locally and test (`npm run dev`).  
2. Commit and `git push` to the connected branch.  
3. Vercel rebuilds automatically (`vercel-build` runs migrations + seed + build).

Details: [README_DEPLOY.md](./README_DEPLOY.md).

---

## Support / handoff

Read [FINAL_REPORT.md](./FINAL_REPORT.md) for env list, customization, and troubleshooting.
