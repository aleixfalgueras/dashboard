import { linkedinRepository } from '@/repositories/linkedin-repository'
import {
  LinkedinDataSchema,
  RawLinkedinData,
  LinkedinMetrics,
  LinkedinHashtagAnalysis
} from '@/lib/types/linkedin-types'
import { UploadRequestDto } from '@/lib/types/common/upload-types'
import { LinkedinPost, LinkedinProfile, Prisma } from '@prisma/client'
import { uploadRepository } from '@/repositories/upload-repository'
import { clientService } from './client-service'
import { logger } from "@/lib/utils"

export class LinkedinService {

  async processLinkedInUpload(uploadRequestDto: UploadRequestDto): Promise<void> {
    try {
      // Parse and validate the JSON data
      const parsedData = JSON.parse(uploadRequestDto.jsonData)
      const validatedData = LinkedinDataSchema.parse(parsedData)

      // Get the client by ID
      const client = await clientService.getClientById(uploadRequestDto.clientId)
      if (!client) {
        throw new Error('Client not found')
      }

      // Delete existing posts if overwrite is enabled
      if (uploadRequestDto.overwriteData) {
        await this.deleteLinkedinProfileByClientId(uploadRequestDto.clientId)
      }

      // Find existing LinkedIn profile or create new one
      const profileId = await this.getLinkedinProfileIdOrCreateFromData(
        client.id,
        validatedData
      )

      // Create posts
      await this.createLinkedinPostsFromData(profileId, validatedData)

      // Store upload metadata
      await uploadRepository.create({
        client: { connect: { id: client.id } },
        filename: uploadRequestDto.fileName
      })

    } catch (error) {
      logger.error('LinkedIn upload processing error:', error)
      throw error
    }
  }

  async getLinkedinProfileIdOrCreateFromData(
    clientId: string,
    linkedinData: RawLinkedinData
  ): Promise<string> {
    // Check if profile already exists
    const existingProfile = await linkedinRepository.findLinkedinProfileByClientId(clientId)

    //  We assume all LinkedIn posts from linkedinData are from the same author
    const firstPost = linkedinData[0]

    if (existingProfile) {
      // Update profile with latest data from first post
      logger.info(`LinkedIn profile found for clientId ${clientId}: ${existingProfile.id}`)

      if (firstPost) {
        await linkedinRepository.updateLinkedinProfile(existingProfile.id, {
          firstName: firstPost.author.first_name,
          lastName: firstPost.author.last_name,
          headline: firstPost.author.headline,
          username: firstPost.author.username,
          profileUrl: firstPost.author.profile_url,
          profilePicUrl: firstPost.author.profile_picture
        })
      }
      return existingProfile.id
    }

    // Create new profile if none exists
    logger.info(`Creating LinkedIn profile for clientId ${clientId}`)

    const profile = await linkedinRepository.createLinkedinProfile({
      client: { connect: { id: clientId } },
      firstName: firstPost.author.first_name,
      lastName: firstPost.author.last_name,
      headline: firstPost.author.headline,
      username: firstPost.author.username,
      profileUrl: firstPost.author.profile_url,
      profilePicUrl: firstPost.author.profile_picture
    })

    logger.info(`LinkedIn profile created successfully: ${profile.id}`)
    
    return profile.id
  }

  async createLinkedinPostsFromData(
    profileId: string,
    linkedinData: RawLinkedinData
  ): Promise<void> {
    const postsToCreate: Prisma.LinkedinPostCreateManyInput[] = linkedinData.map(post => ({
      profileId: profileId,
      urn: post.urn,
      fullUrn: post.full_urn,
      postType: post.post_type,
      text: post.text,
      url: post.url,
      postedAt: new Date(post.posted_at.timestamp),
      totalReactions: post.stats.total_reactions,
      likesCount: post.stats.like,
      supportsCount: post.stats.support,
      lovesCount: post.stats.love,
      insightsCount: post.stats.insight,
      celebratesCount: post.stats.celebrate,
      commentsCount: post.stats.comments,
      repostsCount: post.stats.reposts,
      mediaType: post.media?.type,
      mediaUrl: post.media?.url,
      mediaThumbnail: post.media?.thumbnail,
      imageUrls: post.media?.images?.map(img => img.url) || [],
      paginationToken: post.pagination_token
    }))

    await linkedinRepository.createManyLinkedinPosts(postsToCreate)
    logger.info(`Created ${postsToCreate.length} LinkedIn posts`)
  }

  calculateLinkedinMetrics(posts: LinkedinPost[]): LinkedinMetrics {
    const totalReactions = posts.reduce((sum, post) => sum + post.totalReactions, 0)
    const totalComments = posts.reduce((sum, post) => sum + post.commentsCount, 0)
    const totalReposts = posts.reduce((sum, post) => sum + post.repostsCount, 0)
    const totalPosts = posts.length
    
    const avgEngagementPerPost = totalPosts > 0 
      ? (totalReactions + totalComments + totalReposts) / totalPosts 
      : 0

    return {
      totalPosts,
      totalReactions,
      totalComments,
      totalReposts,
      avgEngagementPerPost
    }
  }

  getTopPosts(
    posts: LinkedinPost[],
    limit: number = 6
  ): LinkedinPost[] {
    return [...posts]
      .sort((a, b) => (b.totalReactions + b.commentsCount + b.repostsCount) - (a.totalReactions + a.commentsCount + a.repostsCount))
      .slice(0, limit)
  }

  extractHashtags(text: string): string[] {
    const hashtagRegex = /#\w+/g
    return text?.match(hashtagRegex)?.map(tag => tag.substring(1)) || []
  }

  analyzeHashtags(posts: LinkedinPost[], limit: number = 10): LinkedinHashtagAnalysis[] {
    const hashtagCount: Record<string, number> = {}
    
    posts.forEach(post => {
      if (post.text) {
        const hashtags = this.extractHashtags(post.text)
        hashtags.forEach(tag => {
          hashtagCount[tag] = (hashtagCount[tag] || 0) + 1
        })
      }
    })
    
    return Object.entries(hashtagCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([tag, count]) => ({ tag, count }))
  }

  async deleteLinkedinProfileByClientId(clientId: string): Promise<LinkedinProfile | null> {
    try {
      return await linkedinRepository.deleteLinkedinProfileByClientId(clientId)
    } catch (error) {
      throw error
    }
  }

}

// Export singleton instance
export const linkedinService = new LinkedinService()