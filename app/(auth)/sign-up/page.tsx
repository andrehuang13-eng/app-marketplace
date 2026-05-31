import Link from "next/link";

export const metadata = { title: "Sign up" };

export default function SignUpLandingPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
          Join Storestack
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Choose how you want to use the marketplace.
        </p>
      </div>

      <div className="grid gap-3">
        <Link
          href="/sign-up/merchant"
          className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300 hover:shadow dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
        >
          <p className="text-sm font-medium text-zinc-900 dark:text-white">
            I run an e-commerce store
          </p>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Browse and install apps that extend your storefront.
          </p>
        </Link>
        <Link
          href="/sign-up/developer"
          className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300 hover:shadow dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
        >
          <p className="text-sm font-medium text-zinc-900 dark:text-white">
            I build apps for merchants
          </p>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Publish your app to the Storestack marketplace.
          </p>
        </Link>
      </div>

      <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
        Already have an account?{" "}
        <Link href="/sign-in" className="font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-white">
          Sign in
        </Link>
      </p>
    </div>
  );
}
