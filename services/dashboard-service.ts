import { clientService } from './client-service'
import { instagramService } from './instagram-service'
import { DashboardData, DatasourcesData, InstagramDashboardData } from '@/lib/types/dashboard-types'
import { AvailableDatasources } from '@/lib/types/common/enums'

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

    // Future datasources can be added here
    // if (client.twitterProfile) {
    //   const twitterData = await this.getTwitterDashboardData(client.twitterProfile)
    //   if (twitterData) {
    //     datasources.twitter = twitterData
    //     availableDatasources.push('twitter')
    //   }
    // }

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
      console.error('Error processing Instagram data:', error)
      return null
    }
  }
}

// Export singleton instance
export const dashboardService = new DashboardService()