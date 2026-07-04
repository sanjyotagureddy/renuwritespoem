"use client";

import ReusableLikeButton from "@/components/ui/like-button";

export default function BookLikeButton({ slug }: { slug: string }) {
  return <ReusableLikeButton slug={slug} type="book" />;
}
