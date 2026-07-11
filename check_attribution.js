const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
require("dotenv").config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function run() {
  // Add some clicks from whatsapp, invite, and ig-story
  await prisma.attributionLog.createMany({
    data: [
      { source: "whatsapp", path: "/poems/whispers-of-the-wind" },
      { source: "whatsapp", path: "/poems/whispers-of-the-wind" },
      { source: "invite", path: "/" },
      { source: "ig-story", path: "/books/morning-light" },
      { source: "ig-story", path: "/books/morning-light" },
      { source: "ig-story", path: "/books/morning-light" },
    ]
  });

  // Update first user to have signed up from whatsapp
  const user = await prisma.user.findFirst();
  if (user) {
    await prisma.user.update({
      where: { id: user.id },
      data: { signUpSource: "whatsapp" }
    });
  }

  console.log("Mock data inserted successfully!");
  await prisma.$disconnect();
  await pool.end();
}

run();
