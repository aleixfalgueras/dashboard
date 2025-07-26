import { nanoid } from 'nanoid'
import { clientRepository } from '@/repositories/client-repository'
import { Client } from '@prisma/client'
import { FullClientData } from '@/lib/types/dashboard-types'

export class ClientService {
  async createClient(name: string): Promise<Client> {
    const slug = this.generateSlug(name)
    
    return clientRepository.create({
      name,
      slug
    })
  }

  async getClientByName(name: string): Promise<Client | null> {
    return clientRepository.findByName(name)
  }

  async getClientById(id: string): Promise<Client | null> {
    return clientRepository.findById(id)
  }

  async getClientFullData(slug: string): Promise<FullClientData | null> {
    return clientRepository.findBySlugWithFullData(slug)
  }

  async getAllClients(): Promise<Client[]> {
    return await clientRepository.findMany()
  }

  async deleteClientById(id: string): Promise<void> {
    await clientRepository.delete(id)
  }

  private generateSlug(name: string): string {
    // Convert name to URL-friendly format
    const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
    return `${cleanName}_${nanoid(6)}`
  }

}

// Export singleton instance
export const clientService = new ClientService()