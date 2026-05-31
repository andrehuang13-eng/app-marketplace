"use client";

import { Stagger, StaggerItem } from "@/components/motion";
import { AnimatedNumber } from "@/components/animated-number";

interface Stat {
  label: string;
  value: number;
  accent?: "magenta" | "indigo" | "cyan" | "lime" | "amber";
  format?: (n: number) => string;
}

const ACCENT_CLASS: Record<NonNullable<Stat["accent"]>, string> = {
  magenta: "from-pink-500/30 via-fuchsia-500/10 to-transparent text-pink-300",
  indigo: "from-indigo-500/30 via-violet-500/10 to-transparent text-indigo-300",
  cyan: "from-cyan-400/30 via-sky-500/10 to-transparent text-cyan-300",
  lime: "from-lime-400/30 via-emerald-500/10 to-transparent text-lime-300",
  amber: "from-amber-400/30 via-orange-500/10 to-transparent text-amber-300",
};

export function DashboardStats({ stats }: { stats: Stat[] }) {
  return (
    <Stagger className={`grid gap-3 ${stats.length === 4 ? "sm:grid-cols-4" : "sm:grid-cols-3"}`}>
      {stats.map((s, i) => {
        const accent = s.accent ?? (["magenta", "indigo", "cyan", "lime", "amber"][i % 5] as NonNullable<Stat["accent"]>);
        const cls = ACCENT_CLASS[accent];
        const [gradient, ...colorParts] = cls.split(" text-");
        const textColor = `text-${colorParts.join(" text-")}`;
        return (
          <StaggerItem key={s.label}>
            <div className="glass relative overflow-hidden rounded-2xl p-5">
              <div
                aria-hidden
                className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-70`}
              />
              <p className={`relative font-mono text-[10px] uppercase tracking-[0.22em] ${textColor}`}>
                / {s.label}
              </p>
              <p className="relative mt-2 font-display text-4xl text-zinc-50 sm:text-5xl">
                <AnimatedNumber value={s.value} format={s.format} />
              </p>
            </div>
          </StaggerItem>
        );
      })}
    </Stagger>
  );
}
