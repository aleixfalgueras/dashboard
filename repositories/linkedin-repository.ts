import { prisma } from '@/lib/prisma'
import { LinkedinProfile, Prisma } from '@prisma/client'
import { logger } from "@/lib/utils"

export class LinkedinRepository {
  // Profile operations
  async createLinkedinProfile(data: Prisma.LinkedinProfileCreateInput): Promise<LinkedinProfile> {
    return prisma.linkedinProfile.create({ data })
  }

  async updateLinkedinProfile(id: string, data: Prisma.LinkedinProfileUpdateInput): Promise<LinkedinProfile> {
    return prisma.linkedinProfile.update({
      where: { id },
      data
    })
  }

  // Post operations
  async createManyLinkedinPosts(data: Prisma.LinkedinPostCreateManyInput[]): Promise<Prisma.BatchPayload> {
    return prisma.linkedinPost.createMany({ data })
  }

  // Find operations
  async findLinkedinProfileByClientId(clientId: string): Promise<LinkedinProfile | null> {
    return prisma.linkedinProfile.findUnique({
      where: { clientId }
    })
  }

  // Delete operations
  async deleteLinkedinProfileByClientId(clientId: string): Promise<LinkedinProfile | null> {
    logger.info(`Attempting to delete LinkedIn profile for client ${clientId}`)
    
    // Check if profile exists first
    const existingProfile = await this.findLinkedinProfileByClientId(clientId)
    
    if (!existingProfile) {
      logger.info(`No LinkedIn profile found for client ${clientId}, nothing to delete`)
      return null
    }
    
    const result = await prisma.linkedinProfile.delete({
      where: {
        clientId: clientId
      }
    })
    
    logger.info(`Deleted LinkedIn profile for client ${clientId}`)
    return result
  }

}

// Export singleton instance
export const linkedinRepository = new LinkedinRepository()