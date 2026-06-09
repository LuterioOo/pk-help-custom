# Support Chat Guide

## Overview

The site includes a floating **Support** chat widget (desktop panel / mobile bottom sheet). Messages are stored in PostgreSQL (`SupportMessage` table) and visible in **Admin → Support**.

Optional Telegram notifications use the same env vars as orders.

## User flow

1. Visitor opens chat via floating button or hero **Support** CTA.
2. Quick questions get scripted FAQ answers (no OpenAI).
3. **Leave a request** form: topic, message, optional name/phone/Telegram.
4. Toast confirms delivery; record appears in admin.

## Admin

- Tab: **Support** in `/admin/dashboard`
- Fields: name, phone, telegram, message, topic, locale, currentPage, createdAt
- Status: `NEW` → `IN_PROGRESS` → `ANSWERED` → `CLOSED`

## Environment (optional Telegram)

```env
TELEGRAM_BOT_TOKEN=""
TELEGRAM_CHAT_ID=""
```

If either is missing, support messages are **still saved**; Telegram is skipped (build does not fail).

## API

| Route | Auth | Purpose |
|-------|------|---------|
| `POST /api/support` | Public (rate limited) | Create support message |
| `GET /api/admin/support` | Admin | List messages |
| `PATCH /api/admin/support` | Admin | Update status |
| `DELETE /api/admin/support` | Admin | Delete message |

## Database

After schema changes:

```bash
npm run db:push
```

## Open chat programmatically

```js
window.dispatchEvent(new Event("pkhelp-open-support"));
```
