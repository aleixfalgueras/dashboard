import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'
import { userService } from '@/services/user-service'

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await userService.authenticateUser(
          credentials.email,
          credentials.password
        )

        if (!user) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          clientId: user.clientId,
          clientSlug: user.client?.slug || null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role as UserRole
        token.clientId = user.clientId
        token.clientSlug = user.clientSlug
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id as string
        session.user.role = token.role as UserRole
        session.user.clientId = token.clientId as string | null
        session.user.clientSlug = token.clientSlug as string | null
      }
      return session
    }
  },
})

export { handler as GET, handler as POST } // not really unused
