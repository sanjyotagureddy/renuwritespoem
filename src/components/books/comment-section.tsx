"use client";

import ReusableCommentSection from "@/components/ui/comment-section";

export default function BookCommentSection({ slug }: { slug: string }) {
  return <ReusableCommentSection slug={slug} type="book" />;
}
