-- CreateTable
CREATE TABLE "song_likes" (
    "songId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "song_likes_pkey" PRIMARY KEY ("songId","userId")
);

-- CreateTable
CREATE TABLE "song_comments" (
    "id" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "edited" BOOLEAN NOT NULL DEFAULT false,
    "status" "CommentStatus" NOT NULL DEFAULT 'APPROVED',
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "songId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "song_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "song_comment_likes" (
    "commentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "song_comment_likes_pkey" PRIMARY KEY ("commentId","userId")
);

-- CreateIndex
CREATE INDEX "song_likes_userId_idx" ON "song_likes"("userId");

-- CreateIndex
CREATE INDEX "song_comments_songId_status_idx" ON "song_comments"("songId", "status");

-- CreateIndex
CREATE INDEX "song_comments_userId_idx" ON "song_comments"("userId");

-- CreateIndex
CREATE INDEX "song_comment_likes_userId_idx" ON "song_comment_likes"("userId");

-- AddForeignKey
ALTER TABLE "song_likes" ADD CONSTRAINT "song_likes_songId_fkey" FOREIGN KEY ("songId") REFERENCES "songs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "song_likes" ADD CONSTRAINT "song_likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "song_comments" ADD CONSTRAINT "song_comments_songId_fkey" FOREIGN KEY ("songId") REFERENCES "songs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "song_comments" ADD CONSTRAINT "song_comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "song_comment_likes" ADD CONSTRAINT "song_comment_likes_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "song_comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "song_comment_likes" ADD CONSTRAINT "song_comment_likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
