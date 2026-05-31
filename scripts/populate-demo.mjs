// One-off: populate demo-state data so admin queue and merchant
// favorites screenshots have content. Safe to re-run (idempotent
// on slug uniqueness).

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

const merchants = await db.user.findMany({
  where: { role: "MERCHANT", status: "ACTIVE" },
  select: { id: true, email: true },
});
const developers = await db.user.findMany({
  where: { role: "DEVELOPER", status: "ACTIVE" },
  select: { id: true, email: true },
});
const categories = await db.category.findMany({
  select: { id: true, slug: true },
});
const apps = await db.app.findMany({
  where: { status: "PUBLISHED" },
  select: { id: true, slug: true },
});

const categoryBySlug = new Map(categories.map((c) => [c.slug, c.id]));
const appBySlug = new Map(apps.map((a) => [a.slug, a.id]));

// 1. Favorites for merchants — saved for later
const favTargets = [
  { merchantEmail: merchants[0].email, slugs: ["mailwave", "tradar-insights", "pixelpeek"] },
  { merchantEmail: merchants[1].email, slugs: ["klavoo", "chathive"] },
];
for (const { merchantEmail, slugs } of favTargets) {
  const merchant = merchants.find((m) => m.email === merchantEmail);
  if (!merchant) continue;
  for (const slug of slugs) {
    const appId = appBySlug.get(slug);
    if (!appId) continue;
    await db.favorite.upsert({
      where: { userId_appId: { userId: merchant.id, appId } },
      update: {},
      create: { userId: merchant.id, appId },
    });
  }
}
console.log("Favorites populated.");

// 2. Two IN_REVIEW submissions for admin queue
const inReviewApps = [
  {
    slug: "loyalee",
    name: "Loyalee",
    tagline: "Drop-in loyalty program with points, tiers, and referrals.",
    descriptionMd:
      "**Loyalee** is a friction-light loyalty program for independent merchants.\n\n" +
      "- Points on purchase, signup, review, birthday\n" +
      "- Three tier ladder out of the box\n" +
      "- Referral code sharing with first-purchase reward\n\n" +
      "## Pricing\n\nStarts at $19/mo for up to 500 active members.",
    pricingModel: "PAID",
    categorySlug: "customer-support",
    developerEmail: developers[0].email,
  },
  {
    slug: "swatch",
    name: "Swatch",
    tagline: "Side-by-side product comparison widget for your storefront.",
    descriptionMd:
      "**Swatch** drops a clean comparison module into any product page.\n\n" +
      "- Compare specs, pricing, ratings across up to 4 products\n" +
      "- Auto-suggests \"similar\" candidates based on category\n" +
      "- Free up to 100 product slots\n",
    pricingModel: "FREEMIUM",
    categorySlug: "reviews",
    developerEmail: developers[1].email,
  },
];

for (const a of inReviewApps) {
  const existing = await db.app.findUnique({ where: { slug: a.slug } });
  if (existing) {
    console.log(`Skipping ${a.slug} (already exists)`);
    continue;
  }
  const developer = developers.find((d) => d.email === a.developerEmail);
  const categoryId = categoryBySlug.get(a.categorySlug);
  if (!developer || !categoryId) {
    console.log(`Cannot create ${a.slug}: missing developer or category`);
    continue;
  }
  await db.app.create({
    data: {
      slug: a.slug,
      name: a.name,
      tagline: a.tagline,
      descriptionMd: a.descriptionMd,
      pricingModel: a.pricingModel,
      categoryId,
      developerId: developer.id,
      status: "IN_REVIEW",
      versions: {
        create: {
          version: "1.0.0",
          changelog: "Initial submission.",
        },
      },
    },
  });
  console.log(`Created IN_REVIEW: ${a.slug}`);
}

await db.$disconnect();
console.log("Done.");
