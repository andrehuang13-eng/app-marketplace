"use client";

import { useActionState } from "react";
import { signupMerchant, type AuthFormState } from "@/lib/actions/auth";
import { Field, FormMessage, SubmitButton } from "@/components/form-field";

export function SignupMerchantForm() {
  const [state, action, pending] = useActionState<AuthFormState, FormData>(
    signupMerchant,
    undefined,
  );

  return (
    <form action={action} className="space-y-4" noValidate>
      <Field
        label="Name"
        name="name"
        autoComplete="name"
        required
        errors={state?.fieldErrors?.name}
      />
      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
        errors={state?.fieldErrors?.email}
      />
      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        errors={state?.fieldErrors?.password}
        hint="At least 8 characters, with a letter and a number."
      />
      <FormMessage message={state?.message} />
      <SubmitButton pending={pending} pendingLabel="Creating account…">
        Create account
      </SubmitButton>
    </form>
  );
}
