import { instagramService } from './instagram-service'
import { DataSource } from '@/lib/types/common/enums'
import {UploadProcessingResult, UploadRequestDto} from "@/lib/types/common/upload-types";

export class UploadService {
  async processUpload(uploadRequestDto: UploadRequestDto): Promise<UploadProcessingResult> {
    try {
      // Route to appropriate processor based on data source
      switch (uploadRequestDto.dataSource) {
        case DataSource.INSTAGRAM_CONTENT:
          return await instagramService.processUpload(uploadRequestDto)
        default:
          throw new Error(`Unsupported data source: ${uploadRequestDto.dataSource}`)
      }
    } catch (error) {
      console.error('Upload processing error:', error)
      throw error
    }
  }
}

// Export singleton instance
export const uploadService = new UploadService()