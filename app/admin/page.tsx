import Link from "next/link";
import { requireRole } from "@/lib/auth/dal";
import { getReviewQueue } from "@/lib/queries/admin";
import { AppIcon, PricingBadge } from "@/components/app-card";
import { db } from "@/lib/db";
import { DashboardStats } from "@/components/dashboard-stats";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";

export const metadata = { title: "Review queue" };

type SearchParams = Promise<{ action?: string }>;

export default async function AdminReviewQueuePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await requireRole("ADMIN");
  const params = await searchParams;
  const [queue, publishedCount, totalUsers, totalApps] = await Promise.all([
    getReviewQueue(),
    db.app.count({ where: { status: "PUBLISHED" } }),
    db.user.count(),
    db.app.count(),
  ]);

  return (
    <div className="space-y-8">
      {params.action === "approved" && (
        <div className="glass rounded-2xl border border-lime-400/20 bg-lime-400/[0.06] px-4 py-3 text-sm text-lime-300">
          <span className="font-mono text-[10px] uppercase tracking-widest">/ approved ·</span>{" "}
          App is now published.
        </div>
      )}
      {params.action === "rejected" && (
        <div className="glass rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] px-4 py-3 text-sm text-amber-300">
          <span className="font-mono text-[10px] uppercase tracking-widest">/ rejected ·</span>{" "}
          The developer was notified.
        </div>
      )}

      <Reveal>
        <div>
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500">
            / admin · {user.name}
          </p>
          <h1 className="font-display text-4xl text-zinc-50 sm:text-5xl">
            Review queue.
          </h1>
        </div>
      </Reveal>

      <DashboardStats
        stats={[
          { label: "Pending", value: queue.length, accent: "amber" },
          { label: "Published live", value: publishedCount, accent: "lime" },
          { label: "Total apps", value: totalApps, accent: "magenta" },
          { label: "Users", value: totalUsers, accent: "indigo" },
        ]}
      />

      {queue.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <p className="text-sm text-zinc-400">
            Nothing in the queue. Nice.
          </p>
        </div>
      ) : (
        <Stagger className="space-y-3">
          {queue.map((app) => (
            <StaggerItem key={app.id}>
              <div className="edge-glow glass relative flex items-start gap-4 overflow-hidden rounded-2xl p-4 pl-5 transition hover:bg-white/[0.02]">
                <AppIcon name={app.name} url={app.iconUrl} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-semibold text-zinc-50">
                      {app.name}
                    </p>
                    <PricingBadge pricing={app.pricingModel} />
                    <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-amber-300">
                      In review
                    </span>
                  </div>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                    {app.category.name} ·{" "}
                    {app.developer.developer?.companyName ?? app.developer.name} · submitted{" "}
                    {new Date(app.updatedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  <p className="mt-2 line-clamp-2 text-sm text-zinc-400">
                    {app.tagline}
                  </p>
                </div>
                <Link
                  href={`/admin/apps/${app.id}`}
                  className="self-center rounded-full bg-zinc-50 px-4 py-2 text-sm font-medium text-zinc-950 shadow-[0_0_0_1px_rgba(255,255,255,0.12),0_8px_24px_-8px_rgba(236,72,153,0.45),0_0_40px_-10px_rgba(34,211,238,0.35)] transition hover:bg-white"
                >
                  Review
                </Link>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </div>
  );
}
