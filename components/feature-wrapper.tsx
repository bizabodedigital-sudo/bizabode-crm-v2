"use client"

import { ReactNode } from "react"
import { isFeatureEnabled } from "@/config/feature-flags"
import { isModuleEnabled } from "@/config/modules"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Settings, Lock } from "lucide-react"

interface FeatureWrapperProps {
  feature?: string
  module?: string
  children: ReactNode
  fallback?: ReactNode
  showUpgrade?: boolean
  upgradeMessage?: string
}

export function FeatureWrapper({ 
  feature, 
  module, 
  children, 
  fallback,
  showUpgrade = true,
  upgradeMessage = "This feature is not available in your current plan."
}: FeatureWrapperProps) {
  // Check if feature is enabled
  if (feature && !isFeatureEnabled(feature)) {
    if (fallback) return <>{fallback}</>
    
    if (showUpgrade) {
      return (
        <Alert className="border-orange-200 bg-orange-50">
          <Lock className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{upgradeMessage}</span>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Upgrade
            </Button>
          </AlertDescription>
        </Alert>
      )
    }
    
    return null
  }

  // Check if module is enabled
  if (module && !isModuleEnabled(module)) {
    if (fallback) return <>{fallback}</>
    
    if (showUpgrade) {
      return (
        <Alert className="border-orange-200 bg-orange-50">
          <Lock className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>The {module} module is not enabled.</span>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Enable Module
            </Button>
          </AlertDescription>
        </Alert>
      )
    }
    
    return null
  }

  return <>{children}</>
}

// Higher-order component for feature gating
export function withFeatureGate<T extends object>(
  Component: React.ComponentType<T>,
  feature?: string,
  module?: string
) {
  return function FeatureGatedComponent(props: T) {
    return (
      <FeatureWrapper feature={feature} module={module}>
        <Component {...props} />
      </FeatureWrapper>
    )
  }
}

// Hook for checking feature availability
export function useFeatureCheck(feature?: string, module?: string) {
  const isFeatureAvailable = feature ? isFeatureEnabled(feature) : true
  const isModuleAvailable = module ? isModuleEnabled(module) : true
  
  return {
    isAvailable: isFeatureAvailable && isModuleAvailable,
    isFeatureEnabled: isFeatureAvailable,
    isModuleEnabled: isModuleAvailable
  }
}
