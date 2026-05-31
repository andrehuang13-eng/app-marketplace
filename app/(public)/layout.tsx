import type { ReactNode } from "react";
import { PublicHeader } from "@/components/public-header";
import { AnnouncementBanner } from "@/components/announcement-banner";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col bg-[#07070a] text-zinc-100">
      <div
        aria-hidden
        className="dot-grid pointer-events-none fixed inset-0 opacity-40"
      />
      <AnnouncementBanner />
      <PublicHeader />
      <div className="relative flex-1">{children}</div>
      <footer className="relative border-t border-white/[0.06] py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-xs text-zinc-500 sm:flex-row">
          <div className="flex items-center gap-2">
            <span
              aria-hidden
              className="size-2 rounded-full bg-gradient-to-br from-violet-500 to-cyan-400"
            />
            <span>© Storestack — concept portfolio project</span>
          </div>
          <span className="font-mono uppercase tracking-widest">
            built with Next.js · Prisma · Neon
          </span>
        </div>
      </footer>
    </div>
  );
}
