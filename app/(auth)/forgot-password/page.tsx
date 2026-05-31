import Link from "next/link";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

export const metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
          Forgot your password?
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Enter your email and we'll send a reset link.
        </p>
      </div>
      <ForgotPasswordForm />
      <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
        Remembered it?{" "}
        <Link
          href="/sign-in"
          className="font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-white"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
