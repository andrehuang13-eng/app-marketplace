import { requireRole } from "@/lib/auth/dal";
import { getDeveloperProfile } from "@/lib/queries/developer";
import { DeveloperProfileForm } from "./DeveloperProfileForm";

export const metadata = { title: "Developer profile" };

export default async function DeveloperProfilePage() {
  const user = await requireRole("DEVELOPER");
  const profile = await getDeveloperProfile(user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
          Developer profile
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Shown to merchants on each of your app's detail page.
        </p>
      </div>
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <DeveloperProfileForm
          defaults={{
            companyName: profile?.companyName ?? "",
            bio: profile?.bio ?? "",
            supportEmail: profile?.supportEmail ?? user.email,
          }}
        />
      </div>
    </div>
  );
}
