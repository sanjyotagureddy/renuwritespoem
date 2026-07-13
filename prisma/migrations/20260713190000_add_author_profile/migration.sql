-- CreateTable
CREATE TABLE "author_profile" (
    "id" TEXT NOT NULL,
    "whyIWrite" TEXT,
    "writingJourney" TEXT,
    "inspiration" TEXT,
    "awards" TEXT,
    "publications" TEXT,
    "interviews" TEXT,
    "behindTheScenes" TEXT,
    "writingDesk" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "author_profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "author_gallery_images" (
    "id" TEXT NOT NULL,
    "url" TEXT,
    "fileData" TEXT,
    "fileMime" TEXT,
    "width" INTEGER NOT NULL DEFAULT 0,
    "height" INTEGER NOT NULL DEFAULT 0,
    "order" INTEGER NOT NULL DEFAULT 0,
    "caption" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "profileId" TEXT NOT NULL,

    CONSTRAINT "author_gallery_images_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "author_gallery_images" ADD CONSTRAINT "author_gallery_images_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "author_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
