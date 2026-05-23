# Deploy to Vercel

## 1. Repository

Push to GitHub. Do **not** commit `.env`, `.env.local`, or uploaded images in `public/uploads/`.

## 2. Neon (once)

1. Neon project → branch **production** → **Pooled** connection string.
2. Copy full URL with password → `?sslmode=require` if missing.
3. Locally:

```bash
copy .env.example .env.local
# paste DATABASE_URL into .env.local
# comment out DATABASE_URL in .env if it points to localhost

npm run db:setup
```

## 3. Import on Vercel

1. [vercel.com](https://vercel.com) → **Add New** → Import Git repo.
2. Framework: **Next.js** (auto-detected).
3. Settings (or use `vercel.json`):

| Setting | Value |
|---------|--------|
| Install Command | `npm install` |
| Build Command | `prisma generate && next build` |
| Output | Next.js default |
| Node.js | 20.x |

4. **Environment Variables** (Production + Preview):

| Variable | Required | Example |
|----------|----------|---------|
| `DATABASE_URL` | Yes | Neon pooled URL |
| `JWT_SECRET` | Yes | 32+ random chars |
| `ADMIN_USERNAME` | Yes | admin |
| `ADMIN_PASSWORD` | Yes | strong password |
| `NEXT_PUBLIC_SITE_URL` | Yes | `https://pk-help.pl` |
| `NEXT_PUBLIC_MAIN_DOMAIN` | Yes | `pk-help.pl` |
| `NEXT_PUBLIC_POLISH_DOMAIN` | Yes | `pk-help-pl.pl` |
| `TELEGRAM_BOT_TOKEN` | Recommended | from @BotFather |
| `TELEGRAM_CHAT_ID` | Recommended | chat id |
| `BLOB_READ_WRITE_TOKEN` | Yes (uploads) | from Vercel Blob store |
| `NEXT_PUBLIC_TELEGRAM_URL` | Optional | `https://t.me/...` |
| `NEXT_PUBLIC_INSTAGRAM_URL` | Optional | Instagram URL |
| `NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL` | Optional | Maps embed URL |

5. **Storage** → **Blob** → Create / Connect → `BLOB_READ_WRITE_TOKEN` is added automatically.

6. **Deploy**.

## 4. Domains

**Project → Settings → Domains:**

- `pk-help.pl` (+ `www` if needed)
- `pk-help-pl.pl` (+ `www` if needed)

Add DNS records at your registrar (Vercel shows exact values).

| Domain | Locales |
|--------|---------|
| pk-help.pl | ru, uk, en |
| pk-help-pl.pl | pl only |

## 5. Post-deploy checklist

- [ ] https://pk-help.pl loads
- [ ] https://pk-help-pl.pl — Polish only, no RU/UA/EN switcher
- [ ] PC builder loads components
- [ ] Order form → success → row in Neon `Order` table
- [ ] Telegram notification (if tokens set)
- [ ] `/admin` login works
- [ ] Admin image upload (Blob connected)
- [ ] `/robots.txt`, `/sitemap.xml`

## 6. Updates

```bash
git push
```

Vercel redeploys automatically.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `table Order does not exist` | Run `npm run db:setup` with production `DATABASE_URL` |
| Form: Database unavailable | Check `DATABASE_URL` on Vercel |
| Prisma used localhost | Use `npm run db:push` (loads `.env.local`); remove localhost from `.env` |
| Admin 401 | Set `JWT_SECRET`, `ADMIN_*`, use HTTPS |
| Upload fails | Connect Vercel Blob |
| Empty PC builder | Run `npm run db:setup` on production DB |
| Build EPERM (Windows) | Stop `npm run dev` before `prisma generate` |

## Region

`vercel.json` sets EU region `fra1` (Frankfurt).
