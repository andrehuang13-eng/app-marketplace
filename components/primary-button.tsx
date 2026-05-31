import Link from "next/link";
import type { ReactNode } from "react";

interface PrimaryButtonProps {
  href?: string;
  type?: "button" | "submit";
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "ghost";
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}

export function PrimaryButton({
  href,
  type = "button",
  size = "md",
  variant = "primary",
  children,
  className = "",
  disabled,
}: PrimaryButtonProps) {
  const sizeCls =
    size === "lg"
      ? "px-6 py-3 text-sm"
      : size === "sm"
        ? "px-3 py-1.5 text-xs"
        : "px-5 py-2.5 text-sm";

  const variantCls =
    variant === "primary"
      ? "bg-zinc-50 text-zinc-950 hover:bg-white shadow-[0_0_0_1px_rgba(255,255,255,0.12),0_8px_24px_-8px_rgba(236,72,153,0.55),0_0_40px_-10px_rgba(34,211,238,0.45)]"
      : "border border-white/15 bg-white/5 text-zinc-100 backdrop-blur hover:border-white/30 hover:bg-white/10";

  const baseCls = `inline-flex items-center justify-center rounded-full font-medium transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60 ${sizeCls} ${variantCls} ${className}`;

  if (href) {
    return (
      <Link href={href} className={baseCls}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} disabled={disabled} className={baseCls}>
      {children}
    </button>
  );
}
