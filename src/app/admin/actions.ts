"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/lib/auth";
import { getPrisma } from "@/lib/db";
import type { PoemLanguage } from "@/lib/poem-language";

async function requireAdmin() {
  const session = await getServerAuthSession();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }
  return session;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// ─── Poems ───────────────────────────────────────────────────

export async function createPoem(formData: FormData) {
  await requireAdmin();

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
  redirect("/admin/poems");
}

export async function updatePoem(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const language = String(formData.get("language") ?? "EN") as PoemLanguage;
  const publishNow = formData.get("publishNow") === "on";

  if (!id || !title || !content) {
    throw new Error("ID, title, and content are required.");
  }

  const prisma = getPrisma();
  const existing = await prisma.poem.findUnique({ where: { id } });
  if (!existing) throw new Error("Poem not found.");

  await prisma.poem.update({
    where: { id },
    data: {
      title,
      content,
      excerpt: content.slice(0, 180),
      language,
      published: publishNow,
      publishedAt: publishNow && !existing.publishedAt ? new Date() : existing.publishedAt,
    },
  });

  revalidatePath("/poems");
  revalidatePath(`/poems/${existing.slug}`);
  revalidatePath("/admin");
  redirect("/admin/poems");
}

export async function deletePoem(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  if (!id) throw new Error("Poem ID is required.");

  const prisma = getPrisma();
  await prisma.poem.delete({ where: { id } });

  revalidatePath("/poems");
  revalidatePath("/admin");
  redirect("/admin/poems");
}

export async function togglePublish(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  if (!id) throw new Error("Poem ID is required.");

  const prisma = getPrisma();
  const poem = await prisma.poem.findUnique({ where: { id } });
  if (!poem) throw new Error("Poem not found.");

  const newPublished = !poem.published;
  await prisma.poem.update({
    where: { id },
    data: {
      published: newPublished,
      publishedAt: newPublished && !poem.publishedAt ? new Date() : poem.publishedAt,
    },
  });

  revalidatePath("/poems");
  revalidatePath(`/poems/${poem.slug}`);
  revalidatePath("/admin");
}

export async function toggleFeatured(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  if (!id) throw new Error("Poem ID is required.");

  const prisma = getPrisma();
  const poem = await prisma.poem.findUnique({ where: { id } });
  if (!poem) throw new Error("Poem not found.");

  if (!poem.featured) {
    const featuredCount = await prisma.poem.count({ where: { featured: true } });
    if (featuredCount >= 3) {
      throw new Error("You can only have up to 3 featured poems. Unfeature one first.");
    }
  }

  await prisma.poem.update({
    where: { id },
    data: { featured: !poem.featured },
  });

  revalidatePath("/poems");
  revalidatePath("/admin");
}
