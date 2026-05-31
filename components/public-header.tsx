import Link from "next/link";
import { currentUser } from "@/lib/auth/dal";
import { SignOutButton } from "@/components/sign-out-button";

export async function PublicHeader() {
  const user = await currentUser();
  const dashboardHref =
    user?.role === "ADMIN"
      ? "/admin"
      : user?.role === "DEVELOPER"
        ? "/developer"
        : user?.role === "MERCHANT"
          ? "/merchant"
          : null;

  return (
    <header className="border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-3">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-base font-semibold tracking-tight text-zinc-900 dark:text-white"
          >
            Storestack
          </Link>
          <nav className="hidden gap-4 text-sm text-zinc-600 sm:flex dark:text-zinc-400">
            <Link href="/apps" className="transition hover:text-zinc-900 dark:hover:text-white">
              Browse
            </Link>
            <Link href="/search" className="transition hover:text-zinc-900 dark:hover:text-white">
              Search
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {dashboardHref ? (
            <>
              <Link
                href={dashboardHref}
                className="rounded-full bg-zinc-900 px-4 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Dashboard
              </Link>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="hidden text-sm font-medium text-zinc-700 transition hover:text-zinc-900 sm:inline dark:text-zinc-300 dark:hover:text-white"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="rounded-full bg-zinc-900 px-4 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
