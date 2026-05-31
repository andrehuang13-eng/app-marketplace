import Link from "next/link";
import { requireRole } from "@/lib/auth/dal";
import { getReviewQueue } from "@/lib/queries/admin";
import { AppIcon, PricingBadge } from "@/components/app-card";

export const metadata = { title: "Review queue" };

type SearchParams = Promise<{ action?: string }>;

export default async function AdminReviewQueuePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireRole("ADMIN");
  const params = await searchParams;
  const queue = await getReviewQueue();

  return (
    <div className="space-y-6">
      {params.action === "approved" && (
        <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          App approved and published.
        </p>
      )}
      {params.action === "rejected" && (
        <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:bg-amber-950 dark:text-amber-300">
          App rejected. The developer was notified.
        </p>
      )}

      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
          Review queue
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {queue.length} pending {queue.length === 1 ? "submission" : "submissions"} — sorted oldest first
        </p>
      </div>

      {queue.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-12 text-center dark:border-zinc-700 dark:bg-zinc-900">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Nothing in the queue. Nice.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {queue.map((app) => (
            <li
              key={app.id}
              className="flex items-start gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <AppIcon name={app.name} url={app.iconUrl} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold text-zinc-900 dark:text-white">
                    {app.name}
                  </p>
                  <PricingBadge pricing={app.pricingModel} />
                </div>
                <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                  {app.category.name} ·{" "}
                  {app.developer.developer?.companyName ?? app.developer.name} ·
                  submitted{" "}
                  {new Date(app.updatedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
                <p className="mt-2 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
                  {app.tagline}
                </p>
              </div>
              <Link
                href={`/admin/apps/${app.id}`}
                className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Review
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
