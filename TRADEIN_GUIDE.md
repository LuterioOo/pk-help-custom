# Trade-In guide

Trade-In lets customers submit old hardware (GPU, CPU, RAM, PSU) and receive a preliminary coupon toward a new PC build.

---

## Customer flow

1. Open **Trade-In** (`/trade-in` or hero CTA)
2. Enter name, phone, Telegram (messenger)
3. Select old hardware categories and models
4. Receive preliminary coupon amount (stored in `localStorage`)
5. Order is created in the database
6. Telegram notification sent (if configured)
7. Admin dashboard shows the order in realtime
8. Customer can build a PC with coupon applied in the configurator

**Regular builder** (without Trade-In) is always available when no coupon lock is active.

---

## Coupon storage

- Key: `pkhelp-trade-in` in `localStorage`
- Event: `pkhelp-trade-in-updated` refreshes builder store
- Builder reads coupon via `BuildProvider` / `loadTradeInCoupon()`

---

## Order data

Trade-In orders include:

- `services` containing trade-in marker
- `tradeInEstimate` JSON: hardware parts, `estimatedTotal`, `sourceType: "trade_in"`, `installmentsRequested`, `couponAppliedToBuild`
- `tradeInDiscountPLN` — discount applied to build total

---

## Admin tasks (auto-generated)

| Scenario | Tasks |
|----------|-------|
| Trade-In | Проверить старое железо и подтвердить купон; Ожидаем клиента в сервисе |
| + Installments | Отправить документы на рассрочку |
| Regular order | Связаться с клиентом; Уточнить сборку |

Workflow statuses: `new` → `estimated_waiting_service` → `in_service_check` → `final_price_confirmed` → `accepted` / `rejected` / `used_as_coupon`

---

## Pricing logic

- Preliminary coupon from `src/lib/trade-in.ts` (used component prices)
- Final amount confirmed after service diagnostics
- Coupon applies in builder: `totalAfterTradeIn = total - coupon` (when enabled)

---

## API

- `POST /api/orders` — creates order + triggers Telegram + CRM async
- Admin: `GET /api/admin/orders` with polling

---

## Env

| Variable | Purpose |
|----------|---------|
| `TELEGRAM_BOT_TOKEN` | Bot for new order alerts |
| `TELEGRAM_CHAT_ID` | Chat / channel ID |

See [ADMIN_GUIDE.md](./ADMIN_GUIDE.md) for admin UI details.
