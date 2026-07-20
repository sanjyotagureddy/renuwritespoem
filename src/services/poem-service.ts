import { getPrisma } from "@/lib/db";
import { invalidateCache } from "@/lib/db/cache";
import { slugify } from "@/lib/utils";
import type { PoemLanguage } from "@/lib/domain/poem-language";
import { CampaignService } from "./campaign-service";
import { siteConfig } from "@/lib/seo";

export interface CreatePoemDTO {
  title: string;
  content: string;
  language: PoemLanguage;
  genreId: string | null;
  font: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  publishNow: boolean;
  notifySubscribers: boolean;
  tags: string[];
}

export interface UpdatePoemDTO extends CreatePoemDTO {
  id: string;
}

export class PoemService {
  /**
   * Helper to notify subscribers when a new poem is published
   */
  static async triggerPoemNotification(id: string, title: string, slug: string, excerpt: string) {
    try {
      const campaign = await CampaignService.createCampaign({
        subject: `New Poem: "${title}"`,
        body: `Renu has published a new poem: **${title}**.\n\n${excerpt || "Read the moving new verses on Renu Writes Poem."}\n\n[[POEM:${id}]]\n\n[Read Poem](${siteConfig.url}/poems/${slug})`,
      });
      await CampaignService.dispatchCampaign(campaign.id);
    } catch (error) {
      console.error("Failed to trigger poem notification campaign:", error);
    }
  }

  /**
   * Parses and normalizes tags
   */
  static parseTags(tagsList: string[]): Array<{ name: string; slug: string }> {
    const names = tagsList
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

  static createTagRelations(tags: Array<{ name: string; slug: string }>) {
    return tags.map((tag) => ({
      tag: {
        connectOrCreate: {
          where: { slug: tag.slug },
          create: tag,
        },
      },
    }));
  }

  static async createPoem(dto: CreatePoemDTO) {
    if (!dto.title || !dto.content) {
      throw new Error("Title and content are required.");
    }

    const baseSlug = slugify(dto.title);
    const randomSuffix = Math.random().toString(36).slice(2, 7);
    const slug = `${baseSlug}-${randomSuffix}`;
    const parsedTags = this.parseTags(dto.tags);

    const prisma = getPrisma();
    const poem = await prisma.poem.create({
      data: {
        title: dto.title,
        slug,
        content: dto.content,
        excerpt: dto.content.length > 180 ? dto.content.slice(0, 180) : null,
        language: dto.language,
        genreId: dto.genreId || null,
        seoTitle: dto.seoTitle,
        seoDescription: dto.seoDescription,
        published: dto.publishNow,
        publishedAt: dto.publishNow ? new Date() : null,
        tags: { create: this.createTagRelations(parsedTags) },
        font: dto.font,
      },
    });

    await invalidateCache("home:featured-data");

    if (dto.publishNow && dto.notifySubscribers) {
      await this.triggerPoemNotification(
        poem.id,
        dto.title,
        slug,
        dto.content.slice(0, 180)
      );
    }

    return poem;
  }

  static async updatePoem(dto: UpdatePoemDTO) {
    if (!dto.id || !dto.title || !dto.content) {
      throw new Error("ID, title, and content are required.");
    }

    const prisma = getPrisma();
    const existing = await prisma.poem.findUnique({ where: { id: dto.id } });
    if (!existing) throw new Error("Poem not found.");

    const parsedTags = this.parseTags(dto.tags);

    const poem = await prisma.poem.update({
      where: { id: dto.id },
      data: {
        title: dto.title,
        content: dto.content,
        excerpt: dto.content.length > 180 ? dto.content.slice(0, 180) : null,
        language: dto.language,
        genreId: dto.genreId || null,
        seoTitle: dto.seoTitle,
        seoDescription: dto.seoDescription,
        published: dto.publishNow,
        publishedAt:
          dto.publishNow && !existing.publishedAt ? new Date() : existing.publishedAt,
        font: dto.font,
        tags: {
          deleteMany: {},
          create: this.createTagRelations(parsedTags),
        },
      },
    });

    await invalidateCache(["home:featured-data", `poem:details:${existing.slug}`]);

    if (dto.publishNow && !existing.published && dto.notifySubscribers) {
      await this.triggerPoemNotification(
        existing.id,
        dto.title,
        existing.slug,
        dto.content.slice(0, 180)
      );
    }

    return poem;
  }

  static async deletePoem(id: string) {
    if (!id) throw new Error("Poem ID is required.");

    const prisma = getPrisma();
    const existing = await prisma.poem.findUnique({ where: { id } });
    if (existing) {
      await prisma.poem.delete({ where: { id } });
      await invalidateCache(["home:featured-data", `poem:details:${existing.slug}`]);
    }
  }

  static async togglePublish(id: string) {
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
    return { ...poem, published: newPublished };
  }

  static async toggleFeatured(id: string) {
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
    return { ...poem, featured: !poem.featured };
  }
}
