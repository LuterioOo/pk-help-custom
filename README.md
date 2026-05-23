# PK-HELP Custom

Premium custom PC build service (Next.js, Prisma, Neon, Telegram).

## Local setup

```bash
npm install
copy .env.example .env.local
# Fill DATABASE_URL (Neon pooled), JWT_SECRET, ADMIN_*, TELEGRAM_*

npm run db:setup
npm run dev
```

- Site: http://localhost:3000  
- Admin: http://localhost:3000/admin  

Polish-only locally: `NEXT_PUBLIC_FORCE_LOCALE=pl` in `.env.local`

## Deploy

**[README_DEPLOY.md](./README_DEPLOY.md)** — Vercel, env vars, domains, Neon.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Production server |
| `npm run db:setup` | `db:push` + seed (admin, reviews, components) |
| `npm run db:push` | Sync Prisma schema (uses `.env.local`) |
| `npm run db:reset` | Reset DB schema (destructive) |
| `npm run lint` | ESLint |

## Domains

- `pk-help.pl` — RU (default), `/uk`, `/en`
- `pk-help-pl.pl` — Polish only

## Stack

Next.js 15, TypeScript, Tailwind, next-intl, PostgreSQL (Neon), Prisma, Telegram, Vercel Blob (uploads).
