-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "excerpt" TEXT,
ADD COLUMN     "thumbnailImageId" INTEGER;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_thumbnailImageId_fkey" FOREIGN KEY ("thumbnailImageId") REFERENCES "Attachment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
