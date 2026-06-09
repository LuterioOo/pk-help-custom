# Admin panel guide

Manage orders, PC components, gallery, master builds, and reviews.

**URLs:** `/admin` or `/pl/admin` (locale prefix depends on domain)

---

## Login

| Variable | Purpose |
|----------|---------|
| `ADMIN_USERNAME` | Login name |
| `ADMIN_PASSWORD` | Password |
| `JWT_SECRET` | Session cookie signing (min 16 chars) |

First successful login creates an `AdminUser` row in the database.

---

## Dashboard tabs

### Orders

- Live polling every 5s (no F5 needed)
- Filter by status; Trade-In only filter
- **Sound bell** for new orders — toggle in UI, stored in `localStorage` (`pkhelp-admin-sound`)
- CRM sync status, manual resync, Trade-In workflow buttons
- Admin tasks auto-generated (Trade-In hardware check, installment docs)

### Components

- Full CRUD for PC builder catalog
- **Price priority:** `manualPriceOverride` → `externalPrice` → local `price`
- External store link: Media Expert, RTV Euro AGD, x-kom, Morele — manual price update only (no scraping)
- Image upload via file or URL (`/api/admin/components/upload`)

### Showcase (gallery / ready PCs)

- Upload photo (drag & drop or file picker)
- Optional manual URL (`/uploads/showcase/…` or Blob HTTPS)
- **For sale** mode: price, installment, Trade-In label, builder preset JSON

### Masters

- **Master avatar:** file upload, drag & drop, preview, replace, remove
- **Master builds:** file upload for build photo (primary); optional manual URL
- Local: `public/uploads/masters`, `public/uploads/master-builds`
- Vercel: Vercel Blob (`masters/`, `master-builds/`)

### Reviews

- Add/edit/delete customer reviews

---

## Image storage

| Type | Local path | Blob prefix | Max size |
|------|------------|-------------|----------|
| Component | `public/uploads/components` | `components/` | 5 MB |
| Showcase | `public/uploads/showcase` | `showcase/` | 8 MB |
| Master avatar | `public/uploads/masters` | `masters/` | 4 MB |
| Master build | `public/uploads/master-builds` | `master-builds/` | 8 MB |

**Production on Vercel:** connect **Vercel Blob** → `BLOB_READ_WRITE_TOKEN` is injected automatically.  
Without Blob, upload APIs return `503 BLOB_REQUIRED`.

Check storage status: `GET /api/admin/storage` (used in showcase tab).

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Admin looks dimmed / not clickable | Hard refresh; ensure you are on `/admin` (no site preloader overlay). Decorative layers use `pointer-events-none`. |
| Upload fails on Vercel | Connect Vercel Blob; redeploy |
| `P1000` Neon auth | Check `DATABASE_URL`, IP allowlist, password rotation |
| Missing translations | Add keys to all four locales: `ru`, `uk`, `en`, `pl` |
| Node engines warning | Use Node 20+ (`package.json` engines) |

---

## Related docs

- [README_DEPLOY.md](./README_DEPLOY.md) — Vercel, env, build
- [TRADEIN_GUIDE.md](./TRADEIN_GUIDE.md) — Trade-In flow
- [CRM_GUIDE.md](./CRM_GUIDE.md) — Kommo sync
- [README_DATABASE.md](./README_DATABASE.md) — Prisma, Neon
