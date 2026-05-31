# Storestack

A full-stack app marketplace for independent e-commerce merchants — built end-to-end in Next.js 16 with custom JWT auth, Prisma + Neon Postgres, Resend transactional email, and Server Actions throughout. **Concept project for portfolio**: Storestack is a fictional company. Not real client work.

**Live:** https://storestack-marketplace.vercel.app
**Repo:** https://github.com/andrehuang13-eng/app-marketplace

## What it does

Storestack is a marketplace where:

- **Merchants** browse a curated catalogue of apps that extend their e-commerce storefront (WooCommerce, Magento, or custom), install them, configure them, leave reviews.
- **Developers** publish their apps via a multi-section submission form, edit them, watch installs roll in on a real-numbers analytics view.
- **Admins** moderate the queue, manage categories and users, audit every privileged action, control featured apps and the announcement banner.

## Highlights

- **Custom session auth** — JWT signed with HS256 via `jose`, in an httpOnly cookie. 7-day TTL, role-aware Proxy for `/merchant`, `/developer`, `/admin`. Server-side Data Access Layer (DAL) with `requireSession`, `requireUser`, `requireRole` cached per render.
- **Server Actions everywhere** — every mutation (signup, install, review, app submit, admin approve/reject, etc.) is a Server Action. Built-in CSRF, type-safe RPC, React Hook Form interop via `useActionState`.
- **Real seed** — 6 categories, 12 fictional but realistic apps (`Klavoo`, `Trustfold`, `ShipQuick`, `Tradar Insights`, …), 2 developers, 2 merchants, 2 admins, prior reviews + installs + audit log entries.
- **Transactional email via Resend** — verify-email, password-reset, install-confirmation, and developer approve / reject all `await`'d in the Server Action (Petalcrumb lesson: never fire-and-forget on serverless).
- **Immutable audit log** — every admin write goes through a transaction that also writes an `AuditLog` row. The audit page reads, doesn't write.
- **Postgres-driven search** — case-insensitive `contains` across name, tagline, description, and developer name. Fast on the 12-app seed; the data model is ready for a `tsvector` upgrade if the catalog grows.
- **Trunk-based git** with descriptive commits and matching milestone PRs in history.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack, React 19) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| DB | PostgreSQL on Neon |
| ORM | Prisma 7 + `@prisma/adapter-pg` (driver-adapter pattern required by Prisma 7's `client` engine) |
| Auth | Custom JWT (`jose`) + `bcryptjs` in httpOnly cookie |
| Forms | React Hook Form + Zod (shared schema client + server) |
| Email | Resend |
| Markdown | `react-markdown` + `rehype-sanitize` |
| Charts | Recharts |
| Testing | Vitest (17 passing) + Playwright (configured) |
| Hosting | Vercel (auto-deploy on `main` push) |

## Demo accounts

Password for every seeded account: `Password1!`

| Role | Email |
|---|---|
| Merchant | `olivia@brewroom.co` |
| Merchant | `marcus@stonefieldgoods.com` |
| Developer | `team@brightroot.dev` |
| Developer | `hello@plycraft.io` |
| Admin | `ada@storestack.dev` |
| Admin | `noah@storestack.dev` |

## Setup

```bash
git clone https://github.com/andrehuang13-eng/app-marketplace.git
cd app-marketplace
cp .env.example .env
# fill DATABASE_URL (Neon) and RESEND_API_KEY in .env
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

Open http://localhost:3000

## Commands

```bash
npm run dev          # local dev (Turbopack)
npm run build        # production build
npm run start        # serve production build
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
npm run test         # Vitest unit + integration
npm run test:e2e     # Playwright E2E
npm run db:migrate   # Prisma migrate dev
npm run db:push      # push schema without migration history (dev only)
npm run db:seed      # seed sample data
npm run db:studio    # Prisma Studio
```

## Project structure

```
app/
  (auth)/                Sign-in, sign-up, verify-email, reset-password
  (public)/              Public marketplace (home, browse, app detail, search, category)
  merchant/              Installed apps, configure, favorites, reviews, account
  developer/             My apps, submit, analytics, profile
  admin/                 Review queue, apps, categories, users, audit, settings
  not-found.tsx          404
  error.tsx              500
  layout.tsx             Root layout (brand metadata)
  robots.ts, sitemap.ts  SEO
lib/
  db.ts                  Prisma client singleton (PrismaPg adapter)
  auth/                  password, session (JWT), tokens, DAL
  email/                 Resend client, transactional senders, admin senders
  validators/            Shared Zod schemas
  actions/               Server Actions (auth, merchant, developer, admin)
  queries/               Read helpers (apps, merchant, developer, admin)
components/              Shared UI (form-field, public-header, site-header, app-card, ...)
prisma/
  schema.prisma          15 models, 7 enums
  seed.ts                12 apps, 6 categories, 6 users, reviews + installs + audit
  migrations/            Prisma migrations
docs/superpowers/        Spec + technical plan
proxy.ts                 Next.js 16 Proxy (formerly middleware) for route protection
```

## Notable decisions

- **Server Actions over REST routes** — built-in CSRF, native React 19 form integration, less boilerplate. Public REST API is explicitly out of v1 scope.
- **Driver adapter (PrismaPg + pg)** — Prisma 7's default `client` engine requires a driver adapter; this is the lightest option that works on Vercel's Node runtime and locally.
- **Direct (non-pooler) Neon URL for everything** — at portfolio scale, the operational simplicity wins over the marginal pooling benefit. Upgrade path documented.
- **Single-page submit form** vs the multi-step + draft-auto-save called out in the spec — single-page ships fast and demos cleanly; the multi-step refactor is a known follow-up.

## Not in v1

By design (see `docs/superpowers/specs/...` for the full out-of-scope list):

- Real payments / Stripe
- Real installation onto external storefronts (DB record only)
- i18n / multi-language
- Social sign-in
- Two-factor auth
- Public REST API
- Developer reply-to-review
- App version diff / rollback

## License

This is a concept project for portfolio. No license granted for reuse of the brand identity or copy. Code is reference-only.
