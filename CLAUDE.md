@AGENTS.md

# Storestack — App Marketplace

Concept / portfolio project. **Storestack is a fictional company.** Do not describe as real client work in any deliverable.

Spec: [docs/superpowers/specs/2026-05-31-storestack-marketplace-design.md](docs/superpowers/specs/2026-05-31-storestack-marketplace-design.md)
Plan: [docs/superpowers/plans/2026-05-31-storestack-marketplace-plan.md](docs/superpowers/plans/2026-05-31-storestack-marketplace-plan.md)

## Stack

- Next.js **16.2.6** App Router (TS strict, Tailwind v4)
- Prisma 7 + PostgreSQL (Neon)
- Auth: custom JWT (`jose`) + `bcryptjs` in httpOnly cookie
- Forms: React Hook Form + Zod
- Email: Resend · Image upload: Vercel Blob
- Testing: Vitest + Playwright
- Hosting: Vercel

## Language rule

All product surface in **English**: UI, code, comments, docs, commit messages, dummy/seed data, README. Conversational chat with the developer can be Indonesian; the product itself is global/English-only.

## Commands

```bash
npm run dev          # Local dev (Turbopack)
npm run build        # Production build
npm run start        # Run production build locally
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
npm run test         # Vitest unit/integration
npm run test:e2e     # Playwright E2E
npm run db:migrate   # Prisma migrate dev
npm run db:push      # Push schema without migration history (dev only)
npm run db:studio    # Prisma Studio (DB browser)
npm run db:seed      # Seed sample data
```

## Important — Next.js 16 specifics

This is Next.js **16**, not 14 or 15. Before writing any framework-specific code (auth/proxy, server actions, layouts, route handlers, fetch caching), consult `node_modules/next/dist/docs/`. Things that changed in v16 from training data:

- `middleware.ts` → `proxy.ts` (renamed)
- Server Actions / data mutation API may have new caching semantics
- `cookies()` and other `next/headers` APIs may be async
- Read `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md` before writing auth route protection.
- Read `node_modules/next/dist/docs/01-app/01-getting-started/07-mutating-data.md` before writing Server Actions.

When in doubt, glob the docs directory and read the relevant `01-app/...` file. Don't guess.

## Project structure

```
app/                       Next.js App Router pages
  (public)/                Public marketplace routes (home, browse, app/[slug])
  (auth)/                  Sign-in, sign-up, verify-email, reset-password
  (merchant)/              Merchant area (authenticated)
  (developer)/             Developer area (authenticated)
  (admin)/                 Admin area (authenticated)
  api/                     Route handlers when needed (image upload callback, etc.)
  layout.tsx               Root layout, brand metadata
  page.tsx                 Home page
lib/                       Shared utilities
  db.ts                    Prisma client singleton
  auth/                    Auth helpers (hash, JWT, session, current-user)
  email/                   Resend email senders + templates
  validators/              Shared Zod schemas (client + server)
prisma/
  schema.prisma            DB schema
  migrations/              Prisma migrations
  seed.ts                  Seed sample data
docs/superpowers/          Spec + plan (don't delete — portfolio reference)
public/                    Static assets
```

## Hard rules (CLAUDE.md hard lessons applied)

1. **NO parallel mutating tool calls.** Sequential Edit/Write/Bash. Parallel is fine ONLY for reads. Cascading cancels otherwise.
2. **Verify builds by exit code, not inline text.** `npm run build 2>&1 | Out-File bc.log; "EXIT=$LASTEXITCODE"` then Read the log.
3. **Email + side effects in Server Actions: always `await`.** Fire-and-forget gets killed when the serverless function freezes.
4. **`postinstall: prisma generate` must stay in package.json.** Without it Vercel build cache leaves a stale Prisma Client → silent type errors in CI.
5. **`curl.exe` with Vercel API on Windows needs `--ssl-no-revoke`** (schannel CRT revocation check fails).
6. **Never overstate commit messages.** Describe what actually happened, not intent.

## Environment variables

See `.env.example`. Production values are set on Vercel (via API).

| Var | Source | Purpose |
|---|---|---|
| `DATABASE_URL` | Neon pooler URL | Prisma runtime queries |
| `DIRECT_URL` | Neon direct URL | Prisma migrations |
| `SESSION_SECRET` | random 32-byte base64 | JWT signing |
| `RESEND_API_KEY` | resend.com dashboard | Transactional email |
| `BLOB_READ_WRITE_TOKEN` | Vercel project → Storage → Blob | Image upload |
| `NEXT_PUBLIC_APP_URL` | hardcoded per env | Email link generation |

## Roles

`MERCHANT` · `DEVELOPER` · `ADMIN` — see spec section 6 for permission matrix.

## App status transitions

`DRAFT → IN_REVIEW → (APPROVED → PUBLISHED) | (REJECTED → DRAFT → ...)`

Status transitions enforced server-side in Server Actions. Direct DB writes outside actions are forbidden.
