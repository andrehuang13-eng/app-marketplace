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
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-black/40 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-3">
        <Link
          href="/"
          className="group flex items-center gap-2 text-base font-semibold tracking-tight"
        >
          <span
            aria-hidden
            className="relative inline-flex h-6 w-6 items-center justify-center"
          >
            <span className="absolute inset-0 rounded-md bg-gradient-to-br from-pink-500 via-indigo-500 to-cyan-400 opacity-90 blur-[2px] transition group-hover:opacity-100" />
            <span className="absolute inset-[2px] rounded-[5px] bg-zinc-950" />
            <span className="relative text-[10px] font-bold text-white">S</span>
          </span>
          <span className="text-zinc-50">Storestack</span>
        </Link>

        <nav className="hidden gap-1 text-sm sm:flex">
          {[
            ["/apps", "Browse"],
            ["/search", "Search"],
          ].map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className="rounded-full px-3 py-1.5 text-zinc-400 transition hover:bg-white/5 hover:text-zinc-50"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {dashboardHref ? (
            <>
              <Link
                href={dashboardHref}
                className="rounded-full bg-zinc-50 px-4 py-1.5 text-sm font-medium text-zinc-950 transition hover:bg-white"
              >
                Dashboard
              </Link>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="hidden rounded-full px-3 py-1.5 text-sm font-medium text-zinc-400 transition hover:text-zinc-50 sm:inline"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="rounded-full bg-zinc-50 px-4 py-1.5 text-sm font-medium text-zinc-950 transition hover:bg-white"
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
