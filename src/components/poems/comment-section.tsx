"use client";

import ReusableCommentSection from "@/components/ui/comment-section";

export default function CommentSection({ slug }: { slug: string }) {
  return <ReusableCommentSection slug={slug} type="poem" />;
}
