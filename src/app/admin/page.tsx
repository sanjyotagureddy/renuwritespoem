import type { Metadata } from "next";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import SignOutButton from "@/components/auth/sign-out-button";
import { getServerAuthSession } from "@/lib/auth";
import { getPrisma } from "@/lib/db";
import type { PoemLanguage } from "@/lib/poem-language";

export const metadata: Metadata = {
  title: "Admin",
  description: "Manage poems and content.",
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function createPoem(formData: FormData) {
  "use server";

  const session = await getServerAuthSession();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const language = String(formData.get("language") ?? "EN") as PoemLanguage;
  const publishNow = formData.get("publishNow") === "on";

  if (!title || !content) {
    throw new Error("Title and content are required.");
  }

  const baseSlug = slugify(title);
  const randomSuffix = Math.random().toString(36).slice(2, 7);
  const slug = `${baseSlug}-${randomSuffix}`;

  const prisma = getPrisma();
  await prisma.poem.create({
    data: {
      title,
      slug,
      content,
      excerpt: content.slice(0, 180),
      language,
      published: publishNow,
      publishedAt: publishNow ? new Date() : null,
    },
  });

  revalidatePath("/poems");
  revalidatePath("/admin");
}

export default async function AdminPage() {
  const session = await getServerAuthSession();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 md:py-24">
        <div className="rounded-2xl border border-rose-200/20 bg-rose-500/5 p-8">
          <h1 className="text-3xl text-white mb-3">Access Denied</h1>
          <p className="text-white/70 font-[family-name:var(--font-inter)]">
            Your account is signed in but does not have admin access.
          </p>
        </div>
      </div>
    );
  }

  const recentPoems = await getPrisma().poem.findMany({
    orderBy: { createdAt: "desc" },
    take: 8,
    select: {
      id: true,
      title: true,
      slug: true,
      language: true,
      published: true,
      createdAt: true,
    },
  });

  return (
    <div className="max-w-6xl mx-auto px-6 py-14 md:py-20 space-y-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-white/40 mb-2">Admin Dashboard</p>
          <h1 className="text-3xl md:text-4xl text-white">Create Poem</h1>
          <p className="text-white/60 font-[family-name:var(--font-inter)] mt-2">
            Signed in as {session.user.email}
          </p>
        </div>

        <SignOutButton />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8">
        <section className="rounded-2xl border border-white/15 bg-white/[0.03] p-7">
          <form action={createPoem} className="space-y-5">
            <div>
              <label htmlFor="title" className="block text-sm text-white/80 mb-2">
                Title
              </label>
              <input
                id="title"
                name="title"
                required
                className="w-full rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-white outline-none focus:border-white/40"
                placeholder="Write the poem title"
              />
            </div>

            <div>
              <label htmlFor="language" className="block text-sm text-white/80 mb-2">
                Language
              </label>
              <select
                id="language"
                name="language"
                defaultValue="EN"
                className="w-full rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-white outline-none focus:border-white/40"
              >
                <option value="EN">English</option>
                <option value="HI">Hindi</option>
                <option value="MR">Marathi</option>
              </select>
            </div>

            <div>
              <label htmlFor="content" className="block text-sm text-white/80 mb-2">
                Content
              </label>
              <textarea
                id="content"
                name="content"
                required
                rows={10}
                className="w-full rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-white outline-none focus:border-white/40"
                placeholder="Write your poem here..."
              />
            </div>

            <label className="inline-flex items-center gap-2 text-sm text-white/75">
              <input type="checkbox" name="publishNow" className="accent-white" />
              Publish immediately
            </label>

            <button
              type="submit"
              className="rounded-full border border-white/30 bg-white/10 px-6 py-3 text-xs uppercase tracking-[0.18em] text-white hover:bg-white/20 transition-colors"
            >
              Save Poem
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-white/15 bg-white/[0.03] p-7">
          <h2 className="text-xl text-white mb-5">Recent Poems</h2>
          <div className="space-y-3">
            {recentPoems.length === 0 ? (
              <p className="text-white/60 font-[family-name:var(--font-inter)]">No poems yet.</p>
            ) : (
              recentPoems.map((poem) => (
                <div key={poem.id} className="rounded-xl border border-white/10 bg-black/20 p-3">
                  <p className="text-white">{poem.title}</p>
                  <p className="text-xs uppercase tracking-wider text-white/50 mt-1">
                    {poem.language} • {poem.published ? "Published" : "Draft"}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
