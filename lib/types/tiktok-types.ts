import {z} from 'zod'

// TikTok author metadata schema
export const TiktokAuthorMetaSchema = z.object({
  id: z.string(),
  name: z.string().nullable().optional(),
  profileUrl: z.string().nullable().optional(),
  nickName: z.string().nullable().optional(),
  verified: z.boolean().nullable().optional(),
  signature: z.string().nullable().optional(),
  bioLink: z.string().nullable().optional(),
  originalAvatarUrl: z.string().nullable().optional(),
  avatar: z.string().nullable().optional(),
  commerceUserInfo: z.object({
    commerceUser: z.boolean().nullable().optional()
  }),
  privateAccount: z.boolean().nullable().optional(),
  region: z.string().nullable().optional(),
  roomId: z.string().nullable().optional(),
  ttSeller: z.boolean().nullable().optional().default(false),
  following: z.number().nullable().optional().default(0),
  friends: z.number().nullable().optional().default(0),
  fans: z.number().nullable().optional().default(0),
  heart: z.number().nullable().optional().default(0),
  video: z.number().nullable().optional().default(0),
  digg: z.number().nullable().optional().default(0)
})

// TikTok music metadata schema
export const TiktokMusicMetaSchema = z.object({
  musicName: z.string().nullable().optional(),
  musicAuthor: z.string().nullable().optional(),
  musicOriginal: z.boolean().nullable().optional(),
  playUrl: z.string().nullable().optional(),
  coverMediumUrl: z.string().nullable().optional(),
  originalCoverMediumUrl: z.string().nullable().optional(),
  musicId: z.string().nullable().optional()
})

// TikTok video metadata schema
export const TiktokVideoMetaSchema = z.object({
  height: z.number().nullable().optional(),
  width: z.number().nullable().optional(),
  duration: z.number().nullable().optional(),
  coverUrl: z.string().nullable().optional(),
  originalCoverUrl: z.string().nullable().optional(),
  definition: z.string().nullable().optional(),
  format: z.string().nullable().optional(),
  subtitleLinks: z.array(z.object({
    language: z.string().nullable().optional(),
    downloadLink: z.string().nullable().optional(),
    tiktokLink: z.string().nullable().optional(),
    source: z.string().nullable().optional(),
    sourceUnabbreviated: z.string().nullable().optional(),
    version: z.string()
  })).optional()
})

// TikTok post schema
export const TiktokPostSchema = z.object({
  id: z.string(),
  text: z.string().nullable().optional(),
  textLanguage: z.string().nullable().optional(),
  createTime: z.number().nullable().optional(),
  createTimeISO: z.string().nullable().optional(),
  isAd: z.boolean().nullable().optional(),
  authorMeta: TiktokAuthorMetaSchema,
  musicMeta: TiktokMusicMetaSchema,
  webVideoUrl: z.string().nullable().optional(),
  mediaUrls: z.array(z.string()).nullable().optional(),
  videoMeta: TiktokVideoMetaSchema,
  diggCount: z.number().nullable().optional(),
  shareCount: z.number().nullable().optional(),
  playCount: z.number().nullable().optional(),
  collectCount: z.number().nullable().optional(),
  commentCount: z.number().nullable().optional(),
  mentions: z.array(z.string()),
  detailedMentions: z.array(z.object({
    id: z.string().nullable().optional(),
    name: z.string().nullable().optional(),
    nickName: z.string().nullable().optional(),
    profileUrl: z.string().nullable().optional()
  })).nullable().optional(),
  hashtags: z.array(z.object({
    name: z.string()
  })),
  effectStickers: z.array(z.any()).nullable().optional(),
  isSlideshow: z.boolean().nullable().optional(),
  isPinned: z.boolean().nullable().optional(),
  isSponsored: z.boolean().nullable().optional(),
  input: z.string().nullable().optional(),
  fromProfileSection: z.string().nullable().optional()
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
