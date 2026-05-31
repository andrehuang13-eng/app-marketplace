# Storestack — App Marketplace Design Spec

**Date:** 2026-05-31
**Status:** Approved (Fase 1)
**Project:** app-marketplace (concept project — fictional client)

> Concept / portfolio project. **Storestack is a fictional company.** Do not describe as real client work in any deliverable.

---

## 1. Company Profile (fictional)

Storestack is a 3-year-old B2B SaaS company headquartered in Berlin with a 35-person remote-first team. Its core product is a curated app marketplace for independent e-commerce merchants on **WooCommerce**, **Magento**, or custom storefronts. Shopify is explicitly out of audience (Shopify has its own App Store).

The CEO is a former Magento merchant who got frustrated by siloed plugin ecosystems across e-commerce platforms. Storestack is platform-agnostic: app developers build once (REST API + webhooks) and reach merchants on any supported platform.

**Funding:** Series A — $8M closed June 2025. Bootstrapped before that.

**Team:** CEO, CTO, Head of Product, 2 app reviewers, 3 engineers, growth team.

## 2. Problem & Current State

- **Content site** (`storestack.com`) — WordPress (blog, case studies, pricing, contact). Stable. **Not in scope.**
- **App marketplace** (`apps.storestack.com`) — quick PHP MVP, crashes under load, hard to maintain. **Rebuilt from scratch.**
- **Goal:** modern Next.js full-stack marketplace at `apps.storestack.com`.

> **Portfolio scope:** we build only the marketplace. The WordPress content site is fictional context — not delivered as part of this project. README and case study clarify the scope.

## 3. Business Goals (measurable)

| Goal | Current (PHP) | Target (v1) |
|---|---|---|
| Published apps | 47 | 200 within 6 months |
| Uptime | ~94% | > 99.5% |
| TTFB p95 | not measured | < 200 ms |
| Fully-interactive p95 | not measured | < 2 s |
| Merchant → app-detail conversion | 18% | 30% |
| Developer self-service rate | ~40% | 80% (submissions without staff intervention) |

## 4. Feature Modules

### 4.1 Public Marketplace (anyone)
- **Home** — hero, 6 featured apps (admin-curated), category grid, 12 latest apps, global search bar.
- **Browse / Category** — app cards (icon, name, tagline, rating, install count, category badge). Filter by category; sort by popularity / rating / newest / A–Z.
- **Search** — full-text on app name + description + developer name. Facets: category, pricing model (free / freemium / paid).
- **App detail page** — screenshot gallery, Markdown description, pricing tiers, developer info, version history, reviews + rating breakdown, similar apps, Install button.
- **Auth pages** — Sign up (role: merchant or developer), Sign in, Reset password, Verify email.

### 4.2 Merchant Area (role = merchant)
- **My Installed apps** — list of installed apps (DB record only; not an actual storefront install — mocked). Status badges: active / needs-config / error.
- **App configuration** — per-app config page (1–2 example fields: API key, webhook URL).
- **Favorites / Wishlist** — saved for later.
- **My Reviews** — write/edit reviews for installed apps.
- **Account** — profile, email/password update. Billing tab is mocked (display only, no Stripe).

### 4.3 Developer Area (role = developer)
- **My Published apps** — list with status: `draft` / `in_review` / `approved` / `rejected` / `published`.
- **Submit new app** — multi-step form (5 steps: basics → description → screenshots → pricing → technical info). Auto-save draft per step.
- **Edit app** — pre-filled form. Post-publish edits re-enter the review queue.
- **Analytics** — chart of installs over time, page views, conversion rate. Mock data.
- **Developer profile** — company name, logo, bio, support email.

### 4.4 Admin Area (role = admin)
- **Review queue** — pending submissions, oldest-first. Full review → approve / reject with mandatory comment.
- **Category management** — CRUD categories, drag-to-reorder.
- **App management** — search all apps; force-unpublish; edit any field.
- **User management** — search users; change role; suspend.
- **Settings** — pick featured apps for the home page, site-wide announcement banner.

### 4.5 Cross-cutting
- **Transactional email** (via Resend): sign-up verify, submission received, approve / reject with reason, first install for developer.
- **Image upload** (via Vercel Blob): app icons (512×512), screenshots (1280×800), developer logos.
- **Markdown** rendering with HTML sanitizer (XSS prevention).
- **Audit log** (admin-only): who approved/rejected what, when, with reason. Immutable.

## 5. Core User Flows

### Flow A — Merchant discovers and installs an app
1. Anonymous → home → click "Email & SMS" → open "Klavoo" → read + reviews → click **Install**.
2. Prompted to sign in / sign up (merchant role) → after auth, returns to app page → install confirmed → app appears in "My Installed".
3. Confirmation email sent ("You installed Klavoo").

### Flow B — Developer submits an app
1. Sign up with developer role → open **Submit new app**.
2. Fill 5-step form, auto-save per step → click **Submit for review**.
3. Status → `in_review`; email queued to admins.
4. Admin reviews; approves with comment.
5. Approval email sent; status → `published`; app live on marketplace within 60 s.

### Flow C — Admin rejects with reason
1. Admin opens review queue → picks pending submission → reviews.
2. Rejects with reason (e.g., "logo too small, please upload at least 512×512").
3. Email + status `rejected` sent to developer.
4. Developer edits → resubmits → status returns to `in_review`.

## 6. Permission Matrix

| Action | Anonymous | Merchant | Developer | Admin |
|---|:---:|:---:|:---:|:---:|
| Browse marketplace, view app detail | ✓ | ✓ | ✓ | ✓ |
| Install app | — | ✓ | — | — |
| Write review (only for installed apps) | — | ✓ | — | — |
| Submit new app | — | — | ✓ | — |
| Edit own draft / own app | — | — | ✓ | — |
| Approve / reject submissions | — | — | — | ✓ |
| CRUD categories | — | — | — | ✓ |
| Suspend users | — | — | — | ✓ |
| View any user's data | — | — | — | ✓ |

## 7. Sample Data (seed)

**6 Categories:** Email & SMS · Reviews · Shipping & Fulfillment · Inventory · Customer Support · Analytics

**12 Apps (fictional):**

| Category | Apps |
|---|---|
| Email & SMS | Klavoo (paid), Mailwave (freemium) |
| Reviews | Trustfold (freemium), Reviewly (free) |
| Shipping & Fulfillment | ShipQuick (paid), LabelKit (free) |
| Inventory | Stockfly (paid), RestockNow (freemium) |
| Customer Support | Chathive (paid), HelpNest (free) |
| Analytics | Tradar Insights (paid), PixelPeek (free) |

**6 Users (seed):**
- 2 merchants — each with installed apps + 2–3 written reviews
- 2 developers — each owns 2–3 published apps + 1 `in_review`
- 2 admins — one with audit log entries from prior approvals

## 8. Acceptance Criteria

### Public marketplace
- [ ] Home displays ≥6 featured + ≥12 latest apps from DB.
- [ ] Search returns matching apps in < 200 ms on seed data; partial-match, case-insensitive.
- [ ] App detail shows current pricing, average rating to 1 decimal, all reviews paginated 10/page.

### Auth
- [ ] Merchant sign-up: email + password + name + role = merchant.
- [ ] Developer sign-up: same + company-name field.
- [ ] Email verification: link valid 24 h; unverified accounts cannot install, review, or submit.
- [ ] Session in httpOnly cookie, 7-day expiration, auto-renewed on activity.

### Developer flow
- [ ] Multi-step form persists draft across step navigation and away-and-back navigation.
- [ ] Submission triggers admin-queue email within 10 s.
- [ ] Status transitions valid: `draft` → `in_review` → (`approved` | `rejected` → `draft`).
- [ ] Approved apps appear on the public marketplace within 60 s.

### Admin flow
- [ ] Pending queue paginated, oldest-first.
- [ ] Approve / reject requires comment (min 5 chars).
- [ ] Reject comment included in the developer email.
- [ ] Audit log: 1 immutable entry per approve / reject action.

### Cross-cutting
- [ ] All forms client-validated (Zod) + server re-validated.
- [ ] All write actions CSRF-protected (Next.js Server Actions handle this by default).
- [ ] 404 + 500 pages use brand layout.
- [ ] Mobile responsive (≥ 360 px width).
- [ ] Accessibility: keyboard nav, focus rings, alt text on all images.

## 9. Out of Scope (v1)

- ❌ Real payments / Stripe — pricing display only.
- ❌ Real installation onto external storefronts — DB record only.
- ❌ i18n / multi-language — English only.
- ❌ Social sign-in (Google / Apple) — email/password only.
- ❌ Developer reply to reviews — v2.
- ❌ App version diff / rollback — only latest version tracked.
- ❌ Two-factor auth.
- ❌ Public REST API — internal use only.

---

*Approved by Andre Huang on 2026-05-31. Next: Fase 2 — technical plan.*
