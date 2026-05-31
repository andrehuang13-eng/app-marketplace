import Link from "next/link";
import { SignupMerchantForm } from "./SignupMerchantForm";

export const metadata = { title: "Sign up as merchant" };

export default function SignUpMerchantPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
          Create a merchant account
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Browse and install apps that extend your store.
        </p>
      </div>

      <SignupMerchantForm />

      <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
        Already have an account?{" "}
        <Link href="/sign-in" className="font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-white">
          Sign in
        </Link>
      </p>
      <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
        Building apps instead?{" "}
        <Link href="/sign-up/developer" className="font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-white">
          Sign up as a developer
        </Link>
      </p>
    </div>
  );
}
