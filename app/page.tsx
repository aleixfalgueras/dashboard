import Link from 'next/link'
import { clientService } from '@/services/client-service'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, Upload } from 'lucide-react'


export default async function Home() {
  const clients = await clientService.getAllClients()

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Instagram Analytics Dashboard</h1>
        <p className="text-muted-foreground">View analytics for Instagram profiles</p>
      </div>

      <div className="mb-8">
        <Link href="/admin">
          <Button>
            <Upload className="mr-2 h-4 w-4" />
            Upload New Data
          </Button>
        </Link>
      </div>

      {clients.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No dashboards created yet</p>
            <Link href="/admin">
              <Button variant="outline">
                Upload your first Instagram data
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => (
            <Card key={client.id}>
              <CardHeader>
                <CardTitle>@{client.username}</CardTitle>
                {client.profile && (
                  <CardDescription>{client.profile.fullName}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  {client.profile && (
                    <>
                      <p className="text-sm text-muted-foreground">
                        {client.profile.postsCount} posts analyzed
                      </p>
                      {client.lastUpload && (
                        <p className="text-xs text-muted-foreground">
                          Last updated: {new Date(client.lastUpload.processedAt).toLocaleDateString()}
                        </p>
                      )}
                    </>
                  )}
                </div>
                <Link href={`/${client.slug}`}>
                  <Button className="w-full">
                    View Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
