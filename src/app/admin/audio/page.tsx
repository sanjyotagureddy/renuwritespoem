import Link from "next/link";
import Image from "next/image";
import { getPrisma } from "@/lib/db";
import { updateAudioStatus } from "../actions/audio-actions";
import DeleteAudioForm from "./delete-audio-form";
import { formatDate } from "@/lib/utils";

export default async function AdminAudioPage() {
  const prisma = getPrisma();

  const tracks = await prisma.audio.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      coverUrl: true,
      published: true,
      createdAt: true,
      publishedAt: true,
      views: true,
    },
  });

  const publishedCount = tracks.filter((s) => s.published).length;
  const draftCount = tracks.filter((s) => !s.published).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-white md:text-4xl">Audio & Recordings</h1>
          <p className="mt-2 text-sm text-white/45">
            Manage audio releases, cover arts, and publication visibility.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/audio"
            target="_blank"
            className="rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-xs tracking-[0.18em] text-white/65 uppercase transition-colors hover:bg-white/10 hover:text-white"
          >
            View public page ↗
          </Link>
          <Link
            href="/admin/audio/new"
            className="rounded-full border border-white/30 bg-white/10 px-5 py-2.5 text-xs tracking-[0.18em] text-white uppercase transition-colors hover:bg-white/20"
          >
            + New Audio
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 max-w-xl">
        {[
          ["Total Tracks", tracks.length],
          ["Published", publishedCount],
          ["Drafts", draftCount],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
          >
            <p className="mb-1 text-[10px] tracking-[0.18em] text-white/35 uppercase">
              {label}
            </p>
            <p className="text-2xl text-white">{value}</p>
          </div>
        ))}
      </div>

      {tracks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-10 text-center">
          <p className="text-white/50 font-[family-name:var(--font-inter)] mb-3">
            No audio recordings have been uploaded yet.
          </p>
          <Link
            href="/admin/audio/new"
            className="text-sm text-white/70 hover:text-white underline underline-offset-4"
          >
            Upload your first audio
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] divide-y divide-white/8">
          {tracks.map((track) => (
            <div
              key={track.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4"
            >
              {/* Info */}
              <div className="flex items-center gap-3.5 min-w-0">
                {track.coverUrl ? (
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-white/10">
                    <Image
                      src={track.coverUrl}
                      alt={track.title}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-lg text-violet-400">
                    📻
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-white font-medium truncate">{track.title}</p>
                  <p className="text-xs text-white/40 mt-0.5">
                    Created {formatDate(track.createdAt)}
                    {track.publishedAt ? ` • Published ${formatDate(track.publishedAt)}` : ""}
                    {` • ${track.views.toLocaleString()} ${track.views === 1 ? 'play' : 'plays'}`}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] uppercase tracking-wider border ${
                    track.published
                      ? "border-emerald-400/30 text-emerald-400/80 bg-emerald-500/10"
                      : "border-white/15 text-white/40 bg-white/5"
                  }`}
                >
                  {track.published ? "Published" : "Draft"}
                </span>

                {/* Toggle Publish */}
                <form
                  action={async () => {
                    "use server";
                    await updateAudioStatus(track.id, !track.published);
                  }}
                >
                  <button
                    type="submit"
                    className="rounded-lg px-3 py-1.5 text-xs text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    {track.published ? "Unpublish" : "Publish"}
                  </button>
                </form>

                {/* View */}
                <Link
                  href={`/audio`}
                  className="rounded-lg px-3 py-1.5 text-xs text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                  target="_blank"
                >
                  Listen ↗
                </Link>

                {/* Edit */}
                <Link
                  href={`/admin/audio/${track.id}/edit`}
                  className="rounded-lg px-3 py-1.5 text-xs text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                >
                  Edit
                </Link>

                {/* Delete */}
                <DeleteAudioForm audioId={track.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
