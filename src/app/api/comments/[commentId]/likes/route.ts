import { handleCommentLikeToggle } from "@/lib/likes-api-helper";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ commentId: string }> },
) {
  const { commentId } = await params;
  return handleCommentLikeToggle(commentId, "poemComment");
}
