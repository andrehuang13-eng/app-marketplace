import { signout } from "@/lib/actions/auth";

export function SignOutButton({
  className,
  label = "Sign out",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <form action={signout}>
      <button
        type="submit"
        className={
          className ??
          "rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-900 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800"
        }
      >
        {label}
      </button>
    </form>
  );
}
