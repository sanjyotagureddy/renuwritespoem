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
    update: { font: "Playfair Display" },
    create: {
      language: "EN",
      title: "Unspoken Words",
      slug: "unspoken-words",
      content: `There are words I never said,\nlingering on the tip of my tongue,\nheavy with the weight of everything\nI wished you knew.\n\nSilence became our language,\nand in its pauses,\nI loved you louder\nthan words ever could.`,
      excerpt: "There are words I never said, lingering on the tip of my tongue...",
      published: true,
      publishedAt: new Date("2025-06-15"),
      genreId: love.id,
      font: "Playfair Display",
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
    update: { font: "Yatra One" },
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
      font: "Yatra One",
    },
  });

  const poem6 = await prisma.poem.upsert({
    where: { slug: "paus-gandh" },
    update: { font: "Kalam" },
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
      font: "Kalam",
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
  const book = await prisma.book.upsert({
    where: { slug: "where-words-bloom" },
    update: {
      status: "AVAILABLE",
      price: 299,
      discountedPrice: 199,
    },
    create: {
      title: "Where Words Bloom",
      slug: "where-words-bloom",
      description:
        "A debut collection of poetry exploring love, loss, nature, and the quiet moments that shape us.",
      status: "AVAILABLE",
      price: 299,
      discountedPrice: 199,
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

  // ─── Dummy Users for Likes & Comments ───────────────────
  const user1 = await prisma.user.upsert({
    where: { email: "alice@example.com" },
    update: {},
    create: { email: "alice@example.com", name: "Alice Smith" },
  });
  const user2 = await prisma.user.upsert({
    where: { email: "bob@example.com" },
    update: {},
    create: { email: "bob@example.com", name: "Bob Johnson" },
  });
  const user3 = await prisma.user.upsert({
    where: { email: "charlie@example.com" },
    update: {},
    create: { email: "charlie@example.com", name: "Charlie Brown" },
  });
  const user4 = await prisma.user.upsert({
    where: { email: "diana@example.com" },
    update: {},
    create: { email: "diana@example.com", name: "Diana Prince" },
  });
  const user5 = await prisma.user.upsert({
    where: { email: "ethan@example.com" },
    update: {},
    create: { email: "ethan@example.com", name: "Ethan Hunt" },
  });

  // ─── Dummy Poem Comments (Whispers of the Wind) ─────────
  const countPoemComments = await prisma.comment.count({ where: { poemId: poem1.id } });
  if (countPoemComments === 0) {
    const dummyComments = [
      { body: "This is a beautiful poem! Truly touched my heart.", userId: user1.id },
      { body: "The imagery of wind carrying secrets is so vivid.", userId: user2.id },
      { body: "Reminds me of quiet autumn evenings.", userId: user3.id },
      { body: "Absolutely wonderful writing. Kudos to the writer!", userId: user4.id },
      { body: "I read this twice, it's so comforting.", userId: user5.id },
      { body: "Is there a printed collection of these poems?", userId: user1.id },
      { body: "Perfect words for a lazy Sunday morning.", userId: user2.id },
      { body: "So simple yet so profound.", userId: user3.id },
      { body: "Love the rhythm of this piece.", userId: user4.id },
      { body: "This wind whispers to my soul as well.", userId: user5.id },
    ];

    for (let i = 0; i < dummyComments.length; i++) {
      const c = dummyComments[i];
      await prisma.comment.create({
        data: {
          body: c.body,
          poemId: poem1.id,
          userId: c.userId,
          status: "APPROVED",
          createdAt: new Date(Date.now() - (10 - i) * 3600000),
        },
      });
    }
  }

  // ─── Dummy Book Comments (Where Words Bloom) ────────────
  const countBookComments = await prisma.bookComment.count({ where: { bookId: book.id } });
  if (countBookComments === 0) {
    const dummyBookComments = [
      { body: "Can't wait to get my hands on this book!", userId: user1.id },
      { body: "The title 'Where Words Bloom' is beautiful.", userId: user2.id },
      { body: "Pre-ordered! Super excited.", userId: user3.id },
      { body: "Is this book available in print or only digital?", userId: user4.id },
      { body: "I've been following your poems, this book is a must-buy.", userId: user5.id },
      { body: "Beautiful cover and description. Highly anticipating this.", userId: user1.id },
      { body: "Congratulations on the launch!", userId: user2.id },
      { body: "Will there be a book signing event?", userId: user3.id },
      { body: "Already loving the preview pages.", userId: user4.id },
      { body: "Indeed, where words bloom, emotions rise.", userId: user5.id },
    ];

    for (let i = 0; i < dummyBookComments.length; i++) {
      const c = dummyBookComments[i];
      await prisma.bookComment.create({
        data: {
          body: c.body,
          bookId: book.id,
          userId: c.userId,
          status: "APPROVED",
          createdAt: new Date(Date.now() - (10 - i) * 3600000),
        },
      });
    }
  }

  // ─── Dummy Likes ─────────────────────────────────────────
  const countPoemLikes = await prisma.like.count({ where: { poemId: poem1.id } });
  if (countPoemLikes === 0) {
    await prisma.like.createMany({
      data: [
        { poemId: poem1.id, userId: user1.id },
        { poemId: poem1.id, userId: user2.id },
        { poemId: poem1.id, userId: user3.id },
      ],
    });
  }

  const countBookLikes = await prisma.bookLike.count({ where: { bookId: book.id } });
  if (countBookLikes === 0) {
    await prisma.bookLike.createMany({
      data: [
        { bookId: book.id, userId: user2.id },
        { bookId: book.id, userId: user3.id },
        { bookId: book.id, userId: user4.id },
        { bookId: book.id, userId: user5.id },
      ],
    });
  }

  console.log("✅ Seed data created successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
