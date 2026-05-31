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

export async function sendVerifyEmail(opts: {
  to: string;
  name: string;
  token: string;
}): Promise<void> {
  const url = `${getAppUrl()}/verify-email/${opts.token}`;
  const html = buildLayout(
    "Verify your email",
    `<p>Hi ${escapeHtml(opts.name)},</p>
     <p>Welcome to Storestack. Confirm your email to activate your account:</p>
     <p style="margin:24px 0"><a href="${url}" style="background:#18181b;color:#fff;padding:10px 18px;border-radius:999px;text-decoration:none;display:inline-block">Verify email</a></p>
     <p style="font-size:13px;color:#52525b">Or paste this link: <br>${url}</p>
     <p style="font-size:13px;color:#52525b">This link expires in 24 hours.</p>`,
  );
  await getResend().emails.send({
    from: getFromAddress(),
    to: opts.to,
    subject: "Verify your Storestack email",
    html,
  });
}

export async function sendResetEmail(opts: {
  to: string;
  name: string;
  token: string;
}): Promise<void> {
  const url = `${getAppUrl()}/reset-password/${opts.token}`;
  const html = buildLayout(
    "Reset your password",
    `<p>Hi ${escapeHtml(opts.name)},</p>
     <p>We received a request to reset your password. Use the link below to choose a new one:</p>
     <p style="margin:24px 0"><a href="${url}" style="background:#18181b;color:#fff;padding:10px 18px;border-radius:999px;text-decoration:none;display:inline-block">Reset password</a></p>
     <p style="font-size:13px;color:#52525b">Or paste this link: <br>${url}</p>
     <p style="font-size:13px;color:#52525b">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>`,
  );
  await getResend().emails.send({
    from: getFromAddress(),
    to: opts.to,
    subject: "Reset your Storestack password",
    html,
  });
}

export async function sendInstallConfirmation(opts: {
  to: string;
  name: string;
  appName: string;
}): Promise<void> {
  const html = buildLayout(
    "App installed",
    `<p>Hi ${escapeHtml(opts.name)},</p>
     <p>You installed <strong>${escapeHtml(opts.appName)}</strong> on Storestack.</p>
     <p style="margin:24px 0"><a href="${getAppUrl()}/merchant/installed" style="background:#18181b;color:#fff;padding:10px 18px;border-radius:999px;text-decoration:none;display:inline-block">Go to My Installed apps</a></p>`,
  );
  await getResend().emails.send({
    from: getFromAddress(),
    to: opts.to,
    subject: `You installed ${opts.appName}`,
    html,
  });
}
