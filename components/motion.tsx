"use client";

import {
  motion,
  useInView,
  useScroll,
  useTransform,
  type Variants,
  type HTMLMotionProps,
  type Variant,
} from "framer-motion";
import { useRef, type ReactNode } from "react";

const RISE: Variants = {
  hidden: { opacity: 0, y: 28, filter: "blur(10px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  } as Variant,
};

const STAGGER: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};

const ITEM: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  } as Variant,
};

type RevealProps = Omit<HTMLMotionProps<"div">, "ref"> & {
  children: ReactNode;
  delay?: number;
  once?: boolean;
};

export function Reveal({ children, delay = 0, once = true, ...rest }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, margin: "-10%" });
  return (
    <motion.div
      ref={ref}
      variants={RISE}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      transition={{ delay }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

type StaggerProps = Omit<HTMLMotionProps<"div">, "ref"> & {
  children: ReactNode;
};

export function Stagger({ children, ...rest }: StaggerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  return (
    <motion.div
      ref={ref}
      variants={STAGGER}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

type StaggerItemProps = Omit<HTMLMotionProps<"div">, "ref"> & {
  children: ReactNode;
};

export function StaggerItem({ children, ...rest }: StaggerItemProps) {
  return (
    <motion.div variants={ITEM} {...rest}>
      {children}
    </motion.div>
  );
}

/**
 * Parallax: shifts children by `intensity` px (positive = moves up faster than scroll).
 */
export function Parallax({
  children,
  intensity = 60,
  className,
}: {
  children: ReactNode;
  intensity?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [intensity, -intensity]);
  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  );
}

/**
 * SplitReveal: animates each word of a phrase with a stagger.
 * Useful for big serif headlines.
 */
export function SplitReveal({
  text,
  className,
  delay = 0,
  as: As = "span",
}: {
  text: string;
  className?: string;
  delay?: number;
  as?: keyof React.JSX.IntrinsicElements;
}) {
  const words = text.split(" ");
  return (
    <As className={className}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom">
          <motion.span
            className="inline-block"
            initial={{ y: "110%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              delay: delay + i * 0.08,
              duration: 0.8,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {word}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </As>
  );
}
