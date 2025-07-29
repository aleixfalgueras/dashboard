import { z } from 'zod'

// YouTube channel description link schema
export const YoutubeChannelDescriptionLinkSchema = z.object({
  text: z.string(),
  url: z.string()
})

// YouTube channel about info schema
export const YoutubeAboutChannelInfoSchema = z.object({
  channelDescription: z.string(),
  channelJoinedDate: z.string(),
  channelDescriptionLinks: z.array(YoutubeChannelDescriptionLinkSchema),
  channelLocation: z.string(),
  channelUsername: z.string(),
  channelAvatarUrl: z.string(),
  channelBannerUrl: z.string(),
  channelTotalVideos: z.number(),
  channelTotalViews: z.number(),
  numberOfSubscribers: z.number(),
  isChannelVerified: z.boolean(),
  channelName: z.string(),
  channelUrl: z.string(),
  channelId: z.string(),
  inputChannelUrl: z.string(),
  isAgeRestricted: z.boolean()
})

// YouTube description link schema
export const YoutubeDescriptionLinkSchema = z.object({
  url: z.string(),
  text: z.string()
})

// YouTube video schema
export const YoutubeVideoSchema = z.object({
  title: z.string(),
  type: z.string(),
  id: z.string(),
  url: z.string(),
  thumbnailUrl: z.string().optional(),
  viewCount: z.number(),
  date: z.string(),
  likes: z.number(),
  location: z.string().nullable(),
  channelName: z.string(),
  channelUrl: z.string(),
  channelId: z.string(),
  channelUsername: z.string().optional(),
  channelDescription: z.string(),
  channelJoinedDate: z.string(),
  channelDescriptionLinks: z.array(YoutubeChannelDescriptionLinkSchema),
  channelLocation: z.string().optional(),
  channelAvatarUrl: z.string(),
  channelBannerUrl: z.string(),
  channelTotalVideos: z.number(),
  channelTotalViews: z.number(),
  numberOfSubscribers: z.number(),
  isChannelVerified: z.boolean(),
  inputChannelUrl: z.string(),
  isAgeRestricted: z.boolean(),
  aboutChannelInfo: YoutubeAboutChannelInfoSchema.optional(),
  duration: z.string().optional(),
  commentsCount: z.number(),
  text: z.string().optional(),
  descriptionLinks: z.array(YoutubeDescriptionLinkSchema).optional(),
  subtitles: z.any().nullable(),
  order: z.number(),
  commentsTurnedOff: z.boolean(),
  fromYTUrl: z.string(),
  isMonetized: z.boolean().nullable(),
  hashtags: z.array(z.string()),
  formats: z.array(z.any()),
  isMembersOnly: z.boolean(),
  input: z.string(),
  fromChannelListPage: z.string()
})

export const YoutubeDataSchema = z.array(YoutubeVideoSchema)

// Type exports for use in services
export type RawYoutubeData = z.infer<typeof YoutubeDataSchema>

export interface YoutubeMetrics {
  totalVideos: number
  totalViews: number
  totalLikes: number
  totalComments: number
  avgViewsPerVideo: number
  avgLikesPerVideo: number
  avgCommentsPerVideo: number
  avgEngagementPerPost: number
}

export interface YoutubeHashtagAnalysis {
  tag: string
  count: number
}

export interface YoutubeHeatmapCell {
  dayOfWeek: number // 1-7 (Monday to Sunday)
  hourBlock: number // 0, 3, 6, 9, 12, 15, 18, 21
  videoCount: number
}

export interface YoutubeConsistencyMetrics {
  activeDays: number
  inactiveDays: number
  dailyConsistencyRate: number
  longestSilence: number
  longestActiveStreak: number
  heatmapData: YoutubeHeatmapCell[]
  consistencyScore: number // 0-100 composite score
}