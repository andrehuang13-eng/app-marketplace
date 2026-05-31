"use client";

import { useActionState, useState } from "react";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  type AdminFormState,
} from "@/lib/actions/admin";
import { Field, FormMessage, SubmitButton } from "@/components/form-field";

export function CategoryCreateForm() {
  const [state, action, pending] = useActionState<AdminFormState, FormData>(
    createCategory,
    undefined,
  );
  return (
    <form action={action} className="space-y-4" noValidate>
      <div className="grid gap-3 sm:grid-cols-3">
        <Field
          label="Name"
          name="name"
          required
          errors={state?.fieldErrors?.name}
        />
        <Field
          label="Slug"
          name="slug"
          required
          errors={state?.fieldErrors?.slug}
          hint="lowercase, hyphens"
        />
        <Field
          label="Sort order"
          name="sortOrder"
          type="number"
          required
          defaultValue="0"
          errors={state?.fieldErrors?.sortOrder}
        />
      </div>
      {state?.ok && state?.message && (
        <FormMessage message={state.message} tone="success" />
      )}
      {!state?.ok && <FormMessage message={state?.message} />}
      <SubmitButton pending={pending} pendingLabel="Creating…">
        Add category
      </SubmitButton>
    </form>
  );
}

export function CategoryRow({
  category,
}: {
  category: { id: string; slug: string; name: string; sortOrder: number; appCount: number };
}) {
  const [editing, setEditing] = useState(false);
  const [state, action, pending] = useActionState<AdminFormState, FormData>(
    updateCategory,
    undefined,
  );

  if (!editing) {
    return (
      <li className="flex items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div>
          <p className="text-sm font-semibold text-zinc-900 dark:text-white">
            {category.name}
          </p>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
            /{category.slug} · sort {category.sortOrder} · {category.appCount}{" "}
            {category.appCount === 1 ? "app" : "apps"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-xs font-medium text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-400"
          >
            Edit
          </button>
          <form action={deleteCategory}>
            <input type="hidden" name="id" value={category.id} />
            <button
              type="submit"
              disabled={category.appCount > 0}
              title={
                category.appCount > 0
                  ? "Move or delete the apps in this category first"
                  : "Delete category"
              }
              className="text-xs font-medium text-zinc-500 transition hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 dark:text-zinc-400 dark:hover:text-red-400"
            >
              Delete
            </button>
          </form>
        </div>
      </li>
    );
  }

  return (
    <li className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <form action={action} className="space-y-3" noValidate>
        <input type="hidden" name="id" value={category.id} />
        <div className="grid gap-3 sm:grid-cols-3">
          <Field
            label="Name"
            name="name"
            required
            defaultValue={category.name}
            errors={state?.fieldErrors?.name}
          />
          <Field
            label="Slug"
            name="slug"
            required
            defaultValue={category.slug}
            errors={state?.fieldErrors?.slug}
          />
          <Field
            label="Sort order"
            name="sortOrder"
            type="number"
            required
            defaultValue={String(category.sortOrder)}
            errors={state?.fieldErrors?.sortOrder}
          />
        </div>
        {state?.ok && state?.message && (
          <FormMessage message={state.message} tone="success" />
        )}
        {!state?.ok && <FormMessage message={state?.message} />}
        <div className="flex gap-2">
          <SubmitButton pending={pending} pendingLabel="Saving…">
            Save
          </SubmitButton>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800"
          >
            Cancel
          </button>
        </div>
      </form>
    </li>
  );
}
