import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function resolveDatabaseUrl(): string | undefined {
  return (
    process.env.DATABASE_URL ??
    process.env.renuwritespoem_postgres_POSTGRES_PRISMA_URL ??
    process.env.renuwritespoem_postgres_POSTGRES_URL
  );
}

function isLocalDatabase(url: URL): boolean {
  return url.hostname === "localhost" || url.hostname === "127.0.0.1";
}

export function getPrisma(): PrismaClient {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  const connectionString = resolveDatabaseUrl();

  if (!connectionString) {
    throw new Error(
      "Missing database connection URL. Set DATABASE_URL or renuwritespoem_postgres_POSTGRES_PRISMA_URL in Vercel environment variables.",
    );
  }

  const parsedUrl = new URL(connectionString);

  const pool = new Pool({
    connectionString,
    ssl: isLocalDatabase(parsedUrl) ? undefined : { rejectUnauthorized: false },
  });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
  }

  return prisma;
}
