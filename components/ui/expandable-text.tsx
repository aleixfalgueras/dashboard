"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ExpandableTextProps {
  text: string
  maxLength?: number
  className?: string
}

export function ExpandableText({ 
  text, 
  maxLength = 150, 
  className 
}: ExpandableTextProps) {
  const [isExpanded, setIsExpanded] = React.useState(false)
  
  if (!text) return null
  
  const shouldTruncate = text.length > maxLength
  const displayText = isExpanded || !shouldTruncate 
    ? text 
    : text.slice(0, maxLength) + "... "
  
  return (
    <p className={cn("text-muted-foreground", className)}>
      {displayText}
      {shouldTruncate && (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-auto p-0 text-sm text-primary hover:bg-transparent hover:underline inline"
          >
            {isExpanded ? " Show less" : "Show more"}
          </Button>
        </>
      )}
    </p>
  )
}