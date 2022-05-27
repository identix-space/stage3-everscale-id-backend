-- CreateTable
CREATE TABLE "Account" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "did" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DISABLED'
);

-- CreateTable
CREATE TABLE "VerifyMessage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "did" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Upload" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "filename" TEXT NOT NULL,
    "originalFilename" TEXT NOT NULL,
    "extension" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "mimetype" TEXT NOT NULL,
    "uploaderIp" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "AccountSession" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "accountId" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "ipAddr" TEXT NOT NULL,
    "userAgent" TEXT,
    "expiresAt" DATETIME NOT NULL,
    CONSTRAINT "AccountSession_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_did_key" ON "Account"("did");

-- CreateIndex
CREATE UNIQUE INDEX "VerifyMessage_did_key" ON "VerifyMessage"("did");

-- CreateIndex
CREATE UNIQUE INDEX "Upload_filename_key" ON "Upload"("filename");

-- CreateIndex
CREATE UNIQUE INDEX "AccountSession_token_key" ON "AccountSession"("token");
