# CRM integration (Kommo)

Orders from the site (`POST /api/orders`) are saved in PostgreSQL first. If CRM env vars are set, a lead is created in [Kommo](https://www.kommo.com/) (formerly amoCRM) asynchronously.

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `CRM_ACCESS_TOKEN` or `CRM_API_KEY` | **Yes** | Long-lived token (Secret key is **not** used) |
| `CRM_API_URL` or `CRM_SUBDOMAIN` | Recommended | `https://yourcompany.kommo.com` or `yourcompany` |
| `CRM_API_DOMAIN` | No | API host, default from token (`api-c.kommo.com`) |
| `CRM_PROVIDER` | No | Default `kommo` |
| `CRM_PIPELINE_ID` | No | Target pipeline ID for new leads |
| `CRM_RESPONSIBLE_USER_ID` | No | Kommo user ID for the responsible manager |

**Important:** for accounts like `lutcasperl`, API requests must go to `https://lutcasperl.kommo.com/api/v4`, not `api-c.kommo.com`. Always set `CRM_API_URL`.

Test connection (logged in as admin): `GET /api/admin/crm-test`

## Kommo setup

1. Kommo → **Settings** → **Integrations** → create a private integration.
2. Grant access to leads/contacts; copy the **long-lived token**.
3. Note your account URL (`https://….kommo.com`) → `CRM_API_URL`.
4. Optional: open a pipeline → copy **pipeline ID** from URL or API → `CRM_PIPELINE_ID`.
5. Optional: **Users** → copy user ID → `CRM_RESPONSIBLE_USER_ID`.

## Synced fields

- Lead title: client name + PC build hint
- Price: builder total (PLN)
- Contact: name, phone, email, messenger in note
- Note: services, components, comment, budget, status, admin link, source URL

## Admin

Dashboard → **Orders**: CRM status, link to lead, **Sync to CRM** for manual retry.

## Local test

```bash
# .env.local
CRM_API_URL=https://yourcompany.kommo.com
CRM_ACCESS_TOKEN=your_token
CRM_PIPELINE_ID=123456

npm run db:push
npm run dev
```

Submit the order form on the homepage, then check admin and Kommo leads.

## Vercel

Add the same variables under **Project → Settings → Environment Variables**, redeploy, run `prisma db push` (included in `vercel-build`).
