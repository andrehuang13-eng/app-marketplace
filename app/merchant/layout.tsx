import type { ReactNode } from "react";
import { requireRole } from "@/lib/auth/dal";
import { SiteHeader } from "@/components/site-header";

export default async function MerchantLayout({ children }: { children: ReactNode }) {
  const user = await requireRole("MERCHANT");
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <SiteHeader user={user} area="merchant" />
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
