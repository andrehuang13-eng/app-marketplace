import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const db = new PrismaClient({ adapter });

const PASSWORD = "Password1!";

interface CategorySeed {
  slug: string;
  name: string;
  sortOrder: number;
}

const categories: CategorySeed[] = [
  { slug: "email-and-sms", name: "Email & SMS", sortOrder: 1 },
  { slug: "reviews", name: "Reviews", sortOrder: 2 },
  { slug: "shipping-and-fulfillment", name: "Shipping & Fulfillment", sortOrder: 3 },
  { slug: "inventory", name: "Inventory", sortOrder: 4 },
  { slug: "customer-support", name: "Customer Support", sortOrder: 5 },
  { slug: "analytics", name: "Analytics", sortOrder: 6 },
];

interface AppSeed {
  slug: string;
  name: string;
  tagline: string;
  descriptionMd: string;
  pricingModel: "FREE" | "FREEMIUM" | "PAID";
  categorySlug: string;
  developerEmail: string;
  featured: boolean;
}

const apps: AppSeed[] = [
  {
    slug: "klavoo",
    name: "Klavoo",
    tagline: "Email marketing automation that converts browsers into buyers.",
    descriptionMd:
      "**Klavoo** is a full-stack email marketing platform built for independent merchants.\n\n" +
      "- Behavioural segmentation based on browse + cart events\n" +
      "- Pre-built welcome, abandoned cart, and win-back automations\n" +
      "- A/B test subject lines with confidence intervals\n" +
      "- Drag-and-drop email editor with brand-kit support\n\n" +
      "## Pricing\n\nStarts at $20/mo for up to 1,000 contacts. 14-day free trial.",
    pricingModel: "PAID",
    categorySlug: "email-and-sms",
    developerEmail: "team@brightroot.dev",
    featured: true,
  },
  {
    slug: "mailwave",
    name: "Mailwave",
    tagline: "Free transactional email with a generous tier and clean delivery.",
    descriptionMd:
      "**Mailwave** keeps your order confirmations, shipping updates, and password resets out of the spam folder.\n\n" +
      "- 10,000 emails per month free\n" +
      "- Webhook on every delivery event\n" +
      "- DKIM + SPF auto-setup for your custom domain\n",
    pricingModel: "FREEMIUM",
    categorySlug: "email-and-sms",
    developerEmail: "team@brightroot.dev",
    featured: false,
  },
  {
    slug: "trustfold",
    name: "Trustfold",
    tagline: "Collect, moderate, and showcase product reviews.",
    descriptionMd:
      "**Trustfold** automates the review request flow and surfaces social proof where it matters.\n\n" +
      "- Post-purchase review request emails\n" +
      "- Photo + video reviews with auto-moderation\n" +
      "- Carousel + grid widgets to embed in product pages\n",
    pricingModel: "FREEMIUM",
    categorySlug: "reviews",
    developerEmail: "team@brightroot.dev",
    featured: true,
  },
  {
    slug: "reviewly",
    name: "Reviewly",
    tagline: "Lightweight review collection without the bloat.",
    descriptionMd:
      "**Reviewly** is the no-frills review widget. Add a single script tag and you're done.\n\n" +
      "- One-click install\n" +
      "- 100% free for under 500 reviews\n" +
      "- Honest moderation queue\n",
    pricingModel: "FREE",
    categorySlug: "reviews",
    developerEmail: "hello@plycraft.io",
    featured: false,
  },
  {
    slug: "shipquick",
    name: "ShipQuick",
    tagline: "Multi-carrier shipping label printing with discounted rates.",
    descriptionMd:
      "**ShipQuick** plugs into your storefront and prints labels for 40+ carriers.\n\n" +
      "- Negotiated rates on USPS, UPS, FedEx, DHL\n" +
      "- Batch print up to 500 labels in one click\n" +
      "- International customs forms generated automatically\n",
    pricingModel: "PAID",
    categorySlug: "shipping-and-fulfillment",
    developerEmail: "hello@plycraft.io",
    featured: true,
  },
  {
    slug: "labelkit",
    name: "LabelKit",
    tagline: "Free shipping label generator for small stores.",
    descriptionMd:
      "**LabelKit** generates standard 4×6 shipping labels straight from your order list.\n\n" +
      "- USPS and Canada Post out of the box\n" +
      "- No monthly fees, pay carrier rates only\n",
    pricingModel: "FREE",
    categorySlug: "shipping-and-fulfillment",
    developerEmail: "hello@plycraft.io",
    featured: false,
  },
  {
    slug: "stockfly",
    name: "Stockfly",
    tagline: "Real-time inventory sync across every sales channel.",
    descriptionMd:
      "**Stockfly** keeps your inventory accurate whether you sell on WooCommerce, Magento, eBay, or in-person.\n\n" +
      "- Sub-second sync across channels\n" +
      "- Reorder alerts based on velocity\n" +
      "- Multi-warehouse support\n",
    pricingModel: "PAID",
    categorySlug: "inventory",
    developerEmail: "team@brightroot.dev",
    featured: true,
  },
  {
    slug: "restocknow",
    name: "RestockNow",
    tagline: "Predictive restock alerts based on your sales velocity.",
    descriptionMd:
      "**RestockNow** watches your sales and tells you what to reorder before you run out.\n\n" +
      "- Seasonal trend detection\n" +
      "- One-click PO drafts\n" +
      "- Free for up to 50 SKUs\n",
    pricingModel: "FREEMIUM",
    categorySlug: "inventory",
    developerEmail: "hello@plycraft.io",
    featured: false,
  },
  {
    slug: "chathive",
    name: "Chathive",
    tagline: "Unified inbox for email, chat, and social DMs.",
    descriptionMd:
      "**Chathive** turns customer support chaos into a single tidy inbox.\n\n" +
      "- Connect Instagram, WhatsApp, Messenger, email, and live chat\n" +
      "- AI suggested replies trained on your past conversations\n" +
      "- SLA timers + escalation rules\n",
    pricingModel: "PAID",
    categorySlug: "customer-support",
    developerEmail: "team@brightroot.dev",
    featured: true,
  },
  {
    slug: "helpnest",
    name: "HelpNest",
    tagline: "A free, embeddable knowledge base for small stores.",
    descriptionMd:
      "**HelpNest** is a simple knowledge base widget for your storefront.\n\n" +
      "- Drag-and-drop article editor\n" +
      "- Built-in search bar\n" +
      "- Hosted on your subdomain\n",
    pricingModel: "FREE",
    categorySlug: "customer-support",
    developerEmail: "hello@plycraft.io",
    featured: false,
  },
  {
    slug: "tradar-insights",
    name: "Tradar Insights",
    tagline: "Conversion analytics with attribution that actually works.",
    descriptionMd:
      "**Tradar Insights** combines server-side tracking with cookie-less attribution to give you a clear picture of what drives revenue.\n\n" +
      "- Multi-touch attribution across channels\n" +
      "- Cohort retention dashboards\n" +
      "- Funnel drop-off analysis\n",
    pricingModel: "PAID",
    categorySlug: "analytics",
    developerEmail: "team@brightroot.dev",
    featured: true,
  },
  {
    slug: "pixelpeek",
    name: "PixelPeek",
    tagline: "Free heatmaps and session recordings for your storefront.",
    descriptionMd:
      "**PixelPeek** shows you where customers click, scroll, and rage-quit.\n\n" +
      "- 100% free for under 5,000 monthly sessions\n" +
      "- Session recordings with privacy redaction\n" +
      "- Click heatmaps + scroll depth maps\n",
    pricingModel: "FREE",
    categorySlug: "analytics",
    developerEmail: "hello@plycraft.io",
    featured: false,
  },
];

interface DeveloperSeed {
  email: string;
  name: string;
  companyName: string;
  bio: string;
}

const developers: DeveloperSeed[] = [
  {
    email: "team@brightroot.dev",
    name: "Brightroot Studio",
    companyName: "Brightroot Studio",
    bio: "Brightroot builds premium tools that help indie merchants scale operations without losing their craft.",
  },
  {
    email: "hello@plycraft.io",
    name: "Plycraft",
    companyName: "Plycraft Labs",
    bio: "Plycraft makes simple, fast tools — free where we can, fair where we can't.",
  },
];

interface MerchantSeed {
  email: string;
  name: string;
}

const merchants: MerchantSeed[] = [
  { email: "olivia@brewroom.co", name: "Olivia Greer" },
  { email: "marcus@stonefieldgoods.com", name: "Marcus Stonefield" },
];

interface AdminSeed {
  email: string;
  name: string;
}

const admins: AdminSeed[] = [
  { email: "ada@storestack.dev", name: "Ada Hong" },
  { email: "noah@storestack.dev", name: "Noah Persson" },
];

async function main() {
  console.log("Resetting marketplace data…");
  await db.auditLog.deleteMany();
  await db.reviewQueueComment.deleteMany();
  await db.review.deleteMany();
  await db.favorite.deleteMany();
  await db.install.deleteMany();
  await db.appVersion.deleteMany();
  await db.appScreenshot.deleteMany();
  await db.app.deleteMany();
  await db.category.deleteMany();
  await db.developer.deleteMany();
  await db.emailVerificationToken.deleteMany();
  await db.passwordResetToken.deleteMany();
  await db.user.deleteMany();
  await db.setting.deleteMany();

  console.log("Hashing seed password…");
  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  console.log("Creating categories…");
  const categoryRows = await Promise.all(
    categories.map((c) =>
      db.category.create({
        data: c,
        select: { id: true, slug: true },
      }),
    ),
  );
  const categoryBySlug = new Map(categoryRows.map((c) => [c.slug, c.id]));

  console.log("Creating developers…");
  const developerRows = await Promise.all(
    developers.map((d) =>
      db.user.create({
        data: {
          email: d.email,
          name: d.name,
          passwordHash,
          role: "DEVELOPER",
          status: "ACTIVE",
          emailVerifiedAt: new Date(),
          developer: {
            create: {
              companyName: d.companyName,
              bio: d.bio,
              supportEmail: d.email,
            },
          },
        },
        select: { id: true, email: true },
      }),
    ),
  );
  const developerByEmail = new Map(developerRows.map((d) => [d.email, d.id]));

  console.log("Creating merchants…");
  const merchantRows = await Promise.all(
    merchants.map((m) =>
      db.user.create({
        data: {
          email: m.email,
          name: m.name,
          passwordHash,
          role: "MERCHANT",
          status: "ACTIVE",
          emailVerifiedAt: new Date(),
        },
        select: { id: true, email: true },
      }),
    ),
  );

  console.log("Creating admins…");
  const adminRows = await Promise.all(
    admins.map((a) =>
      db.user.create({
        data: {
          email: a.email,
          name: a.name,
          passwordHash,
          role: "ADMIN",
          status: "ACTIVE",
          emailVerifiedAt: new Date(),
        },
        select: { id: true, email: true },
      }),
    ),
  );

  console.log("Creating apps…");
  const appRows = await Promise.all(
    apps.map((a) =>
      db.app.create({
        data: {
          slug: a.slug,
          name: a.name,
          tagline: a.tagline,
          descriptionMd: a.descriptionMd,
          pricingModel: a.pricingModel,
          categoryId: categoryBySlug.get(a.categorySlug)!,
          developerId: developerByEmail.get(a.developerEmail)!,
          status: "PUBLISHED",
          featured: a.featured,
          publishedAt: new Date(),
          versions: {
            create: {
              version: "1.0.0",
              changelog: "Initial public release.",
            },
          },
        },
        select: { id: true, slug: true },
      }),
    ),
  );
  const appBySlug = new Map(appRows.map((a) => [a.slug, a.id]));

  console.log("Creating installs + reviews…");
  const merchantAInstalls = ["klavoo", "stockfly", "chathive", "trustfold"];
  const merchantBInstalls = ["mailwave", "shipquick", "tradar-insights"];

  for (const slug of merchantAInstalls) {
    await db.install.create({
      data: {
        userId: merchantRows[0].id,
        appId: appBySlug.get(slug)!,
        configStatus: "ACTIVE",
      },
    });
  }
  for (const slug of merchantBInstalls) {
    await db.install.create({
      data: {
        userId: merchantRows[1].id,
        appId: appBySlug.get(slug)!,
        configStatus: slug === "shipquick" ? "NEEDS_CONFIG" : "ACTIVE",
      },
    });
  }

  await db.review.create({
    data: {
      userId: merchantRows[0].id,
      appId: appBySlug.get("klavoo")!,
      rating: 5,
      body: "Set up two welcome flows in 20 minutes. Open rates jumped from 22% to 38%. Worth every penny.",
    },
  });
  await db.review.create({
    data: {
      userId: merchantRows[0].id,
      appId: appBySlug.get("stockfly")!,
      rating: 4,
      body: "Inventory sync is genuinely real-time. Wish multi-warehouse setup was simpler, but support helped me through it.",
    },
  });
  await db.review.create({
    data: {
      userId: merchantRows[1].id,
      appId: appBySlug.get("shipquick")!,
      rating: 5,
      body: "Saved us about $0.40 per US domestic label. At our volume that's hundreds a month.",
    },
  });
  await db.review.create({
    data: {
      userId: merchantRows[1].id,
      appId: appBySlug.get("tradar-insights")!,
      rating: 4,
      body: "Attribution finally makes sense. Took a day to dial in the channel mapping.",
    },
  });

  console.log("Creating audit log entries…");
  await db.auditLog.create({
    data: {
      actorId: adminRows[0].id,
      action: "app.approve",
      targetType: "App",
      targetId: appBySlug.get("klavoo")!,
      metadataJson: { comment: "Onboarding flow looks solid. Approved for marketplace." },
    },
  });
  await db.auditLog.create({
    data: {
      actorId: adminRows[0].id,
      action: "app.approve",
      targetType: "App",
      targetId: appBySlug.get("trustfold")!,
      metadataJson: { comment: "Review moderation looks robust. Approved." },
    },
  });

  console.log("Creating settings…");
  await db.setting.create({
    data: {
      key: "announcement_banner",
      valueJson: { enabled: false, message: "", type: "info" },
    },
  });

  console.log("\nSeed complete.");
  console.log(`Login password for all seeded accounts: ${PASSWORD}`);
  console.log("Merchants:", merchants.map((m) => m.email).join(", "));
  console.log("Developers:", developers.map((d) => d.email).join(", "));
  console.log("Admins:", admins.map((a) => a.email).join(", "));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
