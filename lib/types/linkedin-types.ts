import {z} from 'zod'

// LinkedIn author schema
export const LinkedinAuthorSchema = z.object({
  first_name: z.string().default(""),
  last_name: z.string().default(""),
  headline: z.string().default(""),
  username: z.string().default(""),
  profile_url: z.string().default(""),
  profile_picture: z.string().nullable().optional()
})

// LinkedIn stats schema
export const LinkedinStatsSchema = z.object({
  total_reactions: z.number().nullable().optional().default(0),
  like: z.number().nullable().optional().default(0),
  support: z.number().nullable().optional().default(0),
  love: z.number().nullable().optional().default(0),
  insight: z.number().nullable().optional().default(0),
  celebrate: z.number().nullable().optional().default(0),
  comments: z.number().nullable().optional().default(0),
  reposts: z.number().nullable().optional().default(0)
})

// LinkedIn media schema
export const LinkedinMediaSchema = z.object({
  type: z.enum(['image', 'video', 'images']),
  url: z.string(),
  thumbnail: z.string().nullable().optional(),
  images: z.array(z.object({
    url: z.string(),
    width: z.number(),
    height: z.number(),
  })).optional()
})

// LinkedIn posted at schema
export const LinkedinPostedAtSchema = z.object({
  date: z.string().nullable().optional(),
  relative: z.string().nullable().optional(),
  timestamp: z.number().nullable().optional()
})

// LinkedIn post schema
export const LinkedinPostSchema = z.object({
  urn: z.string().nullable().optional(),
  full_urn: z.string().nullable().optional(),
  posted_at: LinkedinPostedAtSchema,
  text: z.string().nullable().optional(),
  url: z.string().nullable().optional(),
  post_type: z.string().nullable().optional(),
  author: LinkedinAuthorSchema,
  stats: LinkedinStatsSchema,
  media: LinkedinMediaSchema.nullable().optional(),
  pagination_token: z.string().nullable().optional()
})

export const LinkedinDataSchema = z.array(LinkedinPostSchema)

// Type exports for use in services
export type RawLinkedinData = z.infer<typeof LinkedinDataSchema>

export interface LinkedinMetrics {
  totalPosts: number
  totalReactions: number
  totalComments: number
  totalReposts: number
  avgRepostsPerPost: number
}

export interface LinkedinHashtagAnalysis {
  tag: string
  count: number
}
