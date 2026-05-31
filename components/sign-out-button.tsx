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
          "rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-sm font-medium text-zinc-300 backdrop-blur transition hover:border-white/30 hover:bg-white/10 hover:text-zinc-50"
        }
      >
        {label}
      </button>
    </form>
  );
}
