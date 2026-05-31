import { requireRole } from "@/lib/auth/dal";
import { searchUsers } from "@/lib/queries/admin";
import {
  suspendUser,
  reinstateUser,
  changeUserRole,
} from "@/lib/actions/admin";

export const metadata = { title: "Users" };

type SearchParams = Promise<{ q?: string }>;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const me = await requireRole("ADMIN");
  const params = await searchParams;
  const q = params.q ?? "";
  const users = await searchUsers(q);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
          Users
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {users.length} {users.length === 1 ? "user" : "users"}
        </p>
      </div>

      <form action="/admin/users" method="GET" className="max-w-md">
        <label htmlFor="q" className="sr-only">
          Search users
        </label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={q}
          placeholder="Search by name or email…"
          className="block w-full rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
        />
      </form>

      <ul className="space-y-3">
        {users.map((u) => {
          const isSelf = u.id === me.id;
          return (
            <li
              key={u.id}
              className="flex items-start justify-between gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-zinc-900 dark:text-white">
                  {u.name}
                </p>
                <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                  {u.email} · {u.role.toLowerCase()} ·{" "}
                  <span
                    className={
                      u.status === "ACTIVE"
                        ? "text-emerald-700 dark:text-emerald-400"
                        : u.status === "SUSPENDED"
                          ? "text-red-700 dark:text-red-400"
                          : "text-zinc-700 dark:text-zinc-400"
                    }
                  >
                    {u.status.toLowerCase()}
                  </span>
                  {isSelf && (
                    <span className="ml-2 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                      You
                    </span>
                  )}
                </p>
              </div>
              {!isSelf && (
                <div className="flex flex-col items-end gap-2">
                  <form action={changeUserRole} className="flex items-center gap-2">
                    <input type="hidden" name="userId" value={u.id} />
                    <select
                      name="role"
                      defaultValue={u.role}
                      className="rounded-lg border border-zinc-300 bg-white px-2 py-1 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                    >
                      <option value="MERCHANT">Merchant</option>
                      <option value="DEVELOPER">Developer</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                    <button
                      type="submit"
                      className="text-xs font-medium text-zinc-700 underline-offset-4 hover:underline dark:text-zinc-300"
                    >
                      Save role
                    </button>
                  </form>
                  {u.status === "SUSPENDED" ? (
                    <form action={reinstateUser}>
                      <input type="hidden" name="userId" value={u.id} />
                      <button
                        type="submit"
                        className="text-xs font-medium text-emerald-700 underline-offset-4 hover:underline dark:text-emerald-400"
                      >
                        Reinstate
                      </button>
                    </form>
                  ) : (
                    <form action={suspendUser}>
                      <input type="hidden" name="userId" value={u.id} />
                      <button
                        type="submit"
                        className="text-xs font-medium text-zinc-500 transition hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400"
                      >
                        Suspend
                      </button>
                    </form>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
