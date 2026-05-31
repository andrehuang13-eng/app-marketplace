import { requireRole } from "@/lib/auth/dal";

export const metadata = { title: "Review queue" };

export default async function AdminDashboardPage() {
  const user = await requireRole("ADMIN");
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
          Review queue
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Welcome, {user.name}. Pending app submissions appear here.
        </p>
      </div>
      <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-12 text-center dark:border-zinc-700 dark:bg-zinc-900">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          No pending submissions.
        </p>
      </div>
    </div>
  );
}
