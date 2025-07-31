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
    const clientChecksum = formData.get('checksum') as string

    if (!clientId || !dataSource || !jsonData || !fileName) {
      return {
        success: false,
        error: 'Missing client, data source, data, or file name'
      }
    }

    // Normalize data for consistent checksum calculation
    const normalizeForChecksum = (str: string) => {
      return str.replace(/\r\n/g, '\n').trim()
    }

    // Calculate server-side checksum for integrity validation
    const calculateChecksum = (str: string) => {
      let hash = 0
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash // Convert to 32bit integer
      }
      return hash.toString(16)
    }

    const normalizedJsonData = normalizeForChecksum(jsonData || '')
    const serverChecksum = calculateChecksum(normalizedJsonData)

    // Enhanced logging for debugging
    logger.info(`Upload request details:
      - Client ID: ${clientId}
      - Data Source: ${dataSource}
      - File Name: ${fileName}
      - File Size: ${jsonData?.length || 0} characters
      - Client Checksum: ${clientChecksum}
      - Server Checksum: ${serverChecksum}
      - Integrity Check: ${clientChecksum === serverChecksum ? 'PASS' : 'FAIL'}
      - Overwrite: ${overwriteData}`)

    // Verify data integrity
    if (clientChecksum && clientChecksum !== serverChecksum) {
      logger.error('Data integrity check failed - checksums do not match')
      return {
        success: false,
        error: 'Data integrity check failed. The file may have been corrupted during transfer. Please try again.'
      }
    }

    const uploadRequestDto: UploadRequestDto = {
      clientId,
      dataSource: dataSource as DataSource,
      jsonData: normalizedJsonData,
      fileName,
      overwriteData
    }

    await uploadService.processUpload(uploadRequestDto)
    return { success: true }

  } catch (error) {
    logger.error('Upload action error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      type: error?.constructor?.name || 'Unknown'
    })
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process upload'
    }
  }
}