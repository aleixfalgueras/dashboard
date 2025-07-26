'use server'

import { uploadService } from '@/services/upload-service'
import { UploadRequestDto } from '@/lib/types/instagram/upload-dto'

export async function uploadInstagramData(formData: FormData) {
  try {
    const clientId = formData.get('clientId') as string
    const jsonData = formData.get('jsonData') as string

    if (!clientId || !jsonData) {
      return {
        success: false,
        error: 'Missing client or data'
      }
    }

    const uploadRequestDto: UploadRequestDto = {
      clientId,
      jsonData
    }

    const result = await uploadService.processUpload(uploadRequestDto)
    
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