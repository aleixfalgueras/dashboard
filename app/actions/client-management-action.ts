'use server'

import { clientService } from '@/services/client-service'
import { Client } from '@prisma/client'
import {logger} from "@/lib/utils";

export async function createClient(formData: FormData) {
  try {
    const name = formData.get('name') as string

    if (!name?.trim()) {
      return {
        success: false,
        error: 'Client name is required'
      }
    }

    // Check if client with this name already exists
    const existingClient = await clientService.getClientByName(name.trim())
    if (existingClient) {
      return {
        success: false,
        error: 'A client with this name already exists'
      }
    }

    const client = await clientService.createClient(name.trim())
    
    return {
      success: true,
      data: {
        id: client.id,
        name: client.name,
        slug: client.slug
      }
    }
  } catch (error) {
    logger.error('Create client error:', error)
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create client'
    }
  }
}

export async function getAllClients(): Promise<Client[]> {
  try {
    return await clientService.getAllClients()

  } catch (error) {
    logger.error('Get clients error:', error)
    return []
  }
}

export async function deleteClient(clientId: string) {
  try {
    await clientService.deleteClientById(clientId)
    
    return {
      success: true
    }
  } catch (error) {
    logger.error('Delete client error:', error)
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete client'
    }
  }
}