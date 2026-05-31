import "server-only";
import { db } from "@/lib/db";

export async function getReviewQueue() {
  return db.app.findMany({
    where: { status: "IN_REVIEW" },
    orderBy: { updatedAt: "asc" },
    select: {
      id: true,
      slug: true,
      name: true,
      tagline: true,
      iconUrl: true,
      pricingModel: true,
      updatedAt: true,
      category: { select: { name: true } },
      developer: {
        select: { name: true, email: true, developer: { select: { companyName: true } } },
      },
    },
  });
}

export async function getAppForReview(appId: string) {
  return db.app.findUnique({
    where: { id: appId },
    select: {
      id: true,
      slug: true,
      name: true,
      tagline: true,
      descriptionMd: true,
      iconUrl: true,
      pricingModel: true,
      status: true,
      currentVersion: true,
      updatedAt: true,
      category: { select: { name: true } },
      developer: {
        select: {
          id: true,
          name: true,
          email: true,
          developer: { select: { companyName: true, bio: true, supportEmail: true } },
        },
      },
    },
  });
}

export async function getCategoriesForAdmin() {
  return db.category.findMany({
    orderBy: { sortOrder: "asc" },
    select: { id: true, slug: true, name: true, sortOrder: true, _count: { select: { apps: true } } },
  });
}

export async function searchUsers(query: string) {
  const q = query.trim();
  return db.user.findMany({
    where: q
      ? {
          OR: [
            { email: { contains: q, mode: "insensitive" } },
            { name: { contains: q, mode: "insensitive" } },
          ],
        }
      : {},
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      createdAt: true,
      emailVerifiedAt: true,
    },
    take: 50,
  });
}

export async function getAuditLog(limit = 50) {
  return db.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      action: true,
      targetType: true,
      targetId: true,
      metadataJson: true,
      createdAt: true,
      actor: { select: { id: true, name: true, email: true } },
    },
    take: limit,
  });
}

export async function getAllAppsForAdmin() {
  return db.app.findMany({
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
      category: { select: { name: true } },
      developer: { select: { name: true, email: true } },
      _count: { select: { installs: true, reviews: true } },
    },
    take: 200,
  });
}

export async function getSettings() {
  const rows = await db.setting.findMany();
  const map: Record<string, unknown> = {};
  for (const r of rows) map[r.key] = r.valueJson;
  return map;
}

export async function getAllPublishedAppsSimple() {
  return db.app.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true, featured: true },
  });
}
