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
        className="block text-sm font-medium text-zinc-900 dark:text-zinc-100"
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
        className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:border-white"
      />
      {hint && !hasError && (
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{hint}</p>
      )}
      {hasError && (
        <p id={errorId} className="mt-1 text-xs text-red-600 dark:text-red-400">
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
      className="w-full rounded-full bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
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
      ? "rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
      : "rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300";
  return (
    <p className={className} role={tone === "error" ? "alert" : undefined}>
      {message}
    </p>
  );
}
