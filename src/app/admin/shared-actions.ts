"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/lib/auth";
import { getPrisma } from "@/lib/db";
import { invalidateCache } from "@/lib/cache";

export async function requireAdmin() {
  const session = await getServerAuthSession();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }
  return session;
}



export async function clearAllCache() {
  await requireAdmin();
  const prisma = getPrisma();
  const [poems, books] = await Promise.all([
    prisma.poem.findMany({ select: { slug: true } }),
    prisma.book.findMany({ select: { slug: true } }),
  ]);

  const keys = [
    "home:featured-data",
    ...poems.map((p) => `poem:details:${p.slug}`),
    ...books.map((b) => `book:details:${b.slug}`),
  ];

  await invalidateCache(keys);

  revalidatePath("/");
  revalidatePath("/poems");
  revalidatePath("/books");
  revalidatePath("/admin");
}
