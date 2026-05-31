"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/dal";

export type DeveloperFormState =
  | {
      ok?: boolean;
      message?: string;
      fieldErrors?: Record<string, string[]>;
    }
  | undefined;

const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Slug must be at least 3 characters")
  .max(60, "Slug is too long")
  .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers, and hyphens only");

const baseAppSchema = z.object({
  slug: slugSchema,
  name: z.string().trim().min(2).max(80),
  tagline: z.string().trim().min(10).max(160),
  descriptionMd: z.string().trim().min(50).max(20000),
  iconUrl: z
    .string()
    .trim()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  pricingModel: z.enum(["FREE", "FREEMIUM", "PAID"]),
  categoryId: z.string().min(1, "Pick a category"),
});

const intent = z.enum(["draft", "submit"]);

export async function saveApp(
  prev: DeveloperFormState,
  formData: FormData,
): Promise<DeveloperFormState> {
  const user = await requireRole("DEVELOPER");
  const appId = formData.get("appId");

  const parsedIntent = intent.safeParse(formData.get("intent"));
  if (!parsedIntent.success) {
    return { message: "Invalid form submission" };
  }
  const action = parsedIntent.data;

  const parsed = baseAppSchema.safeParse({
    slug: formData.get("slug"),
    name: formData.get("name"),
    tagline: formData.get("tagline"),
    descriptionMd: formData.get("descriptionMd"),
    iconUrl: formData.get("iconUrl"),
    pricingModel: formData.get("pricingModel"),
    categoryId: formData.get("categoryId"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const data = parsed.data;
  const iconUrl = data.iconUrl ? data.iconUrl : null;

  let resultId: string;

  try {
    if (typeof appId === "string" && appId.length > 0) {
      const existing = await db.app.findUnique({
        where: { id: appId },
        select: { id: true, developerId: true, status: true },
      });
      if (!existing || existing.developerId !== user.id) {
        return { message: "App not found or you do not own it" };
      }
      const willResubmit =
        existing.status === "APPROVED" ||
        existing.status === "PUBLISHED" ||
        existing.status === "REJECTED";
      const nextStatus =
        action === "submit"
          ? "IN_REVIEW"
          : willResubmit
            ? "IN_REVIEW"
            : "DRAFT";
      const updated = await db.app.update({
        where: { id: appId },
        data: {
          slug: data.slug,
          name: data.name,
          tagline: data.tagline,
          descriptionMd: data.descriptionMd,
          iconUrl,
          pricingModel: data.pricingModel,
          categoryId: data.categoryId,
          status: nextStatus,
        },
        select: { id: true },
      });
      resultId = updated.id;
    } else {
      const created = await db.app.create({
        data: {
          slug: data.slug,
          name: data.name,
          tagline: data.tagline,
          descriptionMd: data.descriptionMd,
          iconUrl,
          pricingModel: data.pricingModel,
          categoryId: data.categoryId,
          developerId: user.id,
          status: action === "submit" ? "IN_REVIEW" : "DRAFT",
          versions: {
            create: {
              version: "1.0.0",
              changelog: "Initial submission.",
            },
          },
        },
        select: { id: true },
      });
      resultId = created.id;
    }
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return { fieldErrors: { slug: ["This slug is already taken"] } };
    }
    return { message: "Something went wrong. Please try again." };
  }

  revalidatePath("/developer");
  revalidatePath(`/apps/${data.slug}`);
  if (action === "submit") {
    redirect(`/developer?submitted=${resultId}`);
  }
  return { ok: true, message: "Draft saved" };
}

export async function deleteDraft(formData: FormData): Promise<void> {
  const user = await requireRole("DEVELOPER");
  const appId = formData.get("appId");
  if (typeof appId !== "string") return;
  const app = await db.app.findUnique({
    where: { id: appId },
    select: { developerId: true, status: true },
  });
  if (!app || app.developerId !== user.id) return;
  if (app.status !== "DRAFT" && app.status !== "REJECTED") return;
  await db.app.delete({ where: { id: appId } });
  revalidatePath("/developer");
}

const developerProfileSchema = z.object({
  companyName: z.string().trim().min(2).max(80),
  bio: z.string().trim().max(800).optional().or(z.literal("")),
  supportEmail: z.string().trim().toLowerCase().email(),
});

export async function updateDeveloperProfile(
  _prev: DeveloperFormState,
  formData: FormData,
): Promise<DeveloperFormState> {
  const user = await requireRole("DEVELOPER");
  const parsed = developerProfileSchema.safeParse({
    companyName: formData.get("companyName"),
    bio: formData.get("bio"),
    supportEmail: formData.get("supportEmail"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  await db.developer.update({
    where: { userId: user.id },
    data: {
      companyName: parsed.data.companyName,
      bio: parsed.data.bio || null,
      supportEmail: parsed.data.supportEmail,
    },
  });
  revalidatePath("/developer/profile");
  return { ok: true, message: "Profile updated" };
}
