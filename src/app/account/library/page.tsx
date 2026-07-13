import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/lib/auth";
import { getPrisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import SavedLibraryItem from "@/components/account/saved-library-item";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "My Library" };

type PageProps = { searchParams: Promise<{ tab?: string }> };

export default async function LibraryPage({ searchParams }: PageProps) {
  const session = await getServerAuthSession();
  if (!session?.user?.id) redirect("/login");
  const { tab } = await searchParams;
  const activeTab = tab === "books" || tab === "likes" ? tab : "poems";
  const prisma = getPrisma();
  const [poems, books] = await Promise.all([
    prisma.savedPoem.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: "desc" }, include: { poem: { select: { title: true, slug: true } } } }),
    prisma.savedBook.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: "desc" }, include: { book: { select: { title: true, slug: true } } } }),
  ]);
  const tabs = [
    { key: "poems", label: `Saved Poems (${poems.length})` },
    { key: "books", label: `Saved Books (${books.length})` },
    { key: "likes", label: "Liked Content" },
  ];

  return <div className="space-y-6">
    <div><h2 className="text-xl font-semibold text-white">My Library</h2><p className="mt-1 text-sm text-white/40">Keep poems and books close for another quiet moment.</p></div>
    <nav className="flex gap-2 overflow-x-auto border-b border-white/10 pb-3">
      {tabs.map((item) => <Link key={item.key} href={item.key === "poems" ? "/account/library" : `/account/library?tab=${item.key}`} className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm ${activeTab === item.key ? "bg-white/10 text-white" : "text-white/45 hover:bg-white/5 hover:text-white"}`}>{item.label}</Link>)}
    </nav>
    {activeTab === "likes" ? <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6"><p className="text-sm text-white/60">Your liked poems, books, and audio are kept together in one place.</p><Link href="/account/likes" className="mt-4 inline-block text-sm text-amber-200 hover:text-amber-100">View liked content →</Link></div> : activeTab === "poems" ? <LibraryList empty="No saved poems yet." items={poems.map((item) => <SavedLibraryItem key={item.poemId} type="poem" slug={item.poem.slug} title={item.poem.title} savedAt={formatDate(item.createdAt)} />)} /> : <LibraryList empty="No saved books yet." items={books.map((item) => <SavedLibraryItem key={item.bookId} type="book" slug={item.book.slug} title={item.book.title} savedAt={formatDate(item.createdAt)} />)} />}
  </div>;
}

function LibraryList({ items, empty }: { items: React.ReactNode[]; empty: string }) {
  return items.length ? <div className="space-y-2">{items}</div> : <div className="rounded-2xl border border-dashed border-white/15 p-10 text-center text-sm text-white/40">{empty}</div>;
}
