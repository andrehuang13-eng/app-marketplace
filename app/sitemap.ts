import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://storestack-marketplace.vercel.app";

  const [apps, categories] = await Promise.all([
    db.app.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
    }),
    db.category.findMany({
      select: { slug: true },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  return [
    { url: `${base}/`, changeFrequency: "daily", priority: 1.0 },
    { url: `${base}/apps`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/search`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/sign-up`, changeFrequency: "monthly", priority: 0.5 },
    ...categories.map((c) => ({
      url: `${base}/categories/${c.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...apps.map((a) => ({
      url: `${base}/apps/${a.slug}`,
      lastModified: a.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
