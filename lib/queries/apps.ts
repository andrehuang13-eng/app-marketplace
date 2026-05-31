import "server-only";
import { db } from "@/lib/db";
import type { AppStatus, Prisma } from "@prisma/client";

const PUBLIC_STATUS: AppStatus = "PUBLISHED";

const appCardSelect = {
  id: true,
  slug: true,
  name: true,
  tagline: true,
  iconUrl: true,
  pricingModel: true,
  publishedAt: true,
  category: { select: { slug: true, name: true } },
  developer: { select: { name: true } },
  _count: { select: { installs: true, reviews: true } },
  reviews: { select: { rating: true } },
} satisfies Prisma.AppSelect;

export type AppCard = Prisma.AppGetPayload<{ select: typeof appCardSelect }>;

export interface AppCardView extends AppCard {
  ratingAverage: number | null;
  installCount: number;
  reviewCount: number;
}

function withDerived(app: AppCard): AppCardView {
  const reviews = app.reviews;
  const total = reviews.reduce((sum, r) => sum + r.rating, 0);
  const ratingAverage = reviews.length > 0 ? total / reviews.length : null;
  return {
    ...app,
    ratingAverage,
    installCount: app._count.installs,
    reviewCount: app._count.reviews,
  };
}

export async function getFeaturedApps(limit = 6): Promise<AppCardView[]> {
  const rows = await db.app.findMany({
    where: { status: PUBLIC_STATUS, featured: true },
    orderBy: { publishedAt: "desc" },
    select: appCardSelect,
    take: limit,
  });
  return rows.map(withDerived);
}

export async function getLatestApps(limit = 12): Promise<AppCardView[]> {
  const rows = await db.app.findMany({
    where: { status: PUBLIC_STATUS },
    orderBy: { publishedAt: "desc" },
    select: appCardSelect,
    take: limit,
  });
  return rows.map(withDerived);
}

export interface BrowseFilters {
  categorySlug?: string;
  pricing?: ("FREE" | "FREEMIUM" | "PAID")[];
  sort?: "popularity" | "rating" | "newest" | "name";
}

export async function browseApps(filters: BrowseFilters): Promise<AppCardView[]> {
  const where: Prisma.AppWhereInput = { status: PUBLIC_STATUS };
  if (filters.categorySlug) {
    where.category = { slug: filters.categorySlug };
  }
  if (filters.pricing && filters.pricing.length > 0) {
    where.pricingModel = { in: filters.pricing };
  }

  let orderBy: Prisma.AppOrderByWithRelationInput | Prisma.AppOrderByWithRelationInput[];
  switch (filters.sort) {
    case "popularity":
      orderBy = { installs: { _count: "desc" } };
      break;
    case "newest":
      orderBy = { publishedAt: "desc" };
      break;
    case "name":
      orderBy = { name: "asc" };
      break;
    case "rating":
    default:
      orderBy = { publishedAt: "desc" };
  }

  const rows = await db.app.findMany({
    where,
    orderBy,
    select: appCardSelect,
  });
  const views = rows.map(withDerived);
  if (filters.sort === "rating") {
    views.sort((a, b) => (b.ratingAverage ?? 0) - (a.ratingAverage ?? 0));
  }
  return views;
}

export async function searchApps(query: string): Promise<AppCardView[]> {
  const q = query.trim();
  if (q.length === 0) return [];
  const rows = await db.app.findMany({
    where: {
      status: PUBLIC_STATUS,
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { tagline: { contains: q, mode: "insensitive" } },
        { descriptionMd: { contains: q, mode: "insensitive" } },
        { developer: { name: { contains: q, mode: "insensitive" } } },
      ],
    },
    orderBy: { name: "asc" },
    select: appCardSelect,
  });
  return rows.map(withDerived);
}

export async function getAllCategories() {
  return db.category.findMany({
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      slug: true,
      name: true,
      _count: { select: { apps: { where: { status: PUBLIC_STATUS } } } },
    },
  });
}

export async function getCategoryBySlug(slug: string) {
  return db.category.findUnique({
    where: { slug },
    select: { id: true, slug: true, name: true },
  });
}

export async function getAppBySlug(slug: string) {
  const app = await db.app.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      name: true,
      tagline: true,
      descriptionMd: true,
      iconUrl: true,
      pricingModel: true,
      currentVersion: true,
      publishedAt: true,
      status: true,
      categoryId: true,
      category: { select: { id: true, slug: true, name: true } },
      developer: {
        select: {
          name: true,
          developer: { select: { companyName: true, bio: true, supportEmail: true } },
        },
      },
      screenshots: {
        orderBy: { sortOrder: "asc" },
        select: { id: true, url: true, caption: true },
      },
      versions: {
        orderBy: { publishedAt: "desc" },
        select: { id: true, version: true, changelog: true, publishedAt: true },
        take: 5,
      },
      _count: { select: { installs: true, reviews: true } },
    },
  });
  if (!app || app.status !== PUBLIC_STATUS) return null;
  return app;
}

export async function getReviewsForApp(appId: string, page = 1, pageSize = 10) {
  const skip = (page - 1) * pageSize;
  const [reviews, total] = await Promise.all([
    db.review.findMany({
      where: { appId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        rating: true,
        body: true,
        createdAt: true,
        user: { select: { name: true } },
      },
      skip,
      take: pageSize,
    }),
    db.review.count({ where: { appId } }),
  ]);

  const ratingBuckets = await db.review.groupBy({
    by: ["rating"],
    where: { appId },
    _count: { rating: true },
  });
  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const b of ratingBuckets) counts[b.rating] = b._count.rating;
  const avg =
    total === 0
      ? null
      : ratingBuckets.reduce((sum, b) => sum + b.rating * b._count.rating, 0) / total;

  return {
    reviews,
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
    ratingAverage: avg,
    ratingCounts: counts,
  };
}

export async function getSimilarApps(
  appId: string,
  categoryId: string,
  limit = 4,
): Promise<AppCardView[]> {
  const rows = await db.app.findMany({
    where: {
      status: PUBLIC_STATUS,
      categoryId,
      NOT: { id: appId },
    },
    orderBy: { publishedAt: "desc" },
    select: appCardSelect,
    take: limit,
  });
  return rows.map(withDerived);
}
