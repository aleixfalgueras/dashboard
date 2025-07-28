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

  async findBySlugWithFullData(slug: string, startDate?: Date): Promise<FullClientData | null> {
    return prisma.client.findUnique({
      where: { slug },
      include: {
        instagramProfile: {
          include: {
            posts: {
              where: startDate ? {
                timestamp: {
                  gte: startDate
                }
              } : undefined,
              orderBy: {
                timestamp: 'desc'
              }
            }
          }
        },
        tiktokProfile: {
          include: {
            posts: {
              where: startDate ? {
                createTime: {
                  gte: startDate
                }
              } : undefined,
              orderBy: {
                createTime: 'desc'
              }
            }
          }
        },
        linkedinProfile: {
          include: {
            posts: {
              where: startDate ? {
                postedAt: {
                  gte: startDate
                }
              } : undefined,
              orderBy: {
                postedAt: 'desc'
              }
            }
          }
        },
        youtubeProfile: {
          include: {
            videos: {
              where: startDate ? {
                publishedAt: {
                  gte: startDate
                }
              } : undefined,
              orderBy: {
                publishedAt: 'desc'
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

  async updateStatsDataStartDate(id: string, statsDataStartDate: Date | null): Promise<Client> {
    logger.info(`Updating client stats data start date: ${id}, ${statsDataStartDate}`)
    return prisma.client.update({
      where: { id },
      data: { statsDataStartDate }
    })
  }

}

// Export singleton instance
export const clientRepository = new ClientRepository()