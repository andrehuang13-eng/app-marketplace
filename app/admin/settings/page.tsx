import { requireRole } from "@/lib/auth/dal";
import {
  getAllPublishedAppsSimple,
  getSettings,
} from "@/lib/queries/admin";
import { FeaturedAppsForm, BannerForm } from "./SettingsForms";

export const metadata = { title: "Settings" };

export default async function AdminSettingsPage() {
  await requireRole("ADMIN");
  const [apps, settings] = await Promise.all([
    getAllPublishedAppsSimple(),
    getSettings(),
  ]);
  const banner =
    (settings.announcement_banner as
      | { enabled?: boolean; message?: string; type?: "info" | "success" | "warning" }
      | undefined) ?? {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
          Settings
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Featured apps on the home page and the site-wide announcement banner.
        </p>
      </div>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-4 text-lg font-semibold tracking-tight text-zinc-900 dark:text-white">
          Featured apps
        </h2>
        <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
          Select up to 12 apps to feature on the home page. Currently featured:
          {" "}
          {apps.filter((a) => a.featured).length}.
        </p>
        <FeaturedAppsForm
          apps={apps.map((a) => ({ id: a.id, name: a.name, featured: a.featured }))}
        />
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-4 text-lg font-semibold tracking-tight text-zinc-900 dark:text-white">
          Announcement banner
        </h2>
        <BannerForm
          defaults={{
            enabled: Boolean(banner.enabled),
            message: banner.message ?? "",
            type: (banner.type ?? "info") as "info" | "success" | "warning",
          }}
        />
      </section>
    </div>
  );
}
