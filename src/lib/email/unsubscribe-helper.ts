import { createHmac } from "crypto";

export function getUnsubscribeToken(email: string): string {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET (or NEXTAUTH_SECRET) environment variable is not set. Cannot generate secure tokens.");
  }
  return createHmac("sha256", secret).update(email).digest("hex").slice(0, 16);
}

export function verifyUnsubscribeToken(email: string, token: string): boolean {
  if (!email || !token) return false;
  const expectedToken = getUnsubscribeToken(email);
  return token === expectedToken;
}
