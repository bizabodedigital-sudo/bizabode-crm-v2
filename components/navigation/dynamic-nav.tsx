"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  Settings, 
  Package, 
  ShoppingCart, 
  Users, 
  Building, 
  BarChart3, 
  Truck, 
  Settings2 
} from "lucide-react"
import { MODULE_CONFIG, isModuleEnabled } from "@/config/modules"

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  enabled: boolean
  required: boolean
}

const navigationItems: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/',
    icon: Settings,
    enabled: true,
    required: true
  },
  {
    name: 'Inventory',
    href: '/inventory',
    icon: Package,
    enabled: true,
    required: false
  },
  {
    name: 'Procurement',
    href: '/procurement',
    icon: ShoppingCart,
    enabled: true,
    required: false
  },
  {
    name: 'HR',
    href: '/hr',
    icon: Users,
    enabled: true,
    required: false
  },
  {
    name: 'CRM',
    href: '/crm',
    icon: Building,
    enabled: true,
    required: true
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: BarChart3,
    enabled: true,
    required: false
  },
  {
    name: 'After-Sales',
    href: '/after-sales',
    icon: Truck,
    enabled: false,
    required: false
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings2,
    enabled: true,
    required: true
  }
]

export function DynamicNavigation() {
  const pathname = usePathname()
  const [enabledModules, setEnabledModules] = useState<string[]>([])

  useEffect(() => {
    // Load enabled modules from configuration
    const enabled = navigationItems
      .filter(item => isModuleEnabled(item.name.toLowerCase()))
      .map(item => item.name.toLowerCase())
    
    setEnabledModules(enabled)
  }, [])

  const getVisibleNavigationItems = (): NavigationItem[] => {
    return navigationItems.filter(item => {
      // Always show required items
      if (item.required) return true
      
      // Check if module is enabled in configuration
      return isModuleEnabled(item.name.toLowerCase())
    })
  }

  return (
    <nav className="space-y-1">
      {getVisibleNavigationItems().map((item) => {
        const isActive = pathname === item.href || 
          (item.href !== '/' && pathname.startsWith(item.href))
        
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
              !item.enabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <item.icon className="h-4 w-4" />
            <span>{item.name}</span>
            {item.required && (
              <span className="ml-auto text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded">
                Required
              </span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}

export function MobileDynamicNavigation() {
  const pathname = usePathname()
  const [enabledModules, setEnabledModules] = useState<string[]>([])

  useEffect(() => {
    const enabled = navigationItems
      .filter(item => isModuleEnabled(item.name.toLowerCase()))
      .map(item => item.name.toLowerCase())
    
    setEnabledModules(enabled)
  }, [])

  const getVisibleNavigationItems = (): NavigationItem[] => {
    return navigationItems.filter(item => {
      if (item.required) return true
      return isModuleEnabled(item.name.toLowerCase())
    })
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {getVisibleNavigationItems().map((item) => {
        const isActive = pathname === item.href || 
          (item.href !== '/' && pathname.startsWith(item.href))
        
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-2 rounded-lg p-3 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
              !item.enabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs">{item.name}</span>
            {item.required && (
              <span className="text-xs bg-primary/20 text-primary px-1 py-0.5 rounded">
                Required
              </span>
            )}
          </Link>
        )
      })}
    </div>
  )
}
