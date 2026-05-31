import Link from "next/link";
import { requireRole } from "@/lib/auth/dal";
import { getInstalledApps } from "@/lib/queries/merchant";
import { AppIcon, PricingBadge } from "@/components/app-card";
import { UninstallButton } from "./UninstallButton";

export const metadata = { title: "Installed apps" };

export default async function MerchantInstalledPage() {
  const user = await requireRole("MERCHANT");
  const installs = await getInstalledApps(user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
          Installed apps
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {installs.length} installed
        </p>
      </div>

      {installs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-12 text-center dark:border-zinc-700 dark:bg-zinc-900">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            You haven't installed any apps yet.{" "}
            <Link
              href="/apps"
              className="font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-white"
            >
              Browse the marketplace
            </Link>
            .
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {installs.map((inst) => (
            <li
              key={inst.id}
              className="flex items-start gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <AppIcon name={inst.app.name} url={inst.app.iconUrl} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/apps/${inst.app.slug}`}
                    className="truncate text-sm font-semibold text-zinc-900 hover:underline dark:text-white"
                  >
                    {inst.app.name}
                  </Link>
                  <PricingBadge pricing={inst.app.pricingModel} />
                  <StatusBadge status={inst.configStatus} />
                </div>
                <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                  {inst.app.category.name} · installed{" "}
                  {new Date(inst.installedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
                <p className="mt-2 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
                  {inst.app.tagline}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Link
                  href={`/merchant/installed/${inst.app.id}`}
                  className="rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-900 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800"
                >
                  Configure
                </Link>
                <UninstallButton appId={inst.app.id} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: "ACTIVE" | "NEEDS_CONFIG" | "ERROR" }) {
  const map = {
    ACTIVE: { text: "Active", className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" },
    NEEDS_CONFIG: { text: "Needs config", className: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300" },
    ERROR: { text: "Error", className: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300" },
  } as const;
  const v = map[status];
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${v.className}`}>
      {v.text}
    </span>
  );
}
