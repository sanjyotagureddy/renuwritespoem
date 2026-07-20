"use server";

import { revalidatePath } from "next/cache";
import { put, del } from "@vercel/blob";
import { getPrisma } from "@/lib/db";
import { requireAdmin } from "./shared-actions";

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB

export async function getOrCreateAuthorProfile() {
  const prisma = getPrisma();
  let profile = await prisma.authorProfile.findFirst({
    include: {
      gallery: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!profile) {
    // Seed default if empty
    profile = await prisma.authorProfile.create({
      data: {
        whyIWrite: "I write because words are the closest thing to magic — they can heal, inspire, and connect hearts across time and distance.",
        writingJourney: "Writing has been a lifelong companion — a way to make sense of the world, to find beauty in the ordinary, and to give voice to feelings that often go unspoken.",
        inspiration: "Themes of love, nature, life, and spirituality flow through my verses.",
        awards: "",
        publications: "",
        interviews: "",
        behindTheScenes: "",
        writingDesk: "",
      },
      include: {
        gallery: {
          orderBy: { order: "asc" },
        },
      },
    });
  }

  return profile;
}

export async function updateAuthorProfile(formData: FormData) {
  await requireAdmin();
  const prisma = getPrisma();

  const whyIWrite = String(formData.get("whyIWrite") ?? "").trim();
  const writingJourney = String(formData.get("writingJourney") ?? "").trim();
  const inspiration = String(formData.get("inspiration") ?? "").trim();
  const awards = String(formData.get("awards") ?? "").trim();
  const publications = String(formData.get("publications") ?? "").trim();
  const interviews = String(formData.get("interviews") ?? "").trim();
  const behindTheScenes = String(formData.get("behindTheScenes") ?? "").trim();
  const writingDesk = String(formData.get("writingDesk") ?? "").trim();

  const profile = await getOrCreateAuthorProfile();

  const updated = await prisma.authorProfile.update({
    where: { id: profile.id },
    data: {
      whyIWrite,
      writingJourney,
      inspiration,
      awards,
      publications,
      interviews,
      behindTheScenes,
      writingDesk,
    },
  });

  revalidatePath("/about");
  revalidatePath("/gallery");
  revalidatePath("/");
  revalidatePath("/admin/author");
  return updated;
}

export async function addGalleryImage(formData: FormData) {
  await requireAdmin();
  const file = formData.get("file") as File | null;
  const widthRaw = formData.get("width");
  const heightRaw = formData.get("height");
  const caption = String(formData.get("caption") ?? "").trim();
  const categoryRaw = formData.get("category");
  const category = categoryRaw ? String(categoryRaw).trim() : null;

  if (!file || file.size === 0) {
    throw new Error("No file uploaded.");
  }

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error("Only JPG, PNG, and WebP images are allowed.");
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error("Image must be under 5 MB.");
  }

  const width = widthRaw ? parseInt(String(widthRaw), 10) || 0 : 0;
  const height = heightRaw ? parseInt(String(heightRaw), 10) || 0 : 0;

  const profile = await getOrCreateAuthorProfile();
  const prisma = getPrisma();

  const lastImage = await prisma.authorGalleryImage.findFirst({
    where: { profileId: profile.id },
    orderBy: { order: "desc" },
    select: { order: true },
  });
  const nextOrder = (lastImage?.order ?? -1) + 1;

  let url: string | null = null;
  let fileData: string | null = null;
  let fileMime: string | null = null;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const blob = await put(`author/gallery-${Date.now()}-${file.name}`, file, {
        access: "public",
      });
      url = blob.url;
    } catch (err) {
      console.error("Vercel Blob gallery upload failed, falling back to base64 DB:", err);
      const buffer = Buffer.from(await file.arrayBuffer());
      fileData = buffer.toString("base64");
      fileMime = file.type;
    }
  } else {
    const buffer = Buffer.from(await file.arrayBuffer());
    fileData = buffer.toString("base64");
    fileMime = file.type;
  }

  const newImg = await prisma.authorGalleryImage.create({
    data: {
      profileId: profile.id,
      url,
      fileData,
      fileMime,
      width,
      height,
      caption,
      category,
      order: nextOrder,
    },
  });

  revalidatePath("/about");
  revalidatePath("/gallery");
  revalidatePath("/");
  revalidatePath("/admin/author");
  return newImg;
}

export async function deleteGalleryImage(id: string) {
  await requireAdmin();
  const prisma = getPrisma();

  const img = await prisma.authorGalleryImage.findUnique({
    where: { id },
  });

  if (!img) {
    throw new Error("Image not found.");
  }

  if (img.url && process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      await del(img.url);
    } catch (err) {
      console.error("Failed to delete from Vercel Blob:", err);
    }
  }

  await prisma.authorGalleryImage.delete({
    where: { id },
  });

  revalidatePath("/about");
  revalidatePath("/gallery");
  revalidatePath("/");
  revalidatePath("/admin/author");
  return { success: true };
}

export async function updateGalleryOrder(ids: string[]) {
  await requireAdmin();
  const prisma = getPrisma();

  await prisma.$transaction(
    ids.map((id, index) =>
      prisma.authorGalleryImage.update({
        where: { id },
        data: { order: index },
      })
    )
  );

  revalidatePath("/about");
  revalidatePath("/gallery");
  revalidatePath("/");
  revalidatePath("/admin/author");
  return { success: true };
}

export async function updateGalleryImageCategory(id: string, category: string | null) {
  await requireAdmin();
  const prisma = getPrisma();

  const img = await prisma.authorGalleryImage.findUnique({
    where: { id },
  });

  if (!img) {
    throw new Error("Image not found.");
  }

  const updated = await prisma.authorGalleryImage.update({
    where: { id },
    data: { category },
  });

  revalidatePath("/about");
  revalidatePath("/gallery");
  revalidatePath("/");
  revalidatePath("/admin/author");
  return updated;
}
