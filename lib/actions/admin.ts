"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/dal";
import { sendAppApproved, sendAppRejected } from "@/lib/email/admin-senders";

export type AdminFormState =
  | {
      ok?: boolean;
      message?: string;
      fieldErrors?: Record<string, string[]>;
    }
  | undefined;

const decisionSchema = z.object({
  appId: z.string().min(1),
  comment: z.string().trim().min(5, "Comment must be at least 5 characters").max(2000),
});

export async function approveApp(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const admin = await requireRole("ADMIN");
  const parsed = decisionSchema.safeParse({
    appId: formData.get("appId"),
    comment: formData.get("comment"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const { appId, comment } = parsed.data;

  const app = await db.app.findUnique({
    where: { id: appId },
    include: {
      developer: { select: { id: true, name: true, email: true } },
    },
  });
  if (!app) return { message: "App not found" };
  if (app.status !== "IN_REVIEW") {
    return { message: "App is not in the review queue" };
  }

  await db.$transaction([
    db.app.update({
      where: { id: appId },
      data: { status: "PUBLISHED", publishedAt: new Date() },
    }),
    db.reviewQueueComment.create({
      data: { appId, adminId: admin.id, decision: "APPROVE", comment },
    }),
    db.auditLog.create({
      data: {
        actorId: admin.id,
        action: "app.approve",
        targetType: "App",
        targetId: appId,
        metadataJson: { comment },
      },
    }),
  ]);

  await sendAppApproved({
    to: app.developer.email,
    developerName: app.developer.name,
    appName: app.name,
    appSlug: app.slug,
    comment,
  });

  revalidatePath("/admin");
  revalidatePath("/admin/audit");
  revalidatePath("/apps");
  revalidatePath(`/apps/${app.slug}`);
  redirect("/admin?action=approved");
}

export async function rejectApp(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const admin = await requireRole("ADMIN");
  const parsed = decisionSchema.safeParse({
    appId: formData.get("appId"),
    comment: formData.get("comment"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const { appId, comment } = parsed.data;

  const app = await db.app.findUnique({
    where: { id: appId },
    include: {
      developer: { select: { id: true, name: true, email: true } },
    },
  });
  if (!app) return { message: "App not found" };
  if (app.status !== "IN_REVIEW") {
    return { message: "App is not in the review queue" };
  }

  await db.$transaction([
    db.app.update({
      where: { id: appId },
      data: { status: "REJECTED" },
    }),
    db.reviewQueueComment.create({
      data: { appId, adminId: admin.id, decision: "REJECT", comment },
    }),
    db.auditLog.create({
      data: {
        actorId: admin.id,
        action: "app.reject",
        targetType: "App",
        targetId: appId,
        metadataJson: { comment },
      },
    }),
  ]);

  await sendAppRejected({
    to: app.developer.email,
    developerName: app.developer.name,
    appName: app.name,
    comment,
  });

  revalidatePath("/admin");
  revalidatePath("/admin/audit");
  redirect("/admin?action=rejected");
}

const categorySchema = z.object({
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers, and hyphens only"),
  name: z.string().trim().min(2).max(60),
  sortOrder: z.coerce.number().int().min(0).max(999),
});

export async function createCategory(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const admin = await requireRole("ADMIN");
  const parsed = categorySchema.safeParse({
    slug: formData.get("slug"),
    name: formData.get("name"),
    sortOrder: formData.get("sortOrder") ?? 0,
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  try {
    const created = await db.category.create({ data: parsed.data });
    await db.auditLog.create({
      data: {
        actorId: admin.id,
        action: "category.create",
        targetType: "Category",
        targetId: created.id,
        metadataJson: { slug: created.slug, name: created.name },
      },
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return { fieldErrors: { slug: ["Slug is already in use"] } };
    }
    return { message: "Could not create category" };
  }
  revalidatePath("/admin/categories");
  revalidatePath("/apps");
  return { ok: true, message: "Category created" };
}

const categoryUpdateSchema = categorySchema.extend({
  id: z.string().min(1),
});

export async function updateCategory(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const admin = await requireRole("ADMIN");
  const parsed = categoryUpdateSchema.safeParse({
    id: formData.get("id"),
    slug: formData.get("slug"),
    name: formData.get("name"),
    sortOrder: formData.get("sortOrder") ?? 0,
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  try {
    await db.category.update({
      where: { id: parsed.data.id },
      data: {
        slug: parsed.data.slug,
        name: parsed.data.name,
        sortOrder: parsed.data.sortOrder,
      },
    });
    await db.auditLog.create({
      data: {
        actorId: admin.id,
        action: "category.update",
        targetType: "Category",
        targetId: parsed.data.id,
        metadataJson: { slug: parsed.data.slug, name: parsed.data.name },
      },
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return { fieldErrors: { slug: ["Slug is already in use"] } };
    }
    return { message: "Could not update category" };
  }
  revalidatePath("/admin/categories");
  revalidatePath("/apps");
  return { ok: true, message: "Category updated" };
}

export async function deleteCategory(formData: FormData): Promise<void> {
  const admin = await requireRole("ADMIN");
  const id = formData.get("id");
  if (typeof id !== "string") return;
  const usage = await db.app.count({ where: { categoryId: id } });
  if (usage > 0) return;
  await db.category.delete({ where: { id } });
  await db.auditLog.create({
    data: {
      actorId: admin.id,
      action: "category.delete",
      targetType: "Category",
      targetId: id,
    },
  });
  revalidatePath("/admin/categories");
}

const suspendSchema = z.object({ userId: z.string().min(1) });

export async function suspendUser(formData: FormData): Promise<void> {
  const admin = await requireRole("ADMIN");
  const parsed = suspendSchema.safeParse({ userId: formData.get("userId") });
  if (!parsed.success) return;
  if (parsed.data.userId === admin.id) return; // never self-suspend
  await db.user.update({
    where: { id: parsed.data.userId },
    data: { status: "SUSPENDED" },
  });
  await db.auditLog.create({
    data: {
      actorId: admin.id,
      action: "user.suspend",
      targetType: "User",
      targetId: parsed.data.userId,
    },
  });
  revalidatePath("/admin/users");
}

export async function reinstateUser(formData: FormData): Promise<void> {
  const admin = await requireRole("ADMIN");
  const parsed = suspendSchema.safeParse({ userId: formData.get("userId") });
  if (!parsed.success) return;
  await db.user.update({
    where: { id: parsed.data.userId },
    data: { status: "ACTIVE" },
  });
  await db.auditLog.create({
    data: {
      actorId: admin.id,
      action: "user.reinstate",
      targetType: "User",
      targetId: parsed.data.userId,
    },
  });
  revalidatePath("/admin/users");
}

const roleChangeSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["MERCHANT", "DEVELOPER", "ADMIN"]),
});

export async function changeUserRole(formData: FormData): Promise<void> {
  const admin = await requireRole("ADMIN");
  const parsed = roleChangeSchema.safeParse({
    userId: formData.get("userId"),
    role: formData.get("role"),
  });
  if (!parsed.success) return;
  if (parsed.data.userId === admin.id) return;
  await db.user.update({
    where: { id: parsed.data.userId },
    data: { role: parsed.data.role },
  });
  await db.auditLog.create({
    data: {
      actorId: admin.id,
      action: "user.role.change",
      targetType: "User",
      targetId: parsed.data.userId,
      metadataJson: { role: parsed.data.role },
    },
  });
  revalidatePath("/admin/users");
}

const featuredSchema = z.object({
  featured: z.array(z.string()).max(12),
});

export async function setFeaturedApps(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const admin = await requireRole("ADMIN");
  const featured = formData.getAll("featured").filter((v): v is string => typeof v === "string");
  const parsed = featuredSchema.safeParse({ featured });
  if (!parsed.success) {
    return { message: "Invalid selection" };
  }
  await db.$transaction([
    db.app.updateMany({
      where: { status: "PUBLISHED" },
      data: { featured: false },
    }),
    ...(parsed.data.featured.length > 0
      ? [
          db.app.updateMany({
            where: { id: { in: parsed.data.featured } },
            data: { featured: true },
          }),
        ]
      : []),
    db.auditLog.create({
      data: {
        actorId: admin.id,
        action: "settings.featured",
        targetType: "Setting",
        targetId: "featured_app_ids",
        metadataJson: { featured: parsed.data.featured },
      },
    }),
  ]);
  revalidatePath("/");
  revalidatePath("/admin/settings");
  return { ok: true, message: "Featured apps updated" };
}

const bannerSchema = z.object({
  enabled: z.coerce.boolean().optional(),
  message: z.string().trim().max(280),
  type: z.enum(["info", "success", "warning"]).default("info"),
});

export async function setBanner(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const admin = await requireRole("ADMIN");
  const parsed = bannerSchema.safeParse({
    enabled: formData.get("enabled") === "on",
    message: formData.get("message") ?? "",
    type: formData.get("type") ?? "info",
  });
  if (!parsed.success) {
    return { message: "Invalid banner config" };
  }
  await db.setting.upsert({
    where: { key: "announcement_banner" },
    update: { valueJson: parsed.data },
    create: { key: "announcement_banner", valueJson: parsed.data },
  });
  await db.auditLog.create({
    data: {
      actorId: admin.id,
      action: "settings.banner",
      targetType: "Setting",
      targetId: "announcement_banner",
      metadataJson: parsed.data,
    },
  });
  revalidatePath("/");
  revalidatePath("/admin/settings");
  return { ok: true, message: "Banner saved" };
}

export async function forceUnpublishApp(formData: FormData): Promise<void> {
  const admin = await requireRole("ADMIN");
  const appId = formData.get("appId");
  if (typeof appId !== "string") return;
  const app = await db.app.findUnique({ where: { id: appId }, select: { slug: true } });
  if (!app) return;
  await db.app.update({
    where: { id: appId },
    data: { status: "DRAFT", publishedAt: null, featured: false },
  });
  await db.auditLog.create({
    data: {
      actorId: admin.id,
      action: "app.force_unpublish",
      targetType: "App",
      targetId: appId,
    },
  });
  revalidatePath("/admin/apps");
  revalidatePath("/apps");
  revalidatePath(`/apps/${app.slug}`);
}
