import { z } from 'zod'

// LinkedIn author schema
export const LinkedinAuthorSchema = z.object({
  first_name: z.string(),
  last_name: z.string(),
  headline: z.string(),
  username: z.string(),
  profile_url: z.string(),
  profile_picture: z.string().nullable().optional()
})

// LinkedIn stats schema
export const LinkedinStatsSchema = z.object({
  total_reactions: z.number(),
  like: z.number(),
  support: z.number(),
  love: z.number(),
  insight: z.number(),
  celebrate: z.number(),
  comments: z.number(),
  reposts: z.number()
})

// LinkedIn media schema
export const LinkedinMediaSchema = z.object({
  type: z.enum(['image', 'video', 'images']),
  url: z.string(),
  thumbnail: z.string().optional(),
  images: z.array(z.object({
    url: z.string(),
    width: z.number(),
    height: z.number()
  })).optional()
})

// LinkedIn posted at schema
export const LinkedinPostedAtSchema = z.object({
  date: z.string(),
  relative: z.string(),
  timestamp: z.number()
})

// LinkedIn post schema
export const LinkedinPostSchema = z.object({
  urn: z.string(),
  full_urn: z.string(),
  posted_at: LinkedinPostedAtSchema,
  text: z.string().nullable(),
  url: z.string(),
  post_type: z.string(),
  author: LinkedinAuthorSchema,
  stats: LinkedinStatsSchema,
  media: LinkedinMediaSchema.optional(),
  pagination_token: z.string().optional()
})

export const LinkedinDataSchema = z.array(LinkedinPostSchema)

// Type exports for use in services
export type RawLinkedinData = z.infer<typeof LinkedinDataSchema>

export interface LinkedinMetrics {
  totalPosts: number
  totalReactions: number
  totalComments: number
  totalReposts: number
  avgEngagementPerPost: number
}

export interface LinkedinHashtagAnalysis {
  tag: string
  count: number
}