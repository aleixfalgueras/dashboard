import { Client, InstagramProfile, InstagramPost } from '@prisma/client'

// Dashboard metrics
export interface DashboardMetrics {
  totalPosts: number
  totalLikes: number
  totalComments: number
  avgEngagementPerPost: number
}

// Post type distribution
export interface PostTypeDistribution {
  type: string
  count: number
  percentage: number
}


// Hashtag analysis
export interface HashtagAnalysis {
  tag: string
  count: number
}

// Client with full data for dashboard
export interface ClientDashboardData extends Client {
  profile: InstagramProfile & {
    posts: InstagramPost[]
  } | null
}

// Client with guaranteed profile for dashboard pages
export interface DashboardClientWithProfile extends Client {
  profile: InstagramProfile & {
    posts: InstagramPost[]
  }
}

// Dashboard page data
export interface DashboardPageData {
  client: DashboardClientWithProfile
  metrics: DashboardMetrics
  postTypes: PostTypeDistribution[]
  topPosts: InstagramPost[]
  hashtagAnalysis: HashtagAnalysis[]
}
