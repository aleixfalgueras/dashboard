'use client'

import { useState, useEffect } from 'react'
import { Client } from '@prisma/client'
import { createClient, getAllClients, deleteClient } from '@/app/actions/client-management-action'
import { useToast } from '@/hooks/use-toast'

export function useClientManagement() {
  const [clients, setClients] = useState<Client[]>([])
  const [creating, setCreating] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    void loadClients()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadClients = async () => {
    try {
      const clientList = await getAllClients()
      setClients(clientList)
    } catch (error) {
      console.error('Error loading clients:', error)
      toast({
        title: 'Error',
        description: 'Failed to load clients',
        variant: 'destructive'
      })
    }
  }

  const handleCreateClient = async (name: string) => {
    if (!name.trim()) {
      toast({
        title: 'Missing information',
        description: 'Please provide a client name.',
        variant: 'destructive'
      })
      return { success: false }
    }

    setCreating(true)

    try {
      const formData = new FormData()
      formData.append('name', name.trim())
      
      const result = await createClient(formData)
      
      if (!result.success) {
        throw new Error(result.error || 'Create failed')
      }

      toast({
        title: 'Client created',
        description: `Client "${result.data?.name}" created successfully`
      })

      await loadClients()
      return { success: true, data: result.data }
    } catch (error) {
      console.error('Create client error:', error)
      toast({
        title: 'Create failed',
        description: error instanceof Error ? error.message : 'Failed to create client',
        variant: 'destructive'
      })
      return { success: false }
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteClient = async (clientId: string) => {
    try {
      const result = await deleteClient(clientId)
      
      if (!result.success) {
        throw new Error(result.error || 'Delete failed')
      }

      toast({
        title: 'Client deleted',
        description: 'Client deleted successfully'
      })

      await loadClients()
      return { success: true, clientId }
    } catch (error) {
      console.error('Delete client error:', error)
      toast({
        title: 'Delete failed',
        description: error instanceof Error ? error.message : 'Failed to delete client',
        variant: 'destructive'
      })
      return { success: false }
    }
  }

  return {
    clients,
    creating,
    loadClients,
    createClient: handleCreateClient,
    deleteClient: handleDeleteClient
  }
}