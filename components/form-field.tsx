"use client";

import type { ReactNode } from "react";

export function Field({
  label,
  name,
  type = "text",
  autoComplete,
  required,
  errors,
  hint,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
  errors?: string[];
  hint?: string;
  defaultValue?: string;
}) {
  const hasError = errors && errors.length > 0;
  const errorId = hasError ? `${name}-error` : undefined;
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-xs font-medium uppercase tracking-widest text-zinc-400"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        defaultValue={defaultValue}
        aria-invalid={hasError ? true : undefined}
        aria-describedby={errorId}
        className="mt-1.5 block w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 backdrop-blur transition focus:border-violet-400/60 focus:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-violet-400/20"
      />
      {hint && !hasError && (
        <p className="mt-1.5 text-xs text-zinc-500">{hint}</p>
      )}
      {hasError && (
        <p id={errorId} className="mt-1.5 text-xs text-rose-400">
          {errors!.join(", ")}
        </p>
      )}
    </div>
  );
}

export function SubmitButton({
  pending,
  children,
  pendingLabel,
}: {
  pending: boolean;
  children: ReactNode;
  pendingLabel?: string;
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-full bg-zinc-50 px-4 py-2.5 text-sm font-medium text-zinc-950 shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_8px_24px_-8px_rgba(139,92,246,0.5),0_0_40px_-10px_rgba(34,211,238,0.4)] transition-all duration-300 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? pendingLabel ?? "Working…" : children}
    </button>
  );
}

export function FormMessage({
  message,
  tone = "error",
}: {
  message?: string;
  tone?: "error" | "success";
}) {
  if (!message) return null;
  const className =
    tone === "success"
      ? "rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-300"
      : "rounded-xl border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-sm text-rose-300";
  return (
    <p className={className} role={tone === "error" ? "alert" : undefined}>
      {message}
    </p>
  );
}
