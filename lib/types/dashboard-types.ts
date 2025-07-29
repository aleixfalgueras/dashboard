import {Client, InstagramPost, InstagramProfile, LinkedinPost, LinkedinProfile, TiktokPost, TiktokProfile, YoutubeVideo, YoutubeProfile} from '@prisma/client'
import {InstagramHashtagAnalysis, InstagramMetrics, InstagramPostTypeDistribution, InstagramConsistencyMetrics} from "@/lib/types/instagram-types";
import {TiktokHashtagAnalysis, TiktokMetrics, TiktokConsistencyMetrics} from "@/lib/types/tiktok-types";
import {LinkedinHashtagAnalysis, LinkedinMetrics, LinkedinConsistencyMetrics} from "@/lib/types/linkedin-types";
import {YoutubeHashtagAnalysis, YoutubeMetrics, YoutubeConsistencyMetrics} from "@/lib/types/youtube-types";
import { AvailableDatasources } from './common/enums'

export interface InstagramDashboardData {
  profile: InstagramProfile & {
    posts: InstagramPost[]
  }
  metrics: InstagramMetrics
  postTypes: InstagramPostTypeDistribution[]
  topPosts: InstagramPost[]
  hashtagAnalysis: InstagramHashtagAnalysis[]
  consistencyMetrics: InstagramConsistencyMetrics
}

export interface TiktokDashboardData {
  profile: TiktokProfile & {
    posts: TiktokPost[]
  }
  metrics: TiktokMetrics
  topPosts: TiktokPost[]
  hashtagAnalysis: TiktokHashtagAnalysis[]
  consistencyMetrics: TiktokConsistencyMetrics
}

export interface LinkedinDashboardData {
  profile: LinkedinProfile & {
    posts: LinkedinPost[]
  }
  metrics: LinkedinMetrics
  topPosts: LinkedinPost[]
  hashtagAnalysis: LinkedinHashtagAnalysis[]
  consistencyMetrics: LinkedinConsistencyMetrics
}

export interface YoutubeDashboardData {
  profile: YoutubeProfile & {
    videos: YoutubeVideo[]
  }
  metrics: YoutubeMetrics
  topVideos: YoutubeVideo[]
  hashtagAnalysis: YoutubeHashtagAnalysis[]
  consistencyMetrics: YoutubeConsistencyMetrics
}

// Client with all data relations included
export interface FullClientData extends Client {
  instagramProfile: InstagramProfile & {
    posts: InstagramPost[]
  } | null
  tiktokProfile: TiktokProfile & {
    posts: TiktokPost[]
  } | null
  linkedinProfile: LinkedinProfile & {
    posts: LinkedinPost[]
  } | null
  youtubeProfile: YoutubeProfile & {
    videos: YoutubeVideo[]
  } | null
}

// Generic datasource interface for future extensibility (e.g. twitter?: TwitterDashboardData)
export interface DatasourcesData {
  instagram?: InstagramDashboardData
  tiktok?: TiktokDashboardData
  linkedin?: LinkedinDashboardData
  youtube?: YoutubeDashboardData
}

// General metrics across all platforms
export interface GeneralMetrics {
  totalFollowers: number
  avgViews: number
  globalAvgEngagement: number
  consistency: number
}

// Dashboard page data
export interface DashboardData {
  client: FullClientData
  datasourcesData: DatasourcesData
  availableDatasources: AvailableDatasources[]
  generalMetrics: GeneralMetrics
}
