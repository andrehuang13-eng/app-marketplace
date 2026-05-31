"use client";

import { useActionState, useState } from "react";
import { writeReview, type MerchantFormState } from "@/lib/actions/merchant";
import { FormMessage, SubmitButton } from "@/components/form-field";

export function ReviewForm({
  appId,
  defaultRating,
  defaultBody,
}: {
  appId: string;
  defaultRating: number;
  defaultBody: string;
}) {
  const [state, action, pending] = useActionState<MerchantFormState, FormData>(
    writeReview,
    undefined,
  );
  const [rating, setRating] = useState(defaultRating);

  return (
    <form
      action={action}
      className="space-y-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
      noValidate
    >
      <input type="hidden" name="appId" value={appId} />
      <input type="hidden" name="rating" value={rating} />

      <div>
        <p className="mb-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Your rating
        </p>
        <div className="flex gap-1" role="radiogroup" aria-label="Rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              role="radio"
              aria-checked={rating === star}
              onClick={() => setRating(star)}
              className={`text-2xl transition ${
                star <= rating
                  ? "text-amber-500"
                  : "text-zinc-300 hover:text-amber-400 dark:text-zinc-700"
              }`}
            >
              ★
            </button>
          ))}
        </div>
        {state?.fieldErrors?.rating && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">
            {state.fieldErrors.rating.join(", ")}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="body"
          className="block text-sm font-medium text-zinc-900 dark:text-zinc-100"
        >
          Your review
        </label>
        <textarea
          id="body"
          name="body"
          required
          defaultValue={defaultBody}
          rows={4}
          minLength={10}
          maxLength={2000}
          className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
          aria-invalid={state?.fieldErrors?.body ? true : undefined}
        />
        {state?.fieldErrors?.body && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">
            {state.fieldErrors.body.join(", ")}
          </p>
        )}
      </div>

      {state?.ok && state?.message && (
        <FormMessage message={state.message} tone="success" />
      )}
      {!state?.ok && <FormMessage message={state?.message} />}
      <SubmitButton pending={pending} pendingLabel="Saving…">
        Save review
      </SubmitButton>
    </form>
  );
}
