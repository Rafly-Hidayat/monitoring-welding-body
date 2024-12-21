BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[users] (
    [id] INT NOT NULL IDENTITY(1,1),
    [ulid] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [username] NVARCHAR(1000) NOT NULL,
    [password] NVARCHAR(1000) NOT NULL,
    [role_id] INT NOT NULL,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [users_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    CONSTRAINT [users_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [users_ulid_key] UNIQUE NONCLUSTERED ([ulid]),
    CONSTRAINT [users_username_key] UNIQUE NONCLUSTERED ([username])
);

-- CreateTable
CREATE TABLE [dbo].[roles] (
    [id] INT NOT NULL IDENTITY(1,1),
    [description] NVARCHAR(1000) NOT NULL,
    [code] NVARCHAR(1000) NOT NULL,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [roles_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    CONSTRAINT [roles_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [roles_code_key] UNIQUE NONCLUSTERED ([code])
);

-- CreateTable
CREATE TABLE [dbo].[permissions] (
    [id] INT NOT NULL IDENTITY(1,1),
    [ulid] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [code] NVARCHAR(1000) NOT NULL,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [permissions_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    CONSTRAINT [permissions_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [permissions_ulid_key] UNIQUE NONCLUSTERED ([ulid]),
    CONSTRAINT [permissions_name_key] UNIQUE NONCLUSTERED ([name]),
    CONSTRAINT [permissions_code_key] UNIQUE NONCLUSTERED ([code])
);

-- CreateTable
CREATE TABLE [dbo].[_RolePermissions] (
    [A] INT NOT NULL,
    [B] INT NOT NULL,
    CONSTRAINT [_RolePermissions_AB_unique] UNIQUE NONCLUSTERED ([A],[B])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [_RolePermissions_B_index] ON [dbo].[_RolePermissions]([B]);

-- AddForeignKey
ALTER TABLE [dbo].[users] ADD CONSTRAINT [users_role_id_fkey] FOREIGN KEY ([role_id]) REFERENCES [dbo].[roles]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[_RolePermissions] ADD CONSTRAINT [_RolePermissions_A_fkey] FOREIGN KEY ([A]) REFERENCES [dbo].[permissions]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[_RolePermissions] ADD CONSTRAINT [_RolePermissions_B_fkey] FOREIGN KEY ([B]) REFERENCES [dbo].[roles]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
