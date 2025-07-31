'use client'

import {useCallback, useState} from 'react'
import {useDropzone} from 'react-dropzone'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import {Checkbox} from '@/components/ui/checkbox'
import {useToast} from '@/hooks/use-toast'
import {ChevronDown, Eraser, FileJson, Loader2, Plus, Settings, Trash2, Upload} from 'lucide-react'
import {SiInstagram, SiLinkedin, SiTiktok, SiYoutube} from 'react-icons/si'
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from '@/components/ui/tooltip'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from '@/components/ui/dialog'
import {uploadDataSource} from '@/app/actions/upload-action'
import {useClientManagement} from '@/hooks/use-client-management'
import {AvailableDatasources, DataSource} from '@/lib/types/common/enums'
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,} from '@/components/ui/dropdown-menu'
import {logger} from "@/lib/utils";
import {
  cleanAllClientData,
  cleanClientData,
  updateClientStatsDataStartDate
} from '@/app/actions/client-management-action';
import {DatePicker} from '@/components/ui/date-picker'
import {format, parse} from 'date-fns'
import {Logo} from '@/components/ui/logo'
import {ThemeToggle} from '@/components/theme-toggle'
import {LogoutButton} from '@/components/auth/logout-button'
import {UserManagement} from '@/components/admin/UserManagement'
import {ViewDashboardButton} from '@/components/admin/ViewDashboardButton'

export default function AdminPage() {
  const [selectedClientId, setSelectedClientId] = useState<string>('')
  const [selectedDataSource, setSelectedDataSource] = useState<DataSource>(DataSource.INSTAGRAM_POSTS)
  const [overwriteData, setOverwriteData] = useState(true)
  const [newClientName, setNewClientName] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [clientToDelete, setClientToDelete] = useState<string | null>(null)
  const [showCleanDataDialog, setShowCleanDataDialog] = useState(false)
  const [clientToClean, setClientToClean] = useState<string | null>(null)
  const [selectedCleanDataSource, setSelectedCleanDataSource] = useState<AvailableDatasources | null>(null)
  const [cleaning, setCleaning] = useState(false)
  const [showConfigureDialog, setShowConfigureDialog] = useState(false)
  const [selectedConfigClient, setSelectedConfigClient] = useState<string | null>(null)
  const [selectedStartDate, setSelectedStartDate] = useState<string>('')
  const [configuringDashboard, setConfiguringDashboard] = useState(false)
  const { toast } = useToast()
  const { clients, creating, loadClients, createClient, deleteClient } = useClientManagement()

  const getDataSourceDisplay = (dataSource: DataSource) => {
    switch (dataSource) {
      case DataSource.INSTAGRAM_PROFILE:
        return {
          icon: <SiInstagram className="mr-2 h-4 w-4" />,
          label: DataSource.INSTAGRAM_PROFILE
        }
      case DataSource.INSTAGRAM_POSTS:
        return {
          icon: <SiInstagram className="mr-2 h-4 w-4" />,
          label: DataSource.INSTAGRAM_POSTS
        }
      case DataSource.TIKTOK:
        return {
          icon: <SiTiktok className="mr-2 h-4 w-4" />,
          label: DataSource.TIKTOK
        }
      case DataSource.LINKEDIN:
        return {
          icon: <SiLinkedin className="mr-2 h-4 w-4" />,
          label: DataSource.LINKEDIN
        }
      case DataSource.YOUTUBE:
        return {
          icon: <SiYoutube className="mr-2 h-4 w-4" />,
          label: DataSource.YOUTUBE
        }
      default:
        return {
          icon: <SiInstagram className="mr-2 h-4 w-4" />,
          label: 'Not Found'
        }
    }
  }

  const getAvailableDataSourceDisplay = (dataSource: AvailableDatasources) => {
    switch (dataSource) {
      case AvailableDatasources.TIKTOK:
        return <SiTiktok className="mr-2 h-4 w-4" />
      case AvailableDatasources.LINKEDIN:
        return <SiLinkedin className="mr-2 h-4 w-4" />
      case AvailableDatasources.INSTAGRAM:
        return <SiInstagram className="mr-2 h-4 w-4" />
      case AvailableDatasources.YOUTUBE:
        return <SiYoutube className="mr-2 h-4 w-4" />
      case AvailableDatasources.ALL:
        return <Eraser className="mr-2 h-4 w-4" />
      default:
        return <SiInstagram className="mr-2 h-4 w-4" />
    }
  }

  const getDataSourceFromFilename = (filename: string): DataSource | null => {
    const lowerFilename = filename.toLowerCase()
    
    if (lowerFilename.includes('instagramprofile') || lowerFilename.includes('instagram_profiel') ||
      lowerFilename.includes('instagram_profile') || lowerFilename.includes('instagramprofiel')) {
      return DataSource.INSTAGRAM_PROFILE
    }
    if (lowerFilename.includes('instagram')) {
      return DataSource.INSTAGRAM_POSTS
    }
    if (lowerFilename.includes('tiktok')) {
      return DataSource.TIKTOK
    }
    if (lowerFilename.includes('linkedin')) {
      return DataSource.LINKEDIN
    }
    if (lowerFilename.includes('youtube')) {
      return DataSource.YOUTUBE
    }
    
    return null
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

  const handleOpenCleanDataDialog = (clientId: string) => {
    setClientToClean(clientId)
    setSelectedCleanDataSource(null)
    setShowCleanDataDialog(true)
  }

  const handleCloseCleanDataDialog = () => {
    setShowCleanDataDialog(false)
    setClientToClean(null)
    setSelectedCleanDataSource(null)
  }

  const handleCleanData = async () => {
    if (!clientToClean || !selectedCleanDataSource) return

    setCleaning(true)
    try {
      let result
      if (selectedCleanDataSource === AvailableDatasources.ALL) {
        result = await cleanAllClientData(clientToClean)
      } else {
        result = await cleanClientData(clientToClean, selectedCleanDataSource)
      }
      
      if (result.success) {
        toast({
          title: 'Data cleaned successfully',
          description: selectedCleanDataSource === AvailableDatasources.ALL 
            ? 'All data has been removed for this client.'
            : `${selectedCleanDataSource} data has been removed for this client.`
        })
        handleCloseCleanDataDialog()
      } else {
        throw new Error(result.error || 'Failed to clean data')
      }
    } catch (error) {
      logger.error('Clean data error:', error)
      toast({
        title: 'Failed to clean data',
        description: error instanceof Error ? error.message : 'An error occurred while cleaning data',
        variant: 'destructive'
      })
    } finally {
      setCleaning(false)
    }
  }

  const handleOpenConfigureDialog = (clientId: string) => {
    const client = clients.find(c => c.id === clientId)
    setSelectedConfigClient(clientId)
    setSelectedStartDate(client?.statsDataStartDate ? format(client.statsDataStartDate, 'dd-MM-yyyy') : '')
    setShowConfigureDialog(true)
  }

  const handleCloseConfigureDialog = () => {
    setShowConfigureDialog(false)
    setSelectedConfigClient(null)
    setSelectedStartDate('')
  }

  const handleUpdateStatsDataStartDate = async () => {
    if (!selectedConfigClient) return

    setConfiguringDashboard(true)
    try {
      const dateToSend = selectedStartDate ? parse(selectedStartDate, 'dd-MM-yyyy', new Date()) : null
      const result = await updateClientStatsDataStartDate(selectedConfigClient, dateToSend)
      
      if (result.success) {
        toast({
          title: 'Configuration updated',
          description: selectedStartDate 
            ? `Stats will be calculated from ${selectedStartDate}`
            : 'Stats data start date has been cleared'
        })
        await loadClients()
        handleCloseConfigureDialog()
      } else {
        throw new Error(result.error || 'Failed to update configuration')
      }
    } catch (error) {
      logger.error('Configure dashboard error:', error)
      toast({
        title: 'Failed to update configuration',
        description: error instanceof Error ? error.message : 'An error occurred while updating configuration',
        variant: 'destructive'
      })
    } finally {
      setConfiguringDashboard(false)
    }
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      setUploadedFile(file)
      
      const detectedDataSource = getDataSourceFromFilename(file.name)
      if (detectedDataSource) {
        setSelectedDataSource(detectedDataSource)
      }
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
      
      // Add file size validation
      if (fileContent.length > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: 'File too large',
          description: 'Please upload files smaller than 10MB.',
          variant: 'destructive'
        })
        return
      }

      // Normalize data for consistent checksum calculation
      const normalizeForChecksum = (str: string) => {
        return str.replace(/\r\n/g, '\n').trim()
      }

      // Calculate simple checksum for integrity validation
      const calculateChecksum = (str: string) => {
        let hash = 0
        for (let i = 0; i < str.length; i++) {
          const char = str.charCodeAt(i)
          hash = ((hash << 5) - hash) + char
          hash = hash & hash // Convert to 32bit integer
        }
        return hash.toString(16)
      }

      const normalizedContent = normalizeForChecksum(fileContent)
      const clientChecksum = calculateChecksum(normalizedContent)

      // Pre-upload validation and integrity check
      logger.info(`Client-side upload details:
        - File name: ${uploadedFile.name}
        - File size: ${uploadedFile.size} bytes
        - Content length: ${fileContent.length} characters
        - Checksum: ${clientChecksum}
        - First 100 chars: ${fileContent.slice(0, 100)}
        - Last 100 chars: ${fileContent.slice(-100)}`)

      // Test JSON parsing on client side for immediate feedback
      try {
        JSON.parse(normalizedContent);
        logger.info('Client-side JSON validation passed')
      } catch (clientJsonError) {
        logger.error('Client-side JSON validation failed:', clientJsonError)
        toast({
          title: 'Invalid JSON file',
          description: `JSON parsing error: ${clientJsonError instanceof Error ? clientJsonError.message : 'Unknown error'}`,
          variant: 'destructive'
        })
        return
      }

      const formData = new FormData()
      formData.append('clientId', selectedClientId)
      formData.append('dataSource', selectedDataSource)
      formData.append('jsonData', normalizedContent) // Send normalized content
      formData.append('fileName', uploadedFile.name)
      formData.append('overwriteData', overwriteData.toString())
      formData.append('checksum', clientChecksum) // Add integrity check

      const result = await uploadDataSource(formData)

      if (!result.success) {
        throw new Error(result.error || 'Upload failed')
      }

      toast({
        title: 'Upload successful',
        description: `${selectedDataSource} data propagated successfully`
      })

      // Reset upload file
      setUploadedFile(null)
    } catch (error) {
      logger.error('Upload error:', error)
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
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Logo size="lg" />
          <h1 className="text-4xl font-bold mb-2 text-accent">Dico De Rooij Dashboards</h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LogoutButton />
        </div>
      </div>

      <div className="space-y-6">
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

            <div className="flex items-center space-x-2">
              <Checkbox
                id="overwrite-data"
                checked={overwriteData}
                onCheckedChange={(checked) => setOverwriteData(checked === true)}
                disabled={uploading}
              />
              <Label
                htmlFor="overwrite-data"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Overwrite existing data
              </Label>
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
              className="w-full bg-accent hover:bg-accent/90"
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
                        <ViewDashboardButton 
                          clientSlug={client.slug}
                          disabled={uploading || creating || cleaning || configuringDashboard}
                        />
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenConfigureDialog(client.id)}
                              disabled={uploading || creating || cleaning || configuringDashboard}
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Configure dashboard</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenCleanDataDialog(client.id)}
                              disabled={uploading || creating || cleaning}
                            >
                              <Eraser className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Clean data</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setClientToDelete(client.id)}
                              disabled={uploading || creating || cleaning || configuringDashboard}
                            >
                              <Trash2 className="h-4 w-4 text-destructive hover:text-destructive/80" />
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

        {/* User Management */}
        <UserManagement clients={clients} />
      </div>
      </div>

      <Dialog open={showCleanDataDialog} onOpenChange={handleCloseCleanDataDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clean Data</DialogTitle>
            <DialogDescription>
              Select the data source you want to clean for this client. Choose &quot;All Data&quot; to remove all platform data at once. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Data Source</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between h-10"
                    disabled={cleaning}
                  >
                    <div className="flex items-center">
                      {selectedCleanDataSource ? (
                        <>
                          {getAvailableDataSourceDisplay(selectedCleanDataSource)}
                          {selectedCleanDataSource}
                        </>
                      ) : (
                        'Select data source'
                      )}
                    </div>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-full"
                  style={{width: 'var(--radix-dropdown-menu-trigger-width)'}}>
                  {Object.values(AvailableDatasources).map((dataSource) => (
                    <DropdownMenuItem
                      key={dataSource}
                      onClick={() => setSelectedCleanDataSource(dataSource)}
                    >
                      {getAvailableDataSourceDisplay(dataSource)}
                      {dataSource}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseCleanDataDialog}
              disabled={cleaning}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCleanData}
              disabled={!selectedCleanDataSource || cleaning}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {cleaning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cleaning...
                </>
              ) : (
                'Clean Data'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showConfigureDialog} onOpenChange={handleCloseConfigureDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configure Dashboard</DialogTitle>
            <DialogDescription>
              Set the start date for statistics calculations. Only data created after this date will be included in dashboard metrics.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Stats Data Start Date</Label>
              <DatePicker
                value={selectedStartDate}
                onChange={setSelectedStartDate}
                placeholder="Pick a date"
                disabled={configuringDashboard}
              />
              {selectedStartDate && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => setSelectedStartDate('')}
                  className="text-xs text-muted-foreground"
                >
                  Clear date
                </Button>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseConfigureDialog}
              disabled={configuringDashboard}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateStatsDataStartDate}
              disabled={configuringDashboard}
              className="bg-accent hover:bg-accent/90"
            >
              {configuringDashboard ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Configuration'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
