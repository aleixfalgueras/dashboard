import {dashboardService} from '@/services/dashboard-service'
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs'
import {Card, CardHeader, CardTitle, CardDescription} from '@/components/ui/card'
import {RiInstagramFill} from 'react-icons/ri'
import {SiTiktok, SiLinkedin, SiYoutube} from 'react-icons/si'
import {AvailableDatasources} from '@/lib/types/common/enums'
import {InstagramSection} from "@/components/dashboard/InstagramSection";
import {TiktokSection} from "@/components/dashboard/TiktokSection";
import {LinkedInSection} from "@/components/dashboard/LinkedInSection";
import {YoutubeSection} from "@/components/dashboard/YoutubeSection";
import {GeneralSection} from "@/components/dashboard/GeneralSection";
import {Logo} from "@/components/ui/logo";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {ExpandableText} from "@/components/ui/expandable-text";
import {ThemeToggle} from "@/components/theme-toggle";

interface DashboardPageProps {
  params: {
    slug: string
  }
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const dashboardData = await dashboardService.getDashboardData(params.slug)
  const bioTextSize = 140

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

  const { client, datasourcesData, availableDatasources, generalMetrics } = dashboardData

  // Helper functions to render each platform section
  const renderInstagramSection = (isTabbed: boolean = false) => {
    if (!datasourcesData.instagram) return null
    
    const content = (
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <RiInstagramFill className="h-6 w-6 instagram-gradient-text" />
            @{datasourcesData.instagram.profile.username}
          </h2>
          <div className="space-y-2">
            <p className="text-muted-foreground">{datasourcesData.instagram.profile.fullName}</p>
            <ExpandableText 
              text={datasourcesData.instagram.profile.bio ?? ""}
              maxLength={bioTextSize}
            />
          </div>
        </div>
        <InstagramSection data={datasourcesData.instagram} />
      </div>
    )

    return isTabbed ? (
      <TabsContent value={AvailableDatasources.INSTAGRAM}>{content}</TabsContent>
    ) : content
  }

  const renderTikTokSection = (isTabbed: boolean = false) => {
    if (!datasourcesData.tiktok) return null
    
    const content = (
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <SiTiktok className="h-6 w-6" />
            @{datasourcesData.tiktok.profile.username}
          </h2>
          <div className="space-y-2">
            <p className="text-muted-foreground">{datasourcesData.tiktok.profile.nickname}</p>
            <ExpandableText
              text={datasourcesData.tiktok.profile.signature ?? ""}
              maxLength={bioTextSize}
            />
          </div>
        </div>
        <TiktokSection data={datasourcesData.tiktok} />
      </div>
    )

    return isTabbed ? (
      <TabsContent value={AvailableDatasources.TIKTOK}>{content}</TabsContent>
    ) : content
  }

  const renderYouTubeSection = (isTabbed: boolean = false) => {
    if (!datasourcesData.youtube) return null
    
    const content = (
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <SiYoutube className="h-6 w-6 text-[#FF0000]" />
            @{datasourcesData.youtube.profile.channelUsername}
          </h2>
          <div className="space-y-2">
            <p className="text-muted-foreground">
              {datasourcesData.youtube.profile.channelName}
            </p>
            <ExpandableText 
              text={datasourcesData.youtube.profile.channelDescription ?? ""}
              maxLength={bioTextSize}
            />
          </div>
        </div>
        <YoutubeSection data={datasourcesData.youtube} />
      </div>
    )

    return isTabbed ? (
      <TabsContent value={AvailableDatasources.YOUTUBE}>{content}</TabsContent>
    ) : content
  }

  const renderLinkedInSection = (isTabbed: boolean = false) => {
    if (!datasourcesData.linkedin) return null
    
    const content = (
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <SiLinkedin className="h-6 w-6 text-[#0077B5]" />
            @{datasourcesData.linkedin.profile.username}
          </h2>
          <div className="space-y-2">
            <p className="text-muted-foreground">
              {datasourcesData.linkedin.profile.firstName} {datasourcesData.linkedin.profile.lastName}
            </p>
            <ExpandableText
              text={datasourcesData.linkedin.profile.headline ?? ""}
              maxLength={bioTextSize}
            />
          </div>
        </div>
        <LinkedInSection data={datasourcesData.linkedin} />
      </div>
    )

    return isTabbed ? (
      <TabsContent value={AvailableDatasources.LINKEDIN}>{content}</TabsContent>
    ) : content
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="md" />
            <h1 className="text-3xl font-bold">{client.name}</h1>
          </div>
          <ThemeToggle />
        </div>
        <p className="text-muted-foreground">Analytics Dashboard</p>
      </div>

      {/* Stats Data Start Date Message */}
      {client.statsDataStartDate && (
        <Alert>
          <AlertDescription>
            Showing analytics data from {new Date(client.statsDataStartDate).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })} onwards.
          </AlertDescription>
        </Alert>
      )}

      {/* General Overview Section */}
      <GeneralSection metrics={generalMetrics} />

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
            {availableDatasources.includes(AvailableDatasources.YOUTUBE) && (
              <TabsTrigger value={AvailableDatasources.YOUTUBE} className="flex items-center gap-2">
                <SiYoutube className="h-4 w-4 text-[#FF0000]" />
                YouTube
              </TabsTrigger>
            )}
            {availableDatasources.includes(AvailableDatasources.LINKEDIN) && (
              <TabsTrigger value={AvailableDatasources.LINKEDIN} className="flex items-center gap-2">
                <SiLinkedin className="h-4 w-4 text-[#0077B5]" />
                LinkedIn
              </TabsTrigger>
            )}
          </TabsList>

          {availableDatasources.includes(AvailableDatasources.INSTAGRAM) && renderInstagramSection(true)}
          {availableDatasources.includes(AvailableDatasources.TIKTOK) && renderTikTokSection(true)}
          {availableDatasources.includes(AvailableDatasources.YOUTUBE) && renderYouTubeSection(true)}
          {availableDatasources.includes(AvailableDatasources.LINKEDIN) && renderLinkedInSection(true)}
        </Tabs>
      ) : (
        // Single datasource view
        <>
          {availableDatasources.includes(AvailableDatasources.INSTAGRAM) && renderInstagramSection(false)}
          {availableDatasources.includes(AvailableDatasources.TIKTOK) && renderTikTokSection(false)}
          {availableDatasources.includes(AvailableDatasources.YOUTUBE) && renderYouTubeSection(false)}
          {availableDatasources.includes(AvailableDatasources.LINKEDIN) && renderLinkedInSection(false)}
        </>
      )}
    </div>
  )
}