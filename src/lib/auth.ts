import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { type NextAuthOptions, getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { getPrisma } from "@/lib/db";

function getAdminEmails(): Set<string> {
  const raw = process.env.ADMIN_EMAILS ?? "";
  return new Set(
    raw
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

export const authOptions: NextAuthOptions = {
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(getPrisma()),
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID ?? process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) {
        return false;
      }

      const isAdmin = getAdminEmails().has(user.email.toLowerCase());
      const dbUser = await getPrisma().user.findUnique({
        where: { email: user.email },
        select: { disabledAt: true },
      });

      if (dbUser?.disabledAt) {
        return false;
      }

      if (isAdmin) {
        await getPrisma().user.updateMany({
          where: { email: user.email },
          data: { role: "ADMIN" },
        });
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user?.id) {
        token.userId = user.id;
      }

      // Ensure userId is always set from the database if missing
      if (!token.userId && token.email) {
        const dbUser = await getPrisma().user.findUnique({
          where: { email: token.email },
          select: { id: true },
        });
        if (dbUser) token.userId = dbUser.id;
      }

      const email = (user?.email ?? token.email)?.toLowerCase();
      const isEnvAdmin = email ? getAdminEmails().has(email) : false;

      if (isEnvAdmin) {
        token.role = "ADMIN";
        token.disabled = false;
      } else if (token.userId) {
        const dbUser = await getPrisma().user.findUnique({
          where: { id: token.userId as string },
          select: { role: true, disabledAt: true },
        });
        const disabled = Boolean(dbUser?.disabledAt);
        token.disabled = disabled;
        token.role = dbUser && !disabled ? dbUser.role : "READER";
      } else {
        token.role = "READER";
        token.disabled = false;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.disabled
          ? ""
          : (token.userId as string | undefined) ?? "";
        session.user.role = (token.role as "ADMIN" | "READER" | undefined) ?? "READER";
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

export function getServerAuthSession() {
  return getServerSession(authOptions);
}
