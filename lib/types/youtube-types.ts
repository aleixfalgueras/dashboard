import {z} from 'zod'

// YouTube channel description link schema
export const YoutubeChannelDescriptionLinkSchema = z.object({
  text: z.string().nullable().optional(),
  url: z.string().nullable().optional()
})

// YouTube channel about info schema
export const YoutubeAboutChannelInfoSchema = z.object({
  channelDescription: z.string().nullable().optional(),
  channelJoinedDate: z.string().nullable().optional(),
  channelDescriptionLinks: z.array(YoutubeChannelDescriptionLinkSchema),
  channelLocation: z.string().nullable().optional(),
  channelUsername: z.string().nullable().optional(),
  channelAvatarUrl: z.string().nullable().optional(),
  channelBannerUrl: z.string().nullable().optional(),
  channelTotalVideos: z.number().nullable().optional().default(0),
  channelTotalViews: z.number().nullable().optional().default(0),
  numberOfSubscribers: z.number().nullable().optional().default(0),
  isChannelVerified: z.boolean().nullable().optional(),
  channelName: z.string().nullable().optional(),
  channelUrl: z.string().nullable().optional(),
  channelId: z.string().nullable().optional(),
  inputChannelUrl: z.string().nullable().optional(),
  isAgeRestricted: z.boolean().nullable().optional()
})

// YouTube description link schema
export const YoutubeDescriptionLinkSchema = z.object({
  url: z.string().nullable().optional(),
  text: z.string().nullable().optional()
})

// YouTube video schema
export const YoutubeVideoSchema = z.object({
  title: z.string(),
  type: z.string(),
  id: z.string(),
  url: z.string(),
  thumbnailUrl: z.string().nullable().optional(),
  viewCount: z.number(),
  date: z.string(),
  likes: z.number(),
  location: z.string().nullable().optional(),
  channelName: z.string(),
  channelUrl: z.string(),
  channelId: z.string(),
  channelUsername: z.string().nullable().optional(),
  channelDescription: z.string(),
  channelJoinedDate: z.string(),
  channelDescriptionLinks: z.array(YoutubeChannelDescriptionLinkSchema),
  channelLocation: z.string().nullable().optional(),
  channelAvatarUrl: z.string().nullable().optional(),
  channelBannerUrl: z.string().nullable().optional(),
  channelTotalVideos: z.number().nullable().optional().default(0),
  channelTotalViews: z.number().nullable().optional().default(0),
  numberOfSubscribers: z.number().nullable().optional().default(0),
  isChannelVerified: z.boolean().nullable().optional(),
  inputChannelUrl: z.string().nullable().optional(),
  isAgeRestricted: z.boolean().nullable().optional(),
  aboutChannelInfo: YoutubeAboutChannelInfoSchema.optional(),
  duration: z.string().nullable().optional(),
  commentsCount: z.number().nullable().optional().default(0),
  text: z.string().nullable().optional(),
  descriptionLinks: z.array(YoutubeDescriptionLinkSchema).optional(),
  subtitles: z.any().nullable().optional(),
  order: z.number().nullable().optional(),
  commentsTurnedOff: z.boolean().nullable().optional(),
  fromYTUrl: z.string().nullable().optional(),
  isMonetized: z.boolean().nullable().optional(),
  hashtags: z.array(z.string()).nullable().optional(),
  formats: z.array(z.any()).nullable().optional(),
  isMembersOnly: z.boolean().nullable().optional(),
  input: z.string().nullable().optional(),
  fromChannelListPage: z.string().nullable().optional()
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
