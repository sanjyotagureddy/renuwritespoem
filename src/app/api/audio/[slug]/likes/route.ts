import { handleGetEntityLikes, handleEntityLikeToggle } from "@/lib/api-helpers/likes-api-helper";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  return handleGetEntityLikes(slug, "audio");
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  return handleEntityLikeToggle(slug, "audio");
}
