import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { format } from 'date-fns'
import { BarChart3, Heart, MessageCircle, TrendingUp, Calendar, Image, Video } from 'lucide-react'

interface DashboardPageProps {
  params: {
    slug: string
  }
}

async function getClientData(slug: string) {
  const client = await prisma.client.findUnique({
    where: { slug },
    include: {
      profile: {
        include: {
          posts: {
            include: {
              comments: true
            },
            orderBy: {
              timestamp: 'desc'
            }
          }
        }
      }
    }
  })

  return client
}

function calculateEngagementRate(posts: Array<{
  likesCount: number
  commentsCount: number
}>) {
  if (posts.length === 0) return 0
  
  const totalEngagement = posts.reduce((sum, post) => {
    return sum + post.likesCount + post.commentsCount
  }, 0)
  
  // Since we don't have follower count in this example, we'll use average per post
  const avgEngagement = totalEngagement / posts.length
  return avgEngagement
}

function getPostTypeDistribution(posts: Array<{
  type: string
}>) {
  const distribution = posts.reduce((acc, post) => {
    acc[post.type] = (acc[post.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  return Object.entries(distribution).map(([type, count]) => ({
    type,
    count,
    percentage: (count / posts.length) * 100
  }))
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const client = await getClientData(params.slug)

  if (!client || !client.profile) {
    notFound()
  }

  const { profile } = client
  const posts = profile.posts

  // Calculate metrics
  const totalLikes = posts.reduce((sum, post) => sum + post.likesCount, 0)
  const totalComments = posts.reduce((sum, post) => sum + post.commentsCount, 0)
  const avgEngagement = calculateEngagementRate(posts)
  const postTypes = getPostTypeDistribution(posts)
  
  // Get top performing posts
  const topPosts = [...posts]
    .sort((a, b) => (b.likesCount + b.commentsCount) - (a.likesCount + a.commentsCount))
    .slice(0, 6)

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">@{client.username}</h1>
        <p className="text-muted-foreground">{profile.fullName}</p>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{posts.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLikes.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalComments.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Engagement</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgEngagement.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">per post</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="posts">Top Posts</TabsTrigger>
          <TabsTrigger value="content">Content Analysis</TabsTrigger>
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
                      {type.type === 'Image' ? <Image className="h-4 w-4" /> : <Video className="h-4 w-4" />}
                      <span className="font-medium">{type.type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{type.count} posts</span>
                      <div className="w-32 bg-secondary rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${type.percentage}%` }}
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
                {posts.slice(0, 5).map((post) => (
                  <div key={post.id} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {post.caption ? post.caption.substring(0, 50) + '...' : 'No caption'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <Calendar className="inline h-3 w-3 mr-1" />
                        {format(new Date(post.timestamp), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {post.likesCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        {post.commentsCount}
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
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {topPosts.map((post) => (
                  <Card key={post.id}>
                    <CardContent className="p-4">
                      <div className="aspect-square relative mb-2">
                        {post.displayUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={post.displayUrl}
                            alt={post.caption?.substring(0, 50) || 'Instagram post'}
                            className="rounded-md object-cover w-full h-full"
                          />
                        )}
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm line-clamp-2">
                          {post.caption || 'No caption'}
                        </p>
                        <div className="flex justify-between text-sm">
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            {post.likesCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="h-3 w-3" />
                            {post.commentsCount}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
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
                {(() => {
                  const hashtagCount: Record<string, number> = {}
                  posts.forEach(post => {
                    post.hashtags.forEach((tag: string) => {
                      hashtagCount[tag] = (hashtagCount[tag] || 0) + 1
                    })
                  })
                  
                  const sortedHashtags = Object.entries(hashtagCount)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 10)
                  
                  return sortedHashtags.length > 0 ? (
                    sortedHashtags.map(([tag, count]) => (
                      <div key={tag} className="flex justify-between">
                        <span className="text-sm">#{tag}</span>
                        <span className="text-sm text-muted-foreground">{count} posts</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No hashtags found</p>
                  )
                })()}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}