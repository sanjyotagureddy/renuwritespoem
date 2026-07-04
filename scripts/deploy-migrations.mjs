import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import pg from "pg";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });
loadEnv();

const { Client } = pg;
const databaseUrl =
  process.env.DIRECT_URL ??
  process.env.renuwritespoem_postgres_POSTGRES_URL_NON_POOLING ??
  process.env.DATABASE_URL ??
  process.env.renuwritespoem_postgres_POSTGRES_PRISMA_URL ??
  process.env.renuwritespoem_postgres_POSTGRES_URL;
const baseline = "20260704000000_baseline";

if (!databaseUrl) {
  throw new Error(
    "No database URL is available. Connect the Postgres integration to this Vercel environment or set DIRECT_URL/DATABASE_URL.",
  );
}

function runPrisma(args) {
  const result = spawnSync("npx", ["prisma", ...args], {
    stdio: "inherit",
    env: process.env,
    shell: process.platform === "win32",
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function isLocalDatabase(url) {
  return url.hostname === "localhost" || url.hostname === "127.0.0.1";
}

function buildClientOptions(connectionString) {
  const parsedUrl = new URL(connectionString);

  if (isLocalDatabase(parsedUrl)) {
    return { connectionString };
  }

  // Keep this in sync with src/lib/db.ts for managed Postgres providers whose
  // CA chain is not available in the build/runtime trust store.
  parsedUrl.searchParams.set("sslmode", "no-verify");

  return {
    connectionString: parsedUrl.toString(),
    ssl: { rejectUnauthorized: false },
  };
}

const client = new Client(buildClientOptions(databaseUrl));
await client.connect();
let clientClosed = false;

try {
  const existingSchema = await client.query(
    "SELECT to_regclass('public.users') IS NOT NULL AS exists",
  );
  const migrationTable = await client.query(
    "SELECT to_regclass('public._prisma_migrations') IS NOT NULL AS exists",
  );

  let baselineApplied = false;
  if (migrationTable.rows[0].exists) {
    const result = await client.query(
      'SELECT 1 FROM "_prisma_migrations" WHERE migration_name = $1 AND finished_at IS NOT NULL LIMIT 1',
      [baseline],
    );
    baselineApplied = result.rowCount > 0;
  }

  if (existingSchema.rows[0].exists && !baselineApplied) {
    console.log("Existing database detected; applying compatibility patch and recording baseline.");
    const sql = await readFile(
      new URL("../prisma/production-schema-hotfix.sql", import.meta.url),
      "utf8",
    );
    await client.query(sql);
    await client.end();
    clientClosed = true;
    runPrisma(["migrate", "resolve", "--applied", baseline]);
  }
} finally {
  if (!clientClosed) await client.end();
}

runPrisma(["migrate", "deploy"]);
