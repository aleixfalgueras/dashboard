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
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from '@/components/ui/tooltip'
import {AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle} from '@/components/ui/alert-dialog'
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
  const [clientToDelete, setClientToDelete] = useState<string | null>(null)
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
          label: 'Not Found'
        }
    }
  }

  const getSelectedClientDisplay = () => {
    if (clients.length === 0) {
      return "No clients available"
    }
    if (!selectedClientId) {
      return "Select a client"
    }
    const selectedClient = clients.find(client => client.id === selectedClientId)
    return selectedClient?.name || "Select a client"
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
    setClientToDelete(null)
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
      formData.append('fileName', uploadedFile.name)

      const result = await uploadDataSource(formData)

      if (!result.success) {
        throw new Error(result.error || 'Upload failed')
      }

      toast({
        title: 'Upload successful',
        description: `${selectedDataSource} data propagated successfully`
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
    <TooltipProvider>
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
                        <h4 className="font-medium">
                          {client.name} <span className="text-sm text-muted-foreground font-normal">({client.slug})</span>
                        </h4>
                        <p className="text-sm text-muted-foreground">Created {new Date(client.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link href={`/${client.slug}`}>
                              <Button variant="outline" size="sm">
                                <ArrowRight className="h-4 w-4" />
                              </Button>
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View dashboard</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setClientToDelete(client.id)}
                              disabled={uploading || creating}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Delete client</p>
                          </TooltipContent>
                        </Tooltip>
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between h-10"
                      disabled={uploading || clients.length === 0}
                    >
                      <div className="flex items-center">
                        {getSelectedClientDisplay()}
                      </div>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    className="w-full" 
                    style={{ width: 'var(--radix-dropdown-menu-trigger-width)' }}
                  >
                    {clients.map((client) => (
                      <DropdownMenuItem
                        key={client.id}
                        onClick={() => setSelectedClientId(client.id)}
                      >
                        {client.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
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
              'Upload Data'
            )}
          </Button>
          </CardContent>
        </Card>
      </div>
      </div>

      <AlertDialog open={!!clientToDelete} onOpenChange={() => setClientToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Client</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this client? This action cannot be undone and will remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => clientToDelete && handleDeleteClient(clientToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  )
}
