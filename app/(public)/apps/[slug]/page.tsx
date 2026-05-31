import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import { AppCard, AppIcon, PricingBadge } from "@/components/app-card";
import {
  getAppBySlug,
  getReviewsForApp,
  getSimilarApps,
} from "@/lib/queries/apps";
import {
  getInstallByUserAndApp,
  getMyReviewForApp,
  isFavorited,
} from "@/lib/queries/merchant";
import { currentUser } from "@/lib/auth/dal";
import {
  installApp,
  toggleFavorite,
} from "@/lib/actions/merchant";
import { ReviewForm } from "./ReviewForm";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const app = await getAppBySlug(slug);
  if (!app) return { title: "App not found" };
  return {
    title: app.name,
    description: app.tagline,
  };
}

export default async function AppDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const app = await getAppBySlug(slug);
  if (!app) notFound();

  const viewer = await currentUser();
  const [reviewsData, similarApps, viewerInstall, viewerFavorited, myReview] =
    await Promise.all([
      getReviewsForApp(app.id, 1, 10),
      getSimilarApps(app.id, app.category.id, 4),
      viewer && viewer.role === "MERCHANT"
        ? getInstallByUserAndApp(viewer.id, app.id)
        : Promise.resolve(null),
      viewer && viewer.role === "MERCHANT"
        ? isFavorited(viewer.id, app.id)
        : Promise.resolve(false),
      viewer && viewer.role === "MERCHANT"
        ? getMyReviewForApp(viewer.id, app.id)
        : Promise.resolve(null),
    ]);

  const developerDetails = app.developer.developer;

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <nav className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
        <Link href="/" className="hover:text-zinc-900 dark:hover:text-white">
          Home
        </Link>
        <span className="mx-1.5" aria-hidden>
          /
        </span>
        <Link
          href={`/categories/${app.category.slug}`}
          className="hover:text-zinc-900 dark:hover:text-white"
        >
          {app.category.name}
        </Link>
        <span className="mx-1.5" aria-hidden>
          /
        </span>
        <span className="text-zinc-900 dark:text-white">{app.name}</span>
      </nav>

      <header className="flex flex-col gap-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:flex-row sm:items-start dark:border-zinc-800 dark:bg-zinc-900">
        <AppIcon name={app.name} url={app.iconUrl} size="lg" />
        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
                {app.name}
              </h1>
              <PricingBadge pricing={app.pricingModel} />
            </div>
            <p className="mt-1 text-base text-zinc-600 dark:text-zinc-400">
              {app.tagline}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400">
            <span>by {developerDetails?.companyName ?? app.developer.name}</span>
            <span aria-hidden>•</span>
            <Link
              href={`/categories/${app.category.slug}`}
              className="hover:text-zinc-900 dark:hover:text-white"
            >
              {app.category.name}
            </Link>
            <span aria-hidden>•</span>
            <span>
              ★{" "}
              {reviewsData.ratingAverage !== null
                ? reviewsData.ratingAverage.toFixed(1)
                : "—"}{" "}
              ({reviewsData.total} {reviewsData.total === 1 ? "review" : "reviews"})
            </span>
            <span aria-hidden>•</span>
            <span>v{app.currentVersion}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <InstallCta
              viewerRole={viewer?.role ?? null}
              appId={app.id}
              appSlug={app.slug}
              installed={Boolean(viewerInstall)}
            />
            {viewer?.role === "MERCHANT" && (
              <form action={toggleFavorite}>
                <input type="hidden" name="appId" value={app.id} />
                <button
                  type="submit"
                  className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800"
                >
                  {viewerFavorited ? "♥ Favorited" : "♡ Favorite"}
                </button>
              </form>
            )}
          </div>
        </div>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_280px]">
        <section className="space-y-10">
          <Section title="About">
            <div className="prose prose-zinc max-w-none prose-headings:mt-6 prose-headings:font-semibold dark:prose-invert">
              <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
                {app.descriptionMd}
              </ReactMarkdown>
            </div>
          </Section>

          {viewer?.role === "MERCHANT" && viewerInstall && (
            <Section title={myReview ? "Edit your review" : "Write a review"}>
              <div id="review">
                <ReviewForm
                  appId={app.id}
                  defaultRating={myReview?.rating ?? 5}
                  defaultBody={myReview?.body ?? ""}
                />
              </div>
            </Section>
          )}

          <Section title={`Reviews (${reviewsData.total})`}>
            {reviewsData.total === 0 ? (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                No reviews yet. Be the first to share your experience.
              </p>
            ) : (
              <div className="space-y-6">
                <RatingBreakdown
                  average={reviewsData.ratingAverage}
                  total={reviewsData.total}
                  counts={reviewsData.ratingCounts}
                />
                <ul className="space-y-4">
                  {reviewsData.reviews.map((r) => (
                    <li
                      key={r.id}
                      className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
                    >
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-zinc-900 dark:text-white">
                          {r.user.name}
                        </span>
                        <span className="text-amber-500">
                          {"★".repeat(r.rating)}
                          <span className="text-zinc-300 dark:text-zinc-700">
                            {"★".repeat(5 - r.rating)}
                          </span>
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
                        {r.body}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Section>

          {similarApps.length > 0 && (
            <Section title="Similar apps">
              <div className="grid gap-4 sm:grid-cols-2">
                {similarApps.map((a) => (
                  <AppCard key={a.id} app={a} />
                ))}
              </div>
            </Section>
          )}
        </section>

        <aside className="space-y-6">
          <SideCard title="Developer">
            <p className="text-sm font-medium text-zinc-900 dark:text-white">
              {developerDetails?.companyName ?? app.developer.name}
            </p>
            {developerDetails?.bio && (
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                {developerDetails.bio}
              </p>
            )}
            {developerDetails?.supportEmail && (
              <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
                Support: {developerDetails.supportEmail}
              </p>
            )}
          </SideCard>

          {app.versions.length > 0 && (
            <SideCard title="Version history">
              <ul className="space-y-3 text-sm">
                {app.versions.map((v) => (
                  <li key={v.id}>
                    <p className="font-medium text-zinc-900 dark:text-white">
                      v{v.version}
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                      {new Date(v.publishedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                      {v.changelog}
                    </p>
                  </li>
                ))}
              </ul>
            </SideCard>
          )}
        </aside>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold tracking-tight text-zinc-900 dark:text-white">
        {title}
      </h2>
      {children}
    </section>
  );
}

function SideCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
        {title}
      </p>
      {children}
    </div>
  );
}

function RatingBreakdown({
  average,
  total,
  counts,
}: {
  average: number | null;
  total: number;
  counts: Record<number, number>;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center gap-6">
        <div className="text-center">
          <p className="text-3xl font-semibold text-zinc-900 dark:text-white">
            {average !== null ? average.toFixed(1) : "—"}
          </p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            {total} {total === 1 ? "review" : "reviews"}
          </p>
        </div>
        <div className="flex-1 space-y-1">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = counts[star] ?? 0;
            const pct = total === 0 ? 0 : Math.round((count / total) * 100);
            return (
              <div key={star} className="flex items-center gap-2 text-xs">
                <span className="w-8 text-zinc-600 dark:text-zinc-400">{star}★</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div
                    className="h-full bg-amber-400"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-8 text-right text-zinc-500 dark:text-zinc-400">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function InstallCta({
  viewerRole,
  appId,
  appSlug,
  installed,
}: {
  viewerRole: "MERCHANT" | "DEVELOPER" | "ADMIN" | null;
  appId: string;
  appSlug: string;
  installed: boolean;
}) {
  if (!viewerRole) {
    return (
      <Link
        href={`/sign-in?next=/apps/${appSlug}`}
        className="rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        Sign in to install
      </Link>
    );
  }
  if (viewerRole === "MERCHANT") {
    if (installed) {
      return (
        <Link
          href="/merchant"
          className="rounded-full border border-emerald-300 bg-emerald-50 px-5 py-2 text-sm font-medium text-emerald-800 transition hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 dark:hover:bg-emerald-900"
        >
          ✓ Installed — open
        </Link>
      );
    }
    return (
      <form action={installApp}>
        <input type="hidden" name="appId" value={appId} />
        <button
          type="submit"
          className="rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Install
        </button>
      </form>
    );
  }
  return null;
}
