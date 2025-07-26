import { nanoid } from 'nanoid'
import { clientRepository } from '@/repositories/client-repository'
import { Client } from '@prisma/client'
import { ClientDashboardData, ClientListItem } from '@/lib/types/client/dashboard-dto'

export class ClientService {
  async createClient(username: string): Promise<Client> {
    const slug = this.generateSlug(username)
    
    return clientRepository.create({
      username,
      slug
    })
  }

  async getClientByUsername(username: string): Promise<Client | null> {
    return clientRepository.findByUsername(username)
  }

  async getClientDashboardData(slug: string): Promise<ClientDashboardData | null> {
    return clientRepository.findBySlugWithFullData(slug)
  }

  async getAllClients(): Promise<ClientListItem[]> {
    const clients = await clientRepository.findMany()
    
    return clients.map(client => ({
      ...client,
      lastUpload: client.uploads[0] ? {
        processedAt: client.uploads[0].processedAt
      } : undefined
    }))
  }

  async deleteClientByUsername(username: string): Promise<void> {
    await clientRepository.deleteByUsername(username)
  }

  private generateSlug(username: string): string {
    return `${username}_${nanoid(6)}`
  }

  // Extract username from Instagram URL
  extractUsernameFromUrl(url: string): string {
    const match = url.match(/instagram\.com\/([^\/]+)/)
    return match ? match[1] : 'unknown'
  }
}

// Export singleton instance
export const clientService = new ClientService()