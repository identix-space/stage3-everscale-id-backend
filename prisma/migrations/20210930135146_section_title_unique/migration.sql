/*
  Warnings:

  - A unique constraint covering the columns `[title]` on the table `VCTemplateSection` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "VCTemplateSection_title_key" ON "VCTemplateSection"("title");
