"use client";

import { useActionState, useState } from "react";
import { approveApp, rejectApp, type AdminFormState } from "@/lib/actions/admin";
import { FormMessage } from "@/components/form-field";

export function DecisionForm({ appId }: { appId: string }) {
  const [intent, setIntent] = useState<"approve" | "reject">("approve");
  const action = intent === "approve" ? approveApp : rejectApp;
  const [state, dispatch, pending] = useActionState<AdminFormState, FormData>(
    action,
    undefined,
  );

  return (
    <form action={dispatch} className="space-y-4" noValidate>
      <input type="hidden" name="appId" value={appId} />

      <div>
        <p className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Decision
        </p>
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={() => setIntent("approve")}
            className={`flex-1 rounded-full px-3 py-1.5 text-sm font-medium transition ${
              intent === "approve"
                ? "bg-emerald-600 text-white"
                : "border border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            }`}
          >
            Approve
          </button>
          <button
            type="button"
            onClick={() => setIntent("reject")}
            className={`flex-1 rounded-full px-3 py-1.5 text-sm font-medium transition ${
              intent === "reject"
                ? "bg-red-600 text-white"
                : "border border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            }`}
          >
            Reject
          </button>
        </div>
      </div>

      <div>
        <label
          htmlFor="comment"
          className="block text-sm font-medium text-zinc-900 dark:text-zinc-100"
        >
          {intent === "approve" ? "Approval note" : "Reason for rejection"}
        </label>
        <textarea
          id="comment"
          name="comment"
          required
          minLength={5}
          maxLength={2000}
          rows={6}
          placeholder={
            intent === "approve"
              ? "Optional note included in the developer's approval email."
              : "Required. Sent to the developer in the rejection email."
          }
          className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
          aria-invalid={state?.fieldErrors?.comment ? true : undefined}
        />
        {state?.fieldErrors?.comment && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">
            {state.fieldErrors.comment.join(", ")}
          </p>
        )}
      </div>

      <FormMessage message={state?.message} />

      <button
        type="submit"
        disabled={pending}
        className={`w-full rounded-full px-4 py-2 text-sm font-medium text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60 ${
          intent === "approve"
            ? "bg-emerald-600 hover:bg-emerald-700"
            : "bg-red-600 hover:bg-red-700"
        }`}
      >
        {pending
          ? intent === "approve"
            ? "Approving…"
            : "Rejecting…"
          : intent === "approve"
            ? "Approve and publish"
            : "Reject submission"}
      </button>
    </form>
  );
}
