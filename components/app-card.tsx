import Link from "next/link";
import type { AppCardView } from "@/lib/queries/apps";

export function AppCard({ app }: { app: AppCardView }) {
  const ratingDisplay =
    app.ratingAverage !== null ? app.ratingAverage.toFixed(1) : "—";

  return (
    <Link
      href={`/apps/${app.slug}`}
      className="group flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
    >
      <div className="flex items-start gap-3">
        <AppIcon name={app.name} url={app.iconUrl} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-zinc-900 dark:text-white">
            {app.name}
          </p>
          <p className="mt-1 line-clamp-2 text-xs text-zinc-600 dark:text-zinc-400">
            {app.tagline}
          </p>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between gap-2 text-xs text-zinc-500 dark:text-zinc-400">
        <span className="inline-flex items-center gap-1">
          <span aria-hidden>★</span>
          <span>{ratingDisplay}</span>
          <span className="text-zinc-400 dark:text-zinc-600">({app.reviewCount})</span>
        </span>
        <PricingBadge pricing={app.pricingModel} />
      </div>

      <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
        <span>{app.category.name}</span>
        <span>{app.installCount.toLocaleString()} installs</span>
      </div>
    </Link>
  );
}

const PALETTE = [
  "bg-rose-500",
  "bg-amber-500",
  "bg-emerald-500",
  "bg-sky-500",
  "bg-violet-500",
  "bg-fuchsia-500",
  "bg-cyan-500",
  "bg-orange-500",
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
  const dimension = size === "lg" ? "size-16 text-2xl" : size === "sm" ? "size-8 text-xs" : "size-12 text-base";
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={`${name} icon`}
        className={`${dimension} shrink-0 rounded-lg object-cover`}
      />
    );
  }
  const palette =
    PALETTE[name.charCodeAt(0) % PALETTE.length] ?? "bg-zinc-500";
  return (
    <div
      aria-hidden
      className={`${dimension} ${palette} shrink-0 rounded-lg font-semibold text-white flex items-center justify-center`}
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
    FREE: { text: "Free", className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" },
    FREEMIUM: { text: "Freemium", className: "bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300" },
    PAID: { text: "Paid", className: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300" },
  } as const;
  const v = map[pricing];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${v.className}`}
    >
      {v.text}
    </span>
  );
}
