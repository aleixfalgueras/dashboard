import { NextRequest, NextResponse } from 'next/server'
import { uploadService } from '@/services/upload-service'
import { UploadRequestDto } from '@/lib/types/instagram/upload-dto'
import { z } from 'zod'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const clientName = formData.get('clientName') as string
    const jsonData = formData.get('jsonData') as string

    if (!clientName || !jsonData) {
      return NextResponse.json(
        { error: 'Missing client name or data' },
        { status: 400 }
      )
    }

    const dto: UploadRequestDto = {
      clientName,
      jsonData
    }

    const result = await uploadService.processUpload(dto)

    return NextResponse.json({
      success: result.success,
      slug: result.slug,
      username: result.username
    })

  } catch (error) {
    console.error('Upload API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data format', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process upload' },
      { status: 500 }
    )
  }
}