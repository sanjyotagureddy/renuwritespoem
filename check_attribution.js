const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
require("dotenv").config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function run() {
  try {
    const clicksBySource = await prisma.attributionLog.groupBy({
      by: ["source"],
      _count: { id: true }
    });
    console.log("clicksBySource:", clicksBySource);

    const signupsBySource = await prisma.user.groupBy({
      by: ["signUpSource"],
      where: { signUpSource: { not: null } },
      _count: { id: true }
    });
    console.log("signupsBySource:", signupsBySource);
  } catch (err) {
    console.error("Query Error:", err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

run();
