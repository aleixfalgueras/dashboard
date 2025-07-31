import {InstagramDashboardData} from "@/lib/types/dashboard-types";
import {HeatmapComponent} from "@/components/ui/heatmap";
import {ConsistencyMetricsComponent} from "@/components/ui/consistency-metrics";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {
  BarChart3,
  Calendar,
  Heart,
  HelpCircle,
  Image as ImageIcon,
  MessageCircle,
  TrendingUp,
  Video
} from "lucide-react";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";
import {format} from "date-fns";

export function InstagramSection({data}: { data: InstagramDashboardData }) {
  const {profile, metrics, postTypes, topPosts, hashtagAnalysis, consistencyMetrics} = data

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
            <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
            <MessageCircle className="h-4 w-4 text-blue-500"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{metrics.totalComments.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-400 bg-gradient-to-br from-purple-50/50 to-transparent dark:from-purple-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
            <Heart className="h-4 w-4 text-purple-500"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{metrics.totalLikes.toLocaleString()}</div>
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
                    Calculated as average of (Likes + Comments) ÷ Video Views for video posts only
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <TrendingUp className="h-4 w-4 text-green-500"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{(metrics.avgEngagementPerPost * 100).toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">per video post</p>
          </CardContent>
        </Card>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">Overview</TabsTrigger>
          <TabsTrigger value="posts" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">Top Posts</TabsTrigger>
          <TabsTrigger value="content" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">Hashtags</TabsTrigger>
          <TabsTrigger value="consistency" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">Consistency</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Post Type Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Content Type Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {postTypes.map((type) => (
                  <div key={type.type} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {type.type === 'Image' ? <ImageIcon className="h-4 w-4"/> : <Video className="h-4 w-4"/>}
                      <span className="font-medium">
                        {type.type === "Video" ? "Reels" : type.type === "Sidecar" ? "Carrusel" : "Regular posts"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{type.count} posts</span>
                      <div className="w-32 bg-secondary rounded-full h-2">
                        <div
                          className="instagram-gradient h-2 rounded-full"
                          style={{width: `${type.percentage}%`}}
                        />
                      </div>
                      <span className="text-sm font-medium w-12 text-right">{type.percentage.toFixed(0)}%</span>
                    </div>
                  </div>
                ))}
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
                  <a 
                    key={post.id} 
                    href={post.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-between hover:bg-accent/50 rounded-lg p-2 -m-2 transition-colors cursor-pointer"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {post.caption ? post.caption.substring(0, 50) + '...' : 'No caption'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <Calendar className="inline h-3 w-3 mr-1"/>
                        {format(new Date(post.timestamp), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3 text-purple-500"/>
                        {post.likesCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3 text-blue-500"/>
                        {post.commentsCount}
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
              <CardTitle>Top Performing Posts</CardTitle>
              <CardDescription>Posts with highest engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPosts.map((post) => (
                  <a 
                    key={post.id} 
                    href={post.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-between hover:bg-accent/50 rounded-lg p-2 -m-2 transition-colors cursor-pointer"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {post.type === 'Image' ? <ImageIcon className="h-3 w-3 text-muted-foreground"/> : <Video className="h-3 w-3 text-muted-foreground"/>}
                        <p className="text-sm font-medium leading-none">
                          {post.caption ? post.caption.substring(0, 50) + '...' : 'No caption'}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <Calendar className="inline h-3 w-3 mr-1"/>
                        {format(new Date(post.timestamp), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3 text-purple-500"/>
                        {post.likesCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3 text-blue-500"/>
                        {post.commentsCount}
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
              <ConsistencyMetricsComponent data={consistencyMetrics} />
            </CardContent>
          </Card>

          {/* Posting Heatmap */}
          <Card>
            <CardHeader>
              <CardTitle>Consistency Heatmap</CardTitle>
              <CardDescription>Posts distribution by day and time</CardDescription>
            </CardHeader>
            <CardContent>
              <HeatmapComponent 
                data={consistencyMetrics.heatmapData}
                itemType={{ singular: 'post', plural: 'posts' }}
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

