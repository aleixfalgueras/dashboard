import { prisma } from '@/lib/prisma'
import { Client, Prisma } from '@prisma/client'

export class ClientRepository {
  async create(data: Prisma.ClientCreateInput): Promise<Client> {
    return prisma.client.create({ data })
  }

  async findByUsername(username: string): Promise<Client | null> {
    return prisma.client.findFirst({
      where: { username }
    })
  }

  async findBySlugWithFullData(slug: string) {
    return prisma.client.findUnique({
      where: { slug },
      include: {
        profile: {
          include: {
            posts: {
              orderBy: {
                timestamp: 'desc'
              }
            }
          }
        }
      }
    })
  }

  async findMany() {
    return prisma.client.findMany({
      include: {
        profile: true,
        uploads: {
          orderBy: {
            processedAt: 'desc'
          },
          take: 1
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  }

  async delete(id: string): Promise<void> {
    await prisma.client.delete({
      where: { id }
    })
  }

  async deleteByUsername(username: string): Promise<void> {
    const client = await this.findByUsername(username)
    if (client) {
      await this.delete(client.id)
    }
  }
}

// Export singleton instance
export const clientRepository = new ClientRepository()