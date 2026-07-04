import Link from "next/link";
import NewSongForm from "./song-form";

export default function NewSongPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/songs"
          className="text-xs tracking-wider text-white/50 uppercase hover:text-white"
        >
          ← Songs
        </Link>
        <h1 className="text-3xl text-white md:text-4xl">New Song</h1>
      </div>

      <div className="max-w-2xl">
        <NewSongForm />
      </div>
    </div>
  );
}
