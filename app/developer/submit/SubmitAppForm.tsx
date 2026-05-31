"use client";

import { useActionState, useState } from "react";
import { saveApp, type DeveloperFormState } from "@/lib/actions/developer";
import { Field, FormMessage } from "@/components/form-field";

interface ExistingApp {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  descriptionMd: string;
  iconUrl: string | null;
  pricingModel: "FREE" | "FREEMIUM" | "PAID";
  categoryId: string;
  status: "DRAFT" | "IN_REVIEW" | "APPROVED" | "REJECTED" | "PUBLISHED";
}

export function SubmitAppForm({
  categories,
  existing,
}: {
  categories: { id: string; name: string }[];
  existing: ExistingApp | null;
}) {
  const [state, action, pending] = useActionState<DeveloperFormState, FormData>(
    saveApp,
    undefined,
  );
  const [intent, setIntent] = useState<"draft" | "submit">("draft");

  return (
    <form action={action} className="space-y-8" noValidate>
      {existing && <input type="hidden" name="appId" value={existing.id} />}
      <input type="hidden" name="intent" value={intent} />

      <Section title="Basics" caption="Public-facing identity of your app.">
        <Field
          label="Name"
          name="name"
          required
          defaultValue={existing?.name}
          errors={state?.fieldErrors?.name}
        />
        <Field
          label="Slug"
          name="slug"
          required
          defaultValue={existing?.slug}
          errors={state?.fieldErrors?.slug}
          hint="Used in your app's URL (e.g. /apps/your-slug). Lowercase letters, numbers, hyphens."
        />
        <Field
          label="Tagline"
          name="tagline"
          required
          defaultValue={existing?.tagline}
          errors={state?.fieldErrors?.tagline}
          hint="A one-line pitch. Shown in app cards and search results."
        />
      </Section>

      <Section title="Description" caption="Markdown supported. Headings, lists, and links render in the app detail page.">
        <div>
          <label
            htmlFor="descriptionMd"
            className="block text-sm font-medium text-zinc-900 dark:text-zinc-100"
          >
            Description (Markdown)
          </label>
          <textarea
            id="descriptionMd"
            name="descriptionMd"
            required
            defaultValue={existing?.descriptionMd ?? ""}
            rows={12}
            minLength={50}
            maxLength={20000}
            className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-sm text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
          />
          {state?.fieldErrors?.descriptionMd && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
              {state.fieldErrors.descriptionMd.join(", ")}
            </p>
          )}
        </div>
      </Section>

      <Section title="Category & pricing" caption="Helps merchants find your app and understand the model.">
        <div>
          <label
            htmlFor="categoryId"
            className="block text-sm font-medium text-zinc-900 dark:text-zinc-100"
          >
            Category
          </label>
          <select
            id="categoryId"
            name="categoryId"
            required
            defaultValue={existing?.categoryId ?? ""}
            className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
          >
            <option value="" disabled>
              Select a category
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {state?.fieldErrors?.categoryId && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
              {state.fieldErrors.categoryId.join(", ")}
            </p>
          )}
        </div>

        <div>
          <p className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Pricing model
          </p>
          <div className="mt-1 flex gap-3">
            {(["FREE", "FREEMIUM", "PAID"] as const).map((p) => (
              <label
                key={p}
                className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300"
              >
                <input
                  type="radio"
                  name="pricingModel"
                  value={p}
                  defaultChecked={existing?.pricingModel === p}
                  required
                />
                {p === "FREE" ? "Free" : p === "FREEMIUM" ? "Freemium" : "Paid"}
              </label>
            ))}
          </div>
          {state?.fieldErrors?.pricingModel && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
              {state.fieldErrors.pricingModel.join(", ")}
            </p>
          )}
        </div>
      </Section>

      <Section title="Branding" caption="Icon URL for now (full upload to Vercel Blob lands in the polish pass).">
        <Field
          label="Icon URL"
          name="iconUrl"
          type="url"
          defaultValue={existing?.iconUrl ?? ""}
          errors={state?.fieldErrors?.iconUrl}
          hint="Optional. Square image, 512×512 recommended. Leave blank to use a generated avatar."
        />
      </Section>

      {state?.ok && state?.message && (
        <FormMessage message={state.message} tone="success" />
      )}
      {!state?.ok && <FormMessage message={state?.message} />}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          onClick={() => setIntent("draft")}
          disabled={pending}
          className="rounded-full border border-zinc-300 bg-white px-5 py-2 text-sm font-medium text-zinc-900 shadow-sm transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800"
        >
          {pending && intent === "draft" ? "Saving…" : "Save draft"}
        </button>
        <button
          type="submit"
          onClick={() => setIntent("submit")}
          disabled={pending}
          className="rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {pending && intent === "submit" ? "Submitting…" : "Submit for review"}
        </button>
      </div>
    </form>
  );
}

function Section({
  title,
  caption,
  children,
}: {
  title: string;
  caption?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <header className="mb-4">
        <h2 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-white">
          {title}
        </h2>
        {caption && (
          <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">
            {caption}
          </p>
        )}
      </header>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
