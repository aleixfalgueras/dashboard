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
import {ConsistencyMetrics, HeatmapCell} from "@/lib/types/dashboard-types";

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
          numberOfSubscribers: firstVideo.numberOfSubscribers ?? 0,
          channelTotalVideos: firstVideo.channelTotalVideos ?? 0,
          channelTotalViews: firstVideo.channelTotalViews ?? 0,
          isChannelVerified: firstVideo.isChannelVerified ?? false
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
      numberOfSubscribers: firstVideo.numberOfSubscribers ?? 0,
      channelTotalVideos: firstVideo.channelTotalVideos ?? 0,
      channelTotalViews: firstVideo.channelTotalViews ?? 0,
      isChannelVerified: firstVideo.isChannelVerified ?? false
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
      commentsCount: video.commentsCount ?? 0,
      publishedAt: new Date(video.date),
      duration: video.duration,
      text: video.text,
      location: video.location,
      hashtags: video.hashtags ?? [],
      isAgeRestricted: video.isAgeRestricted ?? false,
      isMonetized: video.isMonetized ?? false,
      isMembersOnly: video.isMembersOnly ?? false
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

  private calculateTimePatternConsistency(heatmapData: HeatmapCell[]): number {
    const nonZeroCells = heatmapData.filter(cell => cell.count > 0)
    if (nonZeroCells.length < 2) return 0.5
    
    // Calculate variance in posting times
    const totalVideos = nonZeroCells.reduce((sum, cell) => sum + cell.count, 0)
    
    // Calculate entropy-based consistency score
    let entropy = 0
    nonZeroCells.forEach(cell => {
      const probability = cell.count / totalVideos
      entropy -= probability * Math.log2(probability)
    })
    
    // Normalize entropy (max entropy for 7 days × 8 time blocks = 56 cells)
    const maxEntropy = Math.log2(56)
    const normalizedEntropy = entropy / maxEntropy
    
    // Lower entropy = more consistent (concentrated posting times)
    return Math.max(0, 1 - normalizedEntropy)
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
    timePatternConsistency: number,
    dailyConsistencyRate: number,
    streakStability: number
  ): number {
    // Weighted combination (restored original weights with time pattern consistency)
    const weights = {
      frequency: 0.40,
      timePattern: 0.25,
      dailyRate: 0.20,
      streakStability: 0.15
    }
    
    const normalizedDailyRate = dailyConsistencyRate / 100 // Convert percentage to 0-1
    
    const weightedScore = 
      frequencyConsistency * weights.frequency +
      timePatternConsistency * weights.timePattern +
      normalizedDailyRate * weights.dailyRate +
      streakStability * weights.streakStability
    
    // Convert to 0-100 scale and round
    return Math.round(weightedScore * 100)
  }

  calculateConsistencyMetrics(videos: YoutubeVideo[]): ConsistencyMetrics {
    if (videos.length === 0) {
      return {
        activeDays: 0,
        inactiveDays: 0,
        dailyConsistencyRate: 0,
        longestSilence: 0,
        longestActiveStreak: 0,
        heatmapData: [],
        consistencyScore: 0
      }
    }

    // Sort videos by published date
    const sortedVideos = [...videos].sort((a, b) => 
      new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime()
    )

    // Get date range
    const firstVideo = new Date(sortedVideos[0].publishedAt)
    const currentDate = new Date()
    
    // Calculate total days from first video to current date
    const totalDays = Math.ceil((currentDate.getTime() - firstVideo.getTime()) / (1000 * 60 * 60 * 24)) + 1

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
    const iterDate = new Date(firstVideo)
    while (iterDate <= currentDate) {
      const dateStr = iterDate.toISOString().split('T')[0]
      allDays.push({
        date: dateStr,
        hasVideo: activeDaysSet.has(dateStr)
      })
      iterDate.setDate(iterDate.getDate() + 1)
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

    // Calculate heatmap data
    const heatmapMap = new Map<string, number>()
    
    // Initialize all cells with 0
    for (let dayOfWeek = 1; dayOfWeek <= 7; dayOfWeek++) {
      for (let hour = 0; hour < 24; hour += 3) {
        const key = `${dayOfWeek}-${hour}`
        heatmapMap.set(key, 0)
      }
    }

    // Count videos for each day/hour combination
    videos.forEach(video => {
      const date = new Date(video.publishedAt)
      // getDay() returns 0 for Sunday, we want 1-7 with Monday as 1
      const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay()
      const hour = date.getHours()
      const hourBlock = Math.floor(hour / 3) * 3
      const key = `${dayOfWeek}-${hourBlock}`
      
      heatmapMap.set(key, (heatmapMap.get(key) || 0) + 1)
    })

    // Convert map to array of cells
    const heatmapData: HeatmapCell[] = []
    for (let dayOfWeek = 1; dayOfWeek <= 7; dayOfWeek++) {
      for (let hourBlock = 0; hourBlock < 24; hourBlock += 3) {
        const key = `${dayOfWeek}-${hourBlock}`
        heatmapData.push({
          dayOfWeek,
          hourBlock,
          count: heatmapMap.get(key) || 0
        })
      }
    }

    // Calculate consistency score components
    const frequencyConsistency = this.calculatePostingFrequencyConsistency(videos)
    const timePatternConsistency = this.calculateTimePatternConsistency(heatmapData)
    const streakStability = this.calculateStreakStability(longestActiveStreak, longestSilence, totalDays)
    const consistencyScore = this.calculateOverallConsistencyScore(
      frequencyConsistency,
      timePatternConsistency,
      dailyConsistencyRate,
      streakStability
    )

    return {
      activeDays,
      inactiveDays,
      dailyConsistencyRate: Number(dailyConsistencyRate.toFixed(2)),
      longestSilence,
      longestActiveStreak,
      heatmapData,
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