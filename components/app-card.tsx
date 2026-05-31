"use client";

import Link from "next/link";
import { TiltCard } from "@/components/tilt-card";
import type { AppCardView } from "@/lib/queries/apps";

const PALETTE = [
  "from-violet-500/25 via-fuchsia-500/10 to-transparent",
  "from-cyan-400/25 via-sky-500/10 to-transparent",
  "from-emerald-400/25 via-teal-500/10 to-transparent",
  "from-amber-400/25 via-orange-500/10 to-transparent",
  "from-rose-400/25 via-pink-500/10 to-transparent",
  "from-fuchsia-400/25 via-purple-500/10 to-transparent",
];

function gradientForName(name: string): string {
  const idx = name.charCodeAt(0) % PALETTE.length;
  return PALETTE[idx];
}

export function AppCard({ app }: { app: AppCardView }) {
  const ratingDisplay =
    app.ratingAverage !== null ? app.ratingAverage.toFixed(1) : "—";
  const gradient = gradientForName(app.name);

  return (
    <TiltCard intensity={4} glow className="group h-full">
      <Link
        href={`/apps/${app.slug}`}
        className="glass gradient-border flex h-full flex-col gap-3 overflow-hidden rounded-2xl p-4"
      >
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${gradient} opacity-50 transition-opacity duration-500 group-hover:opacity-80`}
        />
        <div className="relative flex items-start gap-3">
          <AppIcon name={app.name} url={app.iconUrl} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-zinc-50">
              {app.name}
            </p>
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-zinc-400">
              {app.tagline}
            </p>
          </div>
        </div>

        <div className="relative mt-auto flex items-center justify-between text-xs">
          <span className="inline-flex items-center gap-1 text-zinc-400">
            <span className="text-amber-400">★</span>
            <span className="text-zinc-300">{ratingDisplay}</span>
            <span className="text-zinc-600">({app.reviewCount})</span>
          </span>
          <PricingBadge pricing={app.pricingModel} />
        </div>

        <div className="relative flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-zinc-500">
          <span>{app.category.name}</span>
          <span>{app.installCount.toLocaleString()} installs</span>
        </div>
      </Link>
    </TiltCard>
  );
}

const ICON_PALETTE = [
  "from-violet-500 to-fuchsia-500",
  "from-cyan-400 to-sky-500",
  "from-emerald-400 to-teal-500",
  "from-amber-400 to-orange-500",
  "from-rose-400 to-pink-500",
  "from-fuchsia-400 to-purple-500",
  "from-blue-400 to-violet-500",
  "from-orange-400 to-rose-500",
];

export function AppIcon({
  name,
  url,
  size = "md",
}: {
  name: string;
  url?: string | null;
  size?: "sm" | "md" | "lg";
}) {
  const dimension =
    size === "lg"
      ? "size-16 text-2xl"
      : size === "sm"
        ? "size-8 text-xs"
        : "size-12 text-base";
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={`${name} icon`}
        className={`${dimension} shrink-0 rounded-xl object-cover ring-1 ring-white/10`}
      />
    );
  }
  const palette = ICON_PALETTE[name.charCodeAt(0) % ICON_PALETTE.length];
  return (
    <div
      aria-hidden
      className={`${dimension} ${`bg-gradient-to-br ${palette}`} shrink-0 rounded-xl font-semibold text-white flex items-center justify-center ring-1 ring-white/15 shadow-[0_8px_24px_-12px_rgba(139,92,246,0.5)]`}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

export function PricingBadge({
  pricing,
}: {
  pricing: "FREE" | "FREEMIUM" | "PAID";
}) {
  const map = {
    FREE: { text: "Free", className: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300" },
    FREEMIUM: { text: "Freemium", className: "border-cyan-400/30 bg-cyan-400/10 text-cyan-300" },
    PAID: { text: "Paid", className: "border-white/20 bg-white/5 text-zinc-200" },
  } as const;
  const v = map[pricing];
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest ${v.className}`}
    >
      {v.text}
    </span>
  );
}
