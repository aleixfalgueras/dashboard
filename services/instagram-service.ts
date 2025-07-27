import {instagramRepository} from '@/repositories/instagram-repository'
import {
  InstagramDataSchema,
  InstagramHashtagAnalysis,
  InstagramMetrics,
  InstagramPostTypeDistribution,
  InstagramProfileDataSchema,
  RawInstagramData
} from '@/lib/types/instagram-types'
import {UploadRequestDto} from '@/lib/types/common/upload-types'
import {InstagramPost, InstagramProfile, Prisma} from '@prisma/client'
import {uploadRepository} from '@/repositories/upload-repository'
import {clientService} from './client-service'
import {logger} from "@/lib/utils"
import { analyzeHashtagsGeneric } from './utils-service'

export class InstagramService {

  async processInstagramProfileUpload(uploadRequestDto: UploadRequestDto): Promise<void> {
    try {
      // Parse and validate the JSON data
      const parsedData = JSON.parse(uploadRequestDto.jsonData)
      const validatedData = InstagramProfileDataSchema.parse(parsedData)

      // Get the client by ID
      const client = await clientService.getClientById(uploadRequestDto.clientId)
      if (!client) {
        throw new Error('Client not found')
      }

      // Process profile data (should be array with single profile)
      const profileData = validatedData[0]
      if (!profileData) {
        throw new Error('No profile data found')
      }

      // Check if profile already exists for this client
      const existingProfile = await instagramRepository.findInstagramProfileByClientId(uploadRequestDto.clientId)
      
      if (existingProfile) {
        if (uploadRequestDto.overwriteData) {
          // Update existing profile
          await instagramRepository.updateInstagramProfile(existingProfile.id, {
            username: profileData.username,
            fullName: profileData.fullName,
            followersCount: profileData.followersCount,
            followingCount: profileData.followsCount,
            postsCount: profileData.postsCount,
            bio: profileData.biography,
            profilePicUrl: profileData.profilePicUrl,
            isVerified: profileData.verified
          })
          logger.info(`Instagram profile updated for clientId ${uploadRequestDto.clientId}`)
        } else {
          logger.info(`Instagram profile already exists for clientId ${uploadRequestDto.clientId}, skipping update`)
        }
      } else {
        // Create new profile
        await instagramRepository.createInstagramProfile({
          client: { connect: { id: uploadRequestDto.clientId } },
          username: profileData.username,
          fullName: profileData.fullName,
          followersCount: profileData.followersCount,
          followingCount: profileData.followsCount,
          postsCount: profileData.postsCount,
          bio: profileData.biography,
          profilePicUrl: profileData.profilePicUrl,
          isVerified: profileData.verified
        })
        logger.info(`Instagram profile created for clientId ${uploadRequestDto.clientId}`)
      }

      // Store upload metadata
      await uploadRepository.create({
        client: { connect: { id: client.id } },
        filename: uploadRequestDto.fileName
      })

    } catch (error) {
      logger.error('Instagram profile upload processing error:', error)
      throw error
    }
  }

  async processInstagramContentUpload(uploadRequestDto: UploadRequestDto): Promise<void> {
    try {
      // Parse and validate the JSON data
      const parsedData = JSON.parse(uploadRequestDto.jsonData)
      const validatedData = InstagramDataSchema.parse(parsedData)

      // Get the client by ID
      const client = await clientService.getClientById(uploadRequestDto.clientId)
      if (!client) {
        throw new Error('Client not found')
      }

      // Delete existing posts if overwrite is enabled
      if (uploadRequestDto.overwriteData) {
        await this.deleteInstagramPostsByClientId(uploadRequestDto.clientId)
      }

      // Find existing Instagram profile or create new one
      const profileId = await this.getInstagramProfileIdOrCreateFromData(
        client.id, 
        validatedData
      )

      // Create posts and comments
      await this.createInstagramPostsFromData(profileId, validatedData)

      // Store upload metadata
      await uploadRepository.create({
        client: { connect: { id: client.id } },
        filename: uploadRequestDto.fileName
      })

    } catch (error) {
      logger.error('Instagram upload processing error:', error)
      throw error
    }
  }

  async getInstagramProfileIdOrCreateFromData(
    clientId: string, 
    instagramData: RawInstagramData
  ): Promise<string> {
    // Check if profile already exists
    const existingProfile = await instagramRepository.findInstagramProfileByClientId(clientId)
    
    if (existingProfile) {
      logger.info(`Instagram profile found for clientId ${clientId}: ${existingProfile}`)
      return existingProfile.id
    }

    logger.info(`Creating Instagram profile for clientId ${clientId}`)
    
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

    logger.info(`Instagram profile created successfully: ${profile}`)
    
    return profile.id
  }

  async createInstagramPostsFromData(
    profileId: string,
    instagramData: RawInstagramData
  ): Promise<void> {
    const postsToCreate = instagramData.map(post => ({
      post: {
        profileId: profileId,
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
      } as Prisma.InstagramPostCreateManyInput,
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
    return analyzeHashtagsGeneric(posts, limit)
  }

  async deleteInstagramProfileByClientId(clientId: string): Promise<InstagramProfile | null> {
    try {
      return await instagramRepository.deleteInstagramProfileByClientId(clientId)
    } catch (error) {
      throw error
    }
  }

  async deleteInstagramPostsByClientId(clientId: string): Promise<number> {
    try {
      return await instagramRepository.deleteInstagramPostsByClientId(clientId)
    } catch (error) {
      throw error
    }
  }
}

// Export singleton instance
export const instagramService = new InstagramService()