import {Client, InstagramPost, InstagramProfile, TiktokPost, TiktokProfile} from '@prisma/client'
import {InstagramHashtagAnalysis, InstagramMetrics, InstagramPostTypeDistribution} from "@/lib/types/instagram-types";
import {TiktokHashtagAnalysis, TiktokMetrics} from "@/lib/types/tiktok-types";
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

export interface TiktokDashboardData {
  profile: TiktokProfile & {
    posts: TiktokPost[]
  }
  metrics: TiktokMetrics
  topPosts: TiktokPost[]
  hashtagAnalysis: TiktokHashtagAnalysis[]
}

// Client with all data relations included
export interface FullClientData extends Client {
  instagramProfile: InstagramProfile & {
    posts: InstagramPost[]
  } | null
  tiktokProfile: TiktokProfile & {
    posts: TiktokPost[]
  } | null
}

// Generic datasource interface for future extensibility (e.g. twitter?: TwitterDashboardData)
export interface DatasourcesData {
  instagram?: InstagramDashboardData
  tiktok?: TiktokDashboardData
}

// Dashboard page data
export interface DashboardData {
  client: FullClientData
  datasourcesData: DatasourcesData
  availableDatasources: AvailableDatasources[]
}
