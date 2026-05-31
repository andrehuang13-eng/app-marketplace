"use server";

import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, deleteSession, getSession } from "@/lib/auth/session";
import {
  newEmailVerificationToken,
  newPasswordResetToken,
} from "@/lib/auth/tokens";
import { sendVerifyEmail, sendResetEmail } from "@/lib/email/senders";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  signinSchema,
  signupDeveloperSchema,
  signupMerchantSchema,
} from "@/lib/validators/auth";

export type AuthFormState =
  | {
      ok?: boolean;
      message?: string;
      fieldErrors?: Record<string, string[]>;
    }
  | undefined;

function isUniqueViolation(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

export async function signupMerchant(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = signupMerchantSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const { name, email, password } = parsed.data;

  let userId: string;
  try {
    const user = await db.user.create({
      data: {
        name,
        email,
        passwordHash: await hashPassword(password),
        role: "MERCHANT",
        status: "UNVERIFIED",
      },
      select: { id: true, name: true, email: true },
    });
    userId = user.id;

    const { token, expiresAt } = newEmailVerificationToken();
    await db.emailVerificationToken.create({
      data: { userId: user.id, token, expiresAt },
    });
    await sendVerifyEmail({ to: user.email, name: user.name, token });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { fieldErrors: { email: ["Email is already registered"] } };
    }
    return { message: "Something went wrong. Please try again." };
  }

  await createSession(userId, "MERCHANT");
  redirect("/verify-email?sent=1");
}

export async function signupDeveloper(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = signupDeveloperSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    companyName: formData.get("companyName"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const { name, email, password, companyName } = parsed.data;

  let userId: string;
  try {
    const user = await db.user.create({
      data: {
        name,
        email,
        passwordHash: await hashPassword(password),
        role: "DEVELOPER",
        status: "UNVERIFIED",
        developer: {
          create: {
            companyName,
            supportEmail: email,
          },
        },
      },
      select: { id: true, name: true, email: true },
    });
    userId = user.id;

    const { token, expiresAt } = newEmailVerificationToken();
    await db.emailVerificationToken.create({
      data: { userId: user.id, token, expiresAt },
    });
    await sendVerifyEmail({ to: user.email, name: user.name, token });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { fieldErrors: { email: ["Email is already registered"] } };
    }
    return { message: "Something went wrong. Please try again." };
  }

  await createSession(userId, "DEVELOPER");
  redirect("/verify-email?sent=1");
}

export async function signin(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = signinSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const { email, password } = parsed.data;

  const user = await db.user.findUnique({
    where: { email },
    select: { id: true, passwordHash: true, role: true, status: true },
  });
  if (!user) {
    return { message: "Invalid email or password" };
  }
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    return { message: "Invalid email or password" };
  }
  if (user.status === "SUSPENDED") {
    return { message: "This account has been suspended" };
  }

  await createSession(user.id, user.role);
  const next = (formData.get("next") as string) || "/";
  redirect(next.startsWith("/") ? next : "/");
}

export async function signout(): Promise<void> {
  await deleteSession();
  redirect("/sign-in");
}

export async function verifyEmailWithToken(
  token: string,
): Promise<{ ok: boolean; message: string }> {
  const record = await db.emailVerificationToken.findUnique({
    where: { token },
    include: { user: true },
  });
  if (!record) {
    return { ok: false, message: "Invalid verification link" };
  }
  if (record.expiresAt < new Date()) {
    await db.emailVerificationToken.delete({ where: { id: record.id } });
    return { ok: false, message: "Verification link has expired" };
  }

  await db.$transaction([
    db.user.update({
      where: { id: record.userId },
      data: {
        emailVerifiedAt: new Date(),
        status: record.user.status === "UNVERIFIED" ? "ACTIVE" : record.user.status,
      },
    }),
    db.emailVerificationToken.deleteMany({ where: { userId: record.userId } }),
  ]);

  return { ok: true, message: "Email verified" };
}

export async function resendVerifyEmail(): Promise<AuthFormState> {
  const session = await getSession();
  if (!session?.userId) {
    return { message: "Not signed in" };
  }
  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, name: true, emailVerifiedAt: true },
  });
  if (!user) {
    return { message: "User not found" };
  }
  if (user.emailVerifiedAt) {
    return { ok: true, message: "Your email is already verified" };
  }
  await db.emailVerificationToken.deleteMany({ where: { userId: user.id } });
  const { token, expiresAt } = newEmailVerificationToken();
  await db.emailVerificationToken.create({
    data: { userId: user.id, token, expiresAt },
  });
  await sendVerifyEmail({ to: user.email, name: user.name, token });
  return { ok: true, message: "Verification email sent" };
}

export async function requestPasswordReset(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const user = await db.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true, email: true, name: true },
  });
  // Always return success to avoid email enumeration.
  if (user) {
    await db.passwordResetToken.deleteMany({ where: { userId: user.id } });
    const { token, expiresAt } = newPasswordResetToken();
    await db.passwordResetToken.create({
      data: { userId: user.id, token, expiresAt },
    });
    await sendResetEmail({ to: user.email, name: user.name, token });
  }
  return {
    ok: true,
    message: "If an account exists for that email, a reset link is on its way.",
  };
}

export async function resetPassword(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const record = await db.passwordResetToken.findUnique({
    where: { token: parsed.data.token },
  });
  if (!record || record.expiresAt < new Date()) {
    return { message: "Reset link is invalid or has expired" };
  }
  const passwordHash = await hashPassword(parsed.data.password);
  await db.$transaction([
    db.user.update({
      where: { id: record.userId },
      data: { passwordHash },
    }),
    db.passwordResetToken.deleteMany({ where: { userId: record.userId } }),
  ]);
  redirect("/sign-in?reset=1");
}
