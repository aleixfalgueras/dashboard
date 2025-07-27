import { z } from 'zod'

// TikTok author metadata schema
export const TiktokAuthorMetaSchema = z.object({
  id: z.string(),
  name: z.string(),
  profileUrl: z.string(),
  nickName: z.string(),
  verified: z.boolean(),
  signature: z.string(),
  bioLink: z.string().nullable(),
  originalAvatarUrl: z.string(),
  avatar: z.string(),
  commerceUserInfo: z.object({
    commerceUser: z.boolean()
  }),
  privateAccount: z.boolean(),
  region: z.string(),
  roomId: z.string(),
  ttSeller: z.boolean(),
  following: z.number(),
  friends: z.number(),
  fans: z.number(),
  heart: z.number(),
  video: z.number(),
  digg: z.number()
})

// TikTok music metadata schema
export const TiktokMusicMetaSchema = z.object({
  musicName: z.string(),
  musicAuthor: z.string(),
  musicOriginal: z.boolean(),
  playUrl: z.string(),
  coverMediumUrl: z.string(),
  originalCoverMediumUrl: z.string(),
  musicId: z.string()
})

// TikTok video metadata schema
export const TiktokVideoMetaSchema = z.object({
  height: z.number(),
  width: z.number(),
  duration: z.number(),
  coverUrl: z.string(),
  originalCoverUrl: z.string(),
  definition: z.string(),
  format: z.string(),
  subtitleLinks: z.array(z.object({
    language: z.string(),
    downloadLink: z.string(),
    tiktokLink: z.string(),
    source: z.string(),
    sourceUnabbreviated: z.string(),
    version: z.string()
  })).optional()
})

// TikTok post schema
export const TiktokPostSchema = z.object({
  id: z.string(),
  text: z.string(),
  textLanguage: z.string(),
  createTime: z.number(),
  createTimeISO: z.string(),
  isAd: z.boolean(),
  authorMeta: TiktokAuthorMetaSchema,
  musicMeta: TiktokMusicMetaSchema,
  webVideoUrl: z.string(),
  mediaUrls: z.array(z.string()),
  videoMeta: TiktokVideoMetaSchema,
  diggCount: z.number(),
  shareCount: z.number(),
  playCount: z.number(),
  collectCount: z.number(),
  commentCount: z.number(),
  mentions: z.array(z.string()),
  detailedMentions: z.array(z.object({
    id: z.string(),
    name: z.string(),
    nickName: z.string(),
    profileUrl: z.string()
  })),
  hashtags: z.array(z.object({
    name: z.string()
  })),
  effectStickers: z.array(z.any()),
  isSlideshow: z.boolean(),
  isPinned: z.boolean(),
  isSponsored: z.boolean(),
  input: z.string(),
  fromProfileSection: z.string()
})

export const TiktokDataSchema = z.array(TiktokPostSchema)

// Type exports for use in services
export type RawTiktokData = z.infer<typeof TiktokDataSchema>

export interface TiktokMetrics {
  totalPosts: number
  totalDiggs: number
  totalShares: number
  totalPlays: number
  totalComments: number
  avgEngagementPerPost: number
}

export interface TiktokHashtagAnalysis {
  tag: string
  count: number
}
