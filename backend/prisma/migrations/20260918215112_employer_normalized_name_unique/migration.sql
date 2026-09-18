/*
  Warnings:

  - A unique constraint covering the columns `[normalizedName]` on the table `employers` will be added. If there are existing duplicate values, this will fail.
  - Made the column `normalizedName` on table `employers` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "employers" ALTER COLUMN "normalizedName" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "employers_normalizedName_key" ON "employers"("normalizedName");
