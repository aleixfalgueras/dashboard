import {YoutubeDashboardData} from "@/lib/types/dashboard-types";
import {HeatmapComponent} from "@/components/ui/heatmap";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {BarChart3, Calendar, Eye, Heart, MessageCircle, TrendingUp, Play, HelpCircle, CalendarCheck, CalendarX, AlertCircle, Flame} from "lucide-react";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";
import {format} from "date-fns";

export function YoutubeSection({data}: { data: YoutubeDashboardData }) {
  const {profile, metrics, topVideos, hashtagAnalysis, consistencyMetrics} = data

  return (
    <TooltipProvider>
      <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-accent accent-gradient-subtle">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Videos</CardTitle>
            <BarChart3 className="h-4 w-4 text-accent"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{metrics.totalVideos}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-400 bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
            <Heart className="h-4 w-4 text-blue-500"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{metrics.totalLikes.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-400 bg-gradient-to-br from-purple-50/50 to-transparent dark:from-purple-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-purple-500"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{metrics.totalViews.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-400 bg-gradient-to-br from-green-50/50 to-transparent dark:from-green-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-1">
              <CardTitle className="text-sm font-medium">Avg. Engagement</CardTitle>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3 w-3 text-muted-foreground hover:text-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Calculated as average of (Likes + Comments) ÷ View Count per video
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <TrendingUp className="h-4 w-4 text-green-500"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{(metrics.avgEngagementPerPost * 100).toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">per video</p>
          </CardContent>
        </Card>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">Overview</TabsTrigger>
          <TabsTrigger value="videos" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">Top Videos</TabsTrigger>
          <TabsTrigger value="content" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">Content Analysis</TabsTrigger>
          <TabsTrigger value="consistency" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">Consistency</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Channel Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Channel Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4"/>
                    <span className="font-medium">Avg. Views per Video</span>
                  </div>
                  <span className="text-sm font-medium">{metrics.avgViewsPerVideo.toFixed(0).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-pink-500"/>
                    <span className="font-medium">Avg. Likes per Video</span>
                  </div>
                  <span className="text-sm font-medium">{metrics.avgLikesPerVideo.toFixed(0).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-blue-500"/>
                    <span className="font-medium">Avg. Comments per Video</span>
                  </div>
                  <span className="text-sm font-medium">{metrics.avgCommentsPerVideo.toFixed(0).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500"/>
                    <span className="font-medium">Subscribers</span>
                  </div>
                  <span className="text-sm font-medium">{profile.numberOfSubscribers.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Videos */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Videos</CardTitle>
              <CardDescription>Latest video performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {profile.videos.slice(0, 5).map((video) => (
                  <div key={video.id} className="flex items-center justify-between">
                    <div className="space-y-1 flex-1">
                      <p className="text-sm font-medium leading-none">
                        {video.title.substring(0, 60)}...
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <Calendar className="inline h-3 w-3 mr-1"/>
                        {format(new Date(video.publishedAt), 'MMM d, yyyy')}
                        {video.duration && (
                          <span className="ml-2">
                            <Play className="inline h-3 w-3 mr-1"/>
                            {video.duration}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3 text-purple-500"/>
                        {video.viewCount.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3 text-pink-500"/>
                        {video.likes}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="videos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Videos</CardTitle>
              <CardDescription>Videos with highest engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topVideos.map((video) => (
                  <a 
                    key={video.id} 
                    href={video.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block space-y-2 hover:bg-accent/50 rounded-lg p-2 -m-2 transition-colors cursor-pointer"
                  >
                    {video.thumbnailUrl && (
                      <div className="flex gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={video.thumbnailUrl} 
                          alt={video.title}
                          className="w-24 h-16 object-cover rounded"
                        />
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {video.title}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            <Calendar className="inline h-3 w-3 mr-1"/>
                            {format(new Date(video.publishedAt), 'MMM d, yyyy')}
                            {video.duration && (
                              <span className="ml-2">
                                <Play className="inline h-3 w-3 mr-1"/>
                                {video.duration}
                              </span>
                            )}
                          </p>
                          <div className="flex gap-4 text-sm">
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3 text-purple-500"/>
                              {video.viewCount.toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="h-3 w-3 text-pink-500"/>
                              {video.likes}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="h-3 w-3 text-blue-500"/>
                              {video.commentsCount}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hashtag Analysis</CardTitle>
              <CardDescription>Most used hashtags</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {hashtagAnalysis.length > 0 ? (
                  hashtagAnalysis.map(({tag, count}) => (
                    <div key={tag} className="flex justify-between">
                      <span className="text-sm">#{tag}</span>
                      <span className="text-sm text-muted-foreground">{count} videos</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No hashtags found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consistency" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Consistency Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CalendarCheck className="h-4 w-4 text-green-500"/>
                    <span className="font-medium">Active Days</span>
                  </div>
                  <span className="text-sm font-medium">{consistencyMetrics.activeDays}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CalendarX className="h-4 w-4 text-red-500"/>
                    <span className="font-medium">Inactive Days</span>
                  </div>
                  <span className="text-sm font-medium">{consistencyMetrics.inactiveDays}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-500"/>
                    <span className="font-medium">Daily Consistency Rate</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3 w-3 text-muted-foreground hover:text-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">
                          Active Days ÷ Total Days × 100%
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <span className="text-sm font-medium">{consistencyMetrics.dailyConsistencyRate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-orange-500"/>
                    <span className="font-medium">Longest Silence</span>
                  </div>
                  <span className="text-sm font-medium">{consistencyMetrics.longestSilence} {consistencyMetrics.longestSilence === 1 ? 'day' : 'days'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Flame className="h-4 w-4 text-accent"/>
                    <span className="font-medium">Longest Active Streak</span>
                  </div>
                  <span className="text-sm font-medium">{consistencyMetrics.longestActiveStreak} {consistencyMetrics.longestActiveStreak === 1 ? 'day' : 'days'}</span>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500"/>
                      <span className="font-medium">Consistency Score</span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-3 w-3 text-muted-foreground hover:text-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            Composite score (0-100) based on posting frequency consistency (40%), 
                            time pattern regularity (25%), daily activity rate (20%), 
                            and streak stability (15%)
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{consistencyMetrics.consistencyScore}/100</span>
                      <div className="w-16 h-2 bg-secondary rounded-full">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                          style={{ width: `${consistencyMetrics.consistencyScore}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Posting Heatmap */}
          <Card>
            <CardHeader>
              <CardTitle>Consistency Heatmap</CardTitle>
              <CardDescription>Video distribution by day and time</CardDescription>
            </CardHeader>
            <CardContent>
              <HeatmapComponent 
                data={consistencyMetrics.heatmapData}
                itemType={{ singular: 'video', plural: 'videos' }}
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

