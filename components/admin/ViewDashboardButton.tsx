'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { ArrowRight, Loader2 } from 'lucide-react'

interface ViewDashboardButtonProps {
  clientSlug: string
  disabled?: boolean
}

export function ViewDashboardButton({ clientSlug, disabled = false }: ViewDashboardButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = () => {
    setIsLoading(true)
    // The loading state will be cleared when the page unmounts or when navigating back
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link href={`/${clientSlug}`} onClick={handleClick}>
          <Button variant="outline" size="sm" disabled={disabled || isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
          </Button>
        </Link>
      </TooltipTrigger>
      <TooltipContent>
        <p>{isLoading ? 'Loading dashboard...' : 'View dashboard'}</p>
      </TooltipContent>
    </Tooltip>
  )
}