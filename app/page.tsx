import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { UserRole } from '@prisma/client'
import { authOptions } from '@/lib/auth'
import {logger} from "@/lib/utils";

export default async function Home() {
  const session = await getServerSession(authOptions)

  logger.info(session)
  
  if (!session) {
    redirect('/login')
  }
  
  if (session.user.role === UserRole.ADMIN) {
    redirect('/admin')
  }
  
  if (session.user.role === UserRole.CLIENT && session.user.clientSlug) {
    redirect(`/${session.user.clientSlug}`)
  }
  
  // Fallback for users without proper client assignment
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Welcome!</h1>
        <p className="text-gray-600">Please contact your administrator for dashboard access.</p>
      </div>
    </div>
  )
}
