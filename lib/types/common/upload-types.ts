// Upload request DTO
export interface UploadRequestDto {
  clientId: string
  dataSource: import('../common/enums').DataSource
  jsonData: string
  fileName: string
  overwriteData: boolean
}