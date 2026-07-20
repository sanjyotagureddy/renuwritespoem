import { getPrisma } from "../db";
import { PoemLanguage } from "./poem-language";

export interface GetPoemsArgs {
  language?: PoemLanguage | "ALL";
  genreSlug?: string;
  tagSlug?: string;
  sort?: "popular" | "newest" | "views";
  searchQuery?: string;
  page?: number;
  perPage?: number;
  publishedOnly?: boolean;
}

export async function getPoems({
  language = "ALL",
  genreSlug = "",
  tagSlug = "",
  sort = "popular",
  searchQuery = "",
  page = 1,
  perPage = 9,
  publishedOnly = true,
}: GetPoemsArgs) {
  const prisma = getPrisma();
  const query = searchQuery.trim();

  // Construct standard PostgreSQL search query format
  let searchFilter = {};
  if (query) {
    // Format search terms for Postgres full text search (joining with & for intersection)
    const formattedSearch = query
      .split(/\s+/)
      .filter((word) => word.length > 0)
      .map((word) => `${word}:*`) // Prefix matching support (e.g. "bloo" matches "bloom")
      .join(" & ");

    if (formattedSearch) {
      searchFilter = {
        OR: [
          { title: { search: formattedSearch } },
          { content: { search: formattedSearch } },
          { excerpt: { search: formattedSearch } },
        ],
      };
    }
  }

  const whereClause = {
    ...(publishedOnly ? { published: true } : {}),
    ...(language === "ALL" ? {} : { language }),
    ...(genreSlug ? { genre: { slug: genreSlug } } : {}),
    ...(tagSlug ? { tags: { some: { tag: { slug: tagSlug } } } } : {}),
    ...searchFilter,
  };

  const [poems, totalCount] = await Promise.all([
    prisma.poem.findMany({
      where: whereClause,
      orderBy:
        sort === "views"
          ? [
              { views: "desc" },
              { publishedAt: "desc" },
              { createdAt: "desc" },
            ]
          : sort === "popular"
          ? [
              { likes: { _count: "desc" } },
              { comments: { _count: "desc" } },
              { publishedAt: "desc" },
              { createdAt: "desc" },
            ]
          : [{ publishedAt: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        genre: { select: { name: true, slug: true } },
        tags: { include: { tag: { select: { name: true, slug: true } } } },
        _count: { select: { likes: true, comments: true } },
      },
    }),
    prisma.poem.count({ where: whereClause }),
  ]);

  return { poems, totalCount };
}

export async function getPoemOfTheDay(dateSeed?: string) {
  const prisma = getPrisma();
  const poems = await prisma.poem.findMany({
    where: { published: true },
    select: { id: true },
  });

  if (poems.length === 0) return null;

  let seed = dateSeed;
  if (!seed) {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const date = String(today.getDate()).padStart(2, '0');
    seed = `${year}-${month}-${date}`;
  }

  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }

  const index = Math.abs(hash) % poems.length;
  const selectedId = poems[index].id;

  return prisma.poem.findUnique({
    where: { id: selectedId },
    include: {
      genre: { select: { name: true, slug: true } },
      _count: { select: { likes: true, comments: true } },
    },
  });
}

