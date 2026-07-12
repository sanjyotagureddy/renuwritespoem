import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { type NextAuthOptions, getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
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
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const email = credentials.email.toLowerCase().trim();
        const user = await getPrisma().user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            name: true,
            passwordHash: true,
            emailVerified: true,
            disabledAt: true,
            role: true
          }
        });

        if (!user) {
          throw new Error("No user found with this email");
        }

        if (user.disabledAt) {
          throw new Error("This account has been disabled");
        }

        if (!user.passwordHash) {
          throw new Error("This account signs in with Google. Please use Google Sign-in.");
        }

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) {
          throw new Error("Incorrect password");
        }

        if (!user.emailVerified) {
          throw new Error("UNVERIFIED_EMAIL");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        };
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) {
        return false;
      }

      const email = user.email.toLowerCase();
      const isAdmin = getAdminEmails().has(email);
      const dbUser = await getPrisma().user.findUnique({
        where: { email },
        select: { disabledAt: true, emailVerified: true },
      });

      if (dbUser?.disabledAt) {
        return false;
      }

      // Auto-verify Google OAuth users
      if (account?.provider === "google") {
        if (dbUser && !dbUser.emailVerified) {
          await getPrisma().user.update({
            where: { email },
            data: { emailVerified: new Date() },
          });
        }
      }

      if (isAdmin) {
        await getPrisma().user.updateMany({
          where: { email },
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
  events: {
    async createUser({ user }) {
      if (user.email) {
        await getPrisma().subscriber.upsert({
          where: { email: user.email },
          create: {
            email: user.email,
            name: user.name ?? null,
            verified: true,
            verifyToken: null,
            subscribedAt: new Date(),
          },
          update: {
            verified: true,
            verifyToken: null,
            unsubscribedAt: null,
          },
        });
        await getPrisma().unsubscribedEmail.deleteMany({
          where: { email: user.email },
        });
      }
    },
  },
  pages: {
    signIn: "/login",
  },
};

export function getServerAuthSession() {
  return getServerSession(authOptions);
}
