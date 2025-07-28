-- CreateTable
CREATE TABLE "YoutubeProfile" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "channelName" TEXT NOT NULL,
    "channelUsername" TEXT,
    "channelUrl" TEXT NOT NULL,
    "channelDescription" TEXT,
    "channelAvatarUrl" TEXT,
    "channelBannerUrl" TEXT,
    "channelLocation" TEXT,
    "channelJoinedDate" TEXT,
    "numberOfSubscribers" INTEGER NOT NULL DEFAULT 0,
    "channelTotalVideos" INTEGER NOT NULL DEFAULT 0,
    "channelTotalViews" INTEGER NOT NULL DEFAULT 0,
    "isChannelVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "YoutubeProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "YoutubeVideo" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "commentsCount" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "duration" TEXT,
    "text" TEXT,
    "location" TEXT,
    "hashtags" TEXT[],
    "isAgeRestricted" BOOLEAN NOT NULL DEFAULT false,
    "isMonetized" BOOLEAN,
    "isMembersOnly" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "YoutubeVideo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "YoutubeProfile_clientId_key" ON "YoutubeProfile"("clientId");

-- CreateIndex
CREATE INDEX "YoutubeProfile_channelId_idx" ON "YoutubeProfile"("channelId");

-- CreateIndex
CREATE UNIQUE INDEX "YoutubeVideo_videoId_key" ON "YoutubeVideo"("videoId");

-- CreateIndex
CREATE INDEX "YoutubeVideo_profileId_idx" ON "YoutubeVideo"("profileId");

-- CreateIndex
CREATE INDEX "YoutubeVideo_publishedAt_idx" ON "YoutubeVideo"("publishedAt");

-- AddForeignKey
ALTER TABLE "YoutubeProfile" ADD CONSTRAINT "YoutubeProfile_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YoutubeVideo" ADD CONSTRAINT "YoutubeVideo_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "YoutubeProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
