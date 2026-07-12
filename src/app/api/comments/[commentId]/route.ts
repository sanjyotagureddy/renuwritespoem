import { handleDeleteComment, handlePatchComment } from "@/lib/comments-api-helper";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ commentId: string }> },
) {
  const { commentId } = await params;
  return handlePatchComment(request, commentId, "poem");
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ commentId: string }> },
) {
  const { commentId } = await params;
  return handleDeleteComment(commentId, "poem");
}
