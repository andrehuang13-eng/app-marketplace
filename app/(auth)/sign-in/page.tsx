import Link from "next/link";
import { SigninForm } from "./SigninForm";

export const metadata = { title: "Sign in" };

type SearchParams = Promise<{ next?: string; error?: string; reset?: string }>;

export default async function SignInPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
          Sign in to Storestack
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Welcome back.
        </p>
      </div>

      {params.reset === "1" && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          Password updated. You can sign in with your new password.
        </p>
      )}
      {params.error === "suspended" && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          This account has been suspended. Contact support if you believe this is a mistake.
        </p>
      )}

      <SigninForm next={params.next} />

      <div className="flex flex-col items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
        <Link
          href="/forgot-password"
          className="font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-white"
        >
          Forgot your password?
        </Link>
        <span>
          New here?{" "}
          <Link
            href="/sign-up"
            className="font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-white"
          >
            Create an account
          </Link>
        </span>
      </div>
    </div>
  );
}
