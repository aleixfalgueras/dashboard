import { clientService } from './client-service'
import { instagramService } from './instagram-service'
import { tiktokService } from './tiktok-service'
import { linkedinService } from './linkedin-service'
import { youtubeService } from './youtube-service'
import { DashboardData, DatasourcesData, GeneralMetrics, InstagramDashboardData, LinkedinDashboardData, TiktokDashboardData, YoutubeDashboardData } from '@/lib/types/dashboard-types'
import { AvailableDatasources } from '@/lib/types/common/enums'
import {logger} from "@/lib/utils";

export class DashboardService {
  async getDashboardData(slug: string): Promise<DashboardData | null> {
    const client = await clientService.getClientFullData(slug, undefined)
    
    if (!client) {
      return null
    }

    // If client has a statsDataStartDate, fetch filtered data
    if (client.statsDataStartDate) {
      logger.info(`Calculating stats from ${client.statsDataStartDate} on`)

      const filteredClient = await clientService.getClientFullData(slug, client.statsDataStartDate)
      if (!filteredClient) {
        return null
      }
      // Use the filtered client data for dashboard calculations
      return this.processDashboardData(filteredClient)
    }

    // Otherwise use all data
    return this.processDashboardData(client)
  }

  private async processDashboardData(fullClientData: NonNullable<Awaited<ReturnType<typeof clientService.getClientFullData>>>): Promise<DashboardData | null> {

    const datasourcesData: DatasourcesData = {}
    const availableDatasources: AvailableDatasources[] = []

    // Check and process Instagram data
    if (fullClientData.instagramProfile && fullClientData.instagramProfile.posts.length > 0) {
      const instagramData = await this.getInstagramDashboardData(fullClientData.instagramProfile)
      if (instagramData) {
        datasourcesData.instagram = instagramData
        availableDatasources.push(AvailableDatasources.INSTAGRAM)
      }
    }

    // Check and process TikTok data
    if (fullClientData.tiktokProfile && fullClientData.tiktokProfile.posts.length > 0) {
      const tiktokData = await this.getTiktokDashboardData(fullClientData.tiktokProfile)
      if (tiktokData) {
        datasourcesData.tiktok = tiktokData
        availableDatasources.push(AvailableDatasources.TIKTOK)
      }
    }

    // Check and process LinkedIn data
    if (fullClientData.linkedinProfile && fullClientData.linkedinProfile.posts.length > 0) {
      const linkedinData = await this.getLinkedinDashboardData(fullClientData.linkedinProfile)
      if (linkedinData) {
        datasourcesData.linkedin = linkedinData
        availableDatasources.push(AvailableDatasources.LINKEDIN)
      }
    }

    // Check and process YouTube data
    if (fullClientData.youtubeProfile && fullClientData.youtubeProfile.videos.length > 0) {
      const youtubeData = await this.getYoutubeDashboardData(fullClientData.youtubeProfile)
      if (youtubeData) {
        datasourcesData.youtube = youtubeData
        availableDatasources.push(AvailableDatasources.YOUTUBE)
      }
    }

    // Return null if no datasources have data
    if (availableDatasources.length === 0) {
      return null
    }

    const generalMetrics = this.calculateGeneralMetrics(datasourcesData)

    return {
      client: fullClientData,
      datasourcesData: datasourcesData,
      availableDatasources,
      generalMetrics
    }
  }

  private async getInstagramDashboardData(
    profile: NonNullable<DashboardData['client']['instagramProfile']>
  ): Promise<InstagramDashboardData | null> {
    try {
      const metrics = instagramService.calculateInstagramMetrics(profile.posts)
      const postTypes = instagramService.getPostTypeDistribution(profile.posts)
      const topPosts = instagramService.getTopPosts(profile.posts, 6)
      const hashtagAnalysis = instagramService.analyzeHashtags(profile.posts, 10)
      const consistencyMetrics = instagramService.calculateConsistencyMetrics(profile.posts)

      return {
        profile,
        metrics,
        postTypes,
        topPosts,
        hashtagAnalysis,
        consistencyMetrics
      }
    } catch (error) {
      logger.error('Error processing Instagram data:', error)
      return null
    }
  }

  private async getTiktokDashboardData(
    profile: NonNullable<DashboardData['client']['tiktokProfile']>
  ): Promise<TiktokDashboardData | null> {
    try {
      const metrics = tiktokService.calculateTiktokMetrics(profile.posts)
      const topPosts = tiktokService.getTopPosts(profile.posts, 6)
      const hashtagAnalysis = tiktokService.analyzeHashtags(profile.posts, 10)
      const consistencyMetrics = tiktokService.calculateConsistencyMetrics(profile.posts)

      return {
        profile,
        metrics,
        topPosts,
        hashtagAnalysis,
        consistencyMetrics
      }
    } catch (error) {
      logger.error('Error processing TikTok data:', error)
      return null
    }
  }

  private async getLinkedinDashboardData(
    profile: NonNullable<DashboardData['client']['linkedinProfile']>
  ): Promise<LinkedinDashboardData | null> {
    try {
      const metrics = linkedinService.calculateLinkedinMetrics(profile.posts)
      const topPosts = linkedinService.getTopPosts(profile.posts, 6)
      const hashtagAnalysis = linkedinService.analyzeHashtags(profile.posts, 10)
      const consistencyMetrics = linkedinService.calculateConsistencyMetrics(profile.posts)

      return {
        profile,
        metrics,
        topPosts,
        hashtagAnalysis,
        consistencyMetrics
      }
    } catch (error) {
      logger.error('Error processing LinkedIn data:', error)
      return null
    }
  }

  private async getYoutubeDashboardData(
    profile: NonNullable<DashboardData['client']['youtubeProfile']>
  ): Promise<YoutubeDashboardData | null> {
    try {
      const metrics = youtubeService.calculateYoutubeMetrics(profile.videos)
      const topVideos = youtubeService.getTopVideos(profile.videos, 6)
      const hashtagAnalysis = youtubeService.analyzeHashtags(profile.videos, 10)
      const consistencyMetrics = youtubeService.calculateConsistencyMetrics(profile.videos)

      return {
        profile,
        metrics,
        topVideos,
        hashtagAnalysis,
        consistencyMetrics
      }
    } catch (error) {
      logger.error('Error processing YouTube data:', error)
      return null
    }
  }

  private calculateGeneralMetrics(datasourcesData: DatasourcesData): GeneralMetrics {
    let totalFollowers = 0
    let totalViews = 0
    let totalVideoCount = 0
    let totalEngagement = 0
    let totalConsistencyScore = 0
    let consistencyDatasourcesCount = 0

    // Instagram followers and video posts
    if (datasourcesData.instagram) {
      const { profile, consistencyMetrics } = datasourcesData.instagram
      totalFollowers += profile.followersCount || 0

      // Add consistency score
      if (consistencyMetrics && consistencyMetrics.consistencyScore !== undefined) {
        totalConsistencyScore += consistencyMetrics.consistencyScore
        consistencyDatasourcesCount++
      }

      // Only count video posts for views and engagement
      const videoPosts = profile.posts.filter(post => post.type === "Video")
      videoPosts.forEach(post => {
        if (post.videoPlayCount && post.videoPlayCount > 0) {
          totalViews += post.videoPlayCount
          totalVideoCount++
          totalEngagement += (post.likesCount || 0) + (post.commentsCount || 0)
        }
      })
    }

    // TikTok followers and posts (all are videos)
    if (datasourcesData.tiktok) {
      const { profile, consistencyMetrics } = datasourcesData.tiktok
      totalFollowers += profile.fans || 0

      // Add consistency score
      if (consistencyMetrics && consistencyMetrics.consistencyScore !== undefined) {
        totalConsistencyScore += consistencyMetrics.consistencyScore
        consistencyDatasourcesCount++
      }

      profile.posts.forEach(post => {
        if (post.playCount && post.playCount > 0) {
          totalViews += post.playCount
          totalVideoCount++
          totalEngagement += (post.diggCount || 0) + (post.commentCount || 0) + (post.shareCount || 0)
        }
      })
    }

    // LinkedIn followers and posts
    if (datasourcesData.linkedin) {
      const { consistencyMetrics } = datasourcesData.linkedin

      // Add consistency score
      if (consistencyMetrics && consistencyMetrics.consistencyScore !== undefined) {
        totalConsistencyScore += consistencyMetrics.consistencyScore
        consistencyDatasourcesCount++
      }
    }

    // YouTube followers and videos
    if (datasourcesData.youtube) {
      const { profile, consistencyMetrics } = datasourcesData.youtube
      totalFollowers += profile.numberOfSubscribers || 0

      // Add consistency score
      if (consistencyMetrics && consistencyMetrics.consistencyScore !== undefined) {
        totalConsistencyScore += consistencyMetrics.consistencyScore
        consistencyDatasourcesCount++
      }

      profile.videos.forEach(video => {
        if (video.viewCount && video.viewCount > 0) {
          totalViews += video.viewCount
          totalVideoCount++
          totalEngagement += (video.likes || 0) + (video.commentsCount || 0)
        }
      })
    }

    const avgViews = totalVideoCount > 0 ? Math.round(totalViews / totalVideoCount) : 0
    const globalAvgEngagement = totalViews > 0 ? Number((totalEngagement / totalViews * 100).toFixed(2)) : 0
    const avgConsistencyScore = consistencyDatasourcesCount > 0 ? Math.round(totalConsistencyScore / consistencyDatasourcesCount) : 0

    return {
      totalFollowers,
      avgViews,
      globalAvgEngagement,
      avgConsistencyScore
    }
  }
}

// Export singleton instance
export const dashboardService = new DashboardService()