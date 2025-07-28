import { prisma } from '@/lib/prisma'
import { YoutubeProfile, YoutubeVideo, Prisma } from '@prisma/client'
import { logger } from "@/lib/utils"

export class YoutubeRepository {
  // Profile operations
  async createYoutubeProfile(data: Prisma.YoutubeProfileCreateInput): Promise<YoutubeProfile> {
    return prisma.youtubeProfile.create({ data })
  }

  async updateYoutubeProfile(id: string, data: Prisma.YoutubeProfileUpdateInput): Promise<YoutubeProfile> {
    return prisma.youtubeProfile.update({
      where: { id },
      data
    })
  }

  // Video operations
  async createManyYoutubeVideos(data: Prisma.YoutubeVideoCreateManyInput[]): Promise<Prisma.BatchPayload> {
    return prisma.youtubeVideo.createMany({ data })
  }

  // Find operations
  async findYoutubeProfileByClientId(clientId: string): Promise<YoutubeProfile | null> {
    return prisma.youtubeProfile.findUnique({
      where: { clientId }
    })
  }

  // Delete operations
  async deleteYoutubeProfileByClientId(clientId: string): Promise<YoutubeProfile | null> {
    logger.info(`Attempting to delete YouTube profile for client ${clientId}`)
    
    // Check if profile exists first
    const existingProfile = await this.findYoutubeProfileByClientId(clientId)
    
    if (!existingProfile) {
      logger.info(`No YouTube profile found for client ${clientId}, nothing to delete`)
      return null
    }
    
    const result = await prisma.youtubeProfile.delete({
      where: {
        clientId: clientId
      }
    })
    
    logger.info(`Deleted YouTube profile for client ${clientId}`)
    return result
  }

}

// Export singleton instance
export const youtubeRepository = new YoutubeRepository()