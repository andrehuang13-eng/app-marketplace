import Link from "next/link";
import { requireRole } from "@/lib/auth/dal";
import { getMyReviews } from "@/lib/queries/merchant";
import { AppIcon } from "@/components/app-card";
import { deleteReview } from "@/lib/actions/merchant";

export const metadata = { title: "My reviews" };

export default async function MerchantReviewsPage() {
  const user = await requireRole("MERCHANT");
  const reviews = await getMyReviews(user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
          My reviews
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
        </p>
      </div>

      {reviews.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-12 text-center dark:border-zinc-700 dark:bg-zinc-900">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            You haven't reviewed any apps yet. Reviews can be written from each
            app's detail page after you install it.
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {reviews.map((r) => (
            <li
              key={r.id}
              className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex items-start gap-3">
                <AppIcon name={r.app.name} url={r.app.iconUrl} size="sm" />
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <Link
                      href={`/apps/${r.app.slug}`}
                      className="text-sm font-semibold text-zinc-900 hover:underline dark:text-white"
                    >
                      {r.app.name}
                    </Link>
                    <span className="text-sm text-amber-500">
                      {"★".repeat(r.rating)}
                      <span className="text-zinc-300 dark:text-zinc-700">
                        {"★".repeat(5 - r.rating)}
                      </span>
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Updated{" "}
                    {new Date(r.updatedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  <p className="mt-3 text-sm text-zinc-700 dark:text-zinc-300">
                    {r.body}
                  </p>
                  <div className="mt-3 flex gap-3">
                    <Link
                      href={`/apps/${r.app.slug}#review`}
                      className="text-xs font-medium text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-400"
                    >
                      Edit
                    </Link>
                    <form action={deleteReview}>
                      <input type="hidden" name="appId" value={r.app.id} />
                      <button
                        type="submit"
                        className="text-xs font-medium text-zinc-500 transition hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
