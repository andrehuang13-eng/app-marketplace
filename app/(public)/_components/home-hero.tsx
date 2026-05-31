"use client";

import { motion } from "framer-motion";
import { SplitReveal } from "@/components/motion";

export function HomeHero({
  totalApps,
  totalDevs,
}: {
  totalApps: number;
  totalDevs: number;
}) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-300 backdrop-blur"
      >
        <span className="size-1.5 rounded-full bg-lime-400 shadow-[0_0_10px_rgba(132,204,22,0.7)]" />
        {totalApps} apps published · {totalDevs} developers
      </motion.div>

      <h1 className="font-display text-5xl text-zinc-50 sm:text-7xl md:text-8xl">
        <SplitReveal text="Run your store." className="block" />
        <span className="block text-grad-cool italic">
          <SplitReveal text="Stack the apps." delay={0.3} />
        </span>
      </h1>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="mt-7 max-w-xl text-base leading-relaxed text-zinc-400 sm:text-lg"
      >
        The platform-agnostic marketplace where independent e-commerce merchants
        find apps that extend their store — and developers reach them across
        every storefront.
      </motion.p>
    </>
  );
}
