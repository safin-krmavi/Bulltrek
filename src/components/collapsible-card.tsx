'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronDown, ChevronUp, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CollapsibleCardProps {
  title: React.ReactNode // Changed from string to ReactNode
  children: React.ReactNode
  className?: string
  defaultExpanded?: boolean
  action?: React.ReactNode
  contentClassName?: string
  showInfoIcon?: boolean
}

export function CollapsibleCard({ 
  title, 
  children, 
  className,
  defaultExpanded = true,
  action,
  contentClassName,
  showInfoIcon = false
}: CollapsibleCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <Card className={cn("bg-card dark:bg-[#232326] border border-border dark:border-gray-700 shadow-lg text-foreground dark:text-white rounded-lg transition-colors duration-300", className)}>
      <CardHeader 
        className="bg-[#4A0D0D] dark:bg-[#3b3b41] text-white cursor-pointer flex flex-row items-center justify-between p-4 rounded-t-lg"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          {showInfoIcon && <Info className="h-4 w-4 text-white" />}
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          {action}
          {isExpanded ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </div>
      </CardHeader>
      <div className={cn(
        "transition-all duration-200 ease-in-out",
        isExpanded ? "opacity-100" : "opacity-0 h-0 overflow-hidden"
      )}>
        <CardContent className={contentClassName ?? "p-6"}>
          {children}
        </CardContent>
      </div>
    </Card>
  )
}

