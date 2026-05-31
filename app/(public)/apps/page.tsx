import Link from "next/link";
import { AppCard } from "@/components/app-card";
import { browseApps, getAllCategories } from "@/lib/queries/apps";

export const metadata = { title: "Browse all apps" };

type Sort = "popularity" | "rating" | "newest" | "name";

const ALLOWED_SORTS: Sort[] = ["popularity", "rating", "newest", "name"];

type SearchParams = Promise<{
  sort?: string;
  pricing?: string | string[];
  category?: string;
}>;

export default async function BrowseAllPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const sort: Sort = ALLOWED_SORTS.includes(params.sort as Sort)
    ? (params.sort as Sort)
    : "newest";
  const pricing = Array.isArray(params.pricing)
    ? params.pricing
    : params.pricing
      ? [params.pricing]
      : [];
  const allowedPricing = pricing.filter((p): p is "FREE" | "FREEMIUM" | "PAID" =>
    ["FREE", "FREEMIUM", "PAID"].includes(p),
  );

  const [apps, categories] = await Promise.all([
    browseApps({
      sort,
      pricing: allowedPricing.length > 0 ? allowedPricing : undefined,
      categorySlug: params.category,
    }),
    getAllCategories(),
  ]);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
            Browse apps
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {apps.length} {apps.length === 1 ? "app" : "apps"}
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside>
          <form action="/apps" method="GET" className="space-y-6">
            <FilterGroup title="Sort">
              <SelectInput
                name="sort"
                defaultValue={sort}
                options={[
                  { value: "newest", label: "Newest" },
                  { value: "popularity", label: "Most installed" },
                  { value: "rating", label: "Highest rated" },
                  { value: "name", label: "A → Z" },
                ]}
              />
            </FilterGroup>

            <FilterGroup title="Pricing">
              <div className="space-y-1.5">
                {(["FREE", "FREEMIUM", "PAID"] as const).map((p) => (
                  <label
                    key={p}
                    className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300"
                  >
                    <input
                      type="checkbox"
                      name="pricing"
                      value={p}
                      defaultChecked={allowedPricing.includes(p)}
                      className="size-3.5 rounded border-zinc-300 dark:border-zinc-700"
                    />
                    {p === "FREE" ? "Free" : p === "FREEMIUM" ? "Freemium" : "Paid"}
                  </label>
                ))}
              </div>
            </FilterGroup>

            <FilterGroup title="Category">
              <div className="space-y-1">
                <Link
                  href="/apps"
                  className={`block text-sm transition ${
                    !params.category
                      ? "font-semibold text-zinc-900 dark:text-white"
                      : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                  }`}
                >
                  All categories
                </Link>
                {categories.map((c) => (
                  <Link
                    key={c.id}
                    href={`/apps?category=${c.slug}`}
                    className={`block text-sm transition ${
                      params.category === c.slug
                        ? "font-semibold text-zinc-900 dark:text-white"
                        : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                    }`}
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </FilterGroup>

            <button
              type="submit"
              className="w-full rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Apply filters
            </button>
          </form>
        </aside>

        <div>
          {apps.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-12 text-center dark:border-zinc-700 dark:bg-zinc-900">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                No apps match your filters.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {apps.map((app) => (
                <AppCard key={app.id} app={app} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
        {title}
      </p>
      {children}
    </div>
  );
}

function SelectInput({
  name,
  defaultValue,
  options,
}: {
  name: string;
  defaultValue: string;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      name={name}
      defaultValue={defaultValue}
      className="block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
