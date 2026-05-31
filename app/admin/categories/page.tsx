import { requireRole } from "@/lib/auth/dal";
import { getCategoriesForAdmin } from "@/lib/queries/admin";
import { CategoryCreateForm, CategoryRow } from "./CategoryForms";

export const metadata = { title: "Categories" };

export default async function AdminCategoriesPage() {
  await requireRole("ADMIN");
  const categories = await getCategoriesForAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
          Categories
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {categories.length} {categories.length === 1 ? "category" : "categories"}.
          Sort order controls display position on the home page and browse
          views.
        </p>
      </div>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-4 text-lg font-semibold tracking-tight text-zinc-900 dark:text-white">
          Add category
        </h2>
        <CategoryCreateForm />
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-4 text-lg font-semibold tracking-tight text-zinc-900 dark:text-white">
          Existing categories
        </h2>
        <ul className="space-y-3">
          {categories.map((c) => (
            <CategoryRow
              key={c.id}
              category={{
                id: c.id,
                slug: c.slug,
                name: c.name,
                sortOrder: c.sortOrder,
                appCount: c._count.apps,
              }}
            />
          ))}
        </ul>
      </section>
    </div>
  );
}
