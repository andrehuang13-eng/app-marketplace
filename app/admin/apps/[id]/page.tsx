import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import { requireRole } from "@/lib/auth/dal";
import { getAppForReview } from "@/lib/queries/admin";
import { AppIcon, PricingBadge } from "@/components/app-card";
import { DecisionForm } from "./DecisionForm";

export const metadata = { title: "Review app" };

type Params = Promise<{ id: string }>;

export default async function AdminReviewAppPage({ params }: { params: Params }) {
  await requireRole("ADMIN");
  const { id } = await params;
  const app = await getAppForReview(id);
  if (!app) notFound();

  const developer = app.developer.developer;

  return (
    <div className="space-y-6">
      <Link
        href="/admin"
        className="text-sm text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-400"
      >
        ← Back to queue
      </Link>

      <header className="flex flex-col gap-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:flex-row sm:items-start dark:border-zinc-800 dark:bg-zinc-900">
        <AppIcon name={app.name} url={app.iconUrl} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
              {app.name}
            </h1>
            <PricingBadge pricing={app.pricingModel} />
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-300">
              {app.status === "IN_REVIEW" ? "In review" : app.status}
            </span>
          </div>
          <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
            {app.tagline}
          </p>
          <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
            By {developer?.companyName ?? app.developer.name} ({app.developer.email}) · {app.category.name} · v{app.currentVersion}
          </p>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-lg font-semibold tracking-tight text-zinc-900 dark:text-white">
            Description
          </h2>
          <div className="prose prose-zinc max-w-none dark:prose-invert">
            <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
              {app.descriptionMd}
            </ReactMarkdown>
          </div>
        </section>

        <aside className="space-y-4">
          {app.status === "IN_REVIEW" ? (
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <DecisionForm appId={app.id} />
            </div>
          ) : (
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                This app is currently <strong>{app.status}</strong>. The review
                queue only acts on submissions in review.
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
