import Link from "next/link";
import { SignupDeveloperForm } from "./SignupDeveloperForm";

export const metadata = { title: "Sign up as developer" };

export default function SignUpDeveloperPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
          Create a developer account
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Publish your app to the Storestack marketplace.
        </p>
      </div>

      <SignupDeveloperForm />

      <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
        Already have an account?{" "}
        <Link href="/sign-in" className="font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-white">
          Sign in
        </Link>
      </p>
      <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
        Running a store instead?{" "}
        <Link href="/sign-up/merchant" className="font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-white">
          Sign up as a merchant
        </Link>
      </p>
    </div>
  );
}
