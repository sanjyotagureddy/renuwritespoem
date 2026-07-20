"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "./shared-actions";
import { CampaignService, CampaignData } from "@/services/campaign-service";

export async function createCampaign(data: CampaignData) {
  await requireAdmin();
  const campaign = await CampaignService.createCampaign(data);
  revalidatePath("/admin/campaigns");
  return campaign;
}

export async function updateCampaign(
  id: string,
  data: Partial<CampaignData> & { status?: "DRAFT" | "SCHEDULED" | "SENDING" | "SENT" | "FAILED"; scheduledAt?: Date | null }
) {
  await requireAdmin();
  const campaign = await CampaignService.updateCampaign(id, data);
  revalidatePath("/admin/campaigns");
  return campaign;
}

export async function deleteCampaign(id: string) {
  await requireAdmin();
  await CampaignService.deleteCampaign(id);
  revalidatePath("/admin/campaigns");
  return { success: true };
}

export async function sendTestEmailAction(campaignId: string, testEmail: string) {
  await requireAdmin();
  return CampaignService.sendTestEmail(campaignId, testEmail);
}

export async function sendCampaignAction(campaignId: string) {
  await requireAdmin();
  const result = await CampaignService.dispatchCampaign(campaignId);
  revalidatePath("/admin/campaigns");
  return result;
}
