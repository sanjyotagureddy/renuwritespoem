import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

loadEnv({ path: ".env.local" });
loadEnv();

const directDatabaseUrl =
  process.env["DIRECT_URL"] ??
  process.env["renuwritespoem_postgres_POSTGRES_URL_NON_POOLING"];

const pooledDatabaseUrl =
  process.env["DATABASE_URL"] ??
  process.env["renuwritespoem_postgres_POSTGRES_PRISMA_URL"] ??
  process.env["renuwritespoem_postgres_POSTGRES_URL"];

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed.ts",
  },
  datasource: {
    // Prefer direct connection for migrations, fallback to pooled URL.
    url: directDatabaseUrl ?? pooledDatabaseUrl,
  },
});
