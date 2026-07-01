import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Missing DIRECT_URL or DATABASE_URL");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  // ─── Genres ──────────────────────────────────────────────
  const love = await prisma.genre.upsert({
    where: { slug: "love" },
    update: {},
    create: { name: "Love", slug: "love", description: "Poems about love, longing, and connection." },
  });

  const nature = await prisma.genre.upsert({
    where: { slug: "nature" },
    update: {},
    create: { name: "Nature", slug: "nature", description: "Poems inspired by the natural world." },
  });

  const life = await prisma.genre.upsert({
    where: { slug: "life" },
    update: {},
    create: { name: "Life", slug: "life", description: "Reflections on everyday life and human experience." },
  });

  const solitude = await prisma.genre.upsert({
    where: { slug: "solitude" },
    update: {},
    create: { name: "Solitude", slug: "solitude", description: "Poems about silence, stillness, and being alone." },
  });

  // ─── Tags ────────────────────────────────────────────────
  const tagData = [
    { name: "Heartfelt", slug: "heartfelt" },
    { name: "Seasons", slug: "seasons" },
    { name: "Hope", slug: "hope" },
    { name: "Melancholy", slug: "melancholy" },
    { name: "Dreams", slug: "dreams" },
    { name: "Rain", slug: "rain" },
    { name: "Stars", slug: "stars" },
    { name: "Moonlight", slug: "moonlight" },
  ];

  const tags: Record<string, { id: string }> = {};
  for (const t of tagData) {
    tags[t.slug] = await prisma.tag.upsert({
      where: { slug: t.slug },
      update: {},
      create: t,
    });
  }

  // ─── Poems ───────────────────────────────────────────────
  const poem1 = await prisma.poem.upsert({
    where: { slug: "whispers-of-the-wind" },
    update: {},
    create: {
      language: "EN",
      title: "Whispers of the Wind",
      slug: "whispers-of-the-wind",
      content: `The wind carries secrets\nthrough the rustling leaves,\nwhispering tales of distant lands\nand forgotten dreams.\n\nIt brushes past my cheek,\na gentle reminder\nthat the world is vast\nand full of wonder.`,
      excerpt: "The wind carries secrets through the rustling leaves...",
      published: true,
      publishedAt: new Date("2025-06-01"),
      genreId: nature.id,
    },
  });

  const poem2 = await prisma.poem.upsert({
    where: { slug: "unspoken-words" },
    update: {},
    create: {
      language: "EN",
      title: "Unspoken Words",
      slug: "unspoken-words",
      content: `There are words I never said,\nlingering on the tip of my tongue,\nheavy with the weight of everything\nI wished you knew.\n\nSilence became our language,\nand in its pauses,\nI loved you louder\nthan words ever could.`,
      excerpt: "There are words I never said, lingering on the tip of my tongue...",
      published: true,
      publishedAt: new Date("2025-06-15"),
      genreId: love.id,
    },
  });

  const poem3 = await prisma.poem.upsert({
    where: { slug: "morning-light" },
    update: {},
    create: {
      language: "EN",
      title: "Morning Light",
      slug: "morning-light",
      content: `The first ray of light\nslips through the curtain,\npainting golden stripes\nacross the quiet room.\n\nA new day begins—\nnot with fanfare,\nbut with the soft promise\nthat today, anything is possible.`,
      excerpt: "The first ray of light slips through the curtain...",
      published: true,
      publishedAt: new Date("2025-07-01"),
      genreId: life.id,
    },
  });

  const poem4 = await prisma.poem.upsert({
    where: { slug: "the-quiet-hour" },
    update: {},
    create: {
      language: "EN",
      title: "The Quiet Hour",
      slug: "the-quiet-hour",
      content: `In the hush between dusk and dark,\nI find a stillness\nthat speaks in colors\nthe day never shows.\n\nThe world slows its breath,\nand for a moment,\nI am enough\njust as I am.`,
      excerpt: "In the hush between dusk and dark, I find a stillness...",
      published: true,
      publishedAt: new Date("2025-07-15"),
      genreId: solitude.id,
    },
  });

  const poem5 = await prisma.poem.upsert({
    where: { slug: "sannata-bolta-hai" },
    update: {},
    create: {
      language: "HI",
      title: "सन्नाटा बोलता है",
      slug: "sannata-bolta-hai",
      content: `रात की तहों में
जब शहर थक कर सो जाता है,
सन्नाटा धीरे-धीरे
मेरे भीतर उतर आता है।

वह कुछ कहता नहीं,
बस यादों की धूल हिलाकर
मन के पुराने आईने में
एक नया चेहरा दिखा जाता है।`,
      excerpt: "रात की तहों में जब शहर थक कर सो जाता है...",
      published: true,
      publishedAt: new Date("2025-08-01"),
      genreId: solitude.id,
    },
  });

  const poem6 = await prisma.poem.upsert({
    where: { slug: "paus-gandh" },
    update: {},
    create: {
      language: "MR",
      title: "पावसाचा गंध",
      slug: "paus-gandh",
      content: `पहिल्या सरीत
मातीने खोल श्वास घेतला,
आणि अंगणभर
आठवणींचा गंध पसरला.

खिडकीत उभा राहून
मी पावसाला ऐकत राहिले,
प्रत्येक थेंबात
घराची एक ओळ सापडली.`,
      excerpt: "पहिल्या सरीत मातीने खोल श्वास घेतला...",
      published: true,
      publishedAt: new Date("2025-08-10"),
      genreId: nature.id,
    },
  });

  // ─── Poem–Tag relations ──────────────────────────────────
  const poemTags = [
    { poemId: poem1.id, tagId: tags["seasons"].id },
    { poemId: poem1.id, tagId: tags["dreams"].id },
    { poemId: poem2.id, tagId: tags["heartfelt"].id },
    { poemId: poem2.id, tagId: tags["melancholy"].id },
    { poemId: poem3.id, tagId: tags["hope"].id },
    { poemId: poem3.id, tagId: tags["moonlight"].id },
    { poemId: poem4.id, tagId: tags["stars"].id },
    { poemId: poem4.id, tagId: tags["rain"].id },
    { poemId: poem5.id, tagId: tags["melancholy"].id },
    { poemId: poem5.id, tagId: tags["heartfelt"].id },
    { poemId: poem6.id, tagId: tags["rain"].id },
    { poemId: poem6.id, tagId: tags["seasons"].id },
  ];

  for (const pt of poemTags) {
    await prisma.poemTag.upsert({
      where: { poemId_tagId: { poemId: pt.poemId, tagId: pt.tagId } },
      update: {},
      create: pt,
    });
  }

  // ─── Books ───────────────────────────────────────────────
  await prisma.book.upsert({
    where: { slug: "where-words-bloom" },
    update: {},
    create: {
      title: "Where Words Bloom",
      slug: "where-words-bloom",
      description:
        "A debut collection of poetry exploring love, loss, nature, and the quiet moments that shape us.",
      status: "COMING_SOON",
    },
  });

  // ─── Admin user (placeholder) ────────────────────────────
  await prisma.user.upsert({
    where: { email: "renu@renuwritespoem.com" },
    update: {},
    create: {
      email: "renu@renuwritespoem.com",
      name: "Renu",
      role: "ADMIN",
    },
  });

  console.log("✅ Seed data created successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
