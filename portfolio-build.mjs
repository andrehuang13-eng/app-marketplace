// Capture marketplace screenshots and build the portfolio PDF.
//
// Auth strategy: sign in through the real /sign-in form for each role,
// reuse the server-issued cookie. Avoids needing the production
// SESSION_SECRET locally.
//
// Run: node portfolio-build.mjs
//
// Outputs:
//   screenshots/*.png — raw screenshots
//   screenshots/_jpg/*.jpg — compressed for PDF embedding
//   storestack-portfolio.pdf — final deliverable

import "dotenv/config";
import puppeteer from "puppeteer-core";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import sharp from "sharp";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const BASE = "https://storestack-marketplace.vercel.app";
const ROOT = resolve(".").replaceAll("\\", "/");
const SEED_PASSWORD = "Password1!";

mkdirSync("screenshots", { recursive: true });

// ---------------------------------------------------------------
// 1. Pick representative users + top app for detail screenshot
// ---------------------------------------------------------------
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const [merchant, developer, admin, topApp] = await Promise.all([
  prisma.user.findFirst({ where: { role: "MERCHANT", status: "ACTIVE" } }),
  prisma.user.findFirst({ where: { role: "DEVELOPER", status: "ACTIVE" } }),
  prisma.user.findFirst({ where: { role: "ADMIN", status: "ACTIVE" } }),
  prisma.app.findFirst({ where: { status: "PUBLISHED", slug: "klavoo" } }) ??
    prisma.app.findFirst({ where: { status: "PUBLISHED" } }),
]);
await prisma.$disconnect();

if (!merchant || !developer || !admin || !topApp) {
  throw new Error("Need at least one merchant, developer, admin, and a published app in the DB.");
}

console.log(`Signing in as merchant=${merchant.email}, developer=${developer.email}, admin=${admin.email}`);

// ---------------------------------------------------------------
// 2. Launch browser; perform sign-in to mint a real session cookie.
// ---------------------------------------------------------------
const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
});

async function signIn(email) {
  const ctx = await browser.createBrowserContext();
  const page = await ctx.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(`${BASE}/sign-in`, { waitUntil: "networkidle2", timeout: 60000 });
  await page.type('input[name="email"]', email);
  await page.type('input[name="password"]', SEED_PASSWORD);
  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle2", timeout: 60000 }).catch(() => null),
    page.click('button[type="submit"]'),
  ]);
  await page.close();
  return ctx;
}

const merchantCtx = await signIn(merchant.email);
const developerCtx = await signIn(developer.email);
const adminCtx = await signIn(admin.email);

async function settle(page) {
  await page.evaluate(() =>
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }),
  );
  await new Promise((r) => setTimeout(r, 600));
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await new Promise((r) => setTimeout(r, 300));
}

async function shot({ ctx, slug, path, viewport }) {
  const useCtx = ctx ?? (await browser.createBrowserContext());
  const page = await useCtx.newPage();
  await page.setViewport(viewport);
  await page.goto(BASE + path, { waitUntil: "networkidle2", timeout: 60000 });
  await settle(page);
  const out = `screenshots/${slug}.png`;
  await page.screenshot({ path: out, fullPage: true });
  console.log("OK", out);
  await page.close();
  if (!ctx) await useCtx.close();
}

const D = { width: 1440, height: 900, deviceScaleFactor: 1 };
const M = { width: 390, height: 844, deviceScaleFactor: 2 };

// Public — anonymous
await shot({ slug: "home-desktop", path: "/", viewport: D });
await shot({ slug: "browse-desktop", path: "/apps", viewport: D });
await shot({ slug: "detail-desktop", path: `/apps/${topApp.slug}`, viewport: D });
await shot({ slug: "search-desktop", path: "/search?q=email", viewport: D });
await shot({ slug: "category-desktop", path: "/categories/email-and-sms", viewport: D });
await shot({ slug: "signup-desktop", path: "/sign-up", viewport: D });

// Mobile
await shot({ slug: "home-mobile", path: "/", viewport: M });
await shot({ slug: "browse-mobile", path: "/apps", viewport: M });
await shot({ slug: "detail-mobile", path: `/apps/${topApp.slug}`, viewport: M });

// Merchant — authed
await shot({ ctx: merchantCtx, slug: "merchant-dashboard", path: "/merchant", viewport: D });
await shot({ ctx: merchantCtx, slug: "merchant-favorites", path: "/merchant/favorites", viewport: D });
await shot({ ctx: merchantCtx, slug: "merchant-reviews", path: "/merchant/reviews", viewport: D });

// Developer — authed
await shot({ ctx: developerCtx, slug: "developer-dashboard", path: "/developer", viewport: D });
await shot({ ctx: developerCtx, slug: "developer-submit", path: "/developer/submit", viewport: D });
await shot({ ctx: developerCtx, slug: "developer-analytics", path: "/developer/analytics", viewport: D });

// Admin — authed
await shot({ ctx: adminCtx, slug: "admin-queue", path: "/admin", viewport: D });
await shot({ ctx: adminCtx, slug: "admin-users", path: "/admin/users", viewport: D });
await shot({ ctx: adminCtx, slug: "admin-categories", path: "/admin/categories", viewport: D });
await shot({ ctx: adminCtx, slug: "admin-audit", path: "/admin/audit", viewport: D });

await merchantCtx.close();
await developerCtx.close();
await adminCtx.close();
await browser.close();

// ---------------------------------------------------------------
// 3. Compress every PNG used by the PDF to JPEG.
// ---------------------------------------------------------------
mkdirSync("screenshots/_jpg", { recursive: true });

const u = (file) => {
  const jpgName = file.replace(/\.png$/i, ".jpg");
  return `file:///${ROOT}/screenshots/_jpg/${jpgName}`;
};
const has = (file) => existsSync(`screenshots/${file}`);

const SOURCES = [
  "home-desktop.png",
  "browse-desktop.png",
  "detail-desktop.png",
  "search-desktop.png",
  "category-desktop.png",
  "signup-desktop.png",
  "home-mobile.png",
  "browse-mobile.png",
  "detail-mobile.png",
  "merchant-dashboard.png",
  "merchant-favorites.png",
  "merchant-reviews.png",
  "developer-dashboard.png",
  "developer-submit.png",
  "developer-analytics.png",
  "admin-queue.png",
  "admin-users.png",
  "admin-categories.png",
  "admin-audit.png",
];
for (const src of SOURCES) {
  if (!has(src)) continue;
  const dst = `screenshots/_jpg/${src.replace(/\.png$/i, ".jpg")}`;
  await sharp(`screenshots/${src}`)
    .resize({ width: 1600, withoutEnlargement: true })
    .jpeg({ quality: 78, mozjpeg: true, progressive: true })
    .toFile(dst);
}
console.log(`Compressed ${SOURCES.length} screenshots → screenshots/_jpg/`);

// ---------------------------------------------------------------
// 4. Assemble the portfolio HTML.
// ---------------------------------------------------------------
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

  * { box-sizing: border-box; }
  html, body {
    margin: 0; padding: 0;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    color: #18181b;
    background: #ffffff;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .page {
    width: 297mm; height: 210mm;
    padding: 18mm 22mm;
    page-break-after: always;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    position: relative;
    background: #ffffff;
  }
  .page:last-child { page-break-after: auto; }

  h1, h2, h3 {
    font-family: 'Inter', system-ui, sans-serif;
    color: #18181b;
    line-height: 1.05;
    letter-spacing: -0.02em;
    font-weight: 600;
  }
  h1 { font-size: 56pt; margin: 0 0 6mm; }
  h2 { font-size: 26pt; margin: 0 0 5mm; }
  h3 { font-size: 14pt; margin: 0 0 3mm; font-weight: 600; }
  p  { font-size: 10pt; line-height: 1.55; color: #3f3f46; margin: 0 0 3mm; }

  .eyebrow {
    font-size: 8pt; letter-spacing: 0.25em; text-transform: uppercase;
    color: #71717a; margin: 0 0 4mm; font-weight: 500;
  }
  .accent { color: #059669; }

  .meta {
    font-size: 8pt; letter-spacing: 0.18em; text-transform: uppercase;
    color: #71717a;
  }

  .footer {
    position: absolute; left: 22mm; right: 22mm; bottom: 10mm;
    display: flex; justify-content: space-between; align-items: center;
    font-size: 7.5pt; letter-spacing: 0.18em; text-transform: uppercase;
    color: #71717a;
    border-top: 1px solid #e4e4e7;
    padding-top: 3mm;
  }

  .shot {
    border: 1px solid #e4e4e7;
    border-radius: 6px;
    overflow: hidden;
    background: #fafafa;
    display: block;
  }
  .shot img {
    display: block; width: 100%; height: 100%;
    object-fit: cover; object-position: top center;
  }
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 6mm; flex: 1; min-height: 0; }
  .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 5mm; flex: 1; min-height: 0; }

  .cover {
    display: grid;
    grid-template-columns: 1fr 1.1fr;
    gap: 14mm;
    align-items: center;
    flex: 1;
  }
  .cover .hero { height: 165mm; }
  .cover .hero img {
    width: 100%; height: 100%;
    object-fit: cover; object-position: top center;
    border: 1px solid #e4e4e7; border-radius: 6px;
  }
  .cover h1 { font-size: 64pt; }
  .cover .lede {
    font-size: 14pt; color: #3f3f46;
    line-height: 1.35; margin: 5mm 0 10mm;
  }
  .cover .links { font-size: 9pt; line-height: 1.7; color: #3f3f46; }
  .cover .links a { color: #18181b; text-decoration: none; border-bottom: 1px solid #d4d4d8; }

  .stack {
    font-size: 9pt; line-height: 1.85; color: #3f3f46;
  }
  .stack strong { color: #18181b; font-weight: 600; }

  .glance-grid {
    display: grid; grid-template-columns: 1.05fr 0.95fr; gap: 12mm;
    flex: 1; align-content: start;
  }

  .caption {
    font-size: 8pt; color: #71717a; margin-top: 2mm; text-align: center;
    letter-spacing: 0.06em;
  }
`;

const PAGES = [
  {
    title: "Cover",
    html: `
      <div class="cover">
        <div>
          <div class="eyebrow">Portfolio Case Study</div>
          <h1>Storestack</h1>
          <div style="font-size:20pt;color:#71717a;font-weight:500;margin-top:-2mm;letter-spacing:-0.01em;">App marketplace</div>
          <p class="lede">A platform-agnostic app marketplace for independent e-commerce merchants — built end-to-end with Next.js 16, Prisma, and custom auth.</p>
          <div class="links">
            <strong style="color:#18181b">Live</strong> · <a href="${BASE}">${BASE.replace("https://", "")}</a><br/>
            <strong style="color:#18181b">Code</strong> · <a href="https://github.com/andrehuang13-eng/app-marketplace">github.com/andrehuang13-eng/app-marketplace</a><br/><br/>
            <span class="meta">Andre Huang · 2026 · Concept project</span>
          </div>
        </div>
        <div class="hero shot"><img src="${u("home-desktop.png")}" /></div>
      </div>
    `,
  },
  {
    title: "At a glance",
    html: `
      <div class="eyebrow">01 · At a glance</div>
      <h2>Three personas, one platform.</h2>
      <div class="glance-grid">
        <div>
          <h3>What it is</h3>
          <p>A marketplace where merchants browse and install apps that extend their e-commerce store, developers publish and manage their listings, and admins moderate the whole thing. Inspired by the Shopify App Store, but platform-agnostic (WooCommerce, Magento, custom storefronts).</p>
          <h3>My role</h3>
          <p>Solo full-stack — product framing, schema, auth, all flows, design system, deploy.</p>
          <h3>Why concept</h3>
          <p>Fictional brief modeled on a real Upwork posting, treated as if a real client had hired me. Every decision had to justify itself against actual constraints.</p>
        </div>
        <div>
          <h3>Stack</h3>
          <div class="stack">
            <strong>Framework</strong> · Next.js 16 (App Router, Server Actions, RSC)<br/>
            <strong>Language</strong> · TypeScript strict, React 19<br/>
            <strong>Data</strong> · Prisma 7 + PostgreSQL on Neon<br/>
            <strong>Styling</strong> · Tailwind v4 · light + dark mode<br/>
            <strong>Auth</strong> · jose JWT + bcryptjs in httpOnly cookie<br/>
            <strong>Validation</strong> · Zod schemas (shared client + server)<br/>
            <strong>Email</strong> · Resend (verify, reset, install confirm, approve/reject)<br/>
            <strong>Tests</strong> · Vitest (17 passing) + Playwright<br/>
            <strong>Host</strong> · Vercel (CI auto-deploy on push)
          </div>
        </div>
      </div>
    `,
  },
  {
    title: "Public — desktop",
    html: `
      <div class="eyebrow">02 · Public marketplace</div>
      <h2>Browse, search, dive in.</h2>
      <p style="max-width: 200mm;">Home (featured + categories + latest), browse-all with category/pricing/sort filters, app detail with sanitized Markdown, rating breakdown, similar apps.</p>
      <div class="grid-3" style="margin-top: 5mm;">
        <div class="shot"><img src="${u("home-desktop.png")}" /></div>
        <div class="shot"><img src="${u("browse-desktop.png")}" /></div>
        <div class="shot"><img src="${u("detail-desktop.png")}" /></div>
      </div>
    `,
  },
  {
    title: "Mobile",
    html: `
      <div class="eyebrow">03 · Responsive</div>
      <h2>Same care on small screens.</h2>
      <p style="max-width: 200mm;">Single column, full-width cards, mobile-first form layouts. Every page tested at 390px viewport before ship.</p>
      <div class="grid-3" style="margin-top: 5mm;">
        <div class="shot" style="max-height: 135mm;"><img src="${u("home-mobile.png")}" /></div>
        <div class="shot" style="max-height: 135mm;"><img src="${u("browse-mobile.png")}" /></div>
        <div class="shot" style="max-height: 135mm;"><img src="${u("detail-mobile.png")}" /></div>
      </div>
    `,
  },
  {
    title: "Merchant area",
    html: `
      <div class="eyebrow">04 · Merchant area</div>
      <h2>Install. Configure. Review.</h2>
      <p style="max-width: 200mm;">Merchants see only their installed apps, can configure each (mocked API key + webhook URL), favorite for later, and write reviews — only for apps they've actually installed.</p>
      <div class="grid-3" style="margin-top: 5mm;">
        <div class="shot"><img src="${u("merchant-dashboard.png")}" /></div>
        <div class="shot"><img src="${u("merchant-favorites.png")}" /></div>
        <div class="shot"><img src="${u("merchant-reviews.png")}" /></div>
      </div>
    `,
  },
  {
    title: "Developer area",
    html: `
      <div class="eyebrow">05 · Developer area</div>
      <h2>Submit, manage, see installs roll in.</h2>
      <p style="max-width: 200mm;">Developers submit apps via a single-form flow (Save-draft or Submit-for-review), edit them with auto-resubmission, and see real per-app install/review/favorite counts on Analytics.</p>
      <div class="grid-3" style="margin-top: 5mm;">
        <div class="shot"><img src="${u("developer-dashboard.png")}" /></div>
        <div class="shot"><img src="${u("developer-submit.png")}" /></div>
        <div class="shot"><img src="${u("developer-analytics.png")}" /></div>
      </div>
    `,
  },
  {
    title: "Admin area",
    html: `
      <div class="eyebrow">06 · Admin area</div>
      <h2>Moderate the marketplace.</h2>
      <p style="max-width: 200mm;">Approve / reject submissions with a mandatory comment (Resend email goes to the developer immediately), manage categories with use-count protection, suspend or reinstate users, browse an immutable audit log.</p>
      <div class="grid-2" style="margin-top: 5mm;">
        <div class="shot"><img src="${u("admin-queue.png")}" /></div>
        <div class="shot"><img src="${u("admin-users.png")}" /></div>
      </div>
    `,
  },
  {
    title: "Engineering notes",
    html: `
      <div class="eyebrow">07 · Engineering notes</div>
      <h2>Decisions worth calling out.</h2>
      <div class="glance-grid" style="grid-template-columns: 1fr 1fr; gap: 12mm;">
        <div>
          <h3>Custom session, no library</h3>
          <p>jose-signed JWT in an httpOnly cookie, bcryptjs hashes — straight from the Next.js 16 auth guide. Skipped Auth.js v5 (still beta, Next 16 renamed middleware → proxy).</p>
          <h3>Server Actions everywhere</h3>
          <p>Every mutation — signup, install, review, submit, approve — runs as a Server Action. Built-in CSRF, type-safe RPC, React 19 form integration via useActionState. Zero hand-rolled API routes.</p>
          <h3>One Zod, both sides</h3>
          <p>Each form's validation lives in lib/validators and runs on the client (RHF) and server (Action). Drift is structurally impossible.</p>
        </div>
        <div>
          <h3>Prisma 7's driver adapter</h3>
          <p>v7 dropped the implicit library engine — every PrismaClient now needs a driver adapter or Accelerate. Lightweight: @prisma/adapter-pg + pg. Works on Vercel Node runtime and locally with no per-environment config.</p>
          <h3>Email survives serverless</h3>
          <p>Resend send is awaited inside the action so the function doesn't freeze before delivery. Sandbox sender (no domain verification) only delivers to the signup email — documented for future maintainers.</p>
          <h3>Immutable audit log</h3>
          <p>Every admin write goes through a Prisma $transaction that also inserts an AuditLog row. The audit page is read-only — no write paths to delete a record.</p>
        </div>
      </div>
    `,
  },
];

const html = `<!doctype html>
<html><head><meta charset="utf-8" /><title>Storestack · Case Study</title>
<style>${css}</style></head>
<body>
${PAGES.map(
  (p, i) => `
  <div class="page">
    ${p.html}
    <div class="footer">
      <span>Storestack · App marketplace case study</span>
      <span>${String(i + 1).padStart(2, "0")} / ${String(PAGES.length).padStart(2, "0")}</span>
    </div>
  </div>`,
).join("\n")}
</body></html>`;

writeFileSync("portfolio.html", html);
console.log("Wrote portfolio.html");

// ---------------------------------------------------------------
// 5. Render HTML → PDF
// ---------------------------------------------------------------
const browser2 = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--allow-file-access-from-files"],
});
const page = await browser2.newPage();
await page.goto(`file:///${ROOT}/portfolio.html`, { waitUntil: "networkidle2" });
await new Promise((r) => setTimeout(r, 800));
await page.pdf({
  path: "storestack-portfolio.pdf",
  width: "297mm",
  height: "210mm",
  printBackground: true,
  margin: { top: 0, right: 0, bottom: 0, left: 0 },
  preferCSSPageSize: false,
});
await browser2.close();
console.log("Wrote storestack-portfolio.pdf");
