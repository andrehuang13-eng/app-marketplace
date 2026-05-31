import { describe, expect, test, vi, beforeEach, afterEach } from "vitest";
import {
  newEmailVerificationToken,
  newPasswordResetToken,
} from "./tokens";

describe("token generation", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-31T10:00:00.000Z"));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  test("email verification token expires 24 hours from now", () => {
    const { token, expiresAt } = newEmailVerificationToken();
    expect(token).toMatch(/^[A-Za-z0-9]{48}$/);
    expect(expiresAt.toISOString()).toBe("2026-06-01T10:00:00.000Z");
  });

  test("password reset token expires 1 hour from now", () => {
    const { token, expiresAt } = newPasswordResetToken();
    expect(token).toMatch(/^[A-Za-z0-9]{48}$/);
    expect(expiresAt.toISOString()).toBe("2026-05-31T11:00:00.000Z");
  });

  test("each generated token is unique", () => {
    const tokens = new Set<string>();
    for (let i = 0; i < 100; i++) {
      tokens.add(newEmailVerificationToken().token);
    }
    expect(tokens.size).toBe(100);
  });
});
