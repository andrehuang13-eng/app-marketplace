"use client";

import { AnimatedNumber } from "@/components/animated-number";

export function HeroCounters({
  totalApps,
  totalInstalls,
  totalDevs,
}: {
  totalApps: number;
  totalInstalls: number;
  totalDevs: number;
}) {
  return (
    <div className="mt-16 grid w-full max-w-2xl grid-cols-3 divide-x divide-white/[0.08] rounded-2xl border border-white/[0.08] bg-white/[0.02] py-5 backdrop-blur">
      <Stat label="Apps live" value={totalApps} />
      <Stat label="Installs" value={totalInstalls} />
      <Stat label="Developers" value={totalDevs} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="px-4 text-center">
      <p className="text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
        <AnimatedNumber value={value} />
      </p>
      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
        {label}
      </p>
    </div>
  );
}
