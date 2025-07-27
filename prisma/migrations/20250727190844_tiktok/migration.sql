-- CreateTable
CREATE TABLE "TiktokProfile" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "nickname" TEXT,
    "signature" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "fans" INTEGER NOT NULL DEFAULT 0,
    "following" INTEGER NOT NULL DEFAULT 0,
    "friends" INTEGER NOT NULL DEFAULT 0,
    "heart" INTEGER NOT NULL DEFAULT 0,
    "video" INTEGER NOT NULL DEFAULT 0,
    "digg" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TiktokProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TiktokPost" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "text" TEXT,
    "textLanguage" TEXT,
    "createTime" TIMESTAMP(3) NOT NULL,
    "isAd" BOOLEAN NOT NULL DEFAULT false,
    "webVideoUrl" TEXT NOT NULL,
    "diggCount" INTEGER NOT NULL DEFAULT 0,
    "shareCount" INTEGER NOT NULL DEFAULT 0,
    "playCount" INTEGER NOT NULL DEFAULT 0,
    "collectCount" INTEGER NOT NULL DEFAULT 0,
    "commentCount" INTEGER NOT NULL DEFAULT 0,
    "isSlideshow" BOOLEAN NOT NULL DEFAULT false,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "isSponsored" BOOLEAN NOT NULL DEFAULT false,
    "hashtags" TEXT[],
    "mentions" TEXT[],
    "musicName" TEXT,
    "musicAuthor" TEXT,
    "musicOriginal" BOOLEAN NOT NULL DEFAULT false,
    "videoDuration" INTEGER,
    "videoHeight" INTEGER,
    "videoWidth" INTEGER,
    "videoCoverUrl" TEXT,
    "videoDefinition" TEXT,
    "videoFormat" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TiktokPost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TiktokProfile_clientId_key" ON "TiktokProfile"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "TiktokPost_postId_key" ON "TiktokPost"("postId");

-- CreateIndex
CREATE INDEX "TiktokPost_profileId_idx" ON "TiktokPost"("profileId");

-- CreateIndex
CREATE INDEX "TiktokPost_createTime_idx" ON "TiktokPost"("createTime");

-- AddForeignKey
ALTER TABLE "TiktokProfile" ADD CONSTRAINT "TiktokProfile_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TiktokPost" ADD CONSTRAINT "TiktokPost_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "TiktokProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
