import "server-only";
import { db } from "@/lib/db";

export async function getInstalledApps(userId: string) {
  return db.install.findMany({
    where: { userId },
    orderBy: { installedAt: "desc" },
    select: {
      id: true,
      installedAt: true,
      configStatus: true,
      configJson: true,
      app: {
        select: {
          id: true,
          slug: true,
          name: true,
          tagline: true,
          iconUrl: true,
          pricingModel: true,
          category: { select: { slug: true, name: true } },
        },
      },
    },
  });
}

export async function getFavoriteApps(userId: string) {
  return db.favorite.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      createdAt: true,
      app: {
        select: {
          id: true,
          slug: true,
          name: true,
          tagline: true,
          iconUrl: true,
          pricingModel: true,
          category: { select: { slug: true, name: true } },
        },
      },
    },
  });
}

export async function getMyReviews(userId: string) {
  return db.review.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      rating: true,
      body: true,
      updatedAt: true,
      createdAt: true,
      app: {
        select: {
          id: true,
          slug: true,
          name: true,
          iconUrl: true,
        },
      },
    },
  });
}

export async function getInstallByUserAndApp(userId: string, appId: string) {
  return db.install.findUnique({
    where: { userId_appId: { userId, appId } },
    select: {
      id: true,
      installedAt: true,
      configStatus: true,
      configJson: true,
      app: {
        select: { id: true, slug: true, name: true, iconUrl: true },
      },
    },
  });
}

export async function isFavorited(userId: string, appId: string): Promise<boolean> {
  const row = await db.favorite.findUnique({
    where: { userId_appId: { userId, appId } },
    select: { id: true },
  });
  return Boolean(row);
}

export async function getMyReviewForApp(userId: string, appId: string) {
  return db.review.findUnique({
    where: { userId_appId: { userId, appId } },
    select: { id: true, rating: true, body: true },
  });
}
