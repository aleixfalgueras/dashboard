import {TiktokDashboardData} from "@/lib/types/dashboard-types";
import {TiktokConsistencyMetrics} from "@/lib/types/tiktok-types";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {BarChart3, Calendar, Heart, Play, Share2, MessageCircle, TrendingUp, HelpCircle, CalendarCheck, CalendarX, AlertCircle, Flame} from "lucide-react";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";
import {format} from "date-fns";

export function TiktokSection({data}: { data: TiktokDashboardData }) {
  const {profile, metrics, topPosts, hashtagAnalysis, consistencyMetrics} = data

  return (
    <TooltipProvider>
      <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-accent accent-gradient-subtle">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <BarChart3 className="h-4 w-4 text-accent"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{metrics.totalPosts}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-400 bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Plays</CardTitle>
            <Play className="h-4 w-4 text-blue-500"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{metrics.totalPlays.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-400 bg-gradient-to-br from-purple-50/50 to-transparent dark:from-purple-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Diggs</CardTitle>
            <Heart className="h-4 w-4 text-purple-500"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{metrics.totalDiggs.toLocaleString()}</div>
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
                    Calculated as average of (Diggs + Comments + Shares + Collects) ÷ Plays per post
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <TrendingUp className="h-4 w-4 text-green-500"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{(metrics.avgEngagementPerPost * 100).toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">per post</p>
          </CardContent>
        </Card>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">Overview</TabsTrigger>
          <TabsTrigger value="posts" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">Top Posts</TabsTrigger>
          <TabsTrigger value="content" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">Content Analysis</TabsTrigger>
          <TabsTrigger value="consistency" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">Consistency</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Engagement Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Engagement Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Share2 className="h-4 w-4"/>
                    <span className="font-medium">Total Shares</span>
                  </div>
                  <span className="text-sm font-medium">{metrics.totalShares.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4"/>
                    <span className="font-medium">Total Comments</span>
                  </div>
                  <span className="text-sm font-medium">{metrics.totalComments.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Posts</CardTitle>
              <CardDescription>Latest content performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {profile.posts.slice(0, 5).map((post) => (
                  <div key={post.id} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {post.text ? post.text.substring(0, 50) + '...' : 'No caption'}
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
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="posts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Posts</CardTitle>
              <CardDescription>Posts with highest engagement</CardDescription>
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
                        {post.isSlideshow && <span className="text-xs bg-muted px-1 rounded">Slideshow</span>}
                        {post.isPinned && <span className="text-xs bg-accent px-1 rounded text-accent-foreground">Pinned</span>}
                        <p className="text-sm font-medium leading-none">
                          {post.text ? post.text.substring(0, 50) + '...' : 'No caption'}
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
              <CardTitle>Hashtag Analysis</CardTitle>
              <CardDescription>Most used hashtags</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {hashtagAnalysis.length > 0 ? (
                  hashtagAnalysis.map(({tag, count}) => (
                    <div key={tag} className="flex justify-between">
                      <span className="text-sm">#{tag}</span>
                      <span className="text-sm text-muted-foreground">{count} posts</span>
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
              <CardDescription>Posts distribution by day and time</CardDescription>
            </CardHeader>
            <CardContent>
              <PostingHeatmap data={consistencyMetrics.heatmapData} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </TooltipProvider>
  )
}

// Heatmap component for posting consistency
function PostingHeatmap({ data }: { data: TiktokConsistencyMetrics['heatmapData'] }) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const hours = ['12am', '3am', '6am', '9am', '12pm', '3pm', '6pm', '9pm']
  
  // Find max value for color scaling
  const maxCount = Math.max(...data.map(cell => cell.postCount), 1)
  
  // Get color intensity based on post count
  const getColorOpacity = (count: number) => {
    if (count === 0) return 0
    return Math.max(0.1, count / maxCount)
  }
  
  return (
    <TooltipProvider>
      <div className="w-full overflow-x-auto">
        <div className="inline-block">
          {/* Time labels */}
          <div className="flex mb-1">
            <div className="w-16"></div> {/* Spacer to match day label width */}
            <div className="w-1"></div>   {/* Spacer to match gap */}
            <div className="flex gap-1">
              {hours.map((hour, i) => (
                <div key={i} className="w-12 text-center text-xs text-muted-foreground">
                  {hour}
                </div>
              ))}
            </div>
          </div>
          
          {/* Heatmap grid */}
          <div className="space-y-1">
            {days.map((day, dayIndex) => (
              <div key={dayIndex} className="flex items-center gap-1">
                <div className="w-16 text-xs text-muted-foreground text-right">
                  {day}
                </div>
                <div className="flex gap-1">
                  {hours.map((_, hourIndex) => {
                    const cell = data.find(
                      c => c.dayOfWeek === dayIndex + 1 && c.hourBlock === hourIndex * 3
                    )
                    const count = cell?.postCount || 0
                    
                    return (
                      <Tooltip key={hourIndex}>
                        <TooltipTrigger asChild>
                          <div
                            className="w-12 h-12 rounded-sm border border-border cursor-pointer hover:border-accent transition-colors"
                            style={{
                              backgroundColor: count > 0 
                                ? `hsl(var(--accent) / ${getColorOpacity(count)})`
                                : 'hsl(var(--muted) / 0.3)'
                            }}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-sm">
                            {day} {hours[hourIndex]}-{hourIndex === 7 ? '12am' : hours[hourIndex + 1]}
                          </p>
                          <p className="text-sm font-medium">
                            {count} {count === 1 ? 'post' : 'posts'}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
          
          {/* Legend */}
          <div className="flex items-center justify-center gap-3 mt-3">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm border border-border" style={{ backgroundColor: 'hsl(var(--muted) / 0.3)' }} />
              <span className="text-xs text-muted-foreground">No posts</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'hsl(var(--accent) / 0.3)' }} />
              <span className="text-xs text-muted-foreground">Few posts</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'hsl(var(--accent) / 1)' }} />
              <span className="text-xs text-muted-foreground">Many posts</span>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}