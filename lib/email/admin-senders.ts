import "server-only";
import { getResend, getFromAddress, getAppUrl } from "@/lib/email/resend";

function buildLayout(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head><meta charset="utf-8"><title>${escapeHtml(title)}</title></head>
  <body style="background:#f4f4f5;margin:0;padding:32px;font-family:system-ui,-apple-system,sans-serif;color:#18181b">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;padding:32px;border:1px solid #e4e4e7">
      <h1 style="margin:0 0 16px;font-size:22px;font-weight:600">Storestack</h1>
      ${bodyHtml}
      <p style="margin-top:32px;font-size:12px;color:#71717a">
        Storestack — the app marketplace for e-commerce merchants.
      </p>
    </div>
  </body>
</html>`;
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendAppApproved(opts: {
  to: string;
  developerName: string;
  appName: string;
  appSlug: string;
  comment: string;
}): Promise<void> {
  const url = `${getAppUrl()}/apps/${opts.appSlug}`;
  const html = buildLayout(
    "Your app was approved",
    `<p>Hi ${escapeHtml(opts.developerName)},</p>
     <p><strong>${escapeHtml(opts.appName)}</strong> was approved and is now live on the Storestack marketplace.</p>
     ${opts.comment ? `<p style="border-left:3px solid #18181b;padding-left:12px;color:#52525b">${escapeHtml(opts.comment)}</p>` : ""}
     <p style="margin:24px 0"><a href="${url}" style="background:#18181b;color:#fff;padding:10px 18px;border-radius:999px;text-decoration:none;display:inline-block">View public page</a></p>`,
  );
  await getResend().emails.send({
    from: getFromAddress(),
    to: opts.to,
    subject: `Approved: ${opts.appName}`,
    html,
  });
}

export async function sendAppRejected(opts: {
  to: string;
  developerName: string;
  appName: string;
  comment: string;
}): Promise<void> {
  const url = `${getAppUrl()}/developer`;
  const html = buildLayout(
    "Your app needs changes",
    `<p>Hi ${escapeHtml(opts.developerName)},</p>
     <p>The Storestack team reviewed <strong>${escapeHtml(opts.appName)}</strong> and is asking for changes before it can be published.</p>
     <p style="border-left:3px solid #ef4444;padding-left:12px;color:#52525b">${escapeHtml(opts.comment)}</p>
     <p style="margin:24px 0"><a href="${url}" style="background:#18181b;color:#fff;padding:10px 18px;border-radius:999px;text-decoration:none;display:inline-block">Open My Apps</a></p>
     <p style="font-size:13px;color:#52525b">Edit your submission and resubmit when you're ready.</p>`,
  );
  await getResend().emails.send({
    from: getFromAddress(),
    to: opts.to,
    subject: `Action needed: ${opts.appName}`,
    html,
  });
}
