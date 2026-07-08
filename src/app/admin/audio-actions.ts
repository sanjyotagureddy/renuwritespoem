"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { put, del } from "@vercel/blob";
import { getPrisma } from "@/lib/db";
import { requireAdmin } from "./shared-actions";
import { slugify } from "@/lib/utils";

export async function createAudio(formData: FormData) {
  await requireAdmin();

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const audioFile = formData.get("audioFile") as File;
  const coverFile = formData.get("coverFile") as File;
  const publishNow = formData.get("publishNow") === "on";

  if (!title) {
    throw new Error("Title is required.");
  }
  if (!audioFile || audioFile.size === 0) {
    throw new Error("Audio file is required.");
  }
  if (audioFile.size > 15 * 1024 * 1024) {
    throw new Error("Audio file size must not exceed 15MB.");
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error(
      "Missing BLOB_READ_WRITE_TOKEN in environment variables. Please configure it in your Vercel Dashboard or .env.local file to enable audio uploads."
    );
  }

  let audioUrl = "";
  let coverUrl = null;

  try {
    const audioBlob = await put(`audio/audio-${Date.now()}-${audioFile.name}`, audioFile, {
      access: "public",
    });
    audioUrl = audioBlob.url;

    if (coverFile && coverFile.size > 0) {
      const coverBlob = await put(`audio/cover-${Date.now()}-${coverFile.name}`, coverFile, {
        access: "public",
      });
      coverUrl = coverBlob.url;
    }
  } catch (error) {
    console.error("Vercel Blob upload failed:", error);
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to upload media files: ${message}`);
  }

  const baseSlug = slugify(title);
  const randomSuffix = Math.random().toString(36).slice(2, 7);
  const slug = `${baseSlug}-${randomSuffix}`;

  const prisma = getPrisma();
  await prisma.audio.create({
    data: {
      title,
      slug,
      description: description || null,
      audioUrl,
      coverUrl,
      published: publishNow,
      publishedAt: publishNow ? new Date() : null,
    },
  });

  revalidatePath("/audio");
  revalidatePath("/admin/audio");
  redirect("/admin/audio");
}

export async function updateAudioStatus(id: string, published: boolean) {
  await requireAdmin();
  const prisma = getPrisma();
  await prisma.audio.update({
    where: { id },
    data: {
      published,
      publishedAt: published ? new Date() : null,
    },
  });
  revalidatePath("/audio");
  revalidatePath("/admin/audio");
}

export async function deleteAudio(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) throw new Error("Audio ID is required.");

  const prisma = getPrisma();
  const existing = await prisma.audio.findUnique({ where: { id } });
  if (!existing) throw new Error("Audio not found.");

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      if (existing.audioUrl) {
        await del(existing.audioUrl);
      }
      if (existing.coverUrl) {
        await del(existing.coverUrl);
      }
    } catch (err) {
      console.error("Failed to delete Vercel Blob files:", err);
    }
  }

  await prisma.audio.delete({ where: { id } });

  revalidatePath("/audio");
  revalidatePath("/admin/audio");
}

export async function updateAudio(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const audioFile = formData.get("audioFile") as File | null;
  const coverFile = formData.get("coverFile") as File | null;
  const publishNow = formData.get("publishNow") === "on";

  if (!id) throw new Error("Audio ID is required.");
  if (!title) throw new Error("Title is required.");

  const prisma = getPrisma();
  const existing = await prisma.audio.findUnique({ where: { id } });
  if (!existing) throw new Error("Audio not found.");

  let audioUrl = existing.audioUrl;
  let coverUrl = existing.coverUrl;

  if (audioFile && audioFile.size > 0) {
    if (audioFile.size > 15 * 1024 * 1024) {
      throw new Error("Audio file size must not exceed 15MB.");
    }
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      throw new Error("Missing BLOB_READ_WRITE_TOKEN in environment variables.");
    }
    try {
      if (existing.audioUrl) {
        await del(existing.audioUrl).catch((err) => console.error("Failed to delete old audio file:", err));
      }
      const audioBlob = await put(`audio/audio-${Date.now()}-${audioFile.name}`, audioFile, {
        access: "public",
      });
      audioUrl = audioBlob.url;
    } catch (error) {
      console.error("Vercel Blob audio upload failed:", error);
      throw new Error("Failed to upload new audio file.");
    }
  }

  if (coverFile && coverFile.size > 0) {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      throw new Error("Missing BLOB_READ_WRITE_TOKEN in environment variables.");
    }
    try {
      if (existing.coverUrl) {
        await del(existing.coverUrl).catch((err) => console.error("Failed to delete old cover file:", err));
      }
      const coverBlob = await put(`audio/cover-${Date.now()}-${coverFile.name}`, coverFile, {
        access: "public",
      });
      coverUrl = coverBlob.url;
    } catch (error) {
      console.error("Vercel Blob cover upload failed:", error);
      throw new Error("Failed to upload new cover file.");
    }
  }

  await prisma.audio.update({
    where: { id },
    data: {
      title,
      description: description || null,
      audioUrl,
      coverUrl,
      published: publishNow,
      publishedAt: publishNow && !existing.publishedAt ? new Date() : existing.publishedAt,
    },
  });

  revalidatePath("/audio");
  revalidatePath("/admin/audio");
  redirect("/admin/audio");
}
