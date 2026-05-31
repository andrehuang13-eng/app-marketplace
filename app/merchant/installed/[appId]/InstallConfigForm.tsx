"use client";

import { useActionState } from "react";
import { updateInstallConfig, type MerchantFormState } from "@/lib/actions/merchant";
import { Field, FormMessage, SubmitButton } from "@/components/form-field";

export function InstallConfigForm({
  appId,
  defaultApiKey,
  defaultWebhookUrl,
}: {
  appId: string;
  defaultApiKey: string;
  defaultWebhookUrl: string;
}) {
  const [state, action, pending] = useActionState<MerchantFormState, FormData>(
    updateInstallConfig,
    undefined,
  );

  return (
    <form action={action} className="space-y-4" noValidate>
      <input type="hidden" name="appId" value={appId} />
      <Field
        label="API key"
        name="apiKey"
        defaultValue={defaultApiKey}
        errors={state?.fieldErrors?.apiKey}
        hint="Demo only — any non-empty value is accepted."
      />
      <Field
        label="Webhook URL"
        name="webhookUrl"
        type="url"
        defaultValue={defaultWebhookUrl}
        errors={state?.fieldErrors?.webhookUrl}
        hint="Demo only — any non-empty URL is accepted."
      />
      {state?.ok && state?.message && (
        <FormMessage message={state.message} tone="success" />
      )}
      {!state?.ok && <FormMessage message={state?.message} />}
      <SubmitButton pending={pending} pendingLabel="Saving…">
        Save configuration
      </SubmitButton>
    </form>
  );
}
