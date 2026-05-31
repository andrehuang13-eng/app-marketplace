import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession, type SessionPayload } from "@/lib/auth/session";
import type { Role, User, UserStatus } from "@prisma/client";

export type AuthedUser = Pick<
  User,
  "id" | "email" | "name" | "role" | "status" | "emailVerifiedAt"
>;

export const requireSession = cache(async (): Promise<SessionPayload> => {
  const session = await getSession();
  if (!session?.userId) {
    redirect("/sign-in");
  }
  return session;
});

export const requireUser = cache(async (): Promise<AuthedUser> => {
  const session = await requireSession();
  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      emailVerifiedAt: true,
    },
  });
  if (!user) {
    redirect("/sign-in");
  }
  if (user.status === ("SUSPENDED" satisfies UserStatus)) {
    redirect("/sign-in?error=suspended");
  }
  return user;
});

export const requireRole = cache(
  async (allowed: Role | Role[]): Promise<AuthedUser> => {
    const user = await requireUser();
    const allowedSet = Array.isArray(allowed) ? allowed : [allowed];
    if (!allowedSet.includes(user.role)) {
      redirect("/");
    }
    return user;
  },
);

export const requireVerified = cache(async (): Promise<AuthedUser> => {
  const user = await requireUser();
  if (!user.emailVerifiedAt) {
    redirect("/verify-email");
  }
  return user;
});

export const currentUser = cache(async (): Promise<AuthedUser | null> => {
  const session = await getSession();
  if (!session?.userId) return null;
  return db.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      emailVerifiedAt: true,
    },
  });
});
