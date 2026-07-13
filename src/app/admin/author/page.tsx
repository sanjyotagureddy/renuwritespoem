import { getOrCreateAuthorProfile } from "@/app/admin/author-actions";
import AuthorAdminClient from "./author-admin-client";

export const metadata = {
  title: "Manage Author Profile",
};

export default async function AdminAuthorPage() {
  const profile = await getOrCreateAuthorProfile();

  // Map Decimal or other values if required. The DB schema uses String for fields.
  // We can pass it directly to the client side.
  const clientProfile = {
    id: profile.id,
    whyIWrite: profile.whyIWrite,
    writingJourney: profile.writingJourney,
    inspiration: profile.inspiration,
    awards: profile.awards,
    publications: profile.publications,
    interviews: profile.interviews,
    behindTheScenes: profile.behindTheScenes,
    writingDesk: profile.writingDesk,
    gallery: (profile.gallery ?? []).map((img) => ({
      id: img.id,
      url: img.url,
      fileData: img.fileData,
      fileMime: img.fileMime,
      width: img.width,
      height: img.height,
      caption: img.caption,
      order: img.order,
    })),
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 pb-5">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold font-[family-name:var(--font-playfair)] text-white">
            Manage Author Profile
          </h1>
          <p className="text-sm text-white/50">
            Edit Renu&apos;s story sections, write why she writes, and manage the collated photo gallery.
          </p>
        </div>
        <a
          href="/about"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/90 hover:bg-white/10 hover:text-white transition-all cursor-pointer w-fit shrink-0 self-start sm:self-center font-[family-name:var(--font-inter)]"
        >
          <span>View Page</span>
          <span className="text-[10px]">↗</span>
        </a>
      </div>
      <AuthorAdminClient initialProfile={clientProfile} />
    </div>
  );
}
