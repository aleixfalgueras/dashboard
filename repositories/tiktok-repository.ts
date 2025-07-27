import { prisma } from '@/lib/prisma'
import { TiktokProfile, TiktokPost, Prisma } from '@prisma/client'
import { logger } from "@/lib/utils"

export class TiktokRepository {
  // Profile operations
  async createTiktokProfile(data: Prisma.TiktokProfileCreateInput): Promise<TiktokProfile> {
    return prisma.tiktokProfile.create({ data })
  }

  async updateTiktokProfile(id: string, data: Prisma.TiktokProfileUpdateInput): Promise<TiktokProfile> {
    return prisma.tiktokProfile.update({
      where: { id },
      data
    })
  }

  // Post operations
  async createTiktokPost(data: Prisma.TiktokPostCreateInput): Promise<TiktokPost> {
    return prisma.tiktokPost.create({ data })
  }

  async createManyTiktokPosts(data: Prisma.TiktokPostCreateManyInput[]): Promise<Prisma.BatchPayload> {
    return prisma.tiktokPost.createMany({ data })
  }

  // Find operations
  async findTiktokProfileByClientId(clientId: string): Promise<TiktokProfile | null> {
    return prisma.tiktokProfile.findUnique({
      where: { clientId }
    })
  }

  // Delete operations
  async deleteTiktokProfileByClientId(clientId: string): Promise<TiktokProfile | null> {
    logger.info(`Attempting to delete TikTok profile for client ${clientId}`)
    
    // Check if profile exists first
    const existingProfile = await this.findTiktokProfileByClientId(clientId)
    
    if (!existingProfile) {
      logger.info(`No TikTok profile found for client ${clientId}, nothing to delete`)
      return null
    }
    
    const result = await prisma.tiktokProfile.delete({
      where: {
        clientId: clientId
      }
    })
    
    logger.info(`Deleted TikTok profile for client ${clientId}`)
    return result
  }

}

// Export singleton instance
export const tiktokRepository = new TiktokRepository()