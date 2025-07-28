import {dashboardService} from '@/services/dashboard-service'
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs'
import {Card, CardHeader, CardTitle, CardDescription} from '@/components/ui/card'
import {RiInstagramFill} from 'react-icons/ri'
import {SiTiktok, SiLinkedin, SiYoutube} from 'react-icons/si'
import {AvailableDatasources} from '@/lib/types/common/enums'
import {InstagramSection} from "@/components/dashboard/InstagramSection";
import {TikTokSection} from "@/components/dashboard/TikTokSection";
import {LinkedInSection} from "@/components/dashboard/LinkedInSection";
import {YoutubeSection} from "@/components/dashboard/YoutubeSection";
import {Logo} from "@/components/ui/logo";

interface DashboardPageProps {
  params: {
    slug: string
  }
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const dashboardData = await dashboardService.getDashboardData(params.slug)

  if (!dashboardData) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>No Data Available</CardTitle>
            <CardDescription>
              There is no data to be shown for this user.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const { client, datasourcesData, availableDatasources } = dashboardData

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <Logo size="md" />
          <h1 className="text-3xl font-bold">{client.name}</h1>
        </div>
        <p className="text-muted-foreground">Analytics Dashboard</p>
      </div>

      {/* Datasource Sections */}
      {availableDatasources.length > 1 ? (
        <Tabs defaultValue={availableDatasources[0]} className="space-y-4">
          <TabsList>
            {availableDatasources.includes(AvailableDatasources.INSTAGRAM) && (
              <TabsTrigger value={AvailableDatasources.INSTAGRAM} className="flex items-center gap-2">
                <RiInstagramFill className="h-4 w-4 instagram-gradient-text" />
                Instagram
              </TabsTrigger>
            )}
            {availableDatasources.includes(AvailableDatasources.TIKTOK) && (
              <TabsTrigger value={AvailableDatasources.TIKTOK} className="flex items-center gap-2">
                <SiTiktok className="h-4 w-4" />
                TikTok
              </TabsTrigger>
            )}
            {availableDatasources.includes(AvailableDatasources.LINKEDIN) && (
              <TabsTrigger value={AvailableDatasources.LINKEDIN} className="flex items-center gap-2">
                <SiLinkedin className="h-4 w-4 text-[#0077B5]" />
                LinkedIn
              </TabsTrigger>
            )}
            {availableDatasources.includes(AvailableDatasources.YOUTUBE) && (
              <TabsTrigger value={AvailableDatasources.YOUTUBE} className="flex items-center gap-2">
                <SiYoutube className="h-4 w-4 text-[#FF0000]" />
                YouTube
              </TabsTrigger>
            )}
          </TabsList>

          {availableDatasources.includes(AvailableDatasources.INSTAGRAM) && datasourcesData.instagram && (
            <TabsContent value={AvailableDatasources.INSTAGRAM}>
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <RiInstagramFill className="h-6 w-6 instagram-gradient-text" />
                    @{datasourcesData.instagram.profile.username}
                  </h2>
                  <p className="text-muted-foreground">{datasourcesData.instagram.profile.fullName}</p>
                </div>
                <InstagramSection data={datasourcesData.instagram} />
              </div>
            </TabsContent>
          )}
          {availableDatasources.includes(AvailableDatasources.TIKTOK) && datasourcesData.tiktok && (
            <TabsContent value={AvailableDatasources.TIKTOK}>
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <SiTiktok className="h-6 w-6" />
                    @{datasourcesData.tiktok.profile.username}
                  </h2>
                  <p className="text-muted-foreground">{datasourcesData.tiktok.profile.nickname}</p>
                </div>
                <TikTokSection data={datasourcesData.tiktok} />
              </div>
            </TabsContent>
          )}
          {availableDatasources.includes(AvailableDatasources.LINKEDIN) && datasourcesData.linkedin && (
            <TabsContent value={AvailableDatasources.LINKEDIN}>
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <SiLinkedin className="h-6 w-6 text-[#0077B5]" />
                    {datasourcesData.linkedin.profile.firstName} {datasourcesData.linkedin.profile.lastName}
                  </h2>
                  <p className="text-muted-foreground">{datasourcesData.linkedin.profile.headline}</p>
                </div>
                <LinkedInSection data={datasourcesData.linkedin} />
              </div>
            </TabsContent>
          )}
          {availableDatasources.includes(AvailableDatasources.YOUTUBE) && datasourcesData.youtube && (
            <TabsContent value={AvailableDatasources.YOUTUBE}>
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <SiYoutube className="h-6 w-6 text-[#FF0000]" />
                    {datasourcesData.youtube.profile.channelName}
                  </h2>
                  <p className="text-muted-foreground">
                    {datasourcesData.youtube.profile.numberOfSubscribers.toLocaleString()} subscribers • {datasourcesData.youtube.profile.channelTotalVideos} videos
                  </p>
                </div>
                <YoutubeSection data={datasourcesData.youtube} />
              </div>
            </TabsContent>
          )}
        </Tabs>
      ) : (
        // Single datasource view
        <>
          {availableDatasources.includes(AvailableDatasources.INSTAGRAM) && datasourcesData.instagram && (
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <RiInstagramFill className="h-6 w-6 instagram-gradient-text" />
                  @{datasourcesData.instagram.profile.username}
                </h2>
                <p className="text-muted-foreground">{datasourcesData.instagram.profile.fullName}</p>
              </div>
              <InstagramSection data={datasourcesData.instagram} />
            </div>
          )}
          {availableDatasources.includes(AvailableDatasources.TIKTOK) && datasourcesData.tiktok && (
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <SiTiktok className="h-6 w-6" />
                  @{datasourcesData.tiktok.profile.username}
                </h2>
                <p className="text-muted-foreground">{datasourcesData.tiktok.profile.nickname}</p>
              </div>
              <TikTokSection data={datasourcesData.tiktok} />
            </div>
          )}
          {availableDatasources.includes(AvailableDatasources.LINKEDIN) && datasourcesData.linkedin && (
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <SiLinkedin className="h-6 w-6 text-[#0077B5]" />
                  {datasourcesData.linkedin.profile.firstName} {datasourcesData.linkedin.profile.lastName}
                </h2>
                <p className="text-muted-foreground">{datasourcesData.linkedin.profile.headline}</p>
              </div>
              <LinkedInSection data={datasourcesData.linkedin} />
            </div>
          )}
          {availableDatasources.includes(AvailableDatasources.YOUTUBE) && datasourcesData.youtube && (
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <SiYoutube className="h-6 w-6 text-[#FF0000]" />
                  {datasourcesData.youtube.profile.channelName}
                </h2>
                <p className="text-muted-foreground">
                  {datasourcesData.youtube.profile.numberOfSubscribers.toLocaleString()} subscribers • {datasourcesData.youtube.profile.channelTotalVideos} videos
                </p>
              </div>
              <YoutubeSection data={datasourcesData.youtube} />
            </div>
          )}
        </>
      )}
    </div>
  )
}