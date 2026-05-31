"use client";

import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type HTMLMotionProps,
} from "framer-motion";
import type { ReactNode } from "react";

interface TiltCardProps extends Omit<HTMLMotionProps<"div">, "ref"> {
  children: ReactNode;
  intensity?: number;
  glow?: boolean;
  href?: string;
}

export function TiltCard({
  children,
  intensity = 8,
  glow = false,
  href,
  className = "",
  ...rest
}: TiltCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [intensity, -intensity]), {
    stiffness: 220,
    damping: 24,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-intensity, intensity]), {
    stiffness: 220,
    damping: 24,
  });

  // Spotlight position for ::before via custom props.
  const spotlightX = useTransform(x, (v) => `${(v + 0.5) * 100}%`);
  const spotlightY = useTransform(y, (v) => `${(v + 0.5) * 100}%`);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - rect.left) / rect.width - 0.5);
    y.set((event.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const Comp = motion.div;

  return (
    <Comp
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 1200,
        transformStyle: "preserve-3d",
        ["--spotlight-x" as string]: spotlightX,
        ["--spotlight-y" as string]: spotlightY,
      }}
      className={`relative transform-gpu will-change-transform ${glow ? "tilt-glow" : ""} ${className}`}
      {...rest}
    >
      {children}
      {glow && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(220px circle at var(--spotlight-x) var(--spotlight-y), rgba(139,92,246,0.18), transparent 70%)",
          }}
        />
      )}
    </Comp>
  );
}
