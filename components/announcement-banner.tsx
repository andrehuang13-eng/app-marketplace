import { getSettings } from "@/lib/queries/admin";

export async function AnnouncementBanner() {
  const settings = await getSettings();
  const banner = settings.announcement_banner as
    | { enabled?: boolean; message?: string; type?: "info" | "success" | "warning" }
    | undefined;
  if (!banner?.enabled || !banner.message) return null;

  const palette =
    banner.type === "success"
      ? "bg-emerald-600 text-white"
      : banner.type === "warning"
        ? "bg-amber-500 text-zinc-900"
        : "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900";

  return (
    <div className={`${palette} px-6 py-2 text-center text-sm font-medium`}>
      {banner.message}
    </div>
  );
}
