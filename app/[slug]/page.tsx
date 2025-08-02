import {dashboardService} from '@/services/dashboard-service'
import {DashboardContent} from '../../components/dashboard/DashboardContent'

interface DashboardPageProps {
  params: {
    slug: string
  }
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const dashboardData = await dashboardService.getDashboardData(params.slug)
  
  return <DashboardContent dashboardData={dashboardData} />
}