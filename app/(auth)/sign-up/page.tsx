import Link from "next/link";

export const metadata = { title: "Sign up" };

export default function SignUpLandingPage() {
  return (
    <div className="space-y-7">
      <div className="text-center">
        <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500">
          / Join the marketplace
        </p>
        <h1 className="font-display text-4xl text-zinc-50 sm:text-5xl">
          Pick a side.
        </h1>
        <p className="mt-3 text-sm text-zinc-400">
          You can change later — both roles use the same login.
        </p>
      </div>

      <div className="grid gap-3">
        <Link
          href="/sign-up/merchant"
          className="group glass relative flex items-center justify-between overflow-hidden rounded-2xl p-5 transition-transform hover:-translate-y-0.5"
        >
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-br from-cyan-400/15 via-lime-400/8 to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-100"
          />
          <div className="relative">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-cyan-300">
              ● Merchant
            </p>
            <p className="mt-2 text-base font-semibold text-zinc-50">
              I run an e-commerce store
            </p>
            <p className="mt-1 text-sm text-zinc-400">
              Browse and install apps that extend your storefront.
            </p>
          </div>
          <span
            aria-hidden
            className="relative text-xl text-zinc-500 transition group-hover:translate-x-1 group-hover:text-zinc-100"
          >
            →
          </span>
        </Link>

        <Link
          href="/sign-up/developer"
          className="group glass relative flex items-center justify-between overflow-hidden rounded-2xl p-5 transition-transform hover:-translate-y-0.5"
        >
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-br from-pink-500/15 via-indigo-500/8 to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-100"
          />
          <div className="relative">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-pink-300">
              ● Developer
            </p>
            <p className="mt-2 text-base font-semibold text-zinc-50">
              I build apps for merchants
            </p>
            <p className="mt-1 text-sm text-zinc-400">
              Publish your app to the Storestack marketplace.
            </p>
          </div>
          <span
            aria-hidden
            className="relative text-xl text-zinc-500 transition group-hover:translate-x-1 group-hover:text-zinc-100"
          >
            →
          </span>
        </Link>
      </div>

      <p className="text-center text-sm text-zinc-400">
        Already have an account?{" "}
        <Link href="/sign-in" className="link-underline font-medium text-zinc-100">
          Sign in
        </Link>
      </p>
    </div>
  );
}
