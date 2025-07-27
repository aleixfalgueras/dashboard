'use server'

import { uploadService } from '@/services/upload-service'
import { DataSource } from '@/lib/types/common/enums'
import {UploadRequestDto} from "@/lib/types/common/upload-types";
import {logger} from "@/lib/utils";

export async function uploadDataSource(formData: FormData) {
  try {
    const clientId = formData.get('clientId') as string
    const dataSource = formData.get('dataSource') as string
    const jsonData = formData.get('jsonData') as string
    const fileName = formData.get('fileName') as string
    const overwriteData = formData.get('overwriteData') === 'true'

    if (!clientId || !dataSource || !jsonData || !fileName) {
      return {
        success: false,
        error: 'Missing client, data source, data, or file name'
      }
    }

    const uploadRequestDto: UploadRequestDto = {
      clientId,
      dataSource: dataSource as DataSource,
      jsonData,
      fileName,
      overwriteData
    }

    await uploadService.processUpload(uploadRequestDto)
    return { success: true }

  } catch (error) {
    logger.error('Upload action error:', error)
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process upload'
    }
  }
}