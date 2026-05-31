import Link from "next/link";
import { requireRole } from "@/lib/auth/dal";
import { getAllAppsForAdmin } from "@/lib/queries/admin";
import { AppIcon, PricingBadge } from "@/components/app-card";
import { forceUnpublishApp } from "@/lib/actions/admin";

export const metadata = { title: "All apps" };

export default async function AdminAppsPage() {
  await requireRole("ADMIN");
  const apps = await getAllAppsForAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
          All apps
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {apps.length} {apps.length === 1 ? "app" : "apps"}
        </p>
      </div>
      <ul className="space-y-3">
        {apps.map((app) => (
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
                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                  {app.status.toLowerCase()}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                {app.category.name} · by {app.developer.name} ·{" "}
                {app._count.installs.toLocaleString()} installs ·{" "}
                {app._count.reviews} reviews
              </p>
              <p className="mt-2 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
                {app.tagline}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              {app.status === "IN_REVIEW" && (
                <Link
                  href={`/admin/apps/${app.id}`}
                  className="rounded-full bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  Review
                </Link>
              )}
              {app.status === "PUBLISHED" && (
                <>
                  <Link
                    href={`/apps/${app.slug}`}
                    className="text-xs font-medium text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-400"
                  >
                    View public
                  </Link>
                  <form action={forceUnpublishApp}>
                    <input type="hidden" name="appId" value={app.id} />
                    <button
                      type="submit"
                      className="text-xs font-medium text-zinc-500 transition hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400"
                    >
                      Force unpublish
                    </button>
                  </form>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
