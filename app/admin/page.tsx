'use client'

import {useCallback, useState} from 'react'
import {useDropzone} from 'react-dropzone'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import {useToast} from '@/hooks/use-toast'
import {ArrowRight, ChevronDown, FileJson, Loader2, Plus, Trash2, Upload} from 'lucide-react'
import {SiInstagram} from 'react-icons/si'
import {uploadDataSource} from '@/app/actions/upload-action'
import {useClientManagement} from '@/hooks/use-client-management'
import {DataSource} from '@/lib/types/common/enums'
import Link from 'next/link'
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,} from '@/components/ui/dropdown-menu'

export default function AdminPage() {
  const [selectedClientId, setSelectedClientId] = useState<string>('')
  const [selectedDataSource, setSelectedDataSource] = useState<DataSource>(DataSource.INSTAGRAM_CONTENT)
  const [newClientName, setNewClientName] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const { toast } = useToast()
  const { clients, creating, createClient, deleteClient } = useClientManagement()

  const getDataSourceDisplay = (dataSource: DataSource) => {
    switch (dataSource) {
      case DataSource.INSTAGRAM_PROFILE:
        return {
          icon: <SiInstagram className="mr-2 h-4 w-4" />,
          label: DataSource.INSTAGRAM_PROFILE
        }
      case DataSource.INSTAGRAM_CONTENT:
        return {
          icon: <SiInstagram className="mr-2 h-4 w-4" />,
          label: DataSource.INSTAGRAM_CONTENT
        }
      default:
        return {
          icon: <SiInstagram className="mr-2 h-4 w-4" />,
          label: 'Instagram Content'
        }
    }
  }

  const handleCreateClient = async () => {
    const result = await createClient(newClientName)
    if (result.success) {
      setNewClientName('')
      setShowCreateForm(false)
    }
  }

  const handleDeleteClient = async (clientId: string) => {
    const result = await deleteClient(clientId)
    if (result.success && selectedClientId === clientId) {
      setSelectedClientId('')
    }
  }

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
    if (!uploadedFile || !selectedClientId || !selectedDataSource) {
      toast({
        title: 'Missing information',
        description: 'Please select a data source, client, and provide a JSON file.',
        variant: 'destructive'
      })
      return
    }

    setUploading(true)

    try {
      const fileContent = await uploadedFile.text()
      const jsonData = JSON.parse(fileContent)

      const formData = new FormData()
      formData.append('clientId', selectedClientId)
      formData.append('dataSource', selectedDataSource)
      formData.append('jsonData', JSON.stringify(jsonData))

      const result = await uploadDataSource(formData)

      if (!result.success) {
        throw new Error(result.error || 'Upload failed')
      }

      toast({
        title: 'Upload successful',
        description: `Dashboard created at: /${result.data?.slug}`
      })

      // Reset form
      setSelectedClientId('')
      setSelectedDataSource(DataSource.INSTAGRAM_CONTENT)
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
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Dico De Rooij Dashboards</h1>
      </div>

      <div className="space-y-6">
        {/* Client Management */}
        <Card>
          <CardHeader>
            <CardTitle>Client Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Existing Clients</h3>
              <Button
                onClick={() => setShowCreateForm(true)}
                variant="outline"
                size="sm"
                disabled={creating || uploading}
              >
                <Plus className="mr-2 h-4 w-4" />
                New Client
              </Button>
            </div>

            {showCreateForm && (
              <div className="border rounded-lg p-4 space-y-3">
                <Label htmlFor="new-client-name">Client Name</Label>
                <div className="flex gap-2">
                  <Input
                    id="new-client-name"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    placeholder="Enter client name"
                    disabled={creating}
                  />
                  <Button
                    onClick={handleCreateClient}
                    disabled={!newClientName.trim() || creating}
                  >
                    {creating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create'
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCreateForm(false)
                      setNewClientName('')
                    }}
                    disabled={creating}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {clients.length === 0 ? (
                <p className="text-sm text-muted-foreground">No clients found. Create one to get started.</p>
              ) : (
                <div className="grid gap-2">
                  {clients.map((client) => (
                    <div key={client.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{client.name}</h4>
                        <p className="text-sm text-muted-foreground">Created {new Date(client.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/${client.slug}`}>
                          <Button variant="outline" size="sm">
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClient(client.id)}
                          disabled={uploading || creating}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upload Data */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="client-select">Select Client</Label>
                <select
                  id="client-select"
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  disabled={uploading || clients.length === 0}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="" disabled>
                    {clients.length === 0 ? "No clients available" : "Select a client"}
                  </option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-1 space-y-2">
                <Label htmlFor="data-source-select">Data Source</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between h-10"
                      disabled={uploading}
                    >
                      <div className="flex items-center">
                        {getDataSourceDisplay(selectedDataSource).icon}
                        {getDataSourceDisplay(selectedDataSource).label}
                      </div>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    className="w-full" 
                    style={{ width: 'var(--radix-dropdown-menu-trigger-width)' }}
                  >
                    {Object.values(DataSource).map((dataSource) => (
                      <DropdownMenuItem
                        key={dataSource}
                        onClick={() => setSelectedDataSource(dataSource)}
                      >
                        {getDataSourceDisplay(dataSource).icon}
                        {getDataSourceDisplay(dataSource).label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
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
            disabled={!uploadedFile || !selectedClientId || !selectedDataSource || uploading}
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
    </div>
  )
}
