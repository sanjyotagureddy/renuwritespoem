"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getPrisma } from "@/lib/db";
import type { PoemLanguage } from "@/lib/poem-language";
import { invalidateCache } from "@/lib/cache";
import { requireAdmin } from "./shared-actions";
import { slugify } from "@/lib/utils";
import { siteConfig } from "@/lib/seo";
import { createCampaign, sendCampaignAction } from "./campaign-actions";

async function triggerPoemNotification(title: string, slug: string, excerpt: string) {
  try {
    const campaign = await createCampaign({
      subject: `New Poem: "${title}"`,
      body: `Renu has published a new poem: **${title}**.\n\n${excerpt || "Read the moving new verses on Renu Writes Poem."}\n\n[Read Poem](${siteConfig.url}/poems/${slug})`,
    });
    await sendCampaignAction(campaign.id);
  } catch (error) {
    console.error("Failed to trigger poem notification campaign:", error);
  }
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

export async function createPoem(formData: FormData) {
  await requireAdmin();

  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const language = String(formData.get("language") ?? "EN") as PoemLanguage;
  const genreId = String(formData.get("genreId") ?? "").trim();
  const font = String(formData.get("font") ?? "").trim() || null;
  const publishNow = formData.get("publishNow") === "on";
  const notifySubscribers = formData.get("notifySubscribers") === "on";
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
      font,
    },
  });

  await invalidateCache("home:featured-data");

  if (publishNow && notifySubscribers) {
    await triggerPoemNotification(title, slug, content.slice(0, 180));
  }

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
  const publishNow = formData.get("publishNow") === "on";
  const notifySubscribers = formData.get("notifySubscribers") === "on";
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
      font,
      tags: {
        deleteMany: {},
        create: createTagRelations(tags),
      },
    },
  });

  await invalidateCache(["home:featured-data", `poem:details:${existing.slug}`]);

  if (publishNow && !existing.published && notifySubscribers) {
    await triggerPoemNotification(title, existing.slug, content.slice(0, 180));
  }

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
  const existing = await prisma.poem.findUnique({ where: { id } });
  if (existing) {
    await prisma.poem.delete({ where: { id } });
    await invalidateCache(["home:featured-data", `poem:details:${existing.slug}`]);
  }

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

  await invalidateCache(["home:featured-data", `poem:details:${poem.slug}`]);

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

  await invalidateCache(["home:featured-data", `poem:details:${poem.slug}`]);

  revalidatePath("/poems");
  revalidatePath("/");
  revalidatePath("/admin");
}
