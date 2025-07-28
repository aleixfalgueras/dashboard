import { youtubeRepository } from '@/repositories/youtube-repository'
import {
  YoutubeDataSchema,
  RawYoutubeData,
  YoutubeMetrics,
  YoutubeHashtagAnalysis
} from '@/lib/types/youtube-types'
import { UploadRequestDto } from '@/lib/types/common/upload-types'
import { YoutubeVideo, YoutubeProfile, Prisma } from '@prisma/client'
import { uploadRepository } from '@/repositories/upload-repository'
import { clientService } from './client-service'
import { logger } from "@/lib/utils"
import { analyzeHashtagsGeneric } from './utils-service'

export class YoutubeService {

  async processYoutubeUpload(uploadRequestDto: UploadRequestDto): Promise<void> {
    try {
      // Parse and validate the JSON data
      const parsedData = JSON.parse(uploadRequestDto.jsonData)
      const validatedData = YoutubeDataSchema.parse(parsedData)

      // Get the client by ID
      const client = await clientService.getClientById(uploadRequestDto.clientId)
      if (!client) {
        throw new Error('Client not found')
      }

      // Delete existing videos if overwrite is enabled
      if (uploadRequestDto.overwriteData) {
        await this.deleteYoutubeProfileByClientId(uploadRequestDto.clientId)
      }

      // Find existing YouTube profile or create new one
      const profileId = await this.getYoutubeProfileIdOrCreateFromData(
        client.id,
        validatedData
      )

      // Create videos
      await this.createYoutubeVideosFromData(profileId, validatedData)

      // Store upload metadata
      await uploadRepository.create({
        client: { connect: { id: client.id } },
        filename: uploadRequestDto.fileName
      })

    } catch (error) {
      logger.error('YouTube upload processing error:', error)
      throw error
    }
  }

  async getYoutubeProfileIdOrCreateFromData(
    clientId: string,
    youtubeData: RawYoutubeData
  ): Promise<string> {
    // Check if profile already exists
    const existingProfile = await youtubeRepository.findYoutubeProfileByClientId(clientId)

    // We assume all videos from youtubeData are from the same channel
    const firstVideo = youtubeData[0]

    if (existingProfile) {
      // Update profile with latest stats from first video
      logger.info(`YouTube profile found for clientId ${clientId}: ${existingProfile.id}`)

      if (firstVideo) {
        await youtubeRepository.updateYoutubeProfile(existingProfile.id, {
          channelId: firstVideo.channelId,
          channelName: firstVideo.channelName,
          channelUsername: firstVideo.channelUsername,
          channelUrl: firstVideo.channelUrl,
          channelDescription: firstVideo.channelDescription,
          channelAvatarUrl: firstVideo.channelAvatarUrl,
          channelBannerUrl: firstVideo.channelBannerUrl,
          channelLocation: firstVideo.channelLocation,
          channelJoinedDate: firstVideo.channelJoinedDate,
          numberOfSubscribers: firstVideo.numberOfSubscribers,
          channelTotalVideos: firstVideo.channelTotalVideos,
          channelTotalViews: firstVideo.channelTotalViews,
          isChannelVerified: firstVideo.isChannelVerified
        })
      }
      return existingProfile.id
    }

    // Create new profile if none exists
    logger.info(`Creating YouTube profile for clientId ${clientId}`)

    const profile = await youtubeRepository.createYoutubeProfile({
      client: { connect: { id: clientId } },
      channelId: firstVideo.channelId,
      channelName: firstVideo.channelName,
      channelUsername: firstVideo.channelUsername,
      channelUrl: firstVideo.channelUrl,
      channelDescription: firstVideo.channelDescription,
      channelAvatarUrl: firstVideo.channelAvatarUrl,
      channelBannerUrl: firstVideo.channelBannerUrl,
      channelLocation: firstVideo.channelLocation,
      channelJoinedDate: firstVideo.channelJoinedDate,
      numberOfSubscribers: firstVideo.numberOfSubscribers,
      channelTotalVideos: firstVideo.channelTotalVideos,
      channelTotalViews: firstVideo.channelTotalViews,
      isChannelVerified: firstVideo.isChannelVerified
    })

    logger.info(`YouTube profile created successfully: ${profile.id}`)
    
    return profile.id
  }

  async createYoutubeVideosFromData(
    profileId: string,
    youtubeData: RawYoutubeData
  ): Promise<void> {
    const videosToCreate: Prisma.YoutubeVideoCreateManyInput[] = youtubeData.map(video => ({
      profileId: profileId,
      videoId: video.id,
      title: video.title,
      type: video.type,
      url: video.url,
      thumbnailUrl: video.thumbnailUrl,
      viewCount: video.viewCount,
      likes: video.likes,
      commentsCount: video.commentsCount,
      publishedAt: new Date(video.date),
      duration: video.duration,
      text: video.text,
      location: video.location,
      hashtags: video.hashtags,
      isAgeRestricted: video.isAgeRestricted,
      isMonetized: video.isMonetized,
      isMembersOnly: video.isMembersOnly
    }))

    await youtubeRepository.createManyYoutubeVideos(videosToCreate)
    logger.info(`Created ${videosToCreate.length} YouTube videos`)
  }

  calculateYoutubeMetrics(videos: YoutubeVideo[]): YoutubeMetrics {
    const totalViews = videos.reduce((sum, video) => sum + video.viewCount, 0)
    const totalLikes = videos.reduce((sum, video) => sum + video.likes, 0)
    const totalComments = videos.reduce((sum, video) => sum + video.commentsCount, 0)
    const totalVideos = videos.length
    
    const avgViewsPerVideo = totalVideos > 0 ? totalViews / totalVideos : 0
    const avgLikesPerVideo = totalVideos > 0 ? totalLikes / totalVideos : 0
    const avgCommentsPerVideo = totalVideos > 0 ? totalComments / totalVideos : 0

    // Calculate average engagement per post: (likes + comments) / viewCount for each video, then average
    const avgEngagementPerPost = totalVideos > 0 
      ? videos.reduce((sum, video) => {
          const engagement = video.viewCount > 0 ? (video.likes + video.commentsCount) / video.viewCount : 0
          return sum + engagement
        }, 0) / totalVideos
      : 0

    return {
      totalVideos,
      totalViews,
      totalLikes,
      totalComments,
      avgViewsPerVideo,
      avgLikesPerVideo,
      avgCommentsPerVideo,
      avgEngagementPerPost
    }
  }

  getTopVideos(
    videos: YoutubeVideo[],
    limit: number = 6
  ): YoutubeVideo[] {
    return [...videos]
      .sort((a, b) => (b.viewCount + b.likes + b.commentsCount) - (a.viewCount + a.likes + a.commentsCount))
      .slice(0, limit)
  }

  analyzeHashtags(videos: YoutubeVideo[], limit: number = 10): YoutubeHashtagAnalysis[] {
    return analyzeHashtagsGeneric(videos, limit)
  }

  async deleteYoutubeProfileByClientId(clientId: string): Promise<YoutubeProfile | null> {
    try {
      return await youtubeRepository.deleteYoutubeProfileByClientId(clientId)
    } catch (error) {
      throw error
    }
  }

}

// Export singleton instance
export const youtubeService = new YoutubeService()