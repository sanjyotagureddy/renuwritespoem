import { Poem, Audio, AuthorGalleryImage } from "@prisma/client";

export type CommentType = "poem" | "book" | "audio";
export type LikeType = "poem" | "book" | "audio";
export type CommentLikeType = "poemComment" | "bookComment" | "audioComment";

export type HomepageCacheData = {
  featuredPoems: Array<Poem & { genre: { name: string } | null; _count: { likes: number; comments: number } }>;
  latestPoem: (Poem & { genre: { name: string } | null; _count: { likes: number; comments: number } }) | null;
  poemOfTheDay: (Poem & { genre: { name: string } | null; _count: { likes: number; comments: number } }) | null;
  featuredBook: {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    coverImage: string | null;
    price: number | null | { toString(): string };
    discountedPrice: number | null | { toString(): string };
  } | null;
  latestAudio: Audio | null;
  testimonials: Array<{
    id: string;
    body: string;
    userName: string;
    userImage?: string | null;
    targetTitle: string;
    targetLink: string;
    createdAt: string;
  }>;
  galleryPhotos: Array<AuthorGalleryImage>;
  authorProfile: {
    whyIWrite: string | null;
    writingJourney: string | null;
  } | null;
};
