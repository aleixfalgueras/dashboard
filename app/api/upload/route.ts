import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'
import { z } from 'zod'

// Instagram data validation schemas
const InstagramCommentSchema = z.object({
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

const InstagramPostSchema = z.object({
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

const InstagramDataSchema = z.array(InstagramPostSchema)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const clientName = formData.get('clientName') as string
    const jsonData = formData.get('jsonData') as string

    if (!clientName || !jsonData) {
      return NextResponse.json(
        { error: 'Missing client name or data' },
        { status: 400 }
      )
    }

    // Parse and validate the JSON data
    const parsedData = JSON.parse(jsonData)
    const validatedData = InstagramDataSchema.parse(parsedData)

    // Extract username from the first post's inputUrl
    const firstPost = validatedData[0]
    const urlMatch = firstPost.inputUrl.match(/instagram\.com\/([^\/]+)/)
    const username = urlMatch ? urlMatch[1] : 'unknown'

    // Generate unique slug
    const slug = `${username}_${nanoid(6)}`

    // Create client and process data in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Check if client exists and delete old data
      const existingClient = await tx.client.findFirst({
        where: { username }
      })

      if (existingClient) {
        // Delete existing client and all related data (cascade)
        await tx.client.delete({
          where: { id: existingClient.id }
        })
      }

      // Create new client
      const client = await tx.client.create({
        data: {
          username,
          slug,
        }
      })

      // Create Instagram profile (we'll extract more data later)
      const profile = await tx.instagramProfile.create({
        data: {
          clientId: client.id,
          fullName: firstPost.ownerFullName,
          followersCount: 0, // Would need additional API data
          followingCount: 0, // Would need additional API data
          postsCount: validatedData.length,
        }
      })

      // Create posts and comments
      for (const post of validatedData) {
        const createdPost = await tx.instagramPost.create({
          data: {
            profileId: profile.id,
            postId: post.id,
            type: post.type,
            shortCode: post.shortCode,
            caption: post.caption,
            url: post.url,
            likesCount: post.likesCount,
            commentsCount: post.commentsCount,
            timestamp: new Date(post.timestamp),
            displayUrl: post.displayUrl,
            dimensionsHeight: post.dimensionsHeight,
            dimensionsWidth: post.dimensionsWidth,
            isSponsored: post.isSponsored,
            isPinned: post.isPinned,
            locationName: post.locationName,
            locationId: post.locationId,
            hashtags: post.hashtags,
            mentions: post.mentions,
            images: post.images,
          }
        })

        // Create comments
        for (const comment of post.latestComments) {
          await tx.instagramComment.create({
            data: {
              postId: createdPost.id,
              commentId: comment.id,
              text: comment.text,
              ownerUsername: comment.ownerUsername,
              ownerProfilePic: comment.ownerProfilePicUrl,
              timestamp: new Date(comment.timestamp),
              likesCount: comment.likesCount,
              repliesCount: comment.repliesCount,
              isVerified: comment.owner.is_verified,
            }
          })
        }
      }

      // Store raw upload data
      await tx.upload.create({
        data: {
          clientId: client.id,
          filename: `${clientName}_${new Date().toISOString()}.json`,
          rawData: parsedData,
        }
      })

      return client
    })

    return NextResponse.json({
      success: true,
      slug: result.slug,
      username: result.username
    })

  } catch (error) {
    console.error('Upload error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data format', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process upload' },
      { status: 500 }
    )
  }
}