import Link from "next/link";
import { AppCard } from "@/components/app-card";
import {
  getAllCategories,
  getFeaturedApps,
  getLatestApps,
} from "@/lib/queries/apps";

export const metadata = {
  title: "Storestack — App marketplace for e-commerce merchants",
};

export default async function HomePage() {
  const [featured, latest, categories] = await Promise.all([
    getFeaturedApps(6),
    getLatestApps(12),
    getAllCategories(),
  ]);

  return (
    <main>
      <section className="border-b border-zinc-200 bg-white py-16 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-1.5 text-sm font-medium text-zinc-700 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
            <span className="size-2 rounded-full bg-emerald-500" />
            {latest.length} apps published
          </div>
          <h1 className="text-balance text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl dark:text-white">
            The app marketplace for independent e-commerce merchants
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-balance text-base text-zinc-600 dark:text-zinc-400">
            Discover, install, and manage apps that extend your store — built
            once, available on WooCommerce, Magento, and custom storefronts.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link
              href="/apps"
              className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Browse all apps
            </Link>
            <Link
              href="/sign-up/developer"
              className="rounded-full border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-900 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800"
            >
              Publish your app
            </Link>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-white">
              Featured this week
            </h2>
            <Link
              href="/apps"
              className="text-sm font-medium text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-400"
            >
              View all
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((app) => (
              <AppCard key={app.id} app={app} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-6 text-xl font-semibold tracking-tight text-zinc-900 dark:text-white">
            Browse by category
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/categories/${c.slug}`}
                className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-300 hover:shadow dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
              >
                <div>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                    {c.name}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    {c._count.apps} apps
                  </p>
                </div>
                <span aria-hidden className="text-zinc-400 dark:text-zinc-500">
                  →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-white">
              Latest additions
            </h2>
            <Link
              href="/apps"
              className="text-sm font-medium text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-400"
            >
              View all
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {latest.map((app) => (
              <AppCard key={app.id} app={app} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
