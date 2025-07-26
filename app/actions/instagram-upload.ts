'use server'

import { uploadService } from '@/services/upload-service'
import { UploadRequestDto } from '@/lib/types/instagram/upload-dto'

export async function uploadInstagramData(formData: FormData) {
  try {
    const clientName = formData.get('clientName') as string
    const jsonData = formData.get('jsonData') as string

    if (!clientName || !jsonData) {
      return {
        success: false,
        error: 'Missing client name or data'
      }
    }

    const dto: UploadRequestDto = {
      clientName,
      jsonData
    }

    const result = await uploadService.processUpload(dto)
    
    return {
      success: result.success,
      data: {
        slug: result.slug,
        username: result.username
      }
    }
  } catch (error) {
    console.error('Upload action error:', error)
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process upload'
    }
  }
}