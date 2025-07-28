-- CreateTable
CREATE TABLE "LinkedinProfile" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "headline" TEXT,
    "username" TEXT NOT NULL,
    "profileUrl" TEXT NOT NULL,
    "profilePicUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LinkedinProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LinkedinPost" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "urn" TEXT NOT NULL,
    "fullUrn" TEXT NOT NULL,
    "postType" TEXT NOT NULL,
    "text" TEXT,
    "url" TEXT NOT NULL,
    "postedAt" TIMESTAMP(3) NOT NULL,
    "totalReactions" INTEGER NOT NULL DEFAULT 0,
    "likesCount" INTEGER NOT NULL DEFAULT 0,
    "supportsCount" INTEGER NOT NULL DEFAULT 0,
    "lovesCount" INTEGER NOT NULL DEFAULT 0,
    "insightsCount" INTEGER NOT NULL DEFAULT 0,
    "celebratesCount" INTEGER NOT NULL DEFAULT 0,
    "commentsCount" INTEGER NOT NULL DEFAULT 0,
    "repostsCount" INTEGER NOT NULL DEFAULT 0,
    "mediaType" TEXT,
    "mediaUrl" TEXT,
    "mediaThumbnail" TEXT,
    "imageUrls" TEXT[],
    "paginationToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LinkedinPost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LinkedinProfile_clientId_key" ON "LinkedinProfile"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "LinkedinPost_urn_key" ON "LinkedinPost"("urn");

-- CreateIndex
CREATE INDEX "LinkedinPost_profileId_idx" ON "LinkedinPost"("profileId");

-- CreateIndex
CREATE INDEX "LinkedinPost_postedAt_idx" ON "LinkedinPost"("postedAt");

-- AddForeignKey
ALTER TABLE "LinkedinProfile" ADD CONSTRAINT "LinkedinProfile_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinkedinPost" ADD CONSTRAINT "LinkedinPost_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "LinkedinProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
