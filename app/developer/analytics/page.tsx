import { requireRole } from "@/lib/auth/dal";
import { getDeveloperAnalyticsBasics } from "@/lib/queries/developer";
import { AnalyticsCharts } from "./AnalyticsCharts";

export const metadata = { title: "Analytics" };

interface AppAnalytics {
  id: string;
  slug: string;
  name: string;
  installs: number;
  reviews: number;
  favorites: number;
  ratingAvg: number | null;
}

function generateMockSeries(installs: number): { day: string; installs: number }[] {
  const out: { day: string; installs: number }[] = [];
  let remaining = installs;
  for (let i = 29; i >= 0; i--) {
    const dayInstalls = Math.max(0, Math.floor(remaining / (i + 1) + (i % 3)));
    const date = new Date();
    date.setDate(date.getDate() - i);
    out.push({
      day: date.toISOString().slice(5, 10),
      installs: dayInstalls,
    });
    remaining = Math.max(0, remaining - dayInstalls);
  }
  return out;
}

export default async function DeveloperAnalyticsPage() {
  const user = await requireRole("DEVELOPER");
  const apps = await getDeveloperAnalyticsBasics(user.id);

  const totalInstalls = apps.reduce((sum: number, a: AppAnalytics) => sum + a.installs, 0);
  const totalReviews = apps.reduce((sum: number, a: AppAnalytics) => sum + a.reviews, 0);
  const totalFavorites = apps.reduce((sum: number, a: AppAnalytics) => sum + a.favorites, 0);
  const overallAvg =
    apps.filter((a: AppAnalytics) => a.ratingAvg !== null).reduce((s: number, a: AppAnalytics) => s + (a.ratingAvg ?? 0), 0) /
    Math.max(1, apps.filter((a: AppAnalytics) => a.ratingAvg !== null).length);

  const seriesByApp = apps.map((a: AppAnalytics) => ({
    name: a.name,
    series: generateMockSeries(a.installs),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
          Analytics
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Real install counts from the database; daily breakdown is illustrative
          (mock distribution).
        </p>
      </div>

      {apps.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-12 text-center dark:border-zinc-700 dark:bg-zinc-900">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            You don't have any published apps yet — submit one to start seeing
            analytics.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-4">
            <Stat label="Total installs" value={totalInstalls.toLocaleString()} />
            <Stat label="Total reviews" value={totalReviews.toLocaleString()} />
            <Stat label="Total favorites" value={totalFavorites.toLocaleString()} />
            <Stat
              label="Avg rating"
              value={isNaN(overallAvg) ? "—" : overallAvg.toFixed(2)}
            />
          </div>
          <AnalyticsCharts apps={seriesByApp} />
        </>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}
