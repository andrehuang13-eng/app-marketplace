import Link from "next/link";
import { ResendVerifyButton } from "./ResendVerifyButton";
import { currentUser } from "@/lib/auth/dal";

export const metadata = { title: "Verify your email" };

type SearchParams = Promise<{ sent?: string }>;

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const user = await currentUser();

  return (
    <div className="space-y-6 text-center">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
        Verify your email
      </h1>
      {params.sent === "1" && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-left text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          We sent a verification link to your email. Open it to activate your
          account.
        </p>
      )}
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        {user
          ? `We sent a verification link to ${user.email}. Open it to activate your account. If it didn't arrive, you can resend it below.`
          : "Open the link we emailed you to activate your account. You can also sign in to resend the link."}
      </p>

      {user && !user.emailVerifiedAt && <ResendVerifyButton />}

      <div className="text-sm text-zinc-600 dark:text-zinc-400">
        <Link
          href="/sign-in"
          className="font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-white"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
