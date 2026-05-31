import { uninstallApp } from "@/lib/actions/merchant";

export function UninstallButton({ appId }: { appId: string }) {
  return (
    <form action={uninstallApp}>
      <input type="hidden" name="appId" value={appId} />
      <button
        type="submit"
        className="text-xs font-medium text-zinc-500 transition hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400"
      >
        Uninstall
      </button>
    </form>
  );
}
