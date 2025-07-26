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
  async processUpload(dto: UploadRequestDto): Promise<UploadProcessingResult> {
    try {
      // Parse and validate the JSON data
      const parsedData = JSON.parse(dto.jsonData)
      const validatedData = InstagramDataSchema.parse(parsedData)

      // Extract username from the first post
      const firstPost = validatedData[0]
      const username = clientService.extractUsernameFromUrl(firstPost.inputUrl)

      // Process in a transaction
      const result = await prisma.$transaction(async () => {
        // Check if client exists and delete old data if needed
        const existingClient = await clientService.getClientByUsername(username)
        
        if (existingClient) {
          // Delete existing client and all related data (cascade)
          await clientService.deleteClientByUsername(username)
        }

        // Create new client
        const client = await clientService.createClient(username)

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
          filename: `${dto.clientName}_${new Date().toISOString()}.json`,
          rawData: parsedData
        })

        return client
      })

      return {
        success: true,
        slug: result.slug,
        username: result.username
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