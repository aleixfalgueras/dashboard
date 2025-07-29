import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { UserRole } from '@prisma/client'

export async function requireAuth() {
  const session = await getServerSession()
  
  if (!session) {
    redirect('/login')
  }
  
  return session
}

export async function requireAdmin() {
  const session = await requireAuth()
  
  if (session.user.role !== UserRole.ADMIN) {
    redirect('/')
  }
  
  return session
}

export async function requireClientAccess(slug: string) {
  const session = await requireAuth()
  
  // Admin has access to all slugs
  if (session.user.role === UserRole.ADMIN) {
    return session
  }
  
  // Client can only access their assigned slug
  if (session.user.clientSlug !== slug) {
    redirect('/')
  }
  
  return session
}