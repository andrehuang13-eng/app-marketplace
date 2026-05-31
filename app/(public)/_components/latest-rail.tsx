"use client";

import Link from "next/link";
import { TiltCard } from "@/components/tilt-card";
import type { AppCardView } from "@/lib/queries/apps";

export function LatestRail({ apps }: { apps: AppCardView[] }) {
  if (apps.length === 0) {
    return (
      <p className="text-sm text-zinc-500">No apps yet.</p>
    );
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {apps.map((app) => (
        <TiltCard key={app.id} intensity={4} glow className="group">
          <Link
            href={`/apps/${app.slug}`}
            className="glass gradient-border flex h-full flex-col gap-3 overflow-hidden rounded-2xl p-4"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                {app.category.name}
              </span>
              <span className="text-[10px] text-zinc-500">
                {app.installCount.toLocaleString()} installs
              </span>
            </div>
            <p className="text-base font-semibold text-zinc-50">{app.name}</p>
            <p className="line-clamp-2 text-xs leading-relaxed text-zinc-400">
              {app.tagline}
            </p>
            <div className="mt-auto flex items-center justify-between pt-2 text-xs">
              <span className="inline-flex items-center gap-1 text-zinc-400">
                <span className="text-amber-400">★</span>
                <span>
                  {app.ratingAverage !== null ? app.ratingAverage.toFixed(1) : "—"}
                </span>
                <span className="text-zinc-600">({app.reviewCount})</span>
              </span>
              <span className="inline-flex items-center gap-1 text-zinc-50 transition group-hover:gap-2">
                Open
                <span aria-hidden>→</span>
              </span>
            </div>
          </Link>
        </TiltCard>
      ))}
    </div>
  );
}
