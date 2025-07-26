import { prisma } from '@/lib/prisma'
import { uploadRepository } from '@/repositories/upload-repository'
import { clientService } from './client-service'
import { instagramService } from './instagram-service'
import { 
  InstagramDataSchema, 
  UploadProcessingResult,
  UploadRequestDto 
} from '@/lib/types/instagram/upload-dto'
import { z } from 'zod'

export class UploadService {
  async processUpload(uploadRequestDto: UploadRequestDto): Promise<UploadProcessingResult> {
    try {
      // Parse and validate the JSON data
      const parsedData = JSON.parse(uploadRequestDto.jsonData)
      const validatedData = InstagramDataSchema.parse(parsedData)

      // Get the client by ID
      const client = await clientService.getClientById(uploadRequestDto.clientId)
      if (!client) {
        throw new Error('Client not found')
      }

      // Extract username from the first post for Instagram profile
      const firstPost = validatedData[0]
      const extractUsernameFromUrl = (url: string): string => {
        const match = url.match(/instagram\.com\/([^\/]+)/)
        return match ? match[1] : 'unknown'
      }
      const username = extractUsernameFromUrl(firstPost.inputUrl)

      // Process in a transaction
      const result = await prisma.$transaction(async () => {
        // Delete existing Instagram profile (handles case where none exists)
        await instagramService.deleteProfile(client.id)

        // Create Instagram profile
        const profileId = await instagramService.createProfileFromData(
          client.id, 
          validatedData
        )

        // Create posts and comments
        await instagramService.createPostsFromData(profileId, validatedData)

        // Store raw upload data
        await uploadRepository.create({
          client: { connect: { id: client.id } },
          filename: `${client.name}_${new Date().toISOString()}.json`,
          rawData: parsedData
        })

        return client
      })

      return {
        success: true,
        slug: result.slug,
        username: username
      }
    } catch (error) {
      console.error('Upload processing error:', error)
      
      if (error instanceof z.ZodError) {
        throw new Error(`Invalid data format: ${error.issues[0]?.message || 'Unknown validation error'}`)
      }
      
      throw error
    }
  }
}

// Export singleton instance
export const uploadService = new UploadService()