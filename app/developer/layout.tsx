import type { ReactNode } from "react";
import { requireRole } from "@/lib/auth/dal";
import { SiteHeader } from "@/components/site-header";

export default async function DeveloperLayout({ children }: { children: ReactNode }) {
  const user = await requireRole("DEVELOPER");
  return (
    <div className="relative min-h-screen bg-[#07070a] text-zinc-100">
      <div aria-hidden className="dot-grid pointer-events-none fixed inset-0 opacity-30" />
      <SiteHeader user={user} area="developer" />
      <main className="relative mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
