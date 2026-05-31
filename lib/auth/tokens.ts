import "server-only";
import { customAlphabet } from "nanoid";

const TOKEN_ALPHABET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const TOKEN_LENGTH = 48;

const generateToken = customAlphabet(TOKEN_ALPHABET, TOKEN_LENGTH);

export function newEmailVerificationToken(): { token: string; expiresAt: Date } {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return { token, expiresAt };
}

export function newPasswordResetToken(): { token: string; expiresAt: Date } {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
  return { token, expiresAt };
}
