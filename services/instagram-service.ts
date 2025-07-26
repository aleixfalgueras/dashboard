import { instagramRepository } from '@/repositories/instagram-repository'
import {
  RawInstagramData,
  InstagramDataSchema,
  InstagramHashtagAnalysis,
  InstagramPostTypeDistribution,
  InstagramMetrics
} from '@/lib/types/instagram-types'
import { UploadRequestDto } from '@/lib/types/common/upload-types'
import { Prisma, InstagramPost } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { uploadRepository } from '@/repositories/upload-repository'
import { clientService } from './client-service'
import { z } from 'zod'

export class InstagramService {

  async processInstagramContentUpload(uploadRequestDto: UploadRequestDto): Promise<boolean> {
    try {
      // Parse and validate the JSON data
      const parsedData = JSON.parse(uploadRequestDto.jsonData)
      const validatedData = InstagramDataSchema.parse(parsedData)

      // Get the client by ID
      const client = await clientService.getClientById(uploadRequestDto.clientId)
      if (!client) {
        throw new Error('Client not found')
      }

      // Process in a transaction
      await prisma.$transaction(async () => {
        // Find existing Instagram profile or create new one
        const profileId = await this.getInstagramProfileOrCreateFromData(
          client.id, 
          validatedData
        )

        // Create posts and comments
        await this.createInstagramPostsFromData(profileId, validatedData)

        // Store raw upload data
        await uploadRepository.create({
          client: { connect: { id: client.id } },
          filename: `${client.name}_${new Date().toISOString()}.json`,
          rawData: parsedData
        })
      })

      return true
    } catch (error) {
      console.error('Instagram upload processing error:', error)
      
      if (error instanceof z.ZodError) {
        throw new Error(`Invalid data format: ${error.issues[0]?.message || 'Unknown validation error'}`)
      }
      
      throw error
    }
  }

  async getInstagramProfileOrCreateFromData(
    clientId: string, 
    instagramData: RawInstagramData
  ): Promise<string> {
    // Check if profile already exists
    const existingProfile = await instagramRepository.findInstagramProfileByClientId(clientId)
    
    if (existingProfile) {
      return existingProfile.id
    }
    
    // Create new profile if none exists
    const firstPost = instagramData[0]
    
    const profile = await instagramRepository.createInstagramProfile({
      client: { connect: { id: clientId } },
      username: firstPost.ownerUsername,
      fullName: firstPost.ownerFullName,
      followersCount: 0, // Would need additional API data
      followingCount: 0, // Would need additional API data
      postsCount: instagramData.length
    })
    
    return profile.id
  }

  async createInstagramPostsFromData(
    profileId: string,
    instagramData: RawInstagramData
  ): Promise<void> {
    const postsToCreate = instagramData.map(post => ({
      post: {
        profile: { connect: { id: profileId } },
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
        images: post.images
      } as Prisma.InstagramPostCreateInput,
      comments: post.latestComments.map(comment => ({
        commentId: comment.id,
        text: comment.text,
        ownerUsername: comment.ownerUsername,
        ownerProfilePic: comment.ownerProfilePicUrl,
        timestamp: new Date(comment.timestamp),
        likesCount: comment.likesCount,
        repliesCount: comment.repliesCount,
        isVerified: comment.owner.is_verified
      } as Prisma.InstagramCommentCreateManyInput))
    }))

    await instagramRepository.createInstagramPostsWithComments(postsToCreate)
  }

  calculateInstagramMetrics(posts: InstagramPost[]): InstagramMetrics {
    const totalLikes = posts.reduce((sum, post) => sum + post.likesCount, 0)
    const totalComments = posts.reduce((sum, post) => sum + post.commentsCount, 0)
    const totalPosts = posts.length
    
    const avgEngagementPerPost = totalPosts > 0 
      ? (totalLikes + totalComments) / totalPosts 
      : 0

    return {
      totalPosts,
      totalLikes,
      totalComments,
      avgEngagementPerPost
    }
  }

  getPostTypeDistribution(posts: InstagramPost[]): InstagramPostTypeDistribution[] {
    const distribution = posts.reduce((acc, post) => {
      acc[post.type] = (acc[post.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(distribution).map(([type, count]) => ({
      type,
      count,
      percentage: (count / posts.length) * 100
    }))
  }

  getTopPosts(
    posts: InstagramPost[],
    limit: number = 6
  ): InstagramPost[] {
    return [...posts]
      .sort((a, b) => (b.likesCount + b.commentsCount) - (a.likesCount + a.commentsCount))
      .slice(0, limit)
  }

  analyzeHashtags(posts: InstagramPost[], limit: number = 10): InstagramHashtagAnalysis[] {
    const hashtagCount: Record<string, number> = {}
    
    posts.forEach(post => {
      post.hashtags.forEach((tag: string) => {
        hashtagCount[tag] = (hashtagCount[tag] || 0) + 1
      })
    })
    
    return Object.entries(hashtagCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([tag, count]) => ({ tag, count }))
  }
}

// Export singleton instance
export const instagramService = new InstagramService()