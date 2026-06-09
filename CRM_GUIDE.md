# CRM guide (Kommo)

Orders are saved to PostgreSQL first. If CRM env vars are set, Kommo lead creation runs asynchronously.

---

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `CRM_ACCESS_TOKEN` or `CRM_API_KEY` | Yes | Long-lived Kommo token |
| `CRM_API_URL` or `CRM_SUBDOMAIN` | Recommended | `https://yourcompany.kommo.com` |
| `CRM_API_DOMAIN` | No | API host override |
| `CRM_PROVIDER` | No | Default `kommo` |
| `CRM_PIPELINE_ID` | No | Target pipeline |
| `CRM_RESPONSIBLE_USER_ID` | No | Responsible user ID |

**Important:** use your account URL (`https://lutcasperl.kommo.com/api/v4`), not generic `api-c.kommo.com` when required.

---

## Synced data

- Lead title: client name + build hint
- Price: builder total (PLN)
- Contact: phone, email, messenger
- Note: services, components, Trade-In parts, installments, comment, admin link

Trade-In and installment flags are included in the formatted note (`src/lib/crm/format-order.ts`).

---

## Admin UI

Dashboard → **Orders**:

- CRM status: PENDING / SYNCED / FAILED / SKIPPED
- Open deal link when available
- **Sync to CRM** — manual retry (`POST /api/admin/orders/crm-sync`)
- Test connection: `GET /api/admin/crm-test` (admin session required)

---

## Tasks integration

Admin task list is derived from order metadata (not synced to Kommo automatically):

- Trade-In: verify old hardware, confirm coupon
- Installments: send financing documents

---

## Local test

```bash
# .env.local
CRM_API_URL=https://yourcompany.kommo.com
CRM_ACCESS_TOKEN=your_token
CRM_PIPELINE_ID=123456

npm run db:push
npm run dev
```

Submit an order on the site → check admin Orders tab and Kommo leads.

---

## Vercel

Add the same variables in **Project → Settings → Environment Variables**, redeploy.

`vercel-build` runs `prisma db push` automatically.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| CRM status FAILED | Check token, `CRM_API_URL`, pipeline ID |
| Duplicate leads | Avoid double-submit; check idempotency in order handler |
| SKIPPED | CRM not configured or unsupported provider |

See also [README_CRM.md](./README_CRM.md) for Kommo setup steps.
