import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "READER";
    } & DefaultSession["user"];
  }

  interface User {
    role?: "ADMIN" | "READER";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    role?: "ADMIN" | "READER";
  }
}
