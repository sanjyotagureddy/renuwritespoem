import { notFound } from "next/navigation";
import Link from "next/link";
import { getPrisma } from "@/lib/db";
import EditAudioForm from "./edit-audio-form";

type EditAudioPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditAudioPage({ params }: EditAudioPageProps) {
  const { id } = await params;
  const prisma = getPrisma();
  const track = await prisma.audio.findUnique({
    where: { id },
  });

  if (!track) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/audio"
          className="text-xs tracking-wider text-white/50 uppercase hover:text-white"
        >
          ← Audio
        </Link>
        <h1 className="text-3xl text-white md:text-4xl">Edit Audio</h1>
      </div>

      <div className="max-w-2xl">
        <EditAudioForm track={track} />
      </div>
    </div>
  );
}
