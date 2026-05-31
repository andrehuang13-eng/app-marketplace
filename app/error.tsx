"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-zinc-50 dark:bg-zinc-950">
        <main className="flex flex-1 items-center justify-center px-6 py-24">
          <div className="max-w-md text-center">
            <p className="text-sm font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              500
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">
              Something went wrong
            </h1>
            <p className="mt-3 text-base text-zinc-600 dark:text-zinc-400">
              An unexpected error occurred. Please try again, or head back to the
              home page.
            </p>
            <div className="mt-8 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={reset}
                className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Try again
              </button>
              <a
                href="/"
                className="rounded-full border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-900 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800"
              >
                Back to home
              </a>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
