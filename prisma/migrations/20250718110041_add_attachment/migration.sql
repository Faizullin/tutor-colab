-- CreateEnum
CREATE TYPE "ContentTypeGeneric" AS ENUM ('UserAccount', 'Post', 'Attachment');

-- CreateTable
CREATE TABLE "Attachment" (
    "id" SERIAL NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "mimetype" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "ownerId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "objectId" INTEGER,
    "objectType" "ContentTypeGeneric",

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "UserAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;
