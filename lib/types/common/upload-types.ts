// Upload processing result
export interface UploadProcessingResult {
  success: boolean
  slug: string
  username: string
}

// Upload request DTO
export interface UploadRequestDto {
  clientId: string
  dataSource: import('../common/enums').DataSource
  jsonData: string
}