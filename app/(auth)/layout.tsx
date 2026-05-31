import Link from "next/link";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col bg-[#07070a] text-zinc-100">
      <div aria-hidden className="aurora" />
      <div aria-hidden className="dot-grid pointer-events-none fixed inset-0 opacity-30" />
      <header className="relative border-b border-white/[0.06] bg-black/30 px-6 py-4 backdrop-blur-xl">
        <Link href="/" className="group flex items-center gap-2 text-sm font-semibold">
          <span aria-hidden className="relative inline-flex h-6 w-6 items-center justify-center">
            <span className="absolute inset-0 rounded-md bg-gradient-to-br from-pink-500 via-indigo-500 to-cyan-400 opacity-90 blur-[2px]" />
            <span className="absolute inset-[2px] rounded-[5px] bg-zinc-950" />
            <span className="relative text-[10px] font-bold text-white">S</span>
          </span>
          <span className="text-zinc-50">Storestack</span>
        </Link>
      </header>
      <main className="relative flex flex-1 items-center justify-center px-6 py-16">
        <div className="glass w-full max-w-md rounded-3xl p-8 sm:p-10">{children}</div>
      </main>
    </div>
  );
}
