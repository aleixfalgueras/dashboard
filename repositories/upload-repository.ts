import { prisma } from '@/lib/prisma'
import { Upload, Prisma } from '@prisma/client'

export class UploadRepository {

  async create(data: Prisma.UploadCreateInput): Promise<Upload> {
    return prisma.upload.create({ data })
  }

}

// Export singleton instance
export const uploadRepository = new UploadRepository()