import { tiktokRepository } from '@/repositories/tiktok-repository'
import {
  TiktokDataSchema,
  RawTiktokData,
  TiktokMetrics,
  TiktokHashtagAnalysis
} from '@/lib/types/tiktok-types'
import { UploadRequestDto } from '@/lib/types/common/upload-types'
import { TiktokPost, TiktokProfile, Prisma } from '@prisma/client'
import { uploadRepository } from '@/repositories/upload-repository'
import { clientService } from './client-service'
import { logger } from "@/lib/utils"
import { analyzeHashtagsGeneric } from './utils-service'

export class TiktokService {

  async processTikTokUpload(uploadRequestDto: UploadRequestDto): Promise<void> {
    try {
      // Parse and validate the JSON data
      const parsedData = JSON.parse(uploadRequestDto.jsonData)
      const validatedData = TiktokDataSchema.parse(parsedData)

      // Get the client by ID
      const client = await clientService.getClientById(uploadRequestDto.clientId)
      if (!client) {
        throw new Error('Client not found')
      }

      // Delete existing posts if overwrite is enabled
      if (uploadRequestDto.overwriteData) {
        await this.deleteTiktokProfileByClientId(uploadRequestDto.clientId)
      }

      // Find existing TikTok profile or create new one
      const profileId = await this.getTiktokProfileIdOrCreateFromData(
        client.id,
        validatedData
      )

      // Create posts
      await this.createTiktokPostsFromData(profileId, validatedData)

      // Store upload metadata
      await uploadRepository.create({
        client: { connect: { id: client.id } },
        filename: uploadRequestDto.fileName
      })

    } catch (error) {
      logger.error('TikTok upload processing error:', error)
      throw error
    }
  }

  async getTiktokProfileIdOrCreateFromData(
    clientId: string,
    tiktokData: RawTiktokData
  ): Promise<string> {
    // Check if profile already exists
    const existingProfile = await tiktokRepository.findTiktokProfileByClientId(clientId)

    //  We assume all tiktoks objects from tiktokData are from the same author
    const firstPost = tiktokData[0]

    if (existingProfile) {
      // Update profile with latest stats from first post
      logger.info(`TikTok profile found for clientId ${clientId}: ${existingProfile.id}`)

      if (firstPost) {
        await tiktokRepository.updateTiktokProfile(existingProfile.id, {
          username: firstPost.authorMeta.name,
          nickname: firstPost.authorMeta.nickName,
          signature: firstPost.authorMeta.signature,
          verified: firstPost.authorMeta.verified,
          fans: firstPost.authorMeta.fans,
          following: firstPost.authorMeta.following,
          friends: firstPost.authorMeta.friends,
          heart: firstPost.authorMeta.heart,
          video: firstPost.authorMeta.video,
          digg: firstPost.authorMeta.digg
        })
      }
      return existingProfile.id
    }

    // Create new profile if none exists
    logger.info(`Creating TikTok profile for clientId ${clientId}`)

    const profile = await tiktokRepository.createTiktokProfile({
      client: { connect: { id: clientId } },
      username: firstPost.authorMeta.name,
      nickname: firstPost.authorMeta.nickName,
      signature: firstPost.authorMeta.signature,
      verified: firstPost.authorMeta.verified,
      fans: firstPost.authorMeta.fans,
      following: firstPost.authorMeta.following,
      friends: firstPost.authorMeta.friends,
      heart: firstPost.authorMeta.heart,
      video: firstPost.authorMeta.video,
      digg: firstPost.authorMeta.digg
    })

    logger.info(`TikTok profile created successfully: ${profile.id}`)
    
    return profile.id
  }

  async createTiktokPostsFromData(
    profileId: string,
    tiktokData: RawTiktokData
  ): Promise<void> {
    const postsToCreate: Prisma.TiktokPostCreateManyInput[] = tiktokData.map(post => ({
      profileId: profileId,
      postId: post.id,
      text: post.text,
      textLanguage: post.textLanguage,
      createTime: new Date(post.createTimeISO),
      isAd: post.isAd,
      webVideoUrl: post.webVideoUrl,
      diggCount: post.diggCount,
      shareCount: post.shareCount,
      playCount: post.playCount,
      collectCount: post.collectCount,
      commentCount: post.commentCount,
      isSlideshow: post.isSlideshow,
      isPinned: post.isPinned,
      isSponsored: post.isSponsored,
      hashtags: post.hashtags.map(h => h.name),
      mentions: post.mentions,
      musicName: post.musicMeta.musicName,
      musicAuthor: post.musicMeta.musicAuthor,
      musicOriginal: post.musicMeta.musicOriginal,
      videoDuration: post.videoMeta.duration,
      videoHeight: post.videoMeta.height,
      videoWidth: post.videoMeta.width,
      videoCoverUrl: post.videoMeta.coverUrl,
      videoDefinition: post.videoMeta.definition,
      videoFormat: post.videoMeta.format
    }))

    await tiktokRepository.createManyTiktokPosts(postsToCreate)
    logger.info(`Created ${postsToCreate.length} TikTok posts`)
  }

  calculateTiktokMetrics(posts: TiktokPost[]): TiktokMetrics {
    const totalDiggs = posts.reduce((sum, post) => sum + post.diggCount, 0)
    const totalShares = posts.reduce((sum, post) => sum + post.shareCount, 0)
    const totalPlays = posts.reduce((sum, post) => sum + post.playCount, 0)
    const totalComments = posts.reduce((sum, post) => sum + post.commentCount, 0)
    const totalPosts = posts.length
    
    // Calculate engagement rate per post: (diggCount + commentCount + shareCount + collectCount) / playCount
    // Then take the average of these individual engagement rates
    const engagementRates = posts
      .filter(post => post.playCount > 0) // Avoid division by zero
      .map(post => (post.diggCount + post.commentCount + post.shareCount + post.collectCount) / post.playCount)
    
    const avgEngagementPerPost = engagementRates.length > 0 
      ? engagementRates.reduce((sum, rate) => sum + rate, 0) / engagementRates.length
      : 0

    return {
      totalPosts,
      totalDiggs,
      totalShares,
      totalPlays,
      totalComments,
      avgEngagementPerPost
    }
  }

  getTopPosts(
    posts: TiktokPost[],
    limit: number = 6
  ): TiktokPost[] {
    return [...posts]
      .sort((a, b) => (b.diggCount + b.shareCount + b.commentCount) - (a.diggCount + a.shareCount + a.commentCount))
      .slice(0, limit)
  }

  analyzeHashtags(posts: TiktokPost[], limit: number = 10): TiktokHashtagAnalysis[] {
    return analyzeHashtagsGeneric(posts, limit)
  }

  async deleteTiktokProfileByClientId(clientId: string): Promise<TiktokProfile | null> {
    try {
      return await tiktokRepository.deleteTiktokProfileByClientId(clientId)
    } catch (error) {
      throw error
    }
  }

}

// Export singleton instance
export const tiktokService = new TiktokService()