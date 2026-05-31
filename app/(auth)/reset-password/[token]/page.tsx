import Link from "next/link";
import { ResetPasswordForm } from "./ResetPasswordForm";
import { db } from "@/lib/db";

export const metadata = { title: "Reset password" };

type Params = Promise<{ token: string }>;

export default async function ResetPasswordPage({ params }: { params: Params }) {
  const { token } = await params;
  const record = await db.passwordResetToken.findUnique({ where: { token } });
  const invalid = !record || record.expiresAt < new Date();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
          Set a new password
        </h1>
        {invalid && (
          <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            This reset link is invalid or has expired. Please request a new one.
          </p>
        )}
      </div>
      {!invalid && <ResetPasswordForm token={token} />}
      <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
        {invalid ? (
          <Link
            href="/forgot-password"
            className="font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-white"
          >
            Request a new reset link
          </Link>
        ) : (
          <Link
            href="/sign-in"
            className="font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-white"
          >
            Cancel and sign in
          </Link>
        )}
      </p>
    </div>
  );
}
