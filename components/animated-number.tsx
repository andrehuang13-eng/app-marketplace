"use client";

import { animate, useInView, useMotionValue, useTransform, motion } from "framer-motion";
import { useEffect, useRef } from "react";

export function AnimatedNumber({
  value,
  duration = 1.4,
  format = (n: number) => n.toLocaleString(),
}: {
  value: number;
  duration?: number;
  format?: (n: number) => string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const motionVal = useMotionValue(0);
  const rounded = useTransform(motionVal, (v) => format(Math.round(v)));

  useEffect(() => {
    if (!inView) return;
    const controls = animate(motionVal, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
    });
    return controls.stop;
  }, [inView, motionVal, value, duration]);

  return (
    <span ref={ref}>
      <motion.span>{rounded}</motion.span>
    </span>
  );
}
