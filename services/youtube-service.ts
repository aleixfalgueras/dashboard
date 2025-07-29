import { youtubeRepository } from '@/repositories/youtube-repository'
import {
  YoutubeDataSchema,
  RawYoutubeData,
  YoutubeMetrics,
  YoutubeHashtagAnalysis,
  YoutubeConsistencyMetrics
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

  private calculatePostingFrequencyConsistency(videos: YoutubeVideo[]): number {
    if (videos.length < 7) return 0.5 // Not enough data for weekly analysis
    
    // Group videos by week
    const weeklyVideoCounts = new Map<string, number>()
    
    videos.forEach(video => {
      const date = new Date(video.publishedAt)
      // Get Monday of the week as the key (ISO week)
      const monday = new Date(date)
      monday.setDate(date.getDate() - (date.getDay() + 6) % 7)
      const weekKey = monday.toISOString().split('T')[0]
      
      weeklyVideoCounts.set(weekKey, (weeklyVideoCounts.get(weekKey) || 0) + 1)
    })
    
    const counts = Array.from(weeklyVideoCounts.values())
    if (counts.length < 2) return 0.5
    
    // Calculate coefficient of variation (CV = std_dev / mean)
    const mean = counts.reduce((sum, count) => sum + count, 0) / counts.length
    const variance = counts.reduce((sum, count) => sum + Math.pow(count - mean, 2), 0) / counts.length
    const stdDev = Math.sqrt(variance)
    const cv = mean > 0 ? stdDev / mean : 1
    
    // Convert CV to 0-1 scale (lower CV = higher consistency)
    return Math.max(0, 1 - cv)
  }

  private calculateStreakStability(longestActiveStreak: number, longestSilence: number, totalDays: number): number {
    if (totalDays === 0) return 0
    
    // Ideal scenario: moderate active streaks, minimal silence periods
    const activeStreakRatio = longestActiveStreak / totalDays
    const silenceRatio = longestSilence / totalDays
    
    // Penalize both very short streaks and very long silences
    const streakScore = Math.min(1, activeStreakRatio * 2) // Reward longer active streaks up to 50% of total days
    const silenceScore = Math.max(0, 1 - silenceRatio * 3) // Heavily penalize long silences
    
    return (streakScore + silenceScore) / 2
  }

  private calculateOverallConsistencyScore(
    frequencyConsistency: number,
    dailyConsistencyRate: number,
    streakStability: number
  ): number {
    // Weighted combination (adjusted weights since no time pattern consistency for YouTube)
    const weights = {
      frequency: 0.50,      // Increased from 0.40
      dailyRate: 0.30,      // Increased from 0.20  
      streakStability: 0.20 // Increased from 0.15
    }
    
    const normalizedDailyRate = dailyConsistencyRate / 100 // Convert percentage to 0-1
    
    const weightedScore = 
      frequencyConsistency * weights.frequency +
      normalizedDailyRate * weights.dailyRate +
      streakStability * weights.streakStability
    
    // Convert to 0-100 scale and round
    return Math.round(weightedScore * 100)
  }

  calculateConsistencyMetrics(videos: YoutubeVideo[]): YoutubeConsistencyMetrics {
    if (videos.length === 0) {
      return {
        activeDays: 0,
        inactiveDays: 0,
        dailyConsistencyRate: 0,
        longestSilence: 0,
        longestActiveStreak: 0,
        consistencyScore: 0
      }
    }

    // Sort videos by published date
    const sortedVideos = [...videos].sort((a, b) => 
      new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime()
    )

    // Get date range
    const firstVideo = new Date(sortedVideos[0].publishedAt)
    const lastVideo = new Date(sortedVideos[sortedVideos.length - 1].publishedAt)
    
    // Calculate total days in range
    const totalDays = Math.ceil((lastVideo.getTime() - firstVideo.getTime()) / (1000 * 60 * 60 * 24)) + 1

    // Create a Set of unique days with videos
    const activeDaysSet = new Set<string>()
    sortedVideos.forEach(video => {
      const dateStr = new Date(video.publishedAt).toISOString().split('T')[0]
      activeDaysSet.add(dateStr)
    })

    const activeDays = activeDaysSet.size
    const inactiveDays = totalDays - activeDays
    const dailyConsistencyRate = (activeDays / totalDays) * 100

    // Calculate streaks
    const allDays = []
    const currentDate = new Date(firstVideo)
    while (currentDate <= lastVideo) {
      const dateStr = currentDate.toISOString().split('T')[0]
      allDays.push({
        date: dateStr,
        hasVideo: activeDaysSet.has(dateStr)
      })
      currentDate.setDate(currentDate.getDate() + 1)
    }

    // Find longest silence (consecutive days without videos)
    let longestSilence = 0
    let currentSilence = 0
    
    // Find longest active streak (consecutive days with videos)
    let longestActiveStreak = 0
    let currentActiveStreak = 0

    allDays.forEach(day => {
      if (day.hasVideo) {
        currentActiveStreak++
        longestActiveStreak = Math.max(longestActiveStreak, currentActiveStreak)
        currentSilence = 0
      } else {
        currentSilence++
        longestSilence = Math.max(longestSilence, currentSilence)
        currentActiveStreak = 0
      }
    })

    // Calculate consistency score components
    const frequencyConsistency = this.calculatePostingFrequencyConsistency(videos)
    const streakStability = this.calculateStreakStability(longestActiveStreak, longestSilence, totalDays)
    const consistencyScore = this.calculateOverallConsistencyScore(
      frequencyConsistency,
      dailyConsistencyRate,
      streakStability
    )

    return {
      activeDays,
      inactiveDays,
      dailyConsistencyRate: Number(dailyConsistencyRate.toFixed(2)),
      longestSilence,
      longestActiveStreak,
      consistencyScore
    }
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