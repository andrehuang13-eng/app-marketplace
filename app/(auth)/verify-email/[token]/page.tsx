import Link from "next/link";
import { verifyEmailWithToken } from "@/lib/actions/auth";

export const metadata = { title: "Verifying email" };

type Params = Promise<{ token: string }>;

export default async function VerifyEmailTokenPage({ params }: { params: Params }) {
  const { token } = await params;
  const result = await verifyEmailWithToken(token);

  return (
    <div className="space-y-6 text-center">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
        {result.ok ? "Email verified" : "Verification failed"}
      </h1>
      <p
        className={
          result.ok
            ? "rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
            : "rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300"
        }
      >
        {result.message}
      </p>
      <Link
        href={result.ok ? "/sign-in" : "/verify-email"}
        className="inline-block rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {result.ok ? "Sign in" : "Back to verify"}
      </Link>
    </div>
  );
}
