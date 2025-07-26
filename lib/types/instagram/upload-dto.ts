import { z } from 'zod'

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
  timestamp: z.string(),
  locationName: z.string().optional(),
  locationId: z.string().optional(),
  ownerFullName: z.string(),
  ownerUsername: z.string(),
  ownerId: z.string(),
  isSponsored: z.boolean(),
  isPinned: z.boolean(),
  isCommentsDisabled: z.boolean()
})

export const InstagramDataSchema = z.array(InstagramPostSchema)

// Type exports for use in services
export type RawInstagramComment = z.infer<typeof InstagramCommentSchema>
export type RawInstagramPost = z.infer<typeof InstagramPostSchema>
export type RawInstagramData = z.infer<typeof InstagramDataSchema>

// Upload processing result
export interface UploadProcessingResult {
  success: boolean
  slug: string
  username: string
}

// Upload request DTO
export interface UploadRequestDto {
  clientName: string
  jsonData: string
}