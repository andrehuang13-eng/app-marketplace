"use client";

import { useActionState } from "react";
import {
  updateDeveloperProfile,
  type DeveloperFormState,
} from "@/lib/actions/developer";
import { Field, FormMessage, SubmitButton } from "@/components/form-field";

export function DeveloperProfileForm({
  defaults,
}: {
  defaults: { companyName: string; bio: string; supportEmail: string };
}) {
  const [state, action, pending] = useActionState<DeveloperFormState, FormData>(
    updateDeveloperProfile,
    undefined,
  );

  return (
    <form action={action} className="space-y-4" noValidate>
      <Field
        label="Company name"
        name="companyName"
        autoComplete="organization"
        required
        defaultValue={defaults.companyName}
        errors={state?.fieldErrors?.companyName}
      />
      <Field
        label="Support email"
        name="supportEmail"
        type="email"
        autoComplete="email"
        required
        defaultValue={defaults.supportEmail}
        errors={state?.fieldErrors?.supportEmail}
        hint="Shown to merchants on each app's detail page."
      />
      <div>
        <label
          htmlFor="bio"
          className="block text-sm font-medium text-zinc-900 dark:text-zinc-100"
        >
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={4}
          maxLength={800}
          defaultValue={defaults.bio}
          className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
        />
        {state?.fieldErrors?.bio && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">
            {state.fieldErrors.bio.join(", ")}
          </p>
        )}
      </div>
      {state?.ok && state?.message && (
        <FormMessage message={state.message} tone="success" />
      )}
      {!state?.ok && <FormMessage message={state?.message} />}
      <SubmitButton pending={pending} pendingLabel="Saving…">
        Save profile
      </SubmitButton>
    </form>
  );
}
