-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "isAnonymous" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "image" DROP NOT NULL;
