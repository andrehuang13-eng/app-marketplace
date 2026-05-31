import Link from "next/link";
import { requireRole } from "@/lib/auth/dal";
import { getFavoriteApps } from "@/lib/queries/merchant";
import { AppIcon, PricingBadge } from "@/components/app-card";
import { toggleFavorite } from "@/lib/actions/merchant";

export const metadata = { title: "Favorites" };

export default async function MerchantFavoritesPage() {
  const user = await requireRole("MERCHANT");
  const favorites = await getFavoriteApps(user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
          Favorites
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {favorites.length} saved for later
        </p>
      </div>

      {favorites.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-12 text-center dark:border-zinc-700 dark:bg-zinc-900">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            No favorites yet. Heart an app from its detail page to save it here.{" "}
            <Link
              href="/apps"
              className="font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-white"
            >
              Browse apps
            </Link>
            .
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {favorites.map((fav) => (
            <li
              key={fav.id}
              className="flex items-start gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <AppIcon name={fav.app.name} url={fav.app.iconUrl} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/apps/${fav.app.slug}`}
                    className="truncate text-sm font-semibold text-zinc-900 hover:underline dark:text-white"
                  >
                    {fav.app.name}
                  </Link>
                  <PricingBadge pricing={fav.app.pricingModel} />
                </div>
                <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                  {fav.app.category.name}
                </p>
                <p className="mt-2 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
                  {fav.app.tagline}
                </p>
              </div>
              <form action={toggleFavorite}>
                <input type="hidden" name="appId" value={fav.app.id} />
                <button
                  type="submit"
                  className="text-xs font-medium text-zinc-500 transition hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400"
                >
                  Remove
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
