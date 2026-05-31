import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://storestack-marketplace.vercel.app";
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/merchant", "/developer", "/admin"] },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
