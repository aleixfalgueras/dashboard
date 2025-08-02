'use client'

import {TiktokDashboardData} from "@/lib/types/dashboard-types";
import {HeatmapComponent} from "@/components/ui/heatmap";
import {ConsistencyMetricsComponent} from "@/components/ui/consistency-metrics";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {BarChart3, Calendar, Heart, Play, Share2, MessageCircle, TrendingUp, HelpCircle, Users, UserPlus, UserCheck} from "lucide-react";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";
import {format} from "date-fns";
import { useTranslations } from "@/lib/translations/context";

export function TiktokSection({data}: { data: TiktokDashboardData }) {
  const {profile, metrics, topPosts, hashtagAnalysis, consistencyMetrics} = data
  const tContent = useTranslations('content')
  const tTabs = useTranslations('tabs')
  const tCardTitles = useTranslations('cardTitles')
  const tSectionTitles = useTranslations('sectionTitles')
  const tDescriptions = useTranslations('descriptions')
  const tLabels = useTranslations('labels')
  const tUnits = useTranslations('units')
  const tTooltips = useTranslations('tooltips')
  const tStatus = useTranslations('status')

  return (
    <TooltipProvider>
      <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-accent accent-gradient-subtle">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{tCardTitles('totalPosts')}</CardTitle>
            <BarChart3 className="h-4 w-4 text-accent"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{metrics.totalPosts}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-400 bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{tCardTitles('totalPlays')}</CardTitle>
            <Play className="h-4 w-4 text-blue-500"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{metrics.totalPlays.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-400 bg-gradient-to-br from-purple-50/50 to-transparent dark:from-purple-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{tCardTitles('totalDiggs')}</CardTitle>
            <Heart className="h-4 w-4 text-purple-500"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{metrics.totalDiggs.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-400 bg-gradient-to-br from-green-50/50 to-transparent dark:from-green-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-1">
              <CardTitle className="text-sm font-medium">{tCardTitles('avgEngagement')}</CardTitle>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3 w-3 text-muted-foreground hover:text-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    {tTooltips('tiktokEngagementCalc')}
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <TrendingUp className="h-4 w-4 text-green-500"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{(metrics.avgEngagementPerPost * 100).toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">{tUnits('perPost')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">{tTabs('overview')}</TabsTrigger>
          <TabsTrigger value="posts" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">{tTabs('topPosts')}</TabsTrigger>
          <TabsTrigger value="content" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">{tTabs('hashtags')}</TabsTrigger>
          <TabsTrigger value="consistency" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">{tTabs('consistency')}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Account Overview */}
          <Card>
            <CardHeader>
              <CardTitle>{tSectionTitles('accountOverview')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Account Metrics */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-pink-500"/>
                    <span className="font-medium">{tLabels('fans')}</span>
                  </div>
                  <span className="text-sm font-medium">{profile.fans.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4 text-blue-500"/>
                    <span className="font-medium">{tLabels('following')}</span>
                  </div>
                  <span className="text-sm font-medium">{profile.following.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-green-500"/>
                    <span className="font-medium">{tLabels('friends')}</span>
                  </div>
                  <span className="text-sm font-medium">{profile.friends.toLocaleString()}</span>
                </div>
                
                {/* Engagement Metrics */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Share2 className="h-4 w-4"/>
                    <span className="font-medium">{tCardTitles('totalShares')}</span>
                  </div>
                  <span className="text-sm font-medium">{metrics.totalShares.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4"/>
                    <span className="font-medium">{tCardTitles('totalComments')}</span>
                  </div>
                  <span className="text-sm font-medium">{metrics.totalComments.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>{tSectionTitles('recentPosts')}</CardTitle>
              <CardDescription>{tDescriptions('latestContentPerformance')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {profile.posts.slice(0, 5).map((post) => (
                  <a 
                    key={post.id} 
                    href={post.webVideoUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-between hover:bg-accent/50 rounded-lg p-2 -m-2 transition-colors cursor-pointer"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {post.text ? post.text.substring(0, 50) + '...' : tContent('noCaption')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <Calendar className="inline h-3 w-3 mr-1"/>
                        {format(new Date(post.createTime), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3 text-purple-500"/>
                        {post.diggCount.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Play className="h-3 w-3 text-blue-500"/>
                        {post.playCount.toLocaleString()}
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="posts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{tSectionTitles('topPerformingPosts')}</CardTitle>
              <CardDescription>{tDescriptions('postsWithHighestEngagement')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPosts.map((post) => (
                  <a 
                    key={post.id} 
                    href={post.webVideoUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-between hover:bg-accent/50 rounded-lg p-2 -m-2 transition-colors cursor-pointer"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {post.isSlideshow && <span className="text-xs bg-muted px-1 rounded">{tStatus('slideshow')}</span>}
                        {post.isPinned && <span className="text-xs bg-accent px-1 rounded text-accent-foreground">{tStatus('pinned')}</span>}
                        <p className="text-sm font-medium leading-none">
                          {post.text ? post.text.substring(0, 50) + '...' : tContent('noCaption')}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <Calendar className="inline h-3 w-3 mr-1"/>
                        {format(new Date(post.createTime), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3 text-purple-500"/>
                        {post.diggCount.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Share2 className="h-3 w-3 text-green-500"/>
                        {post.shareCount.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3 text-blue-500"/>
                        {post.commentCount.toLocaleString()}
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{tSectionTitles('hashtagAnalysis')}</CardTitle>
              <CardDescription>{tDescriptions('mostUsedHashtags')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {hashtagAnalysis.length > 0 ? (
                  hashtagAnalysis.map(({tag, count}) => (
                    <div key={tag} className="flex justify-between">
                      <span className="text-sm">#{tag}</span>
                      <span className="text-sm text-muted-foreground">{count} {tUnits('posts')}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">{tContent('noHashtags')}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consistency" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{tSectionTitles('consistencyMetrics')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ConsistencyMetricsComponent data={consistencyMetrics} />
            </CardContent>
          </Card>

          {/* Posting Heatmap */}
          <Card>
            <CardHeader>
              <CardTitle>{tSectionTitles('consistencyHeatmap')}</CardTitle>
              <CardDescription>{tDescriptions('postsDistribution')}</CardDescription>
            </CardHeader>
            <CardContent>
              <HeatmapComponent 
                data={consistencyMetrics.heatmapData}
                itemType={{ singular: tUnits('perPost').replace('per ', ''), plural: tUnits('posts') }}
                getCountFromCell={(cell) => cell.count}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </TooltipProvider>
  )
}
