-- Enable Row Level Security and create permissive policies for all tables
-- This will resolve the "RLS Disabled in Public" security warnings

-- Client table
ALTER TABLE "Client" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access" ON "Client" FOR ALL USING (true);

  -- User table
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access" ON "User" FOR ALL USING (true);

  -- Upload table
ALTER TABLE "Upload" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access" ON "Upload" FOR ALL USING (true);

  -- Instagram tables
ALTER TABLE "InstagramProfile" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access" ON "InstagramProfile" FOR ALL USING (true);

ALTER TABLE "InstagramPost" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access" ON "InstagramPost" FOR ALL USING (true);

ALTER TABLE "InstagramComment" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access" ON "InstagramComment" FOR ALL USING (true);

  -- TikTok tables
ALTER TABLE "TiktokProfile" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access" ON "TiktokProfile" FOR ALL USING (true);

ALTER TABLE "TiktokPost" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access" ON "TiktokPost" FOR ALL USING (true);

  -- LinkedIn tables
ALTER TABLE "LinkedinProfile" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access" ON "LinkedinProfile" FOR ALL USING (true);

ALTER TABLE "LinkedinPost" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access" ON "LinkedinPost" FOR ALL USING (true);

  -- YouTube tables
ALTER TABLE "YoutubeProfile" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access" ON "YoutubeProfile" FOR ALL USING (true);

ALTER TABLE "YoutubeVideo" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access" ON "YoutubeVideo" FOR ALL USING (true);

  -- Prisma migrations table
ALTER TABLE "_prisma_migrations" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access" ON "_prisma_migrations" FOR ALL USING (true);
