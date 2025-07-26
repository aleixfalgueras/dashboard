'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Upload, FileJson, Loader2 } from 'lucide-react'
import { uploadInstagramData } from '@/app/actions/instagram-upload'

export default function AdminPage() {
  const [clientName, setClientName] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const { toast } = useToast()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setUploadedFile(acceptedFiles[0])
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/json': ['.json']
    },
    maxFiles: 1
  })

  const handleUpload = async () => {
    if (!uploadedFile || !clientName.trim()) {
      toast({
        title: 'Missing information',
        description: 'Please provide both a client name and a JSON file.',
        variant: 'destructive'
      })
      return
    }

    setUploading(true)

    try {
      const fileContent = await uploadedFile.text()
      const jsonData = JSON.parse(fileContent)

      const formData = new FormData()
      formData.append('clientName', clientName)
      formData.append('jsonData', JSON.stringify(jsonData))

      const result = await uploadInstagramData(formData)

      if (!result.success) {
        throw new Error(result.error || 'Upload failed')
      }

      toast({
        title: 'Upload successful',
        description: `Dashboard created at: /${result.data?.slug}`
      })

      // Reset form
      setClientName('')
      setUploadedFile(null)
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Failed to process the file',
        variant: 'destructive'
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>Upload Instagram Data</CardTitle>
          <CardDescription>
            Upload Instagram JSON data to create analytics dashboards
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="client-name">Client Name</Label>
            <Input
              id="client-name"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Enter client name"
              disabled={uploading}
            />
          </div>

          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/25 hover:border-primary'
            }`}
          >
            <input {...getInputProps()} />
            {uploadedFile ? (
              <div className="space-y-2">
                <FileJson className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="text-sm font-medium">{uploadedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(uploadedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {isDragActive ? 'Drop the file here' : 'Drag & drop a JSON file here, or click to select'}
                </p>
              </div>
            )}
          </div>

          <Button
            onClick={handleUpload}
            disabled={!uploadedFile || !clientName.trim() || uploading}
            className="w-full"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Upload and Create Dashboard'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}