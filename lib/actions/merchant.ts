"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/dal";
import { sendInstallConfirmation } from "@/lib/email/senders";
import { z } from "zod";

export type MerchantFormState =
  | {
      ok?: boolean;
      message?: string;
      fieldErrors?: Record<string, string[]>;
    }
  | undefined;

const idSchema = z.object({ appId: z.string().min(1) });

export async function installApp(formData: FormData): Promise<void> {
  const user = await requireRole("MERCHANT");
  const parsed = idSchema.safeParse({ appId: formData.get("appId") });
  if (!parsed.success) return;
  const { appId } = parsed.data;

  const app = await db.app.findUnique({
    where: { id: appId },
    select: { id: true, name: true, status: true },
  });
  if (!app || app.status !== "PUBLISHED") return;

  const existing = await db.install.findUnique({
    where: { userId_appId: { userId: user.id, appId } },
  });
  if (existing) {
    revalidatePath(`/apps`);
    revalidatePath(`/merchant`);
    return;
  }

  await db.install.create({
    data: {
      userId: user.id,
      appId,
      configStatus: "NEEDS_CONFIG",
    },
  });

  await sendInstallConfirmation({
    to: user.email,
    name: user.name,
    appName: app.name,
  });

  revalidatePath(`/apps`);
  revalidatePath(`/merchant`);
}

export async function uninstallApp(formData: FormData): Promise<void> {
  const user = await requireRole("MERCHANT");
  const parsed = idSchema.safeParse({ appId: formData.get("appId") });
  if (!parsed.success) return;
  await db.install.deleteMany({
    where: { userId: user.id, appId: parsed.data.appId },
  });
  revalidatePath("/merchant");
  revalidatePath("/apps");
}

export async function toggleFavorite(formData: FormData): Promise<void> {
  const user = await requireRole("MERCHANT");
  const parsed = idSchema.safeParse({ appId: formData.get("appId") });
  if (!parsed.success) return;
  const { appId } = parsed.data;

  const existing = await db.favorite.findUnique({
    where: { userId_appId: { userId: user.id, appId } },
  });
  if (existing) {
    await db.favorite.delete({ where: { id: existing.id } });
  } else {
    await db.favorite.create({ data: { userId: user.id, appId } });
  }
  revalidatePath("/merchant/favorites");
  revalidatePath(`/apps`);
}

const reviewSchema = z.object({
  appId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  body: z.string().trim().min(10, "Review must be at least 10 characters").max(2000),
});

export async function writeReview(
  _prev: MerchantFormState,
  formData: FormData,
): Promise<MerchantFormState> {
  const user = await requireRole("MERCHANT");
  const parsed = reviewSchema.safeParse({
    appId: formData.get("appId"),
    rating: formData.get("rating"),
    body: formData.get("body"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const { appId, rating, body } = parsed.data;

  // Merchant must have installed the app before reviewing.
  const install = await db.install.findUnique({
    where: { userId_appId: { userId: user.id, appId } },
  });
  if (!install) {
    return { message: "You can only review apps you have installed" };
  }

  await db.review.upsert({
    where: { userId_appId: { userId: user.id, appId } },
    update: { rating, body },
    create: { userId: user.id, appId, rating, body },
  });

  revalidatePath(`/apps`);
  revalidatePath("/merchant/reviews");
  return { ok: true, message: "Review saved" };
}

export async function deleteReview(formData: FormData): Promise<void> {
  const user = await requireRole("MERCHANT");
  const parsed = idSchema.safeParse({ appId: formData.get("appId") });
  if (!parsed.success) return;
  await db.review.deleteMany({
    where: { userId: user.id, appId: parsed.data.appId },
  });
  revalidatePath("/merchant/reviews");
  revalidatePath(`/apps`);
}

const configSchema = z.object({
  appId: z.string().min(1),
  apiKey: z.string().optional(),
  webhookUrl: z.string().optional(),
});

export async function updateInstallConfig(
  _prev: MerchantFormState,
  formData: FormData,
): Promise<MerchantFormState> {
  const user = await requireRole("MERCHANT");
  const parsed = configSchema.safeParse({
    appId: formData.get("appId"),
    apiKey: formData.get("apiKey"),
    webhookUrl: formData.get("webhookUrl"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const { appId, apiKey, webhookUrl } = parsed.data;
  const cleaned = {
    apiKey: apiKey?.trim() || null,
    webhookUrl: webhookUrl?.trim() || null,
  };
  const hasConfig = Boolean(cleaned.apiKey && cleaned.webhookUrl);

  await db.install.update({
    where: { userId_appId: { userId: user.id, appId } },
    data: {
      configJson: cleaned,
      configStatus: hasConfig ? "ACTIVE" : "NEEDS_CONFIG",
    },
  });

  revalidatePath("/merchant");
  return { ok: true, message: "Configuration saved" };
}

const profileSchema = z.object({
  name: z.string().trim().min(2).max(80),
});

export async function updateAccountProfile(
  _prev: MerchantFormState,
  formData: FormData,
): Promise<MerchantFormState> {
  const user = await requireRole(["MERCHANT", "DEVELOPER", "ADMIN"]);
  const parsed = profileSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  await db.user.update({
    where: { id: user.id },
    data: { name: parsed.data.name },
  });
  revalidatePath("/merchant/account");
  revalidatePath("/developer/profile");
  return { ok: true, message: "Profile updated" };
}
