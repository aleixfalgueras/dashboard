'use client'

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
import {ExpandableText} from "@/components/ui/expandable-text";
import {ThemeToggle} from "@/components/theme-toggle";
import {LogoutButton} from '@/components/auth/logout-button';
import {LanguageSwitcher} from '@/components/language-switcher';
import {useTranslations} from '@/lib/translations/context';
import type {DashboardData} from '@/lib/types/dashboard-types';

interface DashboardContentProps {
  dashboardData: DashboardData | null
}

export function DashboardContent({ dashboardData }: DashboardContentProps) {
  const bioTextSize = 140
  const tDashboard = useTranslations('dashboard')
  const tErrors = useTranslations('errors')

  if (!dashboardData) {
    return (
      <div className="max-w-7xl mx-auto px-10 py-10 space-y-8 flex items-center justify-center min-h-[60vh]">
        <Card className="w-full items-center justify-center text-center">
          <CardHeader>
            <CardTitle>{tErrors('noDataAvailable')}</CardTitle>
            <CardDescription>
              {tErrors('noDataDescription')}
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
            <p className="text-muted-foreground">{datasourcesData.instagram.profile.bio ?? ""}</p>
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
    <div className="max-w-7xl mx-auto px-10 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="md" />
            <h1 className="text-3xl font-bold">{client.name}</h1>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            <LogoutButton />
          </div>
        </div>
        <p className="text-muted-foreground">
          {tDashboard('personalizedDashboard')}
          {client.statsDataStartDate && ` - ${tDashboard('showingDataFrom')} ${new Date(client.statsDataStartDate).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })} onwards.`}
        </p>
      </div>

      {/* General Overview Section */}
      <GeneralSection metrics={generalMetrics} />

      {/* Datasource Sections */}
      {availableDatasources.length > 1 ? (
        <Tabs defaultValue={availableDatasources[0]} className="space-y-4">
          <TabsList>
            {availableDatasources.includes(AvailableDatasources.INSTAGRAM) && (
              <TabsTrigger value={AvailableDatasources.INSTAGRAM} className="flex items-center gap-2">
                <RiInstagramFill className="h-4 w-4 instagram-gradient-text" />
                {tDashboard('instagram')}
              </TabsTrigger>
            )}
            {availableDatasources.includes(AvailableDatasources.TIKTOK) && (
              <TabsTrigger value={AvailableDatasources.TIKTOK} className="flex items-center gap-2">
                <SiTiktok className="h-4 w-4" />
                {tDashboard('tiktok')}
              </TabsTrigger>
            )}
            {availableDatasources.includes(AvailableDatasources.YOUTUBE) && (
              <TabsTrigger value={AvailableDatasources.YOUTUBE} className="flex items-center gap-2">
                <SiYoutube className="h-4 w-4 text-[#FF0000]" />
                {tDashboard('youtube')}
              </TabsTrigger>
            )}
            {availableDatasources.includes(AvailableDatasources.LINKEDIN) && (
              <TabsTrigger value={AvailableDatasources.LINKEDIN} className="flex items-center gap-2">
                <SiLinkedin className="h-4 w-4 text-[#0077B5]" />
                {tDashboard('linkedin')}
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