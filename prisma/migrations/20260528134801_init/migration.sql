-- CreateTable
CREATE TABLE "Trend" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "growthRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "views" TEXT NOT NULL DEFAULT '0',
    "creators" INTEGER NOT NULL DEFAULT 0,
    "thumbnail" TEXT,
    "isViral" BOOLEAN NOT NULL DEFAULT false,
    "isNew" BOOLEAN NOT NULL DEFAULT false,
    "velocity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "saturation" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "creatorFit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "aiPrediction" TEXT,
    "aiScore" DOUBLE PRECISION,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trend_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrendTag" (
    "trendId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "TrendTag_pkey" PRIMARY KEY ("trendId","tagId")
);

-- CreateTable
CREATE TABLE "Video" (
    "id" TEXT NOT NULL,
    "trendId" TEXT NOT NULL,
    "tiktokId" TEXT,
    "url" TEXT,
    "thumbnail" TEXT,
    "views" TEXT NOT NULL DEFAULT '0',
    "likes" TEXT NOT NULL DEFAULT '0',
    "shares" TEXT NOT NULL DEFAULT '0',
    "comments" TEXT NOT NULL DEFAULT '0',
    "duration" TEXT,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scrapedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Creator" (
    "id" TEXT NOT NULL,
    "tiktokId" TEXT,
    "username" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "avatar" TEXT,
    "followers" INTEGER NOT NULL DEFAULT 0,
    "following" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "niche" TEXT,
    "bio" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Creator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrendCreator" (
    "trendId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'early',

    CONSTRAINT "TrendCreator_pkey" PRIMARY KEY ("trendId","creatorId")
);

-- CreateTable
CREATE TABLE "Hashtag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "views" TEXT NOT NULL DEFAULT '0',
    "videos" INTEGER NOT NULL DEFAULT 0,
    "growthRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "category" TEXT,
    "isRising" BOOLEAN NOT NULL DEFAULT false,
    "scrapedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Hashtag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sound" (
    "id" TEXT NOT NULL,
    "tiktokId" TEXT,
    "title" TEXT NOT NULL,
    "author" TEXT,
    "thumbnail" TEXT,
    "uses" INTEGER NOT NULL DEFAULT 0,
    "growthRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isViral" BOOLEAN NOT NULL DEFAULT false,
    "scrapedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Sound_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScrapeLog" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "metadata" JSONB,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "ScrapeLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Trend_slug_key" ON "Trend"("slug");

-- CreateIndex
CREATE INDEX "Trend_category_idx" ON "Trend"("category");

-- CreateIndex
CREATE INDEX "Trend_isViral_idx" ON "Trend"("isViral");

-- CreateIndex
CREATE INDEX "Trend_isNew_idx" ON "Trend"("isNew");

-- CreateIndex
CREATE INDEX "Trend_publishedAt_idx" ON "Trend"("publishedAt");

-- CreateIndex
CREATE INDEX "Trend_aiScore_idx" ON "Trend"("aiScore");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Video_tiktokId_key" ON "Video"("tiktokId");

-- CreateIndex
CREATE INDEX "Video_trendId_idx" ON "Video"("trendId");

-- CreateIndex
CREATE INDEX "Video_scrapedAt_idx" ON "Video"("scrapedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Creator_tiktokId_key" ON "Creator"("tiktokId");

-- CreateIndex
CREATE UNIQUE INDEX "Creator_username_key" ON "Creator"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Hashtag_name_key" ON "Hashtag"("name");

-- CreateIndex
CREATE INDEX "Hashtag_isRising_idx" ON "Hashtag"("isRising");

-- CreateIndex
CREATE INDEX "Hashtag_growthRate_idx" ON "Hashtag"("growthRate");

-- CreateIndex
CREATE UNIQUE INDEX "Sound_tiktokId_key" ON "Sound"("tiktokId");

-- CreateIndex
CREATE INDEX "Sound_isViral_idx" ON "Sound"("isViral");

-- CreateIndex
CREATE INDEX "Sound_uses_idx" ON "Sound"("uses");

-- AddForeignKey
ALTER TABLE "TrendTag" ADD CONSTRAINT "TrendTag_trendId_fkey" FOREIGN KEY ("trendId") REFERENCES "Trend"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrendTag" ADD CONSTRAINT "TrendTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_trendId_fkey" FOREIGN KEY ("trendId") REFERENCES "Trend"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrendCreator" ADD CONSTRAINT "TrendCreator_trendId_fkey" FOREIGN KEY ("trendId") REFERENCES "Trend"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrendCreator" ADD CONSTRAINT "TrendCreator_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Creator"("id") ON DELETE CASCADE ON UPDATE CASCADE;
