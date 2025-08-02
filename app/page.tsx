import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { UserRole } from '@prisma/client'
import { authOptions } from '@/lib/auth'
import { FallbackMessage } from '@/components/homepage/FallbackMessage'

export default async function Home() {
  const session = await getServerSession(authOptions)

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
  return <FallbackMessage />
}