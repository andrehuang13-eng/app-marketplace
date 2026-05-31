"use client";

import Link from "next/link";
import { TiltCard } from "@/components/tilt-card";
import { Stagger, StaggerItem } from "@/components/motion";
import type { AppCardView } from "@/lib/queries/apps";

const PALETTE: { id: string; gradient: string; accent: string }[] = [
  { id: "magenta", gradient: "from-pink-500/35 via-fuchsia-500/15 to-transparent", accent: "text-pink-300" },
  { id: "indigo", gradient: "from-indigo-500/35 via-violet-500/15 to-transparent", accent: "text-indigo-300" },
  { id: "cyan", gradient: "from-cyan-400/35 via-sky-500/15 to-transparent", accent: "text-cyan-300" },
  { id: "lime", gradient: "from-lime-400/35 via-emerald-500/15 to-transparent", accent: "text-lime-300" },
  { id: "amber", gradient: "from-amber-400/35 via-orange-500/15 to-transparent", accent: "text-amber-300" },
  { id: "rose", gradient: "from-rose-400/35 via-pink-500/15 to-transparent", accent: "text-rose-300" },
];

export function FeaturedBento({ apps }: { apps: AppCardView[] }) {
  if (apps.length === 0) return null;
  const hero = apps[0];
  const rest = apps.slice(1, 6);

  return (
    <Stagger className="grid gap-4 lg:grid-cols-3 lg:grid-rows-2">
      <StaggerItem className="h-full lg:col-span-1 lg:row-span-2">
        <HeroCell app={hero} palette={PALETTE[0]} />
      </StaggerItem>
      {rest.map((app, i) => (
        <StaggerItem key={app.id} className="h-full">
          <Cell app={app} palette={PALETTE[(i + 1) % PALETTE.length]} />
        </StaggerItem>
      ))}
    </Stagger>
  );
}

function HeroCell({
  app,
  palette,
}: {
  app: AppCardView;
  palette: (typeof PALETTE)[number];
}) {
  return (
    <TiltCard intensity={6} glow className="group relative h-full lg:col-span-1 lg:row-span-2">
      <Link
        href={`/apps/${app.slug}`}
        className="glass gradient-border relative flex h-full min-h-[420px] flex-col justify-between overflow-hidden rounded-3xl p-6"
      >
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${palette.gradient}`}
        />
        <div className="relative">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
            <span className={palette.accent}>●</span>
            Featured · {app.category.name}
          </div>
          <h3 className="mt-8 font-display text-5xl text-zinc-50">{app.name}</h3>
          <p className="mt-4 text-base leading-relaxed text-zinc-300">{app.tagline}</p>
        </div>

        <div className="relative mt-10 space-y-4">
          <div className="flex items-center gap-4 text-sm text-zinc-400">
            <span className="inline-flex items-center gap-1">
              <span className="text-amber-400">★</span>
              <span className="text-zinc-200">
                {app.ratingAverage !== null ? app.ratingAverage.toFixed(1) : "—"}
              </span>
              <span className="text-zinc-500">({app.reviewCount})</span>
            </span>
            <span className="text-zinc-600">·</span>
            <span>{app.installCount.toLocaleString()} installs</span>
          </div>
          <div className="flex items-center justify-between">
            <PricingPill pricing={app.pricingModel} />
            <span className="inline-flex items-center gap-1 text-sm font-medium text-zinc-50 transition group-hover:gap-2">
              Explore
              <span aria-hidden>→</span>
            </span>
          </div>
        </div>
      </Link>
    </TiltCard>
  );
}

function Cell({
  app,
  palette,
}: {
  app: AppCardView;
  palette: (typeof PALETTE)[number];
}) {
  return (
    <TiltCard intensity={5} glow className="group relative h-full">
      <Link
        href={`/apps/${app.slug}`}
        className="glass gradient-border relative flex h-full min-h-[200px] flex-col justify-between overflow-hidden rounded-2xl p-5"
      >
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${palette.gradient} opacity-60 transition-opacity duration-500 group-hover:opacity-90`}
        />
        <div className="relative">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
            <span className={palette.accent}>●</span>
            {app.category.name}
          </div>
          <p className="mt-4 text-xl font-semibold text-zinc-50">{app.name}</p>
          <p className="mt-2 line-clamp-2 text-sm text-zinc-400">{app.tagline}</p>
        </div>
        <div className="relative mt-4 flex items-center justify-between text-xs text-zinc-500">
          <span className="inline-flex items-center gap-1">
            <span className="text-amber-400">★</span>
            <span className="text-zinc-300">
              {app.ratingAverage !== null ? app.ratingAverage.toFixed(1) : "—"}
            </span>
          </span>
          <PricingPill pricing={app.pricingModel} compact />
        </div>
      </Link>
    </TiltCard>
  );
}

function PricingPill({
  pricing,
  compact,
}: {
  pricing: "FREE" | "FREEMIUM" | "PAID";
  compact?: boolean;
}) {
  const map = {
    FREE: "Free",
    FREEMIUM: "Freemium",
    PAID: "Paid",
  } as const;
  return (
    <span
      className={`inline-flex items-center rounded-full border border-white/15 bg-white/10 backdrop-blur font-mono uppercase tracking-widest text-zinc-200 ${compact ? "px-2 py-0.5 text-[9px]" : "px-2.5 py-1 text-[10px]"}`}
    >
      {map[pricing]}
    </span>
  );
}
