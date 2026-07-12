import type { Metadata } from "next";
import { getPrisma } from "@/lib/db";
import CampaignEditor from "@/components/admin/campaign-editor";

export const metadata: Metadata = {
  title: "Create Campaign — Admin",
};

export default async function NewCampaignPage() {
  const prisma = getPrisma();

  const [poems, books, audios] = await Promise.all([
    prisma.poem.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
      },
    }),
    prisma.book.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        coverImage: true,
      },
    }),
    prisma.audio.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
      },
    }),
  ]);

  return (
    <CampaignEditor
      poems={JSON.parse(JSON.stringify(poems))}
      books={JSON.parse(JSON.stringify(books))}
      audios={JSON.parse(JSON.stringify(audios))}
    />
  );
}
