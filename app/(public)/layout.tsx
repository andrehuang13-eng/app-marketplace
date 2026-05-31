import type { ReactNode } from "react";
import { PublicHeader } from "@/components/public-header";
import { AnnouncementBanner } from "@/components/announcement-banner";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      <AnnouncementBanner />
      <PublicHeader />
      <div className="flex-1">{children}</div>
      <footer className="border-t border-zinc-200 bg-white py-6 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 text-xs text-zinc-500 dark:text-zinc-400">
          <span>© Storestack</span>
          <span>App marketplace for e-commerce merchants</span>
        </div>
      </footer>
    </div>
  );
}
