import { AppCard } from "@/components/app-card";
import { searchApps } from "@/lib/queries/apps";

export const metadata = { title: "Search apps" };

type SearchParams = Promise<{ q?: string }>;

export default async function SearchPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const q = (params.q ?? "").trim();
  const results = q ? await searchApps(q) : [];

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
        Search apps
      </h1>

      <form action="/search" method="GET" className="mt-6 max-w-xl">
        <label htmlFor="q" className="sr-only">
          Search apps
        </label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={q}
          placeholder="Search apps by name, description, or developer…"
          autoFocus
          className="block w-full rounded-full border border-zinc-300 bg-white px-5 py-3 text-sm text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
        />
      </form>

      <div className="mt-8">
        {q.length === 0 ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Type a query to search the marketplace.
          </p>
        ) : results.length === 0 ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            No apps match <span className="font-medium text-zinc-900 dark:text-white">"{q}"</span>.
          </p>
        ) : (
          <>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {results.length} {results.length === 1 ? "result" : "results"} for{" "}
              <span className="font-medium text-zinc-900 dark:text-white">"{q}"</span>
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((app) => (
                <AppCard key={app.id} app={app} />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
