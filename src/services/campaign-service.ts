import { getPrisma } from "@/lib/db";
import { sendCampaignEmail } from "@/lib/email";
import { siteConfig } from "@/lib/seo";

export interface CampaignData {
  subject: string;
  body: string;
}

export class CampaignService {
  /**
   * Helper to inject open tracking pixel and rewrite anchor tags with click tracking
   */
  static async injectTracking(html: string, deliveryId: string): Promise<string> {
    const pixelUrl = `${siteConfig.url}/api/campaigns/track/open/${deliveryId}/pixel.gif`;
    const pixelImg = `<img src="${pixelUrl}" alt="" width="1" height="1" style="display:none;" />`;
    let trackedHtml = html + pixelImg;

    const urlRegex = /href="((https?:\/\/[^"]+))"/gi;
    trackedHtml = trackedHtml.replace(urlRegex, (match, url) => {
      if (
        url.includes("/unsubscribe") ||
        url.includes("/subscribe/preferences") ||
        url.startsWith("mailto:") ||
        url.startsWith("tel:")
      ) {
        return match;
      }
      const trackingUrl = `${siteConfig.url}/api/campaigns/track/click?d=${deliveryId}&url=${encodeURIComponent(url)}`;
      return `href="${trackingUrl}"`;
    });

    return trackedHtml;
  }

  /**
   * Converts Markdown to HTML with special template placeholders
   */
  static async parseMarkdownToHtml(markdown: string): Promise<string> {
    let html = markdown;

    // Escape basic HTML tags to prevent cross-site scripting
    html = html
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Bold (**text**)
    html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    // Italics (*text*)
    html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");

    // Images (![alt](url))
    html = html.replace(
      /!\[(.*?)\]\((https?:\/\/.*?)\)/g,
      '<img src="$2" alt="$1" style="max-width:100%; height:auto; border-radius:8px; margin:12px 0; display:block;" />'
    );

    // Links ([label](url))
    html = html.replace(
      /\[(.*?)\]\((https?:\/\/.*?)\)/g,
      '<a href="$2" style="color:#9a3412; font-weight:bold; text-decoration:underline;" target="_blank" rel="noopener noreferrer">$1</a>'
    );

    // Paragraphs (split by double newlines)
    const paragraphs = html.split(/\r?\n\r?\n/);
    let formatted = paragraphs
      .map((p) => {
        const trimmed = p.trim();
        if (!trimmed) return "";
        const withLineBreaks = trimmed.replace(/\r?\n/g, "<br />");
        return `<p style="margin:0 0 16px; line-height:1.7; color:#374151;">${withLineBreaks}</p>`;
      })
      .filter(Boolean)
      .join("");

    // Scan for template placeholders
    const poemMatches = [...formatted.matchAll(/\[\[POEM:(.*?)\]\]/g)].map((m) => m[1]);
    const bookMatches = [...formatted.matchAll(/\[\[BOOK:(.*?)\]\]/g)].map((m) => m[1]);
    const audioMatches = [...formatted.matchAll(/\[\[AUDIO:(.*?)\]\]/g)].map((m) => m[1]);

    const prisma = getPrisma();

    function absoluteCoverUrl(url: string | null | undefined): string {
      if (!url) return "";
      if (url.startsWith("http")) return url;
      return `${siteConfig.url}${url.startsWith("/") ? url : `/${url}`}`;
    }

    if (poemMatches.length > 0) {
      const poems = await prisma.poem.findMany({ where: { id: { in: poemMatches } } });
      for (const poem of poems) {
        const poemCover = absoluteCoverUrl(poem.coverImage);
        const coverBlock = poemCover
          ? `<img src="${poemCover}" alt="${poem.title}" style="max-width:100%; height:auto; border-radius:8px; margin-bottom:12px; display:block; max-height:200px; object-fit:cover;" />`
          : "";
        const card = `
          <table style="width:100%; border:1px solid #f3e8df; border-radius:12px; background-color:#fff7ed; padding:16px; margin:20px 0; border-spacing:0; border-collapse:collapse; text-align:left;">
            <tr>
              <td style="padding:4px 0;">
                ${coverBlock}
                <span style="display:inline-block; font-size:10px; font-weight:bold; color:#9a3412; letter-spacing:0.05em; text-transform:uppercase; margin-bottom:4px;">Featured Poem</span>
                <h3 style="margin:0 0 8px; color:#431407; font-family:serif; font-size:17px; font-weight:bold; line-height:1.3;">${poem.title}</h3>
                <p style="margin:0 0 12px; font-size:13px; color:#4b5563; line-height:1.6; font-style:italic;">"${poem.excerpt || "Read this moving poem..."}"</p>
                <a href="${siteConfig.url}/poems/${poem.slug}" style="display:inline-block; padding:8px 16px; background-color:#9a3412; color:#ffffff !important; text-decoration:none; border-radius:6px; font-size:11px; font-weight:bold; letter-spacing:0.02em;">Read Poem &rarr;</a>
              </td>
            </tr>
          </table>
        `;
        formatted = formatted.split(`[[POEM:${poem.id}]]`).join(card);
      }
    }

    if (bookMatches.length > 0) {
      const books = await prisma.book.findMany({ where: { id: { in: bookMatches } } });
      for (const book of books) {
        const cover = absoluteCoverUrl(book.coverImage) || `${siteConfig.url}/placeholder-book.png`;
        const card = `
          <table style="width:100%; border:1px solid #f3e8df; border-radius:12px; background-color:#fff7ed; padding:16px; margin:20px 0; border-spacing:0; border-collapse:collapse; text-align:left;">
            <tr>
              <td style="width:80px; vertical-align:top; padding-right:16px;">
                <img src="${cover}" alt="${book.title}" style="width:80px; height:auto; border-radius:6px; box-shadow:0 4px 6px rgba(0,0,0,0.05); display:block;" />
              </td>
              <td style="vertical-align:top; padding-top:4px;">
                <span style="display:inline-block; font-size:10px; font-weight:bold; color:#9a3412; letter-spacing:0.05em; text-transform:uppercase; margin-bottom:4px;">Featured Collection</span>
                <h3 style="margin:0 0 8px; color:#431407; font-family:serif; font-size:17px; font-weight:bold; line-height:1.3;">${book.title}</h3>
                <p style="margin:0 0 12px; font-size:13px; color:#4b5563; line-height:1.5;">${book.description || "Explore this newly available collection..."}</p>
                <a href="${siteConfig.url}/books/${book.slug}" style="display:inline-block; padding:8px 16px; background-color:#9a3412; color:#ffffff !important; text-decoration:none; border-radius:6px; font-size:11px; font-weight:bold; letter-spacing:0.02em;">Explore Book &rarr;</a>
              </td>
            </tr>
          </table>
        `;
        formatted = formatted.split(`[[BOOK:${book.id}]]`).join(card);
      }
    }

    if (audioMatches.length > 0) {
      const audios = await prisma.audio.findMany({ where: { id: { in: audioMatches } } });
      for (const audio of audios) {
        const audioCover = absoluteCoverUrl(audio.coverUrl);
        const audioCoverBlock = audioCover
          ? `<img src="${audioCover}" alt="${audio.title}" style="max-width:100%; height:auto; border-radius:8px; margin-bottom:12px; display:block; max-height:200px; object-fit:cover;" />`
          : "";
        const card = `
          <table style="width:100%; border:1px solid #f3e8df; border-radius:12px; background-color:#fff7ed; padding:16px; margin:20px 0; border-spacing:0; border-collapse:collapse; text-align:left;">
            <tr>
              <td style="padding:4px 0;">
                ${audioCoverBlock}
                <span style="display:inline-block; font-size:10px; font-weight:bold; color:#9a3412; letter-spacing:0.05em; text-transform:uppercase; margin-bottom:4px;">Audio Recitation</span>
                <h3 style="margin:0 0 8px; color:#431407; font-family:serif; font-size:17px; font-weight:bold; line-height:1.3;">🔊 ${audio.title}</h3>
                <p style="margin:0 0 12px; font-size:13px; color:#4b5563; line-height:1.5;">${audio.description || "Listen to this beautiful recitation voiced by Renu..."}</p>
                <a href="${siteConfig.url}/audio" style="display:inline-block; padding:8px 16px; background-color:#9a3412; color:#ffffff !important; text-decoration:none; border-radius:6px; font-size:11px; font-weight:bold; letter-spacing:0.02em;">Listen Now &rarr;</a>
              </td>
            </tr>
          </table>
        `;
        formatted = formatted.split(`[[AUDIO:${audio.id}]]`).join(card);
      }
    }

    // Clean up unmatched placeholders
    formatted = formatted.replace(/\[\[(POEM|BOOK|AUDIO):.*?\]\]/g, "");

    return formatted;
  }

  static async createCampaign(data: CampaignData) {
    const prisma = getPrisma();
    return prisma.campaign.create({
      data: {
        subject: data.subject.trim(),
        body: data.body,
        status: "DRAFT",
      },
    });
  }

  static async updateCampaign(
    id: string,
    data: Partial<CampaignData> & { status?: "DRAFT" | "SCHEDULED" | "SENDING" | "SENT" | "FAILED"; scheduledAt?: Date | null }
  ) {
    const prisma = getPrisma();
    return prisma.campaign.update({
      where: { id },
      data: {
        ...(data.subject !== undefined ? { subject: data.subject.trim() } : {}),
        ...(data.body !== undefined ? { body: data.body } : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
        ...(data.scheduledAt !== undefined ? { scheduledAt: data.scheduledAt } : {}),
      },
    });
  }

  static async deleteCampaign(id: string) {
    const prisma = getPrisma();
    await prisma.campaign.delete({ where: { id } });
    return { success: true };
  }

  static async sendTestEmail(campaignId: string, testEmail: string) {
    const prisma = getPrisma();
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) throw new Error("Campaign not found.");

    const bodyHtml = await this.parseMarkdownToHtml(campaign.body);

    const emailSuccess = await sendCampaignEmail({
      recipientEmail: testEmail.trim(),
      recipientName: "Test Recipient",
      subject: `[TEST] ${campaign.subject}`,
      bodyHtml,
    });

    if (!emailSuccess) {
      throw new Error("Failed to send test email. Check server config or SMTP connection.");
    }
    return { success: true };
  }

  static async dispatchCampaign(campaignId: string) {
    const prisma = getPrisma();

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) throw new Error("Campaign not found.");
    if (campaign.status === "SENDING" || campaign.status === "SENT") {
      throw new Error("Campaign is already sending or has been sent.");
    }

    // Query verified subscribers who haven't unsubscribed
    const subscribers = await prisma.subscriber.findMany({
      where: {
        verified: true,
        unsubscribedAt: null,
      },
      select: {
        email: true,
        name: true,
      },
    });

    if (subscribers.length === 0) {
      await prisma.campaign.update({
        where: { id: campaignId },
        data: {
          status: "SENT",
          sentAt: new Date(),
          sentCount: 0,
          failedCount: 0,
        },
      });
      return { success: true, sent: 0, failed: 0 };
    }

    // Set status to SENDING
    await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        status: "SENDING",
      },
    });

    // Load suppression emails
    const unsubscribedRecords = await prisma.unsubscribedEmail.findMany({
      select: { email: true },
    });
    const suppressedEmails = new Set(
      unsubscribedRecords.map((r) => r.email.toLowerCase())
    );

    const bodyHtml = await this.parseMarkdownToHtml(campaign.body);

    let sent = 0;
    let failed = 0;
    const DISPATCH_BATCH_SIZE = 5;

    for (let i = 0; i < subscribers.length; i += DISPATCH_BATCH_SIZE) {
      const chunk = subscribers.slice(i, i + DISPATCH_BATCH_SIZE);

      await Promise.all(
        chunk.map(async (subscriber) => {
          const emailLower = subscriber.email.toLowerCase();
          if (suppressedEmails.has(emailLower)) {
            await prisma.campaignDelivery.create({
              data: {
                campaignId,
                email: subscriber.email,
                status: "FAILED",
                error: "Recipient has unsubscribed (Suppression Check)",
              },
            });
            failed++;
            return;
          }

          // Create initial campaign delivery trace
          const delivery = await prisma.campaignDelivery.create({
            data: {
              campaignId,
              email: subscriber.email,
              status: "SENDING",
            },
          });

          // Personalize body with custom tracking links and pixel injection
          const personalizedBodyHtml = await this.injectTracking(bodyHtml, delivery.id);

          const emailSuccess = await sendCampaignEmail({
            recipientEmail: subscriber.email,
            recipientName: subscriber.name,
            subject: campaign.subject,
            bodyHtml: personalizedBodyHtml,
          });

          if (emailSuccess) {
            await prisma.campaignDelivery.update({
              where: { id: delivery.id },
              data: { status: "SUCCESS" },
            });
            sent++;
          } else {
            await prisma.campaignDelivery.update({
              where: { id: delivery.id },
              data: {
                status: "FAILED",
                error: "SMTP individual delivery rejected or timed out",
              },
            });
            failed++;
          }
        })
      );
    }

    await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        status: "SENT",
        sentAt: new Date(),
        sentCount: sent,
        failedCount: failed,
      },
    });

    return { success: true, sent, failed };
  }
}
