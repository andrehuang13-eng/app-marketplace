import { describe, expect, test } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("password hashing", () => {
  test("hashes a password to a non-empty string different from the input", async () => {
    const hash = await hashPassword("hunter2-extra-letters");
    expect(typeof hash).toBe("string");
    expect(hash.length).toBeGreaterThan(20);
    expect(hash).not.toBe("hunter2-extra-letters");
  });

  test("verifyPassword returns true for a matching pair", async () => {
    const plain = "correct horse battery staple";
    const hash = await hashPassword(plain);
    expect(await verifyPassword(plain, hash)).toBe(true);
  });

  test("verifyPassword returns false when the password is wrong", async () => {
    const hash = await hashPassword("right one");
    expect(await verifyPassword("wrong one", hash)).toBe(false);
  });

  test("produces a different hash for the same input each call (salted)", async () => {
    const plain = "salt me twice";
    const a = await hashPassword(plain);
    const b = await hashPassword(plain);
    expect(a).not.toBe(b);
    expect(await verifyPassword(plain, a)).toBe(true);
    expect(await verifyPassword(plain, b)).toBe(true);
  });
});
