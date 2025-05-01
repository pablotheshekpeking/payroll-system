/*
  Warnings:

  - Changed the type of `grade` on the `Student` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Grade" AS ENUM ('JSS1', 'JSS2', 'JSS3', 'SS1', 'SS2', 'SS3');

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "grade",
ADD COLUMN     "grade" "Grade" NOT NULL;
