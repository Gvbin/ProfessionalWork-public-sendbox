/*
  Warnings:

  - Added the required column `position` to the `Card` table without a default value. This is not possible if the table is not empty.
  - Added the required column `position` to the `List` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Card" ADD COLUMN     "position" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."List" ADD COLUMN     "position" INTEGER NOT NULL;
