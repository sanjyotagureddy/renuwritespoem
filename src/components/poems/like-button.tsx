"use client";

import ReusableLikeButton from "@/components/ui/like-button";

export default function LikeButton({ slug }: { slug: string }) {
  return <ReusableLikeButton slug={slug} type="poem" />;
}
