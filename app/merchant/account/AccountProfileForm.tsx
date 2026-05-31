"use client";

import { useActionState } from "react";
import { updateAccountProfile, type MerchantFormState } from "@/lib/actions/merchant";
import { Field, FormMessage, SubmitButton } from "@/components/form-field";

export function AccountProfileForm({ defaultName }: { defaultName: string }) {
  const [state, action, pending] = useActionState<MerchantFormState, FormData>(
    updateAccountProfile,
    undefined,
  );

  return (
    <form action={action} className="space-y-4" noValidate>
      <Field
        label="Display name"
        name="name"
        autoComplete="name"
        required
        defaultValue={defaultName}
        errors={state?.fieldErrors?.name}
      />
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
