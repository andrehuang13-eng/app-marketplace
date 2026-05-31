import "server-only";
import { db } from "@/lib/db";

export async function getMyApps(userId: string) {
  return db.app.findMany({
    where: { developerId: userId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      slug: true,
      name: true,
      tagline: true,
      iconUrl: true,
      pricingModel: true,
      status: true,
      publishedAt: true,
      updatedAt: true,
      category: { select: { id: true, slug: true, name: true } },
      _count: { select: { installs: true, reviews: true } },
    },
  });
}

export async function getMyAppForEdit(userId: string, appId: string) {
  return db.app.findFirst({
    where: { id: appId, developerId: userId },
    select: {
      id: true,
      slug: true,
      name: true,
      tagline: true,
      descriptionMd: true,
      iconUrl: true,
      pricingModel: true,
      status: true,
      categoryId: true,
    },
  });
}

export async function getDeveloperProfile(userId: string) {
  return db.developer.findUnique({
    where: { userId },
    select: {
      companyName: true,
      bio: true,
      supportEmail: true,
      logoUrl: true,
    },
  });
}

export async function getDeveloperAnalyticsBasics(userId: string) {
  const apps = await db.app.findMany({
    where: { developerId: userId, status: "PUBLISHED" },
    select: {
      id: true,
      slug: true,
      name: true,
      _count: { select: { installs: true, reviews: true, favorites: true } },
      reviews: { select: { rating: true } },
    },
  });
  return apps.map((a) => {
    const ratingAvg =
      a.reviews.length > 0
        ? a.reviews.reduce((s, r) => s + r.rating, 0) / a.reviews.length
        : null;
    return {
      id: a.id,
      slug: a.slug,
      name: a.name,
      installs: a._count.installs,
      reviews: a._count.reviews,
      favorites: a._count.favorites,
      ratingAvg,
    };
  });
}
