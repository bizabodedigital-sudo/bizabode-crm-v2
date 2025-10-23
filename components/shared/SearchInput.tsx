"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface SearchInputProps {
  placeholder?: string
  value: string
  onChange: (value: string) => void
  className?: string
  disabled?: boolean
}

export default function SearchInput({
  placeholder = "Search...",
  value,
  onChange,
  className,
  disabled = false
}: SearchInputProps) {
  return (
    <div className={cn("relative flex-1 max-w-sm", className)}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="pl-9"
      />
    </div>
  )
}
