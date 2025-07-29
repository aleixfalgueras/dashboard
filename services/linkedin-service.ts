import { linkedinRepository } from '@/repositories/linkedin-repository'
import {
  LinkedinDataSchema,
  RawLinkedinData,
  LinkedinMetrics,
  LinkedinHashtagAnalysis,
  LinkedinConsistencyMetrics
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
    
    const avgRepostsPerPost = totalPosts > 0 ? totalReposts / totalPosts : 0

    return {
      totalPosts,
      totalReactions,
      totalComments,
      totalReposts,
      avgRepostsPerPost
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

  private calculatePostingFrequencyConsistency(posts: LinkedinPost[]): number {
    if (posts.length < 7) return 0.5 // Not enough data for weekly analysis
    
    // Group posts by week
    const weeklyPostCounts = new Map<string, number>()
    
    posts.forEach(post => {
      const date = new Date(post.postedAt)
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
    // Weighted combination (adapted for LinkedIn without time pattern analysis)
    const weights = {
      frequency: 0.50,
      dailyRate: 0.30,
      streakStability: 0.20
    }
    
    const normalizedDailyRate = dailyConsistencyRate / 100 // Convert percentage to 0-1
    
    const weightedScore = 
      frequencyConsistency * weights.frequency +
      normalizedDailyRate * weights.dailyRate +
      streakStability * weights.streakStability
    
    // Convert to 0-100 scale and round
    return Math.round(weightedScore * 100)
  }

  calculateConsistencyMetrics(posts: LinkedinPost[]): LinkedinConsistencyMetrics {
    if (posts.length === 0) {
      return {
        activeDays: 0,
        inactiveDays: 0,
        dailyConsistencyRate: 0,
        longestSilence: 0,
        longestActiveStreak: 0,
        consistencyScore: 0
      }
    }

    // Sort posts by posted date
    const sortedPosts = [...posts].sort((a, b) => 
      new Date(a.postedAt).getTime() - new Date(b.postedAt).getTime()
    )

    // Get date range
    const firstPost = new Date(sortedPosts[0].postedAt)
    const lastPost = new Date(sortedPosts[sortedPosts.length - 1].postedAt)
    
    // Calculate total days in range
    const totalDays = Math.ceil((lastPost.getTime() - firstPost.getTime()) / (1000 * 60 * 60 * 24)) + 1

    // Create a Set of unique days with posts
    const activeDaysSet = new Set<string>()
    sortedPosts.forEach(post => {
      const dateStr = new Date(post.postedAt).toISOString().split('T')[0]
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

    // Calculate consistency score components
    const frequencyConsistency = this.calculatePostingFrequencyConsistency(posts)
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