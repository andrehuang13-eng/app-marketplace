"use client";

import { useActionState } from "react";
import { resetPassword, type AuthFormState } from "@/lib/actions/auth";
import { Field, FormMessage, SubmitButton } from "@/components/form-field";

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState<AuthFormState, FormData>(
    resetPassword,
    undefined,
  );

  return (
    <form action={action} className="space-y-4" noValidate>
      <input type="hidden" name="token" value={token} />
      <Field
        label="New password"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        errors={state?.fieldErrors?.password}
        hint="At least 8 characters, with a letter and a number."
      />
      <Field
        label="Confirm new password"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        required
        errors={state?.fieldErrors?.confirmPassword}
      />
      <FormMessage message={state?.message} />
      <SubmitButton pending={pending} pendingLabel="Updating…">
        Update password
      </SubmitButton>
    </form>
  );
}
