import {dashboardService} from '@/services/dashboard-service'
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs'
import {Card, CardHeader, CardTitle, CardDescription} from '@/components/ui/card'
import {RiInstagramFill} from 'react-icons/ri'
import {SiTiktok} from 'react-icons/si'
import {AvailableDatasources} from '@/lib/types/common/enums'
import {InstagramSection} from "@/components/dashboard/InstagramSection";
import {TikTokSection} from "@/components/dashboard/TikTokSection";

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
        <h1 className="text-3xl font-bold">{client.name}</h1>
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
        </>
      )}
    </div>
  )
}