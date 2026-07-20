import { PrismaClient } from "@prisma/client";

export type BadgeTone = "amber" | "sky" | "violet" | "emerald";

export type Badge = {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  tone: BadgeTone;
};

export type BadgeStats = {
  poemsRead: number;
  booksPurchased: number;
  commentsPosted: number;
  likesGiven: number;
};

export function getBadges(stats: BadgeStats): Badge[] {
  const { poemsRead, booksPurchased, commentsPosted, likesGiven } = stats;
  return [
    {
      id: "first-verse",
      name: "First Verse",
      description: "Read your first poem",
      unlocked: poemsRead >= 1,
      tone: "amber",
    },
    {
      id: "page-turner",
      name: "Page Turner",
      description: "Read 10 poems",
      unlocked: poemsRead >= 10,
      tone: "sky",
    },
    {
      id: "verse-wanderer",
      name: "Verse Wanderer",
      description: "Read 25 poems",
      unlocked: poemsRead >= 25,
      tone: "emerald",
    },
    {
      id: "poetry-regular",
      name: "Poetry Regular",
      description: "Read 50 poems",
      unlocked: poemsRead >= 50,
      tone: "amber",
    },
    {
      id: "poetry-devotee",
      name: "Poetry Devotee",
      description: "Read 100 poems",
      unlocked: poemsRead >= 100,
      tone: "violet",
    },
    {
      id: "century-and-beyond",
      name: "Century and Beyond",
      description: "Read 250 poems",
      unlocked: poemsRead >= 250,
      tone: "sky",
    },
    {
      id: "book-collector",
      name: "Book Collector",
      description: "Purchase your first book",
      unlocked: booksPurchased >= 1,
      tone: "emerald",
    },
    {
      id: "bookshelf-builder",
      name: "Bookshelf Builder",
      description: "Purchase 3 books",
      unlocked: booksPurchased >= 3,
      tone: "violet",
    },
    {
      id: "kindred-voice",
      name: "Kindred Voice",
      description: "Share your first comment",
      unlocked: commentsPosted >= 1,
      tone: "amber",
    },
    {
      id: "thoughtful-reader",
      name: "Thoughtful Reader",
      description: "Share 5 comments",
      unlocked: commentsPosted >= 5,
      tone: "sky",
    },
    {
      id: "first-heart",
      name: "First Heart",
      description: "Like your first piece",
      unlocked: likesGiven >= 1,
      tone: "emerald",
    },
    {
      id: "warm-hearted",
      name: "Warm Hearted",
      description: "Like 10 pieces",
      unlocked: likesGiven >= 10,
      tone: "violet",
    },
  ];
}

export async function fetchUserBadgeStats(
  prisma: PrismaClient,
  userId: string,
  userEmail: string,
): Promise<BadgeStats> {
  const [
    poemLikeCount,
    bookLikeCount,
    audioLikeCount,
    poemCommentCount,
    bookCommentCount,
    audioCommentCount,
    orderCount,
    poemsReadCount,
  ] = await Promise.all([
    prisma.like.count({ where: { userId } }),
    prisma.bookLike.count({ where: { userId } }),
    prisma.audioLike.count({ where: { userId } }),
    prisma.comment.count({ where: { userId } }),
    prisma.bookComment.count({ where: { userId } }),
    prisma.audioComment.count({ where: { userId } }),
    prisma.bookOrder.count({ where: { email: userEmail } }),
    prisma.readerPoemView.count({ where: { userId } }),
  ]);

  const totalLikes = poemLikeCount + bookLikeCount + audioLikeCount;
  const totalComments = poemCommentCount + bookCommentCount + audioCommentCount;

  return {
    poemsRead: poemsReadCount,
    booksPurchased: orderCount,
    commentsPosted: totalComments,
    likesGiven: totalLikes,
  };
}
