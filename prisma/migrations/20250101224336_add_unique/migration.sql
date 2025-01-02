/*
  Warnings:

  - A unique constraint covering the columns `[tag_cd]` on the table `assets` will be added. If there are existing duplicate values, this will fail.

*/
BEGIN TRY

BEGIN TRAN;

-- CreateIndex
ALTER TABLE [dbo].[assets] ADD CONSTRAINT [assets_tag_cd_key] UNIQUE NONCLUSTERED ([tag_cd]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
