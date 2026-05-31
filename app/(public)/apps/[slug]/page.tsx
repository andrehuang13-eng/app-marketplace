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
import { installApp, toggleFavorite } from "@/lib/actions/merchant";
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

const HERO_PALETTE = [
  "from-violet-500/30 via-fuchsia-500/15 to-transparent",
  "from-cyan-400/30 via-sky-500/15 to-transparent",
  "from-emerald-400/30 via-teal-500/15 to-transparent",
  "from-amber-400/30 via-orange-500/15 to-transparent",
  "from-rose-400/30 via-pink-500/15 to-transparent",
  "from-fuchsia-400/30 via-purple-500/15 to-transparent",
];

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
  const heroGradient = HERO_PALETTE[app.name.charCodeAt(0) % HERO_PALETTE.length];

  return (
    <main className="relative mx-auto max-w-6xl px-6 py-10">
      <nav className="mb-8 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500">
        <Link href="/" className="transition hover:text-zinc-200">
          Home
        </Link>
        <span aria-hidden>/</span>
        <Link
          href={`/categories/${app.category.slug}`}
          className="transition hover:text-zinc-200"
        >
          {app.category.name}
        </Link>
        <span aria-hidden>/</span>
        <span className="text-zinc-200">{app.name}</span>
      </nav>

      {/* HERO */}
      <header className="glass relative overflow-hidden rounded-3xl p-8 sm:p-10">
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${heroGradient}`}
        />
        <div className="relative flex flex-col gap-8 sm:flex-row sm:items-start">
          <AppIcon name={app.name} url={app.iconUrl} size="lg" />
          <div className="min-w-0 flex-1">
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500">
              {app.category.name} · v{app.currentVersion}
            </div>
            <h1 className="mt-2 font-display text-5xl text-zinc-50 sm:text-6xl">
              {app.name}
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-zinc-300">
              {app.tagline}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm">
              <span className="text-zinc-400">
                by{" "}
                <span className="text-zinc-100">
                  {developerDetails?.companyName ?? app.developer.name}
                </span>
              </span>
              <span className="text-zinc-700">·</span>
              <span className="inline-flex items-center gap-1.5">
                <span className="text-amber-400">★</span>
                <span className="font-semibold text-zinc-50">
                  {reviewsData.ratingAverage !== null
                    ? reviewsData.ratingAverage.toFixed(1)
                    : "—"}
                </span>
                <span className="text-zinc-500">
                  ({reviewsData.total} {reviewsData.total === 1 ? "review" : "reviews"})
                </span>
              </span>
              <span className="text-zinc-700">·</span>
              <span className="text-zinc-400">
                <span className="font-semibold text-zinc-50">
                  {app._count.installs.toLocaleString()}
                </span>{" "}
                installs
              </span>
              <PricingBadge pricing={app.pricingModel} />
            </div>
            <div className="mt-7 flex flex-wrap items-center gap-3">
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
                    className="rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-medium text-zinc-100 backdrop-blur transition hover:border-white/30 hover:bg-white/10"
                  >
                    {viewerFavorited ? "♥ Favorited" : "♡ Favorite"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_300px]">
        <section className="space-y-10">
          <Section title="About">
            <div className="prose-storestack text-base">
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
              <p className="text-sm text-zinc-500">
                No reviews yet. Be the first to share your experience.
              </p>
            ) : (
              <div className="space-y-6">
                <RatingBreakdown
                  average={reviewsData.ratingAverage}
                  total={reviewsData.total}
                  counts={reviewsData.ratingCounts}
                />
                <ul className="space-y-3">
                  {reviewsData.reviews.map((r) => (
                    <li key={r.id} className="glass rounded-2xl p-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-zinc-100">
                          {r.user.name}
                        </span>
                        <span className="text-amber-400">
                          {"★".repeat(r.rating)}
                          <span className="text-zinc-700">
                            {"★".repeat(5 - r.rating)}
                          </span>
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-zinc-300">
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

        <aside className="space-y-4">
          <SideCard title="Developer">
            <p className="text-sm font-semibold text-zinc-100">
              {developerDetails?.companyName ?? app.developer.name}
            </p>
            {developerDetails?.bio && (
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                {developerDetails.bio}
              </p>
            )}
            {developerDetails?.supportEmail && (
              <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                Support · {developerDetails.supportEmail}
              </p>
            )}
          </SideCard>

          {app.versions.length > 0 && (
            <SideCard title="Version history">
              <ul className="space-y-3 text-sm">
                {app.versions.map((v) => (
                  <li key={v.id}>
                    <p className="font-medium text-zinc-100">v{v.version}</p>
                    <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                      {new Date(v.publishedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    <p className="mt-1.5 text-zinc-400">{v.changelog}</p>
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

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-4 font-mono text-[11px] uppercase tracking-[0.25em] text-zinc-500">
        / {title}
      </h2>
      {children}
    </section>
  );
}

function SideCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass rounded-2xl p-5">
      <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
        / {title}
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
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center gap-6">
        <div className="text-center">
          <p className="font-display text-5xl text-zinc-50">
            {average !== null ? average.toFixed(1) : "—"}
          </p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
            {total} {total === 1 ? "review" : "reviews"}
          </p>
        </div>
        <div className="flex-1 space-y-1.5">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = counts[star] ?? 0;
            const pct = total === 0 ? 0 : Math.round((count / total) * 100);
            return (
              <div key={star} className="flex items-center gap-3 text-xs">
                <span className="w-6 font-mono text-zinc-500">{star}★</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-200"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-6 text-right font-mono text-zinc-500">
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
        className="rounded-full bg-zinc-50 px-5 py-2.5 text-sm font-medium text-zinc-950 shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_8px_24px_-8px_rgba(139,92,246,0.5),0_0_40px_-10px_rgba(34,211,238,0.4)] transition hover:bg-white"
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
          className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-5 py-2.5 text-sm font-medium text-emerald-300 backdrop-blur transition hover:bg-emerald-400/20"
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
          className="rounded-full bg-zinc-50 px-5 py-2.5 text-sm font-medium text-zinc-950 shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_8px_24px_-8px_rgba(139,92,246,0.5),0_0_40px_-10px_rgba(34,211,238,0.4)] transition hover:bg-white"
        >
          Install →
        </button>
      </form>
    );
  }
  return null;
}
