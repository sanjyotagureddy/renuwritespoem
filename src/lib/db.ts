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

function buildPoolOptions(connectionString: string): {
  connectionString: string;
  ssl?: { rejectUnauthorized: boolean };
} {
  const parsedUrl = new URL(connectionString);

  if (isLocalDatabase(parsedUrl)) {
    return { connectionString };
  }

  // Force no-verify for managed Postgres providers whose CA chain is not in runtime trust store.
  parsedUrl.searchParams.set("sslmode", "no-verify");

  return {
    connectionString: parsedUrl.toString(),
    ssl: { rejectUnauthorized: false },
  };
}

let prismaInstance: PrismaClient;

function initPrisma(): PrismaClient {
  const connectionString = resolveDatabaseUrl();
  if (!connectionString) {
    throw new Error(
      "Missing database connection URL. Set DATABASE_URL or renuwritespoem_postgres_POSTGRES_PRISMA_URL in Vercel environment variables.",
    );
  }
  const pool = new Pool(buildPoolOptions(connectionString));
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

if (process.env.NODE_ENV === "production") {
  prismaInstance = initPrisma();
} else {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = initPrisma();
  }
  prismaInstance = globalForPrisma.prisma;
}

export function getPrisma(): PrismaClient {
  return prismaInstance;
}
