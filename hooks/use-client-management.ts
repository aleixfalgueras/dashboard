'use client'

import { useState, useEffect } from 'react'
import { Client } from '@prisma/client'
import { createClient, getAllClients, deleteClient } from '@/app/actions/client-management-action'
import { useToast } from '@/hooks/use-toast'
import { useTranslations } from '@/lib/translations/context'
import {logger} from "@/lib/utils";

export function useClientManagement() {
  const [clients, setClients] = useState<Client[]>([])
  const [creating, setCreating] = useState(false)
  const { toast } = useToast()
  const t = useTranslations('toasts')
  const tValidation = useTranslations('validation')

  useEffect(() => {
    void loadClients()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadClients = async () => {
    try {
      const clientList = await getAllClients()
      setClients(clientList)
    } catch (error) {
      logger.error('Error loading clients:', error)
      toast({
        title: t('loadClientsError'),
        description: t('loadClientsError'),
        variant: 'destructive'
      })
    }
  }

  const handleCreateClient = async (name: string) => {
    if (!name.trim()) {
      toast({
        title: t('createClientError'),
        description: tValidation('clientNameRequired'),
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
        title: t('clientCreatedSuccess'),
        description: `Client "${result.data?.name}" created successfully`
      })

      await loadClients()
      return { success: true, data: result.data }
    } catch (error) {
      logger.error('Create client error:', error)
      toast({
        title: t('createClientError'),
        description: error instanceof Error ? error.message : t('createClientError'),
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
        title: t('clientDeleteSuccess'),
        description: t('clientDeleteSuccess')
      })

      await loadClients()
      return { success: true, clientId }
    } catch (error) {
      logger.error('Delete client error:', error)
      toast({
        title: t('deleteClientError'),
        description: error instanceof Error ? error.message : t('deleteClientError'),
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