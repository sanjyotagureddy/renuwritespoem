"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/lib/auth";
import { getPrisma } from "@/lib/db";
import { sendOrderStatusUpdate } from "@/lib/email";
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
  revalidatePath("/");
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
  revalidatePath("/");
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
  revalidatePath("/");
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
  revalidatePath("/");
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
  revalidatePath("/");
  revalidatePath("/admin");
}

// ─── Genres ──────────────────────────────────────────────────

export async function createGenre(formData: FormData) {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!name) throw new Error("Genre name is required.");
  if (name.length > 80 || description.length > 500) {
    throw new Error("Genre name or description is too long.");
  }

  const prisma = getPrisma();
  const baseSlug = slugify(name);
  const existing = await prisma.genre.findUnique({ where: { slug: baseSlug } });
  const slug = existing
    ? `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`
    : baseSlug;

  await prisma.genre.create({
    data: {
      name,
      slug,
      description: description || null,
    },
  });

  revalidatePath("/genres");
  revalidatePath("/poems");
  revalidatePath("/admin");
  revalidatePath("/admin/genres");
}

export async function updateGenre(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!id || !name) throw new Error("Genre ID and name are required.");
  if (name.length > 80 || description.length > 500) {
    throw new Error("Genre name or description is too long.");
  }

  const prisma = getPrisma();
  const existing = await prisma.genre.findUnique({ where: { id } });
  if (!existing) throw new Error("Genre not found.");

  const nextBaseSlug = slugify(name);
  const slugOwner = await prisma.genre.findUnique({
    where: { slug: nextBaseSlug },
  });
  const nextSlug =
    slugOwner && slugOwner.id !== id
      ? `${nextBaseSlug}-${Math.random().toString(36).slice(2, 6)}`
      : nextBaseSlug;

  await prisma.genre.update({
    where: { id },
    data: {
      name,
      slug: nextSlug,
      description: description || null,
    },
  });

  revalidatePath("/genres");
  revalidatePath("/poems");
  revalidatePath("/admin");
  revalidatePath("/admin/genres");
}

export async function deleteGenre(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  if (!id) throw new Error("Genre ID is required.");

  const prisma = getPrisma();
  await prisma.genre.delete({ where: { id } });

  revalidatePath("/genres");
  revalidatePath("/poems");
  revalidatePath("/admin");
  revalidatePath("/admin/genres");
}

// ─── Books ───────────────────────────────────────────────────

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
const VALID_BOOK_STATUSES = ["COMING_SOON", "AVAILABLE", "ARCHIVED"] as const;
type ValidBookStatus = (typeof VALID_BOOK_STATUSES)[number];

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

function assertBookCanBeAvailable({
  title,
  price,
  hasCover,
}: {
  title: string;
  price: number | null;
  hasCover: boolean;
}) {
  const missing: string[] = [];

  if (!title.trim()) missing.push("title");
  if (price == null || price <= 0) missing.push("price");
  if (!hasCover) missing.push("cover image");

  if (missing.length > 0) {
    throw new Error(
      `Before marking a book available, add ${missing.join(", ")}.`,
    );
  }
}

function assertValidBookStatus(status: string): asserts status is ValidBookStatus {
  if (!VALID_BOOK_STATUSES.includes(status as ValidBookStatus)) {
    throw new Error("Invalid book status.");
  }
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
  assertValidBookStatus(status);

  let coverData: string | null = null;
  let coverMime: string | null = null;
  if (coverFile && coverFile.size > 0) {
    const result = await processBookCover(coverFile);
    coverData = result.data;
    coverMime = result.mime;
  }

  if (status === "AVAILABLE") {
    assertBookCanBeAvailable({
      title,
      price,
      hasCover: Boolean(coverData),
    });
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
      status,
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
  revalidatePath("/");
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
  assertValidBookStatus(status);

  const prisma = getPrisma();
  const existing = await prisma.book.findUnique({
    where: { id },
    select: {
      id: true,
      slug: true,
      coverData: true,
      coverImage: true,
      publishedAt: true,
    },
  });
  if (!existing) throw new Error("Book not found.");

  const updateData: Record<string, unknown> = {
    title,
    description: description || null,
    price,
    discountedPrice,
    shippingCharge,
    purchaseUrl: purchaseUrl || null,
    status,
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

  if (status === "AVAILABLE") {
    assertBookCanBeAvailable({
      title,
      price,
      hasCover:
        Boolean(coverFile?.size) ||
        Boolean(existing.coverData) ||
        Boolean(existing.coverImage),
    });
  }

  await prisma.book.update({
    where: { id },
    data: updateData,
  });

  revalidatePath("/books");
  revalidatePath(`/books/${existing.slug}`);
  revalidatePath("/");
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
  revalidatePath("/");
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
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function updateBookStatus(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();

  if (!id || !status) throw new Error("Book ID and status are required.");

  assertValidBookStatus(status);

  const prisma = getPrisma();
  const book = await prisma.book.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      slug: true,
      price: true,
      coverData: true,
      coverImage: true,
      publishedAt: true,
    },
  });
  if (!book) throw new Error("Book not found.");

  if (status === "AVAILABLE") {
    assertBookCanBeAvailable({
      title: book.title,
      price: book.price == null ? null : Number(book.price),
      hasCover: Boolean(book.coverData) || Boolean(book.coverImage),
    });
  }

  await prisma.book.update({
    where: { id },
    data: {
      status,
      publishedAt:
        status === "AVAILABLE" && !book.publishedAt
          ? new Date()
          : book.publishedAt,
    },
  });

  revalidatePath("/books");
  revalidatePath(`/books/${book.slug}`);
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/books");
}

// ─── Orders ──────────────────────────────────────────────────

export async function updateOrderStatus(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();
  const trackingProvider = String(
    formData.get("trackingProvider") ?? "",
  ).trim();
  const trackingNumber = String(formData.get("trackingNumber") ?? "").trim();
  const trackingUrl = String(formData.get("trackingUrl") ?? "").trim();
  const adminNote = String(formData.get("adminNote") ?? "").trim();

  if (!id || !status) throw new Error("Order ID and status are required.");

  const validStatuses = [
    "PENDING",
    "CONFIRMED",
    "SHIPPED",
    "DELIVERED",
    "REJECTED",
  ];
  if (!validStatuses.includes(status)) throw new Error("Invalid status.");
  if (
    trackingProvider.length > 100 ||
    trackingNumber.length > 150 ||
    trackingUrl.length > 500 ||
    adminNote.length > 1000
  ) {
    throw new Error("One or more order update fields are too long.");
  }
  if (trackingUrl && !/^https?:\/\//i.test(trackingUrl)) {
    throw new Error("Tracking URL must start with http:// or https://.");
  }
  if (status === "SHIPPED" && (!trackingProvider || !trackingNumber)) {
    throw new Error(
      "Delivery provider and tracking number are required when shipping an order.",
    );
  }

  const prisma = getPrisma();
  const existing = await prisma.bookOrder.findUnique({
    where: { id },
    include: { book: { select: { title: true } } },
  });
  if (!existing) throw new Error("Order not found.");
  if (
    status === "SHIPPED" &&
    existing.status !== "CONFIRMED" &&
    existing.status !== "SHIPPED"
  ) {
    throw new Error("Confirm payment before marking an order as shipped.");
  }
  if (
    status === "DELIVERED" &&
    existing.status !== "SHIPPED" &&
    existing.status !== "DELIVERED"
  ) {
    throw new Error("An order must be shipped before it can be delivered.");
  }

  const updated = await prisma.bookOrder.update({
    where: { id },
    data: {
      status: status as
        "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "REJECTED",
      adminNote: adminNote || null,
      trackingProvider: trackingProvider || null,
      trackingNumber: trackingNumber || null,
      trackingUrl: trackingUrl || null,
    },
  });

  if (existing.status !== updated.status && updated.status !== "PENDING") {
    try {
      await sendOrderStatusUpdate({
        buyerEmail: updated.email,
        buyerName: updated.name,
        bookTitle: existing.book.title,
        orderId: updated.orderNumber ?? updated.id,
        status: updated.status,
        trackingProvider: updated.trackingProvider,
        trackingNumber: updated.trackingNumber,
        trackingUrl: updated.trackingUrl,
        note: updated.adminNote,
      });
    } catch (error) {
      console.error("Order status email failed:", error);
    }
  }

  revalidatePath("/admin/orders");
}
