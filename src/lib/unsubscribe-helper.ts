import { createHmac } from "crypto";

export function getUnsubscribeToken(email: string): string {
  const secret = process.env.NEXTAUTH_SECRET || "default-secret-key-12345";
  return createHmac("sha256", secret).update(email).digest("hex").slice(0, 16);
}

export function verifyUnsubscribeToken(email: string, token: string): boolean {
  if (!email || !token) return false;
  const expectedToken = getUnsubscribeToken(email);
  return token === expectedToken;
}
