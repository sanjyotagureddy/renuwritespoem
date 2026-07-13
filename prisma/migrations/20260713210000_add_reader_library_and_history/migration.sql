CREATE TABLE "saved_poems" (
    "userId" TEXT NOT NULL,
    "poemId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "saved_poems_pkey" PRIMARY KEY ("userId", "poemId")
);

CREATE TABLE "saved_books" (
    "userId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "saved_books_pkey" PRIMARY KEY ("userId", "bookId")
);

CREATE TABLE "reader_poem_views" (
    "userId" TEXT NOT NULL,
    "poemId" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "reader_poem_views_pkey" PRIMARY KEY ("userId", "poemId")
);

CREATE TABLE "reader_book_views" (
    "userId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "reader_book_views_pkey" PRIMARY KEY ("userId", "bookId")
);

CREATE INDEX "saved_poems_userId_createdAt_idx" ON "saved_poems"("userId", "createdAt" DESC);
CREATE INDEX "saved_books_userId_createdAt_idx" ON "saved_books"("userId", "createdAt" DESC);
CREATE INDEX "reader_poem_views_userId_viewedAt_idx" ON "reader_poem_views"("userId", "viewedAt" DESC);
CREATE INDEX "reader_book_views_userId_viewedAt_idx" ON "reader_book_views"("userId", "viewedAt" DESC);

ALTER TABLE "saved_poems" ADD CONSTRAINT "saved_poems_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "saved_poems" ADD CONSTRAINT "saved_poems_poemId_fkey" FOREIGN KEY ("poemId") REFERENCES "poems"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "saved_books" ADD CONSTRAINT "saved_books_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "saved_books" ADD CONSTRAINT "saved_books_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reader_poem_views" ADD CONSTRAINT "reader_poem_views_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reader_poem_views" ADD CONSTRAINT "reader_poem_views_poemId_fkey" FOREIGN KEY ("poemId") REFERENCES "poems"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reader_book_views" ADD CONSTRAINT "reader_book_views_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reader_book_views" ADD CONSTRAINT "reader_book_views_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE CASCADE;
