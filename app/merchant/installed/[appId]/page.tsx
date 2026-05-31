import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/dal";
import { getInstallByUserAndApp } from "@/lib/queries/merchant";
import { AppIcon } from "@/components/app-card";
import { InstallConfigForm } from "./InstallConfigForm";

export const metadata = { title: "Configure app" };

type Params = Promise<{ appId: string }>;

export default async function MerchantConfigPage({ params }: { params: Params }) {
  const user = await requireRole("MERCHANT");
  const { appId } = await params;
  const install = await getInstallByUserAndApp(user.id, appId);
  if (!install) notFound();

  const cfg = (install.configJson ?? {}) as { apiKey?: string; webhookUrl?: string };

  return (
    <div className="space-y-6">
      <Link
        href="/merchant"
        className="text-sm text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-400"
      >
        ← Back to installed apps
      </Link>

      <div className="flex items-start gap-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <AppIcon name={install.app.name} url={install.app.iconUrl} size="lg" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
            Configure {install.app.name}
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Demo configuration — fill both fields to mark this app as active.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <InstallConfigForm
          appId={install.app.id}
          defaultApiKey={cfg.apiKey ?? ""}
          defaultWebhookUrl={cfg.webhookUrl ?? ""}
        />
      </div>
    </div>
  );
}
