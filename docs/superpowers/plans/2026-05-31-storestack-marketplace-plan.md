# Storestack Marketplace — Technical Plan (Fase 2)

**Date:** 2026-05-31
**Status:** Pending approval
**Spec:** [2026-05-31-storestack-marketplace-design.md](../specs/2026-05-31-storestack-marketplace-design.md)

> **Note on plan format:** This is a **milestone-level** plan per the project's Fase structure (Fase 2 = architecture + milestones; Fase 4 = per-milestone TDD execution). Step-by-step TDD breakdowns happen at the start of each milestone in Fase 4, not in this document.

---

## 1. Architecture

**Approach:** Next.js App Router monolith with Server Actions for mutations, Prisma + PostgreSQL for data, JWT session cookies for auth, Resend for email, Vercel Blob for image upload, deployed on Vercel.

**Why a monolith:** Single-team scope, single-deployment unit, latency-sensitive browse path, no isolated scaling needs. Microservices would add ops overhead with zero benefit at this scale.

**Why Server Actions over REST routes:** Built-in CSRF protection, type-safe RPC from client to server, less ceremony than route handlers, native fit with React Hook Form + Zod via `useFormState`. The public REST API is explicitly out of scope (spec section 9).

**Why JWT in httpOnly cookie over session store:** Simpler, no extra infra (Redis), secure for the marketplace's threat model. The token contains `userId` + `role`; expiration refreshed on activity. For invalidation (e.g. user suspended), the middleware checks `user.status` against DB on each protected request.

**Why Prisma:** Strong types, migrations, fast iteration, matches the project's preferred stack.

**Why Neon Postgres:** Serverless, fits Vercel's serverless functions naturally, free tier sufficient for portfolio.

**Trade-offs documented:**
- Server Actions can be slower than REST due to RSC serialization — acceptable for marketplace scale (no high-throughput writes).
- Vercel Hobby function timeout = 10s — we structure image uploads to fit comfortably.
- Neon free tier auto-suspends after idle — first request after suspend has ~3s cold start. Acceptable; document in case study.

## 2. Stack (final)

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 16+ (App Router) | SSR + Server Actions + RSC |
| Language | TypeScript (strict) | Type safety across full stack |
| Styling | Tailwind CSS v4 | Project default, fast iteration |
| UI primitives | Custom + shadcn-style patterns | No framework lock-in, ship only what's used |
| DB | PostgreSQL on Neon | Serverless, free tier, Vercel-friendly |
| ORM | Prisma | Type-safe queries, migrations |
| Auth | Custom JWT (`jose`) + `bcryptjs` | Project default; avoid Auth.js v5 beta |
| Forms | React Hook Form + Zod | Schema shared client + server |
| Email | Resend | 3000/mo free tier |
| Image upload | Vercel Blob | Free for portfolio scale |
| Markdown | `react-markdown` + `rehype-sanitize` | Safe rendering |
| Charts (analytics) | Recharts | Lightweight, simple API |
| Search | PostgreSQL `to_tsvector` + GIN index | No Elasticsearch needed at v1 scale |
| Hosting | Vercel Hobby | Auto-deploy on `main` push |
| Testing | Vitest + Playwright | Unit/integration + E2E |
| CI | GitHub Actions (lint + typecheck only) | Cheap, sufficient for portfolio |

## 3. Data Model

Prisma schema sketch (full schema with migrations comes in Milestone 1):

```prisma
enum Role         { MERCHANT DEVELOPER ADMIN }
enum UserStatus   { ACTIVE SUSPENDED UNVERIFIED }
enum AppStatus    { DRAFT IN_REVIEW APPROVED REJECTED PUBLISHED }
enum PricingModel { FREE FREEMIUM PAID }
enum InstallStatus { ACTIVE NEEDS_CONFIG ERROR }
enum AuditDecision { APPROVE REJECT }

model User {
  id              String    @id @default(cuid())
  email           String    @unique
  passwordHash    String
  name            String
  role            Role
  status          UserStatus @default(UNVERIFIED)
  emailVerifiedAt DateTime?
  createdAt       DateTime   @default(now())
  developer       Developer?
  installs        Install[]
  favorites       Favorite[]
  reviews         Review[]
  appsOwned       App[]      @relation("DeveloperApps")
  auditActions    AuditLog[] @relation("Actor")
}

model Developer {
  userId       String  @id
  user         User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  companyName  String
  logoUrl      String?
  bio          String?
  supportEmail String
}

model Category {
  id        String @id @default(cuid())
  slug      String @unique
  name      String
  sortOrder Int    @default(0)
  apps      App[]
}

model App {
  id             String       @id @default(cuid())
  slug           String       @unique
  name           String
  tagline        String
  descriptionMd  String       @db.Text
  iconUrl        String?
  pricingModel   PricingModel
  currentVersion String       @default("1.0.0")
  developerId    String
  developer      User         @relation("DeveloperApps", fields: [developerId], references: [id])
  categoryId     String
  category       Category     @relation(fields: [categoryId], references: [id])
  status         AppStatus    @default(DRAFT)
  featured       Boolean      @default(false)
  publishedAt    DateTime?
  createdAt      DateTime     @default(now())
  screenshots    AppScreenshot[]
  versions       AppVersion[]
  installs       Install[]
  favorites      Favorite[]
  reviews        Review[]
  reviewComments ReviewQueueComment[]
  searchVector   Unsupported("tsvector")?

  @@index([status, publishedAt])
  @@index([categoryId])
}

model AppScreenshot {
  id        String @id @default(cuid())
  appId     String
  app       App    @relation(fields: [appId], references: [id], onDelete: Cascade)
  url       String
  sortOrder Int    @default(0)
  caption   String?
}

model AppVersion {
  id          String   @id @default(cuid())
  appId       String
  app         App      @relation(fields: [appId], references: [id], onDelete: Cascade)
  version     String
  changelog   String   @db.Text
  publishedAt DateTime @default(now())
}

model Install {
  id           String         @id @default(cuid())
  userId       String
  user         User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  appId        String
  app          App            @relation(fields: [appId], references: [id], onDelete: Cascade)
  installedAt  DateTime       @default(now())
  configJson   Json?
  configStatus InstallStatus  @default(NEEDS_CONFIG)

  @@unique([userId, appId])
}

model Favorite {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  appId     String
  app       App      @relation(fields: [appId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())

  @@unique([userId, appId])
}

model Review {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  appId     String
  app       App      @relation(fields: [appId], references: [id], onDelete: Cascade)
  rating    Int      // 1-5
  body      String   @db.Text
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([userId, appId])
}

model ReviewQueueComment {
  id        String         @id @default(cuid())
  appId     String
  app       App            @relation(fields: [appId], references: [id], onDelete: Cascade)
  adminId   String
  decision  AuditDecision
  comment   String         @db.Text
  createdAt DateTime       @default(now())
}

model AuditLog {
  id          String   @id @default(cuid())
  actorId     String
  actor       User     @relation("Actor", fields: [actorId], references: [id])
  action      String   // 'app.approve', 'app.reject', 'user.suspend', etc.
  targetType  String   // 'App', 'User', 'Category'
  targetId    String
  metadataJson Json?
  createdAt   DateTime @default(now())

  @@index([createdAt])
}

model EmailVerificationToken {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
}

model PasswordResetToken {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
}

model Setting {
  key       String @id
  valueJson Json
}
```

Initial settings rows:
- `featured_app_ids`: array of App ids shown on home page
- `announcement_banner`: `{enabled, message, type}` for site-wide banner

## 4. Milestones

> Estimated pace: ~2–3 hrs/day, ~5 working days per milestone. Total ~5 weeks. Andre may run faster or slower depending on schedule; milestones are sequenced not time-boxed.

### Milestone 1 — Foundation
**Theme:** Project boots, auth works, deploys live.

**Scope:**
- Init Next.js 16 + TS + Tailwind v4 project
- Set up Prisma + Neon (dev + prod DBs)
- Define User, Developer, EmailVerificationToken, PasswordResetToken models
- Auth: sign-up (merchant + developer), sign-in, email verify, sign-out, password reset, account settings (password change)
- Middleware (proxy in Next 16): session check, role-based route protection
- Brand placeholder home page (will be replaced in Milestone 2)
- GitHub repo + Vercel project + env vars set + first deploy live

**Definition of Done:**
- [ ] Live URL on Vercel responds 200 on `/`
- [ ] Merchant can sign up → receive verify email (Resend) → click link → status `ACTIVE`
- [ ] Developer sign-up identical with extra company-name field
- [ ] Sign-in sets httpOnly cookie; sign-out clears it
- [ ] Protected routes `/merchant/*`, `/developer/*`, `/admin/*` redirect anonymous to `/sign-in?next=<path>`
- [ ] Suspended user cannot sign in (error page shown)
- [ ] Password reset email + flow works end-to-end
- [ ] `tsc --noEmit` passes, ESLint passes, Vitest tests for auth helpers pass
- [ ] `npm run build` green locally and on Vercel

### Milestone 2 — Public Marketplace
**Theme:** Anyone can browse the marketplace.

**Scope:**
- Seed: 6 categories, 12 apps (with screenshots, descriptions, versions), 2 developer users, 2 merchant users with reviews + installs, 2 admin users
- Home page: hero, featured strip (6 apps), categories grid (6), latest strip (12)
- Category page with filter + sort
- Browse-all page
- Search with PostgreSQL FTS (full-text search) + GIN index on App.searchVector
- App detail page: gallery, Markdown description (sanitized), pricing, reviews paginated, similar apps (same category, top 4 by rating)
- Layout, header, footer (brand identity), 404 page

**Definition of Done:**
- [ ] All 12 seeded apps visible on browse/search
- [ ] Search response < 200ms locally with seed data
- [ ] App detail renders Markdown safely (XSS test: `<script>` in description is stripped)
- [ ] Pagination on reviews works (10/page)
- [ ] Lighthouse score ≥90 on home + app detail (perf, a11y, SEO, best-practices)
- [ ] All Milestone 2 tests pass (Playwright: visit home → click category → click app → read detail)

### Milestone 3 — Merchant + Developer Areas
**Theme:** Authenticated users do their thing.

**Scope:**
- Merchant area: My Installed (list + status badges), App config page (1–2 fields, edit + save), Favorites (toggle from app detail), My Reviews (write + edit + delete)
- Install Server Action + confirmation email
- Uninstall + favorite-toggle Server Actions
- Account page (profile, change password, mocked Billing tab)
- Developer area: My Published Apps list, multi-step submit form (5 steps + draft auto-save), Edit app, Analytics page (Recharts chart with mock data), Developer profile page
- Image upload (icon + screenshots) via Vercel Blob — size + type validation
- Status transition logic: app submit → `IN_REVIEW`, re-submit → `IN_REVIEW`

**Definition of Done:**
- [ ] Merchant can install + uninstall an app; "My Installed" reflects change
- [ ] Merchant can favorite + unfavorite from app detail
- [ ] Merchant can write/edit/delete review (only for installed apps); rating + body required
- [ ] Developer multi-step form saves draft per step; navigating away + back restores draft
- [ ] Developer can submit a draft; status moves to `IN_REVIEW`; admin email triggered
- [ ] Developer can edit a published app; edits move it back to `IN_REVIEW`
- [ ] Image upload validates: < 2 MB, type in (`image/png`, `image/jpeg`, `image/webp`); rejects others with friendly error
- [ ] Server-side enforces status transitions (cannot edit `APPROVED` directly)
- [ ] Playwright E2E: developer submit flow passes

### Milestone 4 — Admin + Audit
**Theme:** Admin moderates the marketplace end-to-end.

**Scope:**
- Review queue: list pending apps oldest-first, paginated; click → full app preview + approve/reject buttons
- Approve / reject Server Action: requires comment (min 5 chars), writes `ReviewQueueComment` + `AuditLog`, sends email to developer
- Category management: CRUD + drag-reorder (`@dnd-kit`)
- App management: search, force-unpublish, edit any field
- User management: search, change role, suspend (sets status SUSPENDED, invalidates session next request)
- Settings page: pick featured app ids (multi-select), site banner editor
- Audit log: read-only paginated list of all admin actions

**Definition of Done:**
- [ ] Approve → app status PUBLISHED → visible on marketplace within 60s, developer email sent with comment
- [ ] Reject → app status REJECTED → developer email sent with comment; developer can edit (status → DRAFT) and resubmit
- [ ] Suspended user signed in: next request invalidates session, redirected to sign-in with "account suspended" message
- [ ] Audit log shows every approve/reject/suspend; entries immutable (no edit/delete UI, server rejects edit attempts)
- [ ] Category reorder persists; new order reflects on home + browse
- [ ] Featured app changes reflect on home within page reload
- [ ] Playwright E2E: admin approves a pending app passes

### Milestone 5 — Polish, Portfolio Prep, Deploy
**Theme:** Production-ready.

**Scope:**
- 404 + 500 pages with brand layout
- Mobile responsive QA: every public + auth page reviewed at 360, 768, 1440 widths
- Accessibility pass: keyboard nav, focus rings, alt text, ARIA labels on icon buttons, contrast
- Light/dark mode (cookie-driven, system default), all pages styled in both modes
- SEO meta tags + Open Graph for app detail pages
- Lighthouse run on all key routes, fix top issues
- README + CLAUDE.md final pass (run, build, test, deploy commands)
- Production deploy + smoke test
- (Fase 5 starts after this milestone is signed off — screenshots, PDF, video, listing copy)

**Definition of Done:**
- [ ] All acceptance criteria from spec section 8 ticked
- [ ] Mobile responsive verified at 360px on all pages
- [ ] Lighthouse a11y ≥95 on home + app detail
- [ ] Dark mode visually consistent on every page
- [ ] Live production URL with all features working
- [ ] README has: project intro, run/build/test commands, env-var list, deploy instructions
- [ ] CLAUDE.md complete with project conventions

## 5. Testing Strategy

| Test type | What | Tool | When written |
|---|---|---|---|
| **Unit** | Auth helpers, validators, format helpers, status-transition guards | Vitest | TDD-first (Milestones 1, 3, 4) |
| **Integration** | Server Actions exercised against test DB | Vitest + Prisma test client | After implementation |
| **E2E** | 3 critical flows: (1) merchant browse→install→review; (2) developer signup→submit→edit; (3) admin review→approve→publish appears | Playwright | End of each milestone |
| **Type check** | `tsc --noEmit` | TypeScript | On every commit (CI + pre-push) |
| **Lint** | ESLint strict | ESLint | On every commit |

**Out of scope:**
- Component unit tests (UI verified by Playwright + manual)
- Snapshot tests
- Performance benchmarks (use Lighthouse manually)
- Visual regression

**TDD discipline:**
- Milestone 1 auth helpers: test-first (signing/verifying tokens, password hashing edge cases)
- Milestone 3 + 4 status-transition guards: test-first
- UI work: test after (Playwright at end of milestone)

## 6. Deployment Plan

**Local dev loop:**
- `npm run dev` against Neon dev DB
- `.env.local` holds dev secrets (gitignored)

**GitHub:**
- Repo: `andrehuang13-eng/storestack-marketplace` (start private, flip public for portfolio Fase 5)
- Branch model: trunk-based, push directly to `main` for portfolio scale (no PR overhead)
- GitHub Actions: lint + `tsc --noEmit` only (cheap)

**Vercel:**
- Project linked to repo, auto-deploy on `main` push
- Env vars (set via Vercel API with stored token — no CLI login needed):
  - `DATABASE_URL` — Neon prod connection (pooler URL)
  - `DIRECT_URL` — Neon direct URL (for Prisma migrations)
  - `SESSION_SECRET` — random 32-byte base64
  - `RESEND_API_KEY`
  - `BLOB_READ_WRITE_TOKEN`
  - `NEXT_PUBLIC_APP_URL`
- Build command: `prisma generate && next build` (the `postinstall` hook covers `prisma generate`, but explicit doesn't hurt)
- Critical: `"postinstall": "prisma generate"` in `package.json` (Petalcrumb lesson — Vercel build cache otherwise leaves stale Prisma Client)

**Per-milestone deploy:**
- Push to `main` → auto-deploy → smoke test on live URL
- Milestone 1 produces the first live URL; every subsequent milestone keeps it live

**Production deploy (Milestone 5):**
- Domain: Vercel preview URL is sufficient for portfolio; custom domain optional
- Final smoke test on prod URL across desktop + mobile

## 7. Risks (with mitigations)

| Risk | Likelihood | Mitigation |
|---|---|---|
| Prisma migrations confusing first time | High | I run them and explain each step; never Andre runs blind |
| Missing `postinstall: prisma generate` in package.json → stale Prisma Client on Vercel | High (Petalcrumb hit this) | Add from day 1 |
| Resend sandbox sender only delivers to sign-up email | High | Confirmed: only `andrehuang13@gmail.com` reachable until domain verified. Document in dev. |
| Neon free tier auto-suspend (cold ~3s) | Medium | Acceptable for portfolio; document in case study |
| Email background task killed by serverless freeze | Medium | Always `await resend.emails.send()` — Petalcrumb lesson |
| `git push` permission prompts mid-build | Medium | Andre writes `.claude/settings.local.json` allowing `Bash(git push:*)` after confirmation (self-modification guardrail) |
| Next.js 16 `middleware` → `proxy` rename | Medium | Consult `node_modules/next/dist/docs` before writing the proxy file (CLAUDE.md rule) |
| Vercel build failing on TS strict | Low | `tsc --noEmit` locally before each push (also CI) |
| Neon DB connection limit on free tier | Low | Use Prisma's pooler URL (`DATABASE_URL`), keep migrations on `DIRECT_URL` |
| Parallel Bash/Edit calls cascading-cancel | Medium | Sequential tool calls for mutating work (CLAUDE.md hard lesson) |
| Schannel TLS issues on Windows curl | Medium | Pass `--ssl-no-revoke` to `curl.exe` when calling Vercel API |

---

*Pending approval. Next: Fase 3 — environment setup (init project, GitHub repo, Vercel link, first deploy).*
