type AchievementBadgesProps = {
  poemsRead: number;
  booksPurchased: number;
  commentsPosted: number;
  likesGiven: number;
};

type Badge = {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  tone: "amber" | "sky" | "violet" | "emerald";
};

import BadgeCelebration from "./badge-celebration";
import BadgeCollectionDialog from "./badge-collection-dialog";

export default function AchievementBadges({
  poemsRead,
  booksPurchased,
  commentsPosted,
  likesGiven,
}: AchievementBadgesProps) {
  const badges: Badge[] = [
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
  const unlockedCount = badges.filter((badge) => badge.unlocked).length;

  return (
    <>
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold tracking-[0.18em] text-white/50 uppercase">
              Reader Badges
            </h2>
            <p className="mt-1 text-sm text-white/35">
              {unlockedCount} of {badges.length} milestones unlocked
            </p>
          </div>
          <BadgeCollectionDialog badges={badges} />
        </div>
      </section>
      <BadgeCelebration badges={badges} />
    </>
  );
}
