"use client"

import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingProps {
  size?: "sm" | "md" | "lg"
  text?: string
  className?: string
  fullScreen?: boolean
}

export default function Loading({ 
  size = "md", 
  text = "Loading...", 
  className,
  fullScreen = false 
}: LoadingProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8", 
    lg: "h-12 w-12"
  }

  const content = (
    <div className={cn(
      "flex items-center justify-center",
      fullScreen ? "min-h-screen" : "py-12",
      className
    )}>
      <div className="flex flex-col items-center gap-2">
        <Loader2 className={cn("animate-spin text-muted-foreground", sizeClasses[size])} />
        {text && (
          <p className="text-sm text-muted-foreground">{text}</p>
        )}
      </div>
    </div>
  )

  return content
}
