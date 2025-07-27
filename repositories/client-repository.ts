import { prisma } from '@/lib/prisma'
import { Client, Prisma } from '@prisma/client'
import {FullClientData} from "@/lib/types/dashboard-types";
import {logger} from "@/lib/utils";

export class ClientRepository {
  async create(data: Prisma.ClientCreateInput): Promise<Client> {
    logger.info(`Creating new client: ${data.name}, ${data.slug}`)
    return prisma.client.create({ data })
  }

  async findByName(name: string): Promise<Client | null> {
    return prisma.client.findFirst({
      where: { name }
    })
  }

  async findById(id: string): Promise<Client | null> {
    return prisma.client.findUnique({
      where: { id }
    })
  }

  async findBySlugWithFullData(slug: string): Promise<FullClientData | null> {
    return prisma.client.findUnique({
      where: { slug },
      include: {
        instagramProfile: {
          include: {
            posts: {
              orderBy: {
                timestamp: 'desc'
              }
            }
          }
        },
        tiktokProfile: {
          include: {
            posts: {
              orderBy: {
                createTime: 'desc'
              }
            }
          }
        }
      }
    })
  }

  async findMany(): Promise<Client[]> {
    return prisma.client.findMany({
      orderBy: {
        name: 'asc'
      }
    })
  }

  async delete(id: string): Promise<void> {
    await prisma.client.delete({
      where: { id }
    })
  }

}

// Export singleton instance
export const clientRepository = new ClientRepository()