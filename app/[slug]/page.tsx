import {notFound} from 'next/navigation'
import {dashboardService} from '@/services/dashboard-service'
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs'
import {RiInstagramFill} from 'react-icons/ri'
import {AvailableDatasources} from '@/lib/types/common/enums'
import {InstagramSection} from "@/components/dashboard/InstagramSection";

interface DashboardPageProps {
  params: {
    slug: string
  }
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const dashboardData = await dashboardService.getDashboardData(params.slug)

  if (!dashboardData) {
    notFound()
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
                <RiInstagramFill className="h-4 w-4" />
                Instagram
              </TabsTrigger>
            )}
            {/* Future datasources can be added here */}
          </TabsList>

          {availableDatasources.includes(AvailableDatasources.INSTAGRAM) && datasourcesData.instagram && (
            <TabsContent value={AvailableDatasources.INSTAGRAM}>
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <RiInstagramFill className="h-6 w-6" />
                    @{datasourcesData.instagram.profile.username}
                  </h2>
                  <p className="text-muted-foreground">{datasourcesData.instagram.profile.fullName}</p>
                </div>
                <InstagramSection data={datasourcesData.instagram} />
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
                  <RiInstagramFill className="h-6 w-6" />
                  @{datasourcesData.instagram.profile.username}
                </h2>
                <p className="text-muted-foreground">{datasourcesData.instagram.profile.fullName}</p>
              </div>
              <InstagramSection data={datasourcesData.instagram} />
            </div>
          )}
        </>
      )}
    </div>
  )
}