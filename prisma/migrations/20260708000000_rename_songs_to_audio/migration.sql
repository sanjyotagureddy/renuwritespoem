-- Rename the tables
ALTER TABLE "songs" RENAME TO "audio";
ALTER TABLE "song_likes" RENAME TO "audio_likes";
ALTER TABLE "song_comments" RENAME TO "audio_comments";
ALTER TABLE "song_comment_likes" RENAME TO "audio_comment_likes";

-- In audio_likes, rename the column "songId" to "audioId"
ALTER TABLE "audio_likes" RENAME COLUMN "songId" TO "audioId";

-- In audio_comments, rename the column "songId" to "audioId"
ALTER TABLE "audio_comments" RENAME COLUMN "songId" TO "audioId";

-- Rename indexes
ALTER INDEX "songs_slug_key" RENAME TO "audio_slug_key";
ALTER INDEX "song_likes_userId_idx" RENAME TO "audio_likes_userId_idx";
ALTER INDEX "song_comments_songId_status_idx" RENAME TO "audio_comments_audioId_status_idx";
ALTER INDEX "song_comments_userId_idx" RENAME TO "audio_comments_userId_idx";
ALTER INDEX "song_comment_likes_userId_idx" RENAME TO "audio_comment_likes_userId_idx";

-- Rename PK constraints
ALTER TABLE "audio" RENAME CONSTRAINT "songs_pkey" TO "audio_pkey";
ALTER TABLE "audio_likes" RENAME CONSTRAINT "song_likes_pkey" TO "audio_likes_pkey";
ALTER TABLE "audio_comments" RENAME CONSTRAINT "song_comments_pkey" TO "audio_comments_pkey";
ALTER TABLE "audio_comment_likes" RENAME CONSTRAINT "song_comment_likes_pkey" TO "audio_comment_likes_pkey";

-- Rename foreign key constraints
ALTER TABLE "audio_likes" RENAME CONSTRAINT "song_likes_songId_fkey" TO "audio_likes_audioId_fkey";
ALTER TABLE "audio_likes" RENAME CONSTRAINT "song_likes_userId_fkey" TO "audio_likes_userId_fkey";

ALTER TABLE "audio_comments" RENAME CONSTRAINT "song_comments_songId_fkey" TO "audio_comments_audioId_fkey";
ALTER TABLE "audio_comments" RENAME CONSTRAINT "song_comments_userId_fkey" TO "audio_comments_userId_fkey";

ALTER TABLE "audio_comment_likes" RENAME CONSTRAINT "song_comment_likes_commentId_fkey" TO "audio_comment_likes_commentId_fkey";
ALTER TABLE "audio_comment_likes" RENAME CONSTRAINT "song_comment_likes_userId_fkey" TO "audio_comment_likes_userId_fkey";
