import { UserRole } from '@prisma/client'
import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface User {
    id: string
    email: string
    role: UserRole
    clientId: string | null
    clientSlug: string | null
  }

  interface Session {
    user: User
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: UserRole
    clientId: string | null
    clientSlug: string | null
  }
}