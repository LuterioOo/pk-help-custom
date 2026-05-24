# Internationalization (i18n)

The site uses **next-intl** with four locales and domain-based routing in production.

---

## Locales

| Code | Language | Domain (production) |
|------|----------|---------------------|
| `ru` | Russian (default) | `pk-help.pl` |
| `uk` | Ukrainian | `pk-help.pl` |
| `en` | English | `pk-help.pl` |
| `pl` | Polish | `pk-help-pl.pl` |

Polish (`pl`) is a **full** translation in `src/messages/locales/pl.ts` (257+ keys).

Ukrainian (`uk`) extends Russian with overrides in `src/messages/locales/uk.ts` (nav, hero, meta).

---

## File structure

```
src/messages/
  index.ts          # exports { ru, uk, en, pl }
  locales/
    ru.ts           # base RU strings
    uk.ts           # spreads ru + UK overrides
    en.ts           # English
    pl.ts           # Polish (standalone)
src/i18n/
  routing.ts        # locales, domains, defaultLocale
  request.ts        # loads messages per request
src/lib/site.ts     # MAIN_DOMAIN, POLISH_DOMAIN, locale lists
```

---

## Routing

- **URL prefix:** `localePrefix: "as-needed"` — default locale (`ru`) has no prefix on main domain.
- **Examples (pk-help.pl):**
  - `/` → Russian
  - `/uk` → Ukrainian
  - `/en` → English
- **Polish domain (pk-help-pl.pl):**
  - `/` → Polish only (no `/pl` prefix needed)

Configuration: `src/i18n/routing.ts`.

---

## Local development

### All locales on localhost

By default, localhost exposes **ru, uk, en** (main locales). Use the language switcher in header/footer.

### Polish only on localhost

Add to `.env.local`:

```env
NEXT_PUBLIC_FORCE_LOCALE=pl
```

Restart `npm run dev`. Only `pl` is available; switcher shows one language.

---

## Language switcher

Component: `src/components/layout/language-switcher.tsx`

- Shows only locales allowed for the current host (`getLocalesForHost`).
- On `pk-help-pl.pl` → only **PL**.
- On `pk-help.pl` → **RU / UA / EN**.
- On `*.vercel.app` preview → all locales configured for that host in `routing.ts`.

---

## SEO / hreflang

Home page metadata (`src/app/[locale]/page.tsx`) sets:

- `alternates.canonical`
- `alternates.languages` (hreflang map for ru, uk, en, pl)
- Open Graph `locale` and `url`

Sitemap/robots use `getSiteUrl()` from `src/lib/site-url.ts`.

---

## Adding a new language

1. Create `src/messages/locales/xx.ts` (copy `en.ts` as template).
2. Export in `src/messages/index.ts`:
   ```ts
   import xx from "./locales/xx";
   const messages = { ru, uk, en, pl, xx } as const;
   ```
3. Add `"xx"` to `locales` in `src/i18n/routing.ts` and to `mainLocales` or `polishLocales` in `src/lib/site.ts`.
4. Add label in `language-switcher.tsx` (`labels` map).
5. If using a dedicated domain, add a `domains` entry in `routing.ts`.
6. Extend Prisma `SiteSettings` / component name fields if content is DB-driven (`nameXx` columns).

---

## Database multilingual fields

| Model | Fields |
|-------|--------|
| `Component` | `name`, `nameUk`, `nameEn`, `namePl` |
| `Review` | `name`, `text` + `nameUk`, `textUk`, … |
| `SiteSettings` | `heroTitleRu`, `heroTitlePl`, … |

Builder and API pick the localized name based on active locale (see `src/lib/localized.ts` if present, or component fetch logic).

---

## Environment variables

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_MAIN_DOMAIN` | Main site domain (ru/uk/en) |
| `NEXT_PUBLIC_POLISH_DOMAIN` | Polish site domain |
| `NEXT_PUBLIC_FORCE_LOCALE` | Optional: force `pl` on any host (dev) |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL for metadata |

---

## Preview vs production

| Host | URL | Locales | Switcher |
|------|-----|---------|----------|
| `localhost` | `/` | ru, uk, en | RU / UA / EN |
| `localhost` + `FORCE_LOCALE=pl` | `/` | pl | hidden |
| `*.vercel.app` | `/` | ru, uk, en | RU / UA / EN |
| `*.vercel.app` | `/pl` | pl | **hidden** |
| `pk-help.pl` | `/` | ru, uk, en | RU / UA / EN |
| `pk-help-pl.pl` | `/` | pl | **hidden** |

`/pl` on the main production domain redirects to `NEXT_PUBLIC_POLISH_SITE_URL` or `pk-help-pl.pl`.

Logic: `src/lib/locale-path.ts` + `src/middleware.ts`.

---

## Related docs

- [README_DEPLOY.md](./README_DEPLOY.md) — domains on Vercel
- [README_ADMIN.md](./README_ADMIN.md) — editing content per language
