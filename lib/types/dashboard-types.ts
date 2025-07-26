import {Client, InstagramPost, InstagramProfile} from '@prisma/client'
import {InstagramHashtagAnalysis, InstagramMetrics, InstagramPostTypeDistribution} from "@/lib/types/instagram-types";
import { AvailableDatasources } from './common/enums'

export interface InstagramDashboardData {
  profile: InstagramProfile & {
    posts: InstagramPost[]
  }
  metrics: InstagramMetrics
  postTypes: InstagramPostTypeDistribution[]
  topPosts: InstagramPost[]
  hashtagAnalysis: InstagramHashtagAnalysis[]
}

// Client with all data relations included
export interface FullClientData extends Client {
  instagramProfile: InstagramProfile & {
    posts: InstagramPost[]
  } | null
}

// Generic datasource interface for future extensibility (e.g. twitter?: TwitterDashboardData)
export interface DatasourcesData {
  instagram?: InstagramDashboardData
}

// Dashboard page data
export interface DashboardData {
  client: FullClientData
  datasourcesData: DatasourcesData
  availableDatasources: AvailableDatasources[]
}
