import Link from "next/link";

export default function NotFoundPage() {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-zinc-50 dark:bg-zinc-950">
        <main className="flex flex-1 items-center justify-center px-6 py-24">
          <div className="max-w-md text-center">
            <p className="text-sm font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              404
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">
              We couldn't find that page
            </h1>
            <p className="mt-3 text-base text-zinc-600 dark:text-zinc-400">
              The page may have moved, been removed, or the link could be broken.
            </p>
            <div className="mt-8 flex items-center justify-center gap-3">
              <Link
                href="/"
                className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Back to home
              </Link>
              <Link
                href="/apps"
                className="rounded-full border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-900 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800"
              >
                Browse apps
              </Link>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
