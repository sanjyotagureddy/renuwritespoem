import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getPrisma } from "@/lib/db";
import CampaignEditor from "@/components/admin/campaign-editor";

export const metadata: Metadata = {
  title: "Edit Campaign — Admin",
};

interface EditCampaignPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCampaignPage({ params }: EditCampaignPageProps) {
  const { id } = await params;
  const prisma = getPrisma();

  const [campaign, poems, books, audios] = await Promise.all([
    prisma.campaign.findUnique({
      where: { id },
    }),
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

  if (!campaign) {
    notFound();
  }

  // Disallow modifications on campaign formats already dispatched
  if (campaign.status === "SENDING" || campaign.status === "SENT") {
    redirect("/admin/campaigns");
  }

  return (
    <CampaignEditor
      initialCampaign={{
        id: campaign.id,
        subject: campaign.subject,
        body: campaign.body,
      }}
      poems={JSON.parse(JSON.stringify(poems))}
      books={JSON.parse(JSON.stringify(books))}
      audios={JSON.parse(JSON.stringify(audios))}
    />
  );
}
