"use client";

import { useState, useTransition } from "react";
import { resendVerifyEmail } from "@/lib/actions/auth";

export function ResendVerifyButton() {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(
    null,
  );

  return (
    <div className="space-y-3">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          startTransition(async () => {
            const result = await resendVerifyEmail();
            if (result?.ok) {
              setMessage({ tone: "success", text: result.message ?? "Verification email sent" });
            } else {
              setMessage({
                tone: "error",
                text: result?.message ?? "Could not send verification email",
              });
            }
          });
        }}
        className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 shadow-sm transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800"
      >
        {pending ? "Sending…" : "Resend verification email"}
      </button>
      {message && (
        <p
          className={
            message.tone === "success"
              ? "text-sm text-emerald-700 dark:text-emerald-400"
              : "text-sm text-red-700 dark:text-red-400"
          }
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
