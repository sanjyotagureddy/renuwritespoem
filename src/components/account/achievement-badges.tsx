import { getBadges, Badge } from "@/lib/domain/badges";
import BadgeCelebration from "./badge-celebration";
import BadgeCollectionDialog from "./badge-collection-dialog";

type AchievementBadgesProps = {
  poemsRead: number;
  booksPurchased: number;
  commentsPosted: number;
  likesGiven: number;
};

export default function AchievementBadges({
  poemsRead,
  booksPurchased,
  commentsPosted,
  likesGiven,
}: AchievementBadgesProps) {
  const badges = getBadges({
    poemsRead,
    booksPurchased,
    commentsPosted,
    likesGiven,
  });
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
