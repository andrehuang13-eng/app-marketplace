import Link from "next/link";
import { SignOutButton } from "@/components/sign-out-button";

export function SiteHeader({
  user,
  area,
}: {
  user: { name: string; email: string };
  area: "merchant" | "developer" | "admin";
}) {
  const nav: Record<typeof area, { href: string; label: string }[]> = {
    merchant: [
      { href: "/merchant", label: "Installed" },
      { href: "/merchant/favorites", label: "Favorites" },
      { href: "/merchant/reviews", label: "Reviews" },
      { href: "/merchant/account", label: "Account" },
    ],
    developer: [
      { href: "/developer", label: "My apps" },
      { href: "/developer/submit", label: "Submit" },
      { href: "/developer/analytics", label: "Analytics" },
      { href: "/developer/profile", label: "Profile" },
    ],
    admin: [
      { href: "/admin", label: "Review queue" },
      { href: "/admin/apps", label: "Apps" },
      { href: "/admin/categories", label: "Categories" },
      { href: "/admin/users", label: "Users" },
      { href: "/admin/audit", label: "Audit" },
      { href: "/admin/settings", label: "Settings" },
    ],
  };

  return (
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-3">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-base font-semibold tracking-tight text-zinc-900 dark:text-white"
          >
            Storestack
          </Link>
          <nav className="hidden gap-4 text-sm text-zinc-600 sm:flex dark:text-zinc-400">
            {nav[area].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition hover:text-zinc-900 dark:hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-zinc-600 sm:inline dark:text-zinc-400">
            {user.name}
          </span>
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
