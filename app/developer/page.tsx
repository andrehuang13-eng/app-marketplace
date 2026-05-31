import Link from "next/link";
import { requireRole } from "@/lib/auth/dal";
import { getMyApps } from "@/lib/queries/developer";
import { AppIcon, PricingBadge } from "@/components/app-card";
import { deleteDraft } from "@/lib/actions/developer";

export const metadata = { title: "My apps" };

type SearchParams = Promise<{ submitted?: string }>;

export default async function DeveloperAppsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await requireRole("DEVELOPER");
  const params = await searchParams;
  const apps = await getMyApps(user.id);

  return (
    <div className="space-y-6">
      {params.submitted && (
        <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          Submitted for review. The Storestack team will review it shortly.
        </p>
      )}

      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
            My apps
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {apps.length} {apps.length === 1 ? "app" : "apps"}
          </p>
        </div>
        <Link
          href="/developer/submit"
          className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Submit new app
        </Link>
      </div>

      {apps.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-12 text-center dark:border-zinc-700 dark:bg-zinc-900">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            You haven't submitted any apps yet.
          </p>
        </div>
      ) : (
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
                  <StatusBadge status={app.status} />
                </div>
                <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                  {app.category.name} ·{" "}
                  {app._count.installs.toLocaleString()} installs ·{" "}
                  {app._count.reviews} reviews
                </p>
                <p className="mt-2 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
                  {app.tagline}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Link
                  href={`/developer/submit?edit=${app.id}`}
                  className="rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-900 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800"
                >
                  Edit
                </Link>
                {app.status === "PUBLISHED" && (
                  <Link
                    href={`/apps/${app.slug}`}
                    className="text-xs font-medium text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-400"
                  >
                    View public
                  </Link>
                )}
                {(app.status === "DRAFT" || app.status === "REJECTED") && (
                  <form action={deleteDraft}>
                    <input type="hidden" name="appId" value={app.id} />
                    <button
                      type="submit"
                      className="text-xs font-medium text-zinc-500 transition hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400"
                    >
                      Delete
                    </button>
                  </form>
                )}
              </div>
            </li>
          ))}
        </ul>
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
    DRAFT: { text: "Draft", className: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300" },
    IN_REVIEW: { text: "In review", className: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300" },
    APPROVED: { text: "Approved", className: "bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300" },
    REJECTED: { text: "Rejected", className: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300" },
    PUBLISHED: { text: "Published", className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" },
  } as const;
  const v = map[status];
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${v.className}`}>
      {v.text}
    </span>
  );
}
