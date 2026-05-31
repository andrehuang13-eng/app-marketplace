"use client";

import { useActionState } from "react";
import { setFeaturedApps, setBanner, type AdminFormState } from "@/lib/actions/admin";
import { FormMessage, SubmitButton } from "@/components/form-field";

export function FeaturedAppsForm({
  apps,
}: {
  apps: { id: string; name: string; featured: boolean }[];
}) {
  const [state, action, pending] = useActionState<AdminFormState, FormData>(
    setFeaturedApps,
    undefined,
  );
  return (
    <form action={action} className="space-y-4" noValidate>
      <div className="grid gap-2 sm:grid-cols-2">
        {apps.map((a) => (
          <label
            key={a.id}
            className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white p-2 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
          >
            <input
              type="checkbox"
              name="featured"
              value={a.id}
              defaultChecked={a.featured}
              className="size-3.5 rounded border-zinc-300 dark:border-zinc-700"
            />
            <span className="truncate">{a.name}</span>
          </label>
        ))}
      </div>
      {state?.ok && state?.message && (
        <FormMessage message={state.message} tone="success" />
      )}
      {!state?.ok && <FormMessage message={state?.message} />}
      <SubmitButton pending={pending} pendingLabel="Saving…">
        Save featured apps
      </SubmitButton>
    </form>
  );
}

export function BannerForm({
  defaults,
}: {
  defaults: { enabled: boolean; message: string; type: "info" | "success" | "warning" };
}) {
  const [state, action, pending] = useActionState<AdminFormState, FormData>(
    setBanner,
    undefined,
  );
  return (
    <form action={action} className="space-y-4" noValidate>
      <label className="flex items-center gap-2 text-sm text-zinc-900 dark:text-white">
        <input
          type="checkbox"
          name="enabled"
          defaultChecked={defaults.enabled}
          className="size-3.5 rounded border-zinc-300 dark:border-zinc-700"
        />
        Enable banner
      </label>
      <div>
        <label
          htmlFor="message"
          className="block text-sm font-medium text-zinc-900 dark:text-zinc-100"
        >
          Message
        </label>
        <input
          id="message"
          name="message"
          type="text"
          defaultValue={defaults.message}
          maxLength={280}
          className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
        />
      </div>
      <div>
        <label
          htmlFor="type"
          className="block text-sm font-medium text-zinc-900 dark:text-zinc-100"
        >
          Tone
        </label>
        <select
          id="type"
          name="type"
          defaultValue={defaults.type}
          className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
        >
          <option value="info">Info (default)</option>
          <option value="success">Success</option>
          <option value="warning">Warning</option>
        </select>
      </div>
      {state?.ok && state?.message && (
        <FormMessage message={state.message} tone="success" />
      )}
      {!state?.ok && <FormMessage message={state?.message} />}
      <SubmitButton pending={pending} pendingLabel="Saving…">
        Save banner
      </SubmitButton>
    </form>
  );
}
