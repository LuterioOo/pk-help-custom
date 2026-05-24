# Admin panel guide

Manage orders, PC components, gallery photos, and reviews.

---

## Access

| Environment | URL |
|-------------|-----|
| Local | http://localhost:3000/admin |
| Preview | https://pkcustompredfinal.vercel.app/admin |

Locale prefix may appear (`/pl/admin` on Polish domain).

### Login credentials

Set in environment variables:

- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `JWT_SECRET` (required for session cookie, min 16 characters)

On first successful login, a user record is created in the `AdminUser` table (password hash).  
Env credentials still work if they match `ADMIN_USERNAME` / `ADMIN_PASSWORD`.

**Production:** always use strong passwords and a long `JWT_SECRET`.

---

## Dashboard tabs

### 1. Orders (Zgłoszenia)

- List of customer submissions from the order form  
- Filter by status: NOWE, W_TRAKCIE, WYCENIONE, ZAKONCZONE, ANULOWANE  
- View phone, email, messenger, services, comment  
- **PC build** — selected components and total price (if customer attached build)  
- Change status, delete order  

Orders are stored in PostgreSQL (`Order` table). Telegram notification is sent if `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` are set.

### 2. Components (Komponenty PC)

Full CRUD for the PC builder catalog.

#### Add / edit form

| Field | Meaning |
|-------|---------|
| Category | CPU, GPU, RAM, MOTHERBOARD, PSU, CASE, SSD, HDD, COOLER, AIO, FANS |
| Name | Display name |
| Brand / Model | Used for deduplication in seed |
| Base price (PLN) | Market / purchase price |
| Markup (PLN) | Service margin (auto **100–150 PLN** when base price changes) |
| Final price (PLN) | Shown in builder (= base + markup, or manual override) |
| Socket, RAM type, form factor | Compatibility hints |
| Popularity | Sorting weight |
| Source URL | Optional link (e.g. Ceneo) |
| Image | Upload or URL |
| Active | Hidden from builder when unchecked |

**Auto markup:** click *Auto narzut 100–150 PLN* to recalculate markup from base price using `src/lib/pricing.ts`.

#### List

- Filter by category  
- Toggle active / inactive  
- Edit, delete  

#### Images

- **Local dev:** saved to `public/uploads/components/{id}.jpg` (etc.)  
- **Vercel:** uploaded to Vercel Blob (`BLOB_READ_WRITE_TOKEN` required)  
- Without a custom image, the builder shows a **category icon** (CPU, GPU, …)  

Supported: JPG, PNG, WebP, GIF — max 5 MB.

### 3. Showcase (Galeria PC)

Photos for the homepage gallery (`#showcase`) and optional sale section (`#shop`).

- Upload image, optional title/caption  
- Sort order, visible/hidden  
- “For sale” + price → appears in **Builds for sale** section  

Storage: `public/uploads/showcase` locally, Vercel Blob in production.

### 4. Reviews (Opinie)

Simple testimonials on the homepage. Add name + text, delete.

---

## How pricing works

1. **Base price** — estimated Polish market price (PLN).  
2. **Markup** — default 100 / 120 / 150 PLN by price tier (`calculateMarkupPLN`).  
3. **Final price** — stored in DB, used by the builder total.

The builder sums **final prices** of selected parts.  
Compatibility warnings do not block submission.

To bulk-update catalog from file, see [README_DATABASE.md](./README_DATABASE.md) — `prisma/data/components-pl.json` + `npm run seed:components`.

---

## API routes (admin)

| Route | Methods |
|-------|---------|
| `/api/admin/login` | POST |
| `/api/admin/logout` | POST |
| `/api/admin/components` | GET, POST, PUT, PATCH, DELETE |
| `/api/admin/components/upload` | POST |
| `/api/admin/orders` | GET, PATCH, DELETE |
| `/api/admin/reviews` | GET, POST, DELETE |
| `/api/admin/showcase` | CRUD |
| `/api/admin/showcase/upload` | POST |

All admin routes require a valid `pk_admin_token` HTTP-only cookie (JWT).

---

## Common tasks

### Change admin password

1. Update `ADMIN_PASSWORD` on Vercel (and `.env.local`).  
2. Delete old row in `AdminUser` table **or** log in once to create a new hash (existing hash is not auto-updated on env change).  
3. Easiest: delete admin user in DB, redeploy/login to recreate.

### Add a new GPU

1. Components tab → fill form → category **GPU**  
2. Set base price → check auto markup → Save  
3. Optional: upload image  

### Hide a part without deleting

Toggle **Inactive** — it disappears from the builder but stays in DB.

### Fix broken image URL

Edit component → re-upload or clear image → save.

---

## Related docs

- [README_DEPLOY.md](./README_DEPLOY.md) — Blob, env vars  
- [README_DATABASE.md](./README_DATABASE.md) — seed, schema  
- [FINAL_REPORT.md](./FINAL_REPORT.md) — handoff summary
