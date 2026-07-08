import Link from "next/link";
import NewAudioForm from "./audio-form";

export default function NewAudioPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/audio"
          className="text-xs tracking-wider text-white/50 uppercase hover:text-white"
        >
          ← Audio
        </Link>
        <h1 className="text-3xl text-white md:text-4xl">New Audio</h1>
      </div>

      <div className="max-w-2xl">
        <NewAudioForm />
      </div>
    </div>
  );
}
