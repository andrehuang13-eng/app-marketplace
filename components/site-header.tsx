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
      { href: "/admin", label: "Queue" },
      { href: "/admin/apps", label: "Apps" },
      { href: "/admin/categories", label: "Categories" },
      { href: "/admin/users", label: "Users" },
      { href: "/admin/audit", label: "Audit" },
      { href: "/admin/settings", label: "Settings" },
    ],
  };

  const accent =
    area === "merchant"
      ? "bg-gradient-to-br from-cyan-400 to-emerald-400"
      : area === "developer"
        ? "bg-gradient-to-br from-violet-500 to-fuchsia-500"
        : "bg-gradient-to-br from-amber-400 to-rose-500";

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-black/40 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-3">
        <div className="flex items-center gap-4">
          <Link href="/" className="group flex items-center gap-2 text-sm font-semibold">
            <span aria-hidden className="relative inline-flex h-6 w-6 items-center justify-center">
              <span className={`absolute inset-0 rounded-md ${accent} opacity-90 blur-[2px]`} />
              <span className="absolute inset-[2px] rounded-[5px] bg-zinc-950" />
              <span className="relative text-[10px] font-bold text-white">S</span>
            </span>
            <span className="text-zinc-50">Storestack</span>
          </Link>
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500 sm:inline">
            / {area}
          </span>
          <nav className="hidden gap-1 sm:flex">
            {nav[area].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-3 py-1.5 text-sm text-zinc-400 transition hover:bg-white/5 hover:text-zinc-50"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-zinc-500 sm:inline">{user.name}</span>
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
