import {z} from 'zod'

export const InstagramProfileDataSchema = z.array(z.object({
  fullName: z.string(),
  profilePicUrl: z.string(),
  username: z.string(),
  postsCount: z.number(),
  followersCount: z.number(),
  followsCount: z.number(),
  private: z.boolean(),
  verified: z.boolean(),
  isBusinessAccount: z.boolean(),
  biography: z.string()
}))


// Instagram data validation schemas
export const InstagramCommentSchema = z.object({
  id: z.string(),
  text: z.string(),
  ownerUsername: z.string(),
  ownerProfilePicUrl: z.string().optional(),
  timestamp: z.string(),
  likesCount: z.number().default(0),
  repliesCount: z.number().default(0),
  owner: z.object({
    id: z.string(),
    is_verified: z.boolean(),
    profile_pic_url: z.string(),
    username: z.string()
  })
})

export const InstagramPostSchema = z.object({
  inputUrl: z.string(),
  id: z.string(),
  type: z.string(),
  shortCode: z.string(),
  caption: z.string().nullable(),
  hashtags: z.array(z.string()),
  mentions: z.array(z.string()),
  url: z.string(),
  commentsCount: z.number(),
  latestComments: z.array(InstagramCommentSchema),
  dimensionsHeight: z.number().optional(),
  dimensionsWidth: z.number().optional(),
  displayUrl: z.string().optional(),
  images: z.array(z.string()),
  likesCount: z.number(),
  videoPlayCount: z.number().optional(),
  videoViewCount: z.number().optional(),
  timestamp: z.string(),
  locationName: z.string().optional(),
  locationId: z.string().optional(),
  ownerFullName: z.string(),
  ownerUsername: z.string(),
  ownerId: z.string(),
  isSponsored: z.coerce.boolean().default(false),
  isPinned: z.coerce.boolean().default(false),
  isCommentsDisabled: z.coerce.boolean().default(false)
})

export const InstagramDataSchema = z.array(InstagramPostSchema)

// Type exports for use in services
export type RawInstagramData = z.infer<typeof InstagramDataSchema>

export interface InstagramMetrics {
  totalPosts: number
  totalLikes: number
  totalComments: number
  avgEngagementPerPost: number
}

export interface InstagramPostTypeDistribution {
  type: string
  count: number
  percentage: number
}

export interface InstagramHashtagAnalysis {
  tag: string
  count: number
}
