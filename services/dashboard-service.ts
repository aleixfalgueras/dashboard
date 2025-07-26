import { clientService } from './client-service'
import { instagramService } from './instagram-service'
import { DashboardPageData, DashboardClientWithProfile } from '@/lib/types/client/dashboard-dto'

export class DashboardService {
  async getDashboardData(slug: string): Promise<DashboardPageData | null> {
    const client = await clientService.getClientDashboardData(slug)
    
    if (!client || !client.profile) {
      return null
    }

    const { posts } = client.profile
    
    const metrics = instagramService.calculateDashboardMetrics(posts)
    const postTypes = instagramService.getPostTypeDistribution(posts)
    const topPosts = instagramService.getTopPosts(posts, 6)
    const hashtagAnalysis = instagramService.analyzeHashtags(posts, 10)

    return {
      client: client as DashboardClientWithProfile, // Safe cast since we checked client.profile exists above
      metrics,
      postTypes,
      topPosts,
      hashtagAnalysis
    }
  }
}

// Export singleton instance
export const dashboardService = new DashboardService()