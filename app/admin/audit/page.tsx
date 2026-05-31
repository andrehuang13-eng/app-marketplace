import { requireRole } from "@/lib/auth/dal";
import { getAuditLog } from "@/lib/queries/admin";

export const metadata = { title: "Audit log" };

export default async function AdminAuditPage() {
  await requireRole("ADMIN");
  const entries = await getAuditLog(100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
          Audit log
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Read-only. Every admin action is recorded immutably; the {entries.length}{" "}
          most recent entries are shown.
        </p>
      </div>

      <ol className="space-y-2">
        {entries.map((e) => {
          const meta = (e.metadataJson ?? {}) as Record<string, unknown>;
          const comment = typeof meta.comment === "string" ? meta.comment : null;
          return (
            <li
              key={e.id}
              className="rounded-xl border border-zinc-200 bg-white p-3 text-sm shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex items-center justify-between gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                <span>
                  {new Date(e.createdAt).toLocaleString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <span className="font-mono uppercase tracking-wider">
                  {e.action}
                </span>
              </div>
              <p className="mt-1 text-zinc-900 dark:text-white">
                <span className="font-medium">{e.actor.name}</span>{" "}
                <span className="text-zinc-500 dark:text-zinc-400">
                  on {e.targetType}:{e.targetId.slice(0, 8)}
                </span>
              </p>
              {comment && (
                <p className="mt-2 rounded border-l-2 border-zinc-200 bg-zinc-50 px-2 py-1 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300">
                  {comment}
                </p>
              )}
            </li>
          );
        })}
      </ol>

      {entries.length === 0 && (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-12 text-center dark:border-zinc-700 dark:bg-zinc-900">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            No admin actions logged yet.
          </p>
        </div>
      )}
    </div>
  );
}
