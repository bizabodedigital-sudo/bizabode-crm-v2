"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { 
  getStatusColor, 
  getCategoryColor, 
  getPriorityColor, 
  getTypeColor,
  getOutcomeColor,
  getAccessLevelColor,
  getCustomerTypeColor,
  getStockStatusColor
} from "@/lib/utils/status-colors"

interface StatusBadgeProps {
  value: string
  type?: 'status' | 'category' | 'priority' | 'type' | 'outcome' | 'accessLevel' | 'customerType' | 'stockStatus'
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
  className?: string
}

export default function StatusBadge({
  value,
  type = 'status',
  variant = 'secondary',
  className
}: StatusBadgeProps) {
  const getColorClass = () => {
    switch (type) {
      case 'category':
        return getCategoryColor(value)
      case 'priority':
        return getPriorityColor(value)
      case 'type':
        return getTypeColor(value)
      case 'outcome':
        return getOutcomeColor(value)
      case 'accessLevel':
        return getAccessLevelColor(value)
      case 'customerType':
        return getCustomerTypeColor(value)
      case 'stockStatus':
        return getStockStatusColor(value)
      default:
        return getStatusColor(value)
    }
  }

  return (
    <Badge 
      variant={variant} 
      className={cn(getColorClass(), className)}
    >
      {value}
    </Badge>
  )
}
