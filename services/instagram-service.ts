import {instagramRepository} from '@/repositories/instagram-repository'
import {
  InstagramDataSchema,
  InstagramHashtagAnalysis,
  InstagramMetrics,
  InstagramPostTypeDistribution,
  InstagramProfileDataSchema,
  RawInstagramData,
  InstagramConsistencyMetrics
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

  async processInstagramPostsUpload(uploadRequestDto: UploadRequestDto): Promise<void> {
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
        videoPlayCount: post.videoPlayCount,
        videoViewCount: post.videoViewCount,
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
    
    // Calculate avgEngagementPerPost only for video posts using videoPlayCount
    const videoPosts = posts.filter(post => post.type === "Video")
    const validVideoPosts = videoPosts.filter(post => post.videoPlayCount && post.videoPlayCount > 0)
    
    const avgEngagementPerPost = validVideoPosts.length > 0
      ? validVideoPosts.reduce((sum, post) => {
          const engagement = (post.likesCount + post.commentsCount) / post.videoPlayCount!
          return sum + engagement
        }, 0) / validVideoPosts.length
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

  calculateConsistencyMetrics(posts: InstagramPost[]): InstagramConsistencyMetrics {
    if (posts.length === 0) {
      return {
        activeDays: 0,
        inactiveDays: 0,
        dailyConsistencyRate: 0,
        longestSilence: 0,
        longestActiveStreak: 0
      }
    }

    // Sort posts by timestamp
    const sortedPosts = [...posts].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )

    // Get date range
    const firstPost = new Date(sortedPosts[0].timestamp)
    const lastPost = new Date(sortedPosts[sortedPosts.length - 1].timestamp)
    
    // Calculate total days in range
    const totalDays = Math.ceil((lastPost.getTime() - firstPost.getTime()) / (1000 * 60 * 60 * 24)) + 1

    // Create a Set of unique days with posts
    const activeDaysSet = new Set<string>()
    sortedPosts.forEach(post => {
      const dateStr = new Date(post.timestamp).toISOString().split('T')[0]
      activeDaysSet.add(dateStr)
    })

    const activeDays = activeDaysSet.size
    const inactiveDays = totalDays - activeDays
    const dailyConsistencyRate = (activeDays / totalDays) * 100

    // Calculate streaks
    const allDays = []
    const currentDate = new Date(firstPost)
    while (currentDate <= lastPost) {
      const dateStr = currentDate.toISOString().split('T')[0]
      allDays.push({
        date: dateStr,
        hasPost: activeDaysSet.has(dateStr)
      })
      currentDate.setDate(currentDate.getDate() + 1)
    }

    // Find longest silence (consecutive days without posts)
    let longestSilence = 0
    let currentSilence = 0
    
    // Find longest active streak (consecutive days with posts)
    let longestActiveStreak = 0
    let currentActiveStreak = 0

    allDays.forEach(day => {
      if (day.hasPost) {
        currentActiveStreak++
        longestActiveStreak = Math.max(longestActiveStreak, currentActiveStreak)
        currentSilence = 0
      } else {
        currentSilence++
        longestSilence = Math.max(longestSilence, currentSilence)
        currentActiveStreak = 0
      }
    })

    return {
      activeDays,
      inactiveDays,
      dailyConsistencyRate: Number(dailyConsistencyRate.toFixed(2)),
      longestSilence,
      longestActiveStreak
    }
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