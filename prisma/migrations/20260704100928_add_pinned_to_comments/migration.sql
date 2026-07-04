-- AlterTable
ALTER TABLE "book_comments" ADD COLUMN     "pinned" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "comments" ADD COLUMN     "pinned" BOOLEAN NOT NULL DEFAULT false;
