import { instagramService } from './instagram-service'
import { DataSource } from '@/lib/types/common/enums'
import { UploadRequestDto} from "@/lib/types/common/upload-types";
import { z } from 'zod'

export class UploadService {

  async processUpload(uploadRequestDto: UploadRequestDto): Promise<void> {
    try {
      console.info(`Processing upload:
       datasource: ${uploadRequestDto.dataSource}, 
       clientId: ${uploadRequestDto.clientId}, 
       fileName: ${uploadRequestDto.fileName}`
      )

      // Route to appropriate processor based on data source
      if (uploadRequestDto.dataSource === DataSource.INSTAGRAM_CONTENT) {
        await instagramService.processInstagramContentUpload(uploadRequestDto)
      }
      else { throw new Error(`Unsupported data source: ${uploadRequestDto.dataSource}`) }

      console.info("Upload processed successfully!")

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