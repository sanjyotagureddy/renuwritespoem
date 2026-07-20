"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { PoemLanguage } from "@/lib/domain/poem-language";
import { requireAdmin } from "./shared-actions";
import { PoemService } from "@/services/poem-service";

export async function createPoem(formData: FormData) {
  await requireAdmin();

  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const language = String(formData.get("language") ?? "EN") as PoemLanguage;
  const genreId = String(formData.get("genreId") ?? "").trim();
  const font = String(formData.get("font") ?? "").trim() || null;
  const seoTitle = String(formData.get("seoTitle") ?? "").trim() || null;
  const seoDescription = String(formData.get("seoDescription") ?? "").trim() || null;
  const publishNow = formData.get("publishNow") === "on";
  const notifySubscribers = formData.get("notifySubscribers") === "on";
  
  const tagsString = String(formData.get("tags") ?? "");
  const tags = tagsString ? tagsString.split(",") : [];

  await PoemService.createPoem({
    title,
    content,
    language,
    genreId,
    font,
    seoTitle,
    seoDescription,
    publishNow,
    notifySubscribers,
    tags,
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
  const font = String(formData.get("font") ?? "").trim() || null;
  const seoTitle = String(formData.get("seoTitle") ?? "").trim() || null;
  const seoDescription = String(formData.get("seoDescription") ?? "").trim() || null;
  const publishNow = formData.get("publishNow") === "on";
  const notifySubscribers = formData.get("notifySubscribers") === "on";
  
  const tagsString = String(formData.get("tags") ?? "");
  const tags = tagsString ? tagsString.split(",") : [];

  const poem = await PoemService.updatePoem({
    id,
    title,
    content,
    language,
    genreId,
    font,
    seoTitle,
    seoDescription,
    publishNow,
    notifySubscribers,
    tags,
  });

  revalidatePath("/poems");
  revalidatePath(`/poems/${poem.slug}`);
  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin/poems");
}

export async function deletePoem(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  await PoemService.deletePoem(id);

  revalidatePath("/poems");
  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin/poems");
}

export async function togglePublish(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  const poem = await PoemService.togglePublish(id);

  revalidatePath("/poems");
  revalidatePath(`/poems/${poem.slug}`);
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function toggleFeatured(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  const poem = await PoemService.toggleFeatured(id);

  revalidatePath("/poems");
  revalidatePath("/");
  revalidatePath("/admin");
}
