"use server";

import { revalidatePath } from "next/cache";
import { getPrisma } from "@/lib/db";
import { requireAdmin } from "./shared-actions";
import { slugify } from "@/lib/utils";

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
