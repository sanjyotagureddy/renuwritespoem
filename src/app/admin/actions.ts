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

// ─── Books ───────────────────────────────────────────────────

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB

async function processBookCover(file: File): Promise<{ data: string; mime: string }> {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error("Only JPG, PNG, and WebP images are allowed.");
  }
  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error("Image must be under 5 MB.");
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  return { data: buffer.toString("base64"), mime: file.type };
}

export async function createBook(formData: FormData) {
  await requireAdmin();

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const purchaseUrl = String(formData.get("purchaseUrl") ?? "").trim();
  const status = String(formData.get("status") ?? "COMING_SOON");
  const coverFile = formData.get("coverImage") as File | null;

  if (!title) throw new Error("Title is required.");

  let coverData: string | null = null;
  let coverMime: string | null = null;
  if (coverFile && coverFile.size > 0) {
    const result = await processBookCover(coverFile);
    coverData = result.data;
    coverMime = result.mime;
  }

  const baseSlug = slugify(title);
  const randomSuffix = Math.random().toString(36).slice(2, 7);
  const slug = `${baseSlug}-${randomSuffix}`;

  const prisma = getPrisma();
  const book = await prisma.book.create({
    data: {
      title,
      slug,
      description: description || null,
      coverData,
      coverMime,
      coverImage: null,
      purchaseUrl: purchaseUrl || null,
      status: status as "COMING_SOON" | "AVAILABLE" | "ARCHIVED",
      publishedAt: status === "AVAILABLE" ? new Date() : null,
    },
  });

  // Set coverImage to the API route now that we have the ID
  if (coverData) {
    await prisma.book.update({
      where: { id: book.id },
      data: { coverImage: `/api/book-covers/${book.id}` },
    });
  }

  revalidatePath("/books");
  revalidatePath("/admin");
  redirect("/admin/books");
}

export async function updateBook(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const purchaseUrl = String(formData.get("purchaseUrl") ?? "").trim();
  const status = String(formData.get("status") ?? "COMING_SOON");
  const coverFile = formData.get("coverImage") as File | null;

  if (!id || !title) throw new Error("ID and title are required.");

  const prisma = getPrisma();
  const existing = await prisma.book.findUnique({
    where: { id },
    select: { id: true, slug: true, coverImage: true, publishedAt: true },
  });
  if (!existing) throw new Error("Book not found.");

  const updateData: Record<string, unknown> = {
    title,
    description: description || null,
    purchaseUrl: purchaseUrl || null,
    status: status as "COMING_SOON" | "AVAILABLE" | "ARCHIVED",
    publishedAt:
      status === "AVAILABLE" && !existing.publishedAt ? new Date() : existing.publishedAt,
  };

  if (coverFile && coverFile.size > 0) {
    const result = await processBookCover(coverFile);
    updateData.coverData = result.data;
    updateData.coverMime = result.mime;
    updateData.coverImage = `/api/book-covers/${id}`;
  }

  await prisma.book.update({
    where: { id },
    data: updateData,
  });

  revalidatePath("/books");
  revalidatePath(`/books/${existing.slug}`);
  revalidatePath("/admin");
  redirect("/admin/books");
}

export async function deleteBook(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  if (!id) throw new Error("Book ID is required.");

  const prisma = getPrisma();
  await prisma.book.delete({ where: { id } });

  revalidatePath("/books");
  revalidatePath("/admin");
  redirect("/admin/books");
}

export async function toggleBookFeatured(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  if (!id) throw new Error("Book ID is required.");

  const prisma = getPrisma();
  const book = await prisma.book.findUnique({ where: { id } });
  if (!book) throw new Error("Book not found.");

  if (!book.featured) {
    const featuredCount = await prisma.book.count({ where: { featured: true } });
    if (featuredCount >= 3) {
      throw new Error("You can only have up to 3 featured books. Unfeature one first.");
    }
  }

  await prisma.book.update({
    where: { id },
    data: { featured: !book.featured },
  });

  revalidatePath("/books");
  revalidatePath("/admin");
}
