"use server";

import { revalidatePath } from "next/cache";
import { getPrisma } from "@/lib/db";
import { requireAdmin } from "./shared-actions";

export async function updateCommentStatus(
  id: string,
  commentType: "poem" | "book" | "audio",
  status: "PENDING" | "APPROVED" | "REJECTED",
) {
  await requireAdmin();
  const prisma = getPrisma();

  if (commentType === "audio") {
    await prisma.audioComment.update({
      where: { id },
      data: { status },
    });
  } else if (commentType === "book") {
    await prisma.bookComment.update({
      where: { id },
      data: { status },
    });
  } else {
    await prisma.comment.update({
      where: { id },
      data: { status },
    });
  }
  revalidatePath("/admin/comments");
}

export async function deleteCommentAdmin(id: string, commentType: "poem" | "book" | "audio") {
  await requireAdmin();
  const prisma = getPrisma();

  if (commentType === "audio") {
    await prisma.audioComment.delete({
      where: { id },
    });
  } else if (commentType === "book") {
    await prisma.bookComment.delete({
      where: { id },
    });
  } else {
    await prisma.comment.delete({
      where: { id },
    });
  }
  revalidatePath("/admin/comments");
}

export async function toggleCommentPin(id: string, commentType: "poem" | "book" | "audio", pin: boolean) {
  await requireAdmin();
  const prisma = getPrisma();

  if (commentType === "audio") {
    await prisma.audioComment.update({
      where: { id },
      data: { pinned: pin },
    });
  } else if (commentType === "book") {
    await prisma.bookComment.update({
      where: { id },
      data: { pinned: pin },
    });
  } else {
    await prisma.comment.update({
      where: { id },
      data: { pinned: pin },
    });
  }
  revalidatePath("/admin/comments");
}
