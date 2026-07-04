-- Auth.js' Prisma adapter writes this value while creating an OAuth user.
ALTER TABLE "users" ADD COLUMN "emailVerified" TIMESTAMP(3);
