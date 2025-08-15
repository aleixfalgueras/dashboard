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
import {ConsistencyMetrics, HeatmapCell} from "@/lib/types/dashboard-types";

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
      logger.info(`Processing Instagram posts upload for file: ${uploadRequestDto.fileName}`)
      logger.info(`JSON data length: ${uploadRequestDto.jsonData.length} characters`)
      
      // Parse and validate the JSON data with enhanced error handling
      let parsedData
      try {
        parsedData = JSON.parse(uploadRequestDto.jsonData)
        logger.info(`JSON parsing successful, data type: ${Array.isArray(parsedData) ? 'array with ' + parsedData.length + ' items' : typeof parsedData}`)
      } catch (parseError) {
        logger.error('JSON parsing failed in Instagram service:', {
          error: parseError instanceof Error ? parseError.message : 'Unknown parse error',
          fileName: uploadRequestDto.fileName,
          jsonLength: uploadRequestDto.jsonData.length,
          errorPosition: parseError instanceof SyntaxError ? (parseError as any).pos : 'unknown',
          contextAroundError: parseError instanceof SyntaxError && (parseError as any).pos ? 
            uploadRequestDto.jsonData.slice(Math.max(0, (parseError as any).pos - 50), (parseError as any).pos + 50) : 'unavailable'
        })
        throw new Error(`Instagram JSON parsing failed: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`)
      }
      
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

  /**
   * Calculates posting frequency consistency based on week-to-week posting patterns.
   * 
   * This method analyzes how consistently a user posts across different weeks by:
   * 1. Grouping posts by ISO weeks (Monday-to-Sunday)
   * 2. Calculating the coefficient of variation (CV) of weekly post counts
   * 3. Converting CV to a 0-1 consistency score (lower CV = higher consistency)
   * 
   * @param posts Array of Instagram posts to analyze
   * @returns Consistency score from 0 to 1, where:
   *   - 1.0 = Perfect consistency (same number of posts every week)
   *   - 0.5 = Default for insufficient data (<7 posts or <2 weeks)
   *   - 0.0 = Very inconsistent posting pattern
   * 
   * @example
   * // User posts 3 times every week = high consistency (~1.0)
   * // User posts 10 times one week, 0 the next = low consistency (~0.0)
   * 
   * @algorithm
   * - Uses ISO week standard where Monday is the first day of the week
   * - Employs coefficient of variation: CV = standard_deviation / mean
   * - Transforms CV using: consistency = max(0, 1 - CV)
   * - Week identification uses complex date math: (date.getDay() + 6) % 7
   *   to convert Sunday=0 standard to Monday=0 for ISO weeks
   */
  private calculatePostingFrequencyConsistency(posts: InstagramPost[]): number {
    if (posts.length < 7) return 0.5 // Not enough data for weekly analysis
    
    // Group posts by week
    const weeklyPostCounts = new Map<string, number>()
    
    posts.forEach(post => {
      const date = new Date(post.timestamp)
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
    // CV of 0 = perfect consistency (1.0), CV of 1+ = poor consistency (0.0)
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
    
    // Normalize entropy (max entropy for 56 time slots = log2(56) ≈ 5.8)
    const maxEntropy = Math.log2(56) // 7 days × 8 time slots
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

  calculateConsistencyMetrics(posts: InstagramPost[]): ConsistencyMetrics {
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
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )

    // Get date range
    const firstPost = new Date(sortedPosts[0].timestamp)
    const currentDate = new Date()
    
    // Calculate total days from first post to current date
    const totalDays = Math.ceil((currentDate.getTime() - firstPost.getTime()) / (1000 * 60 * 60 * 24)) + 1

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
    const iterDate = new Date(firstPost)
    while (iterDate <= currentDate) {
      const dateStr = iterDate.toISOString().split('T')[0]
      allDays.push({
        date: dateStr,
        hasPost: activeDaysSet.has(dateStr)
      })
      iterDate.setDate(iterDate.getDate() + 1)
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
      const date = new Date(post.timestamp)
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