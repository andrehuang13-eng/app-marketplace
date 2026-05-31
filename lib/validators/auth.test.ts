import { describe, expect, test } from "vitest";
import {
  signupMerchantSchema,
  signupDeveloperSchema,
  signinSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "./auth";

describe("signupMerchantSchema", () => {
  test("accepts valid input and normalises email + name", () => {
    const r = signupMerchantSchema.safeParse({
      name: "  Ada Lovelace  ",
      email: "ADA@Example.com",
      password: "secret123",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.email).toBe("ada@example.com");
      expect(r.data.name).toBe("Ada Lovelace");
    }
  });

  test("rejects too-short password", () => {
    const r = signupMerchantSchema.safeParse({
      name: "Ada",
      email: "a@b.co",
      password: "short1",
    });
    expect(r.success).toBe(false);
  });

  test("rejects password without a number", () => {
    const r = signupMerchantSchema.safeParse({
      name: "Ada",
      email: "a@b.co",
      password: "lettersonly",
    });
    expect(r.success).toBe(false);
  });

  test("rejects password without a letter", () => {
    const r = signupMerchantSchema.safeParse({
      name: "Ada",
      email: "a@b.co",
      password: "12345678",
    });
    expect(r.success).toBe(false);
  });
});

describe("signupDeveloperSchema", () => {
  test("requires company name", () => {
    const r = signupDeveloperSchema.safeParse({
      name: "Grace",
      email: "g@h.io",
      password: "navalcobol1",
    });
    expect(r.success).toBe(false);
  });

  test("accepts valid developer input", () => {
    const r = signupDeveloperSchema.safeParse({
      name: "Grace",
      email: "g@h.io",
      password: "navalcobol1",
      companyName: "Hopper Labs",
    });
    expect(r.success).toBe(true);
  });
});

describe("signinSchema", () => {
  test("only requires non-empty password (signin should not enforce strength rules)", () => {
    const r = signinSchema.safeParse({ email: "a@b.co", password: "x" });
    expect(r.success).toBe(true);
  });
});

describe("forgotPasswordSchema", () => {
  test("requires a valid email", () => {
    expect(forgotPasswordSchema.safeParse({ email: "not-an-email" }).success).toBe(false);
    expect(forgotPasswordSchema.safeParse({ email: "ok@example.com" }).success).toBe(true);
  });
});

describe("resetPasswordSchema", () => {
  test("rejects when confirmPassword does not match", () => {
    const r = resetPasswordSchema.safeParse({
      token: "abc",
      password: "newsecret1",
      confirmPassword: "different1",
    });
    expect(r.success).toBe(false);
  });

  test("accepts when fields match", () => {
    const r = resetPasswordSchema.safeParse({
      token: "abc",
      password: "newsecret1",
      confirmPassword: "newsecret1",
    });
    expect(r.success).toBe(true);
  });
});
