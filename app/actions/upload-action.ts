'use server'

import { uploadService } from '@/services/upload-service'
import { DataSource } from '@/lib/types/common/enums'
import {UploadRequestDto} from "@/lib/types/common/upload-types";

export async function uploadDataSource(formData: FormData) {
  try {
    const clientId = formData.get('clientId') as string
    const dataSource = formData.get('dataSource') as string
    const jsonData = formData.get('jsonData') as string

    if (!clientId || !dataSource || !jsonData) {
      return {
        success: false,
        error: 'Missing client, data source, or data'
      }
    }

    const uploadRequestDto: UploadRequestDto = {
      clientId,
      dataSource: dataSource as DataSource,
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