import { tiktokRepository } from '@/repositories/tiktok-repository'
import {
  TiktokDataSchema,
  RawTiktokData,
  TiktokMetrics,
  TiktokHashtagAnalysis,
  TiktokConsistencyMetrics
} from '@/lib/types/tiktok-types'
import { HeatmapCell } from '@/lib/types/common/heatmap-types'
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

  private calculatePostingFrequencyConsistency(posts: TiktokPost[]): number {
    if (posts.length < 7) return 0.5 // Not enough data for weekly analysis
    
    // Group posts by week
    const weeklyPostCounts = new Map<string, number>()
    
    posts.forEach(post => {
      const date = new Date(post.createTime)
      // Get Monday of the week as the key (ISO week)
      const monday = new Date(date)
      monday.setDate(date.getDate() - (date.getDay() + 6) % 7)
      const weekKey = monday.toISOString().split('T')[0]
      
      weeklyPostCounts.set(weekKey, (weeklyPostCounts.get(weekKey) || 0) + 1)
    })
    
    const counts = Array.from(weeklyPostCounts.values())
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
    const totalPosts = nonZeroCells.reduce((sum, cell) => sum + cell.count, 0)
    
    // Calculate entropy-based consistency score
    let entropy = 0
    nonZeroCells.forEach(cell => {
      const probability = cell.count / totalPosts
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
    // Weighted combination
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

  calculateConsistencyMetrics(posts: TiktokPost[]): TiktokConsistencyMetrics {
    if (posts.length === 0) {
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

    // Sort posts by timestamp
    const sortedPosts = [...posts].sort((a, b) => 
      new Date(a.createTime).getTime() - new Date(b.createTime).getTime()
    )

    // Get date range
    const firstPost = new Date(sortedPosts[0].createTime)
    const lastPost = new Date(sortedPosts[sortedPosts.length - 1].createTime)
    
    // Calculate total days in range
    const totalDays = Math.ceil((lastPost.getTime() - firstPost.getTime()) / (1000 * 60 * 60 * 24)) + 1

    // Create a Set of unique days with posts
    const activeDaysSet = new Set<string>()
    sortedPosts.forEach(post => {
      const dateStr = new Date(post.createTime).toISOString().split('T')[0]
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

    // Calculate heatmap data
    const heatmapMap = new Map<string, number>()
    
    // Initialize all cells with 0
    for (let dayOfWeek = 1; dayOfWeek <= 7; dayOfWeek++) {
      for (let hour = 0; hour < 24; hour += 3) {
        const key = `${dayOfWeek}-${hour}`
        heatmapMap.set(key, 0)
      }
    }

    // Count posts for each day/hour combination
    posts.forEach(post => {
      const date = new Date(post.createTime)
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
    const frequencyConsistency = this.calculatePostingFrequencyConsistency(posts)
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