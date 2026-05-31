import Link from "next/link";
import { requireRole } from "@/lib/auth/dal";
import { getInstalledApps } from "@/lib/queries/merchant";
import { AppIcon, PricingBadge } from "@/components/app-card";
import { db } from "@/lib/db";
import { DashboardStats } from "@/components/dashboard-stats";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";
import { UninstallButton } from "./UninstallButton";

export const metadata = { title: "Installed apps" };

export default async function MerchantInstalledPage() {
  const user = await requireRole("MERCHANT");
  const [installs, reviewCount, favoriteCount] = await Promise.all([
    getInstalledApps(user.id),
    db.review.count({ where: { userId: user.id } }),
    db.favorite.count({ where: { userId: user.id } }),
  ]);

  return (
    <div className="space-y-8">
      <Reveal>
        <div>
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500">
            / merchant · {user.name}
          </p>
          <h1 className="font-display text-4xl text-zinc-50 sm:text-5xl">
            Installed apps.
          </h1>
        </div>
      </Reveal>

      <DashboardStats
        stats={[
          { label: "Installed", value: installs.length, accent: "cyan" },
          { label: "Reviews written", value: reviewCount, accent: "lime" },
          { label: "Favorites", value: favoriteCount, accent: "magenta" },
        ]}
      />

      {installs.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <p className="text-sm text-zinc-400">
            You haven't installed any apps yet.{" "}
            <Link
              href="/apps"
              className="link-underline font-medium text-zinc-50"
            >
              Browse the marketplace
            </Link>
            .
          </p>
        </div>
      ) : (
        <Stagger className="space-y-3">
          {installs.map((inst) => (
            <StaggerItem key={inst.id}>
              <div className="edge-glow glass relative flex items-start gap-4 overflow-hidden rounded-2xl p-4 pl-5 transition hover:bg-white/[0.02]">
                <AppIcon name={inst.app.name} url={inst.app.iconUrl} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/apps/${inst.app.slug}`}
                      className="link-underline truncate text-sm font-semibold text-zinc-50"
                    >
                      {inst.app.name}
                    </Link>
                    <PricingBadge pricing={inst.app.pricingModel} />
                    <StatusBadge status={inst.configStatus} />
                  </div>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                    {inst.app.category.name} · installed{" "}
                    {new Date(inst.installedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  <p className="mt-2 line-clamp-2 text-sm text-zinc-400">
                    {inst.app.tagline}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Link
                    href={`/merchant/installed/${inst.app.id}`}
                    className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-100 backdrop-blur transition hover:border-white/30 hover:bg-white/10"
                  >
                    Configure
                  </Link>
                  <UninstallButton appId={inst.app.id} />
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: "ACTIVE" | "NEEDS_CONFIG" | "ERROR" }) {
  const map = {
    ACTIVE: { text: "Active", className: "border-lime-400/30 bg-lime-400/10 text-lime-300" },
    NEEDS_CONFIG: { text: "Needs config", className: "border-amber-400/30 bg-amber-400/10 text-amber-300" },
    ERROR: { text: "Error", className: "border-rose-400/30 bg-rose-400/10 text-rose-300" },
  } as const;
  const v = map[status];
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest ${v.className}`}>
      {v.text}
    </span>
  );
}
