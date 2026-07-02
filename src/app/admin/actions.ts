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

function parseTags(formData: FormData): Array<{ name: string; slug: string }> {
  const names = String(formData.get("tags") ?? "")
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean)
    .slice(0, 10);

  const uniqueNames = [
    ...new Map(names.map((name) => [name.toLocaleLowerCase(), name])).values(),
  ];

  const normalizedTags = uniqueNames
    .map((name) => {
      const slug = name
        .toLocaleLowerCase()
        .normalize("NFKD")
        .replace(/[^\p{L}\p{N}\s-]/gu, "")
        .trim()
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

      return { name: name.slice(0, 50), slug: slug.slice(0, 60) };
    })
    .filter((tag) => tag.slug.length > 0);

  return [...new Map(normalizedTags.map((tag) => [tag.slug, tag])).values()];
}

function createTagRelations(tags: Array<{ name: string; slug: string }>) {
  return tags.map((tag) => ({
    tag: {
      connectOrCreate: {
        where: { slug: tag.slug },
        create: tag,
      },
    },
  }));
}

// ─── Poems ───────────────────────────────────────────────────

export async function createPoem(formData: FormData) {
  await requireAdmin();

  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const language = String(formData.get("language") ?? "EN") as PoemLanguage;
  const genreId = String(formData.get("genreId") ?? "").trim();
  const publishNow = formData.get("publishNow") === "on";
  const tags = parseTags(formData);

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
      genreId: genreId || null,
      published: publishNow,
      publishedAt: publishNow ? new Date() : null,
      tags: { create: createTagRelations(tags) },
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
  const genreId = String(formData.get("genreId") ?? "").trim();
  const publishNow = formData.get("publishNow") === "on";
  const tags = parseTags(formData);

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
      genreId: genreId || null,
      published: publishNow,
      publishedAt:
        publishNow && !existing.publishedAt ? new Date() : existing.publishedAt,
      tags: {
        deleteMany: {},
        create: createTagRelations(tags),
      },
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
      publishedAt:
        newPublished && !poem.publishedAt ? new Date() : poem.publishedAt,
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
    const featuredCount = await prisma.poem.count({
      where: { featured: true },
    });
    if (featuredCount >= 3) {
      throw new Error(
        "You can only have up to 3 featured poems. Unfeature one first.",
      );
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

async function processBookCover(
  file: File,
): Promise<{ data: string; mime: string }> {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error("Only JPG, PNG, and WebP images are allowed.");
  }
  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error("Image must be under 5 MB.");
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  return { data: buffer.toString("base64"), mime: file.type };
}

function parseMoney(
  value: string,
  fallback: number | null = null,
): number | null {
  const trimmed = value.trim();
  if (!trimmed) return fallback;

  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error("Please enter a valid amount.");
  }

  return parsed;
}

function normalizeDiscount(
  price: number | null,
  discountedPrice: number | null,
): number | null {
  if (price == null || discountedPrice == null) return null;
  if (discountedPrice <= 0 || discountedPrice >= price) return null;
  return discountedPrice;
}

export async function createBook(formData: FormData) {
  await requireAdmin();

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const purchaseUrl = String(formData.get("purchaseUrl") ?? "").trim();
  const priceRaw = String(formData.get("price") ?? "").trim();
  const price = parseMoney(priceRaw);
  const discountedPriceRaw = String(
    formData.get("discountedPrice") ?? "",
  ).trim();
  const discountedPrice = normalizeDiscount(
    price,
    parseMoney(discountedPriceRaw),
  );
  const shippingCharge =
    parseMoney(String(formData.get("shippingCharge") ?? "").trim(), 40) ?? 40;
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
      price,
      discountedPrice,
      shippingCharge,
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
  const priceRaw = String(formData.get("price") ?? "").trim();
  const price = parseMoney(priceRaw);
  const discountedPriceRaw = String(
    formData.get("discountedPrice") ?? "",
  ).trim();
  const discountedPrice = normalizeDiscount(
    price,
    parseMoney(discountedPriceRaw),
  );
  const shippingCharge =
    parseMoney(String(formData.get("shippingCharge") ?? "").trim(), 40) ?? 40;
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
    price,
    discountedPrice,
    shippingCharge,
    purchaseUrl: purchaseUrl || null,
    status: status as "COMING_SOON" | "AVAILABLE" | "ARCHIVED",
    publishedAt:
      status === "AVAILABLE" && !existing.publishedAt
        ? new Date()
        : existing.publishedAt,
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
    const featuredCount = await prisma.book.count({
      where: { featured: true },
    });
    if (featuredCount >= 3) {
      throw new Error(
        "You can only have up to 3 featured books. Unfeature one first.",
      );
    }
  }

  await prisma.book.update({
    where: { id },
    data: { featured: !book.featured },
  });

  revalidatePath("/books");
  revalidatePath("/admin");
}

// ─── Orders ──────────────────────────────────────────────────

export async function updateOrderStatus(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();

  if (!id || !status) throw new Error("Order ID and status are required.");

  const validStatuses = [
    "PENDING",
    "CONFIRMED",
    "SHIPPED",
    "DELIVERED",
    "REJECTED",
  ];
  if (!validStatuses.includes(status)) throw new Error("Invalid status.");

  const prisma = getPrisma();
  await prisma.bookOrder.update({
    where: { id },
    data: {
      status: status as
        "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "REJECTED",
    },
  });

  revalidatePath("/admin/orders");
}
