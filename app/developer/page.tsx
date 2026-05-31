import Link from "next/link";
import { requireRole } from "@/lib/auth/dal";
import { getMyApps } from "@/lib/queries/developer";
import { AppIcon, PricingBadge } from "@/components/app-card";
import { db } from "@/lib/db";
import { DashboardStats } from "@/components/dashboard-stats";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";
import { deleteDraft } from "@/lib/actions/developer";
import { PrimaryButton } from "@/components/primary-button";

export const metadata = { title: "My apps" };

type SearchParams = Promise<{ submitted?: string }>;

export default async function DeveloperAppsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await requireRole("DEVELOPER");
  const params = await searchParams;
  const [apps, totalInstalls, totalReviews] = await Promise.all([
    getMyApps(user.id),
    db.install.count({ where: { app: { developerId: user.id } } }),
    db.review.count({ where: { app: { developerId: user.id } } }),
  ]);
  const publishedCount = apps.filter((a) => a.status === "PUBLISHED").length;

  return (
    <div className="space-y-8">
      {params.submitted && (
        <div className="glass rounded-2xl border border-lime-400/20 bg-lime-400/[0.06] px-4 py-3 text-sm text-lime-300">
          <span className="font-mono text-[10px] uppercase tracking-widest">/ submitted ·</span>{" "}
          The Storestack team will review it shortly.
        </div>
      )}

      <Reveal>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500">
              / developer · {user.name}
            </p>
            <h1 className="font-display text-4xl text-zinc-50 sm:text-5xl">
              My apps.
            </h1>
          </div>
          <PrimaryButton href="/developer/submit">Submit new app</PrimaryButton>
        </div>
      </Reveal>

      <DashboardStats
        stats={[
          { label: "Published", value: publishedCount, accent: "lime" },
          { label: "Total installs", value: totalInstalls, accent: "magenta" },
          { label: "Reviews on my apps", value: totalReviews, accent: "indigo" },
        ]}
      />

      {apps.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <p className="text-sm text-zinc-400">
            You haven't submitted any apps yet.
          </p>
        </div>
      ) : (
        <Stagger className="space-y-3">
          {apps.map((app) => (
            <StaggerItem key={app.id}>
              <div className="edge-glow glass relative flex items-start gap-4 overflow-hidden rounded-2xl p-4 pl-5 transition hover:bg-white/[0.02]">
                <AppIcon name={app.name} url={app.iconUrl} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-semibold text-zinc-50">
                      {app.name}
                    </p>
                    <PricingBadge pricing={app.pricingModel} />
                    <StatusBadge status={app.status} />
                  </div>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                    {app.category.name} · {app._count.installs.toLocaleString()} installs · {app._count.reviews} reviews
                  </p>
                  <p className="mt-2 line-clamp-2 text-sm text-zinc-400">
                    {app.tagline}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Link
                    href={`/developer/submit?edit=${app.id}`}
                    className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-100 backdrop-blur transition hover:border-white/30 hover:bg-white/10"
                  >
                    Edit
                  </Link>
                  {app.status === "PUBLISHED" && (
                    <Link
                      href={`/apps/${app.slug}`}
                      className="text-xs font-medium text-zinc-500 underline-offset-4 hover:text-zinc-200 hover:underline"
                    >
                      View public
                    </Link>
                  )}
                  {(app.status === "DRAFT" || app.status === "REJECTED") && (
                    <form action={deleteDraft}>
                      <input type="hidden" name="appId" value={app.id} />
                      <button
                        type="submit"
                        className="text-xs font-medium text-zinc-500 transition hover:text-rose-400"
                      >
                        Delete
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: "DRAFT" | "IN_REVIEW" | "APPROVED" | "REJECTED" | "PUBLISHED";
}) {
  const map = {
    DRAFT: { text: "Draft", className: "border-white/20 bg-white/5 text-zinc-300" },
    IN_REVIEW: { text: "In review", className: "border-amber-400/30 bg-amber-400/10 text-amber-300" },
    APPROVED: { text: "Approved", className: "border-cyan-400/30 bg-cyan-400/10 text-cyan-300" },
    REJECTED: { text: "Rejected", className: "border-rose-400/30 bg-rose-400/10 text-rose-300" },
    PUBLISHED: { text: "Published", className: "border-lime-400/30 bg-lime-400/10 text-lime-300" },
  } as const;
  const v = map[status];
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest ${v.className}`}>
      {v.text}
    </span>
  );
}
