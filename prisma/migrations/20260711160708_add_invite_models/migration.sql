-- CreateTable
CREATE TABLE "invites" (
    "id" TEXT NOT NULL,
    "inviterUserId" TEXT NOT NULL,
    "inviteeName" TEXT NOT NULL,
    "inviteeEmail" TEXT NOT NULL,
    "poemId" TEXT,
    "personalNote" TEXT,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clickedAt" TIMESTAMP(3),
    "signedUpAt" TIMESTAMP(3),

    CONSTRAINT "invites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unsubscribed_emails" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "unsubscribed_emails_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "invites_inviterUserId_idx" ON "invites"("inviterUserId");

-- CreateIndex
CREATE INDEX "invites_inviteeEmail_idx" ON "invites"("inviteeEmail");

-- CreateIndex
CREATE UNIQUE INDEX "unsubscribed_emails_email_key" ON "unsubscribed_emails"("email");

-- AddForeignKey
ALTER TABLE "invites" ADD CONSTRAINT "invites_inviterUserId_fkey" FOREIGN KEY ("inviterUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invites" ADD CONSTRAINT "invites_poemId_fkey" FOREIGN KEY ("poemId") REFERENCES "poems"("id") ON DELETE SET NULL ON UPDATE CASCADE;
