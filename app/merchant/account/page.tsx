import { requireRole } from "@/lib/auth/dal";
import { AccountProfileForm } from "./AccountProfileForm";

export const metadata = { title: "Account" };

export default async function MerchantAccountPage() {
  const user = await requireRole("MERCHANT");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
          Account
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Your profile and billing details.
        </p>
      </div>

      <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-4 text-lg font-semibold tracking-tight text-zinc-900 dark:text-white">
          Profile
        </h2>
        <dl className="mb-6 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Email
            </dt>
            <dd className="mt-0.5 text-zinc-900 dark:text-white">{user.email}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Email verified
            </dt>
            <dd className="mt-0.5 text-zinc-900 dark:text-white">
              {user.emailVerifiedAt
                ? new Date(user.emailVerifiedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : "Not verified"}
            </dd>
          </div>
        </dl>
        <AccountProfileForm defaultName={user.name} />
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-2 text-lg font-semibold tracking-tight text-zinc-900 dark:text-white">
          Billing
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          You're on the <span className="font-medium text-zinc-900 dark:text-white">Free</span>{" "}
          plan. Paid plans are not connected in this concept project.
        </p>
      </section>
    </div>
  );
}
