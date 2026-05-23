import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const envExample = `# =============================================================================
# PK-HELP Custom - environment variables
# Copy: cp .env.example .env   (Windows: copy .env.example .env)
# =============================================================================

# --- Database (required) ---
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public"

# --- Site URL (required in production) ---
NEXT_PUBLIC_SITE_URL="http://localhost:3000"

# --- Domains (production) ---
NEXT_PUBLIC_MAIN_DOMAIN="pk-help.pl"
NEXT_PUBLIC_POLISH_DOMAIN="pk-help-pl.pl"

# NEXT_PUBLIC_FORCE_LOCALE=pl

# --- Admin auth (required in production) ---
JWT_SECRET="change-me-min-32-random-characters-long"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="change-me-strong-password"

# --- Telegram (recommended) ---
TELEGRAM_BOT_TOKEN=""
TELEGRAM_CHAT_ID=""

# --- Public links (optional) ---
NEXT_PUBLIC_TELEGRAM_URL="https://t.me/your_channel"
NEXT_PUBLIC_INSTAGRAM_URL="https://instagram.com/your_profile"
NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL=""

# --- Vercel Blob (required for admin uploads in production) ---
# BLOB_READ_WRITE_TOKEN=""

# RATE_LIMIT_MAX=5
# RATE_LIMIT_WINDOW_MS=60000
`;

const readmeDeploy = `# Deploy PK-HELP Custom to Vercel

See checklist in repository docs. Full guide:

1. GitHub push (no .env, no public/uploads/* files)
2. Neon / Supabase / Vercel Postgres -> DATABASE_URL
3. npm run db:push && npm run seed:components (with prod DATABASE_URL)
4. Vercel import -> env from .env.example
5. Storage -> Blob -> Connect to project
6. Domains: pk-help.pl, pk-help-pl.pl
7. Deploy

## Required env

DATABASE_URL, NEXT_PUBLIC_SITE_URL, NEXT_PUBLIC_MAIN_DOMAIN,
NEXT_PUBLIC_POLISH_DOMAIN, JWT_SECRET, ADMIN_USERNAME, ADMIN_PASSWORD,
BLOB_READ_WRITE_TOKEN (for admin uploads)

## Post-deploy

- Homepage HTTPS
- /api/components
- Order form + Telegram
- /admin login
- Image upload in admin
- /robots.txt /sitemap.xml

## Local production test

npm run build && npm run start
`;

writeFileSync(join(root, ".env.example"), envExample, "utf8");
writeFileSync(join(root, "README_DEPLOY.md"), readmeDeploy, "utf8");
console.log("OK");