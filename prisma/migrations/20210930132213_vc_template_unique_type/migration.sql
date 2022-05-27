/*
  Warnings:

  - A unique constraint covering the columns `[type]` on the table `VCTemplate` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "VCTemplate_type_key" ON "VCTemplate"("type");
