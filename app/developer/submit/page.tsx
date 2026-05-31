import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/dal";
import { getAllCategories } from "@/lib/queries/apps";
import { getMyAppForEdit } from "@/lib/queries/developer";
import { SubmitAppForm } from "./SubmitAppForm";

export const metadata = { title: "Submit app" };

type SearchParams = Promise<{ edit?: string }>;

export default async function DeveloperSubmitPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await requireRole("DEVELOPER");
  const params = await searchParams;

  const [categories, existing] = await Promise.all([
    getAllCategories(),
    params.edit ? getMyAppForEdit(user.id, params.edit) : Promise.resolve(null),
  ]);

  if (params.edit && !existing) notFound();

  return (
    <div className="space-y-6">
      <Link
        href="/developer"
        className="text-sm text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-400"
      >
        ← Back to my apps
      </Link>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
          {existing ? `Edit ${existing.name}` : "Submit a new app"}
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {existing
            ? existing.status === "PUBLISHED" || existing.status === "APPROVED"
              ? "Saving changes will move this app back into the review queue."
              : "Update your draft. Submitting moves it into the review queue."
            : "Save a draft to come back later, or submit straight away for review."}
        </p>
      </div>

      <SubmitAppForm
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        existing={existing}
      />
    </div>
  );
}
