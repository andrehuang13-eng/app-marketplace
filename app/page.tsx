import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-6 py-24 dark:bg-zinc-950">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-1.5 text-sm font-medium text-zinc-700 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
          <span className="size-2 rounded-full bg-emerald-500" />
          Marketplace launching soon
        </div>

        <h1 className="text-5xl font-semibold tracking-tight text-zinc-900 sm:text-6xl dark:text-white">
          Storestack
        </h1>

        <p className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          The platform-agnostic app marketplace for independent e-commerce merchants.
          Discover, install, and manage apps that extend your store — built once, available
          on WooCommerce, Magento, and custom storefronts.
        </p>

        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href="/sign-up"
            className="rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Sign up
          </Link>
          <Link
            href="/apps"
            className="rounded-full border border-zinc-300 bg-white px-6 py-2.5 text-sm font-medium text-zinc-900 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800"
          >
            Browse marketplace
          </Link>
        </div>
      </div>
    </main>
  );
}
