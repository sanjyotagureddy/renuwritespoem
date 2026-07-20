"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { put, del } from "@vercel/blob";
import { getPrisma } from "@/lib/db";
import { invalidateCache } from "@/lib/db/cache";
import { requireAdmin } from "./shared-actions";
import { slugify } from "@/lib/utils";
import { DeleteBookSchema, ToggleBookFeaturedSchema, UpdateBookStatusSchema } from "@/lib/validations";
import { siteConfig } from "@/lib/seo";
import { createCampaign, sendCampaignAction } from "./campaign-actions";

async function triggerBookNotification(id: string, title: string, slug: string, description: string | null) {
  try {
    const campaign = await createCampaign({
      subject: `New Book Available: "${title}"`,
      body: `Renu has released a new book: **${title}**.\n\n${description || "Browse the new poetry book collection."}\n\n[[BOOK:${id}]]\n\n[Explore Book](${siteConfig.url}/books/${slug})`,
    });
    await sendCampaignAction(campaign.id);
  } catch (error) {
    console.error("Failed to trigger book notification campaign:", error);
  }
}

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
  const notifySubscribers = formData.get("notifySubscribers") === "on";
  const seoTitle = String(formData.get("seoTitle") ?? "").trim() || null;
  const seoDescription = String(formData.get("seoDescription") ?? "").trim() || null;
  const coverFile = formData.get("coverImage") as File | null;

  if (!title) throw new Error("Title is required.");
  assertValidBookStatus(status);

  let coverData: string | null = null;
  let coverMime: string | null = null;
  let coverImage: string | null = null;

  if (coverFile && coverFile.size > 0) {
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const coverBlob = await put(`books/cover-${Date.now()}-${coverFile.name}`, coverFile, {
          access: "public",
        });
        coverImage = coverBlob.url;
      } catch (err) {
        console.error("Vercel Blob book cover upload failed, falling back to base64 DB:", err);
        const result = await processBookCover(coverFile);
        coverData = result.data;
        coverMime = result.mime;
      }
    } else {
      const result = await processBookCover(coverFile);
      coverData = result.data;
      coverMime = result.mime;
    }
  }

  if (status === "AVAILABLE") {
    assertBookCanBeAvailable({
      title,
      price,
      hasCover: Boolean(coverData) || Boolean(coverImage),
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
      seoTitle,
      seoDescription,
      coverData,
      coverMime,
      coverImage,
      price,
      discountedPrice,
      shippingCharge,
      purchaseUrl: purchaseUrl || null,
      status,
      publishedAt: status === "AVAILABLE" ? new Date() : null,
    },
  });

  // Set coverImage to the API route only if we used the database base64 fallback
  if (coverData) {
    await prisma.book.update({
      where: { id: book.id },
      data: { coverImage: `/api/book-covers/${book.id}` },
    });
  }

  await invalidateCache("home:featured-data");

  if (status === "AVAILABLE" && notifySubscribers) {
    await triggerBookNotification(book.id, title, slug, description);
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
  const notifySubscribers = formData.get("notifySubscribers") === "on";
  const seoTitle = String(formData.get("seoTitle") ?? "").trim() || null;
  const seoDescription = String(formData.get("seoDescription") ?? "").trim() || null;
  const coverFile = formData.get("coverImage") as File | null;

  if (!id || !title) throw new Error("ID and title are required.");
  assertValidBookStatus(status);

  const prisma = getPrisma();
  const existing = await prisma.book.findUnique({
    where: { id },
    select: {
      id: true,
      slug: true,
      status: true,
      coverData: true,
      coverImage: true,
      publishedAt: true,
    },
  });
  if (!existing) throw new Error("Book not found.");

  const updateData: Record<string, unknown> = {
    title,
    description: description || null,
    seoTitle,
    seoDescription,
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
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        if (existing.coverImage && existing.coverImage.startsWith("http")) {
          try {
            await del(existing.coverImage);
          } catch (e) {
            console.error("Failed to delete old book cover from Vercel Blob:", e);
          }
        }
        const coverBlob = await put(`books/cover-${Date.now()}-${coverFile.name}`, coverFile, {
          access: "public",
        });
        updateData.coverImage = coverBlob.url;
        updateData.coverData = null;
        updateData.coverMime = null;
      } catch (err) {
        console.error("Vercel Blob cover update failed, falling back to base64 DB:", err);
        const result = await processBookCover(coverFile);
        updateData.coverData = result.data;
        updateData.coverMime = result.mime;
        updateData.coverImage = `/api/book-covers/${id}`;
      }
    } else {
      const result = await processBookCover(coverFile);
      updateData.coverData = result.data;
      updateData.coverMime = result.mime;
      updateData.coverImage = `/api/book-covers/${id}`;
    }
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

  await invalidateCache(["home:featured-data", `book:details:${existing.slug}`]);

  if (status === "AVAILABLE" && existing.status !== "AVAILABLE" && notifySubscribers) {
    await triggerBookNotification(id, title, existing.slug, description);
  }

  revalidatePath("/books");
  revalidatePath(`/books/${existing.slug}`);
  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin/books");
}

export async function deleteBook(formData: FormData) {
  await requireAdmin();

  const parsed = DeleteBookSchema.safeParse(formData);
  if (!parsed.success) throw new Error("Book ID is required.");
  const { id } = parsed.data;

  const prisma = getPrisma();
  const existing = await prisma.book.findUnique({
    where: { id },
    select: { id: true, slug: true, coverImage: true },
  });
  if (existing) {
    if (existing.coverImage && existing.coverImage.startsWith("http") && process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        await del(existing.coverImage);
      } catch (e) {
        console.error("Failed to delete book cover from Vercel Blob:", e);
      }
    }
    await prisma.book.delete({ where: { id } });
    await invalidateCache(["home:featured-data", `book:details:${existing.slug}`]);
  }

  revalidatePath("/books");
  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin/books");
}

export async function toggleBookFeatured(formData: FormData) {
  await requireAdmin();

  const parsed = ToggleBookFeaturedSchema.safeParse(formData);
  if (!parsed.success) throw new Error("Invalid request");
  const { id } = parsed.data;

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

  await invalidateCache(["home:featured-data", `book:details:${book.slug}`]);

  revalidatePath("/books");
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function updateBookStatus(formData: FormData) {
  await requireAdmin();

  const parsed = UpdateBookStatusSchema.safeParse(formData);
  if (!parsed.success) throw new Error("Invalid request");
  const { id, status } = parsed.data;

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

  await invalidateCache(["home:featured-data", `book:details:${book.slug}`]);

  revalidatePath("/books");
  revalidatePath(`/books/${book.slug}`);
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/books");
}
