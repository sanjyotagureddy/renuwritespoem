import { handleGetComments, handlePostComment } from "@/lib/comments-api-helper";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  return handleGetComments(request, slug, "audio");
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  return handlePostComment(request, slug, "audio");
}
