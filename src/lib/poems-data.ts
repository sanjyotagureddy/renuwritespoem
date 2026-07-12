import { getPrisma } from "./db";
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
