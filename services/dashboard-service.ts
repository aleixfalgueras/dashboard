import { clientService } from './client-service'
import { instagramService } from './instagram-service'
import { tiktokService } from './tiktok-service'
import { linkedinService } from './linkedin-service'
import { DashboardData, DatasourcesData, InstagramDashboardData, LinkedinDashboardData, TiktokDashboardData } from '@/lib/types/dashboard-types'
import { AvailableDatasources } from '@/lib/types/common/enums'
import {logger} from "@/lib/utils";

export class DashboardService {
  async getDashboardData(slug: string): Promise<DashboardData | null> {
    const client = await clientService.getClientFullData(slug)
    
    if (!client) {
      return null
    }

    const datasourcesData: DatasourcesData = {}
    const availableDatasources: AvailableDatasources[] = []

    // Check and process Instagram data
    if (client.instagramProfile && client.instagramProfile.posts.length > 0) {
      const instagramData = await this.getInstagramDashboardData(client.instagramProfile)
      if (instagramData) {
        datasourcesData.instagram = instagramData
        availableDatasources.push(AvailableDatasources.INSTAGRAM)
      }
    }

    // Check and process TikTok data
    if (client.tiktokProfile && client.tiktokProfile.posts.length > 0) {
      const tiktokData = await this.getTiktokDashboardData(client.tiktokProfile)
      if (tiktokData) {
        datasourcesData.tiktok = tiktokData
        availableDatasources.push(AvailableDatasources.TIKTOK)
      }
    }

    // Check and process LinkedIn data
    if (client.linkedinProfile && client.linkedinProfile.posts.length > 0) {
      const linkedinData = await this.getLinkedinDashboardData(client.linkedinProfile)
      if (linkedinData) {
        datasourcesData.linkedin = linkedinData
        availableDatasources.push(AvailableDatasources.LINKEDIN)
      }
    }

    // Return null if no datasources have data
    if (availableDatasources.length === 0) {
      return null
    }

    return {
      client,
      datasourcesData: datasourcesData,
      availableDatasources
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

      return {
        profile,
        metrics,
        postTypes,
        topPosts,
        hashtagAnalysis
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

      return {
        profile,
        metrics,
        topPosts,
        hashtagAnalysis
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

      return {
        profile,
        metrics,
        topPosts,
        hashtagAnalysis
      }
    } catch (error) {
      logger.error('Error processing LinkedIn data:', error)
      return null
    }
  }
}

// Export singleton instance
export const dashboardService = new DashboardService()