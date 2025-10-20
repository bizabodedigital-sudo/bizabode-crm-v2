"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  FileText, 
  Mail, 
  BarChart3, 
  Zap, 
  Smartphone, 
  DollarSign, 
  Globe, 
  Shield, 
  Workflow, 
  Brain, 
  Download, 
  History 
} from "lucide-react"
import { FEATURE_FLAGS } from "@/config/feature-flags"

interface FeatureFlagsProps {
  onFeatureToggle: (feature: string, enabled: boolean) => void
}

const featureIcons = {
  'pdf-generation': FileText,
  'email-notifications': Mail,
  'advanced-reporting': BarChart3,
  'api-integrations': Zap,
  'mobile-app': Smartphone,
  'multi-currency': DollarSign,
  'multi-language': Globe,
  'advanced-security': Shield,
  'workflow-automation': Workflow,
  'ai-insights': Brain,
  'bulk-operations': Download,
  'audit-trail': History
}

const categoryColors = {
  core: 'bg-blue-100 text-blue-800',
  advanced: 'bg-purple-100 text-purple-800',
  integration: 'bg-green-100 text-green-800',
  premium: 'bg-orange-100 text-orange-800'
}

export function FeatureFlags({ onFeatureToggle }: FeatureFlagsProps) {
  const [features, setFeatures] = useState(FEATURE_FLAGS)

  const handleFeatureToggle = (featureName: string, enabled: boolean) => {
    setFeatures(prev => ({
      ...prev,
      [featureName]: { ...prev[featureName], enabled }
    }))
    
    onFeatureToggle(featureName, enabled)
  }

  const getFeaturesByCategory = (category: string) => {
    return Object.entries(features).filter(([_, feature]) => feature.category === category)
  }

  const categories = ['core', 'advanced', 'integration', 'premium']

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Feature Flags</h3>
        <p className="text-sm text-muted-foreground">
          Enable or disable advanced features and integrations
        </p>
      </div>

      {categories.map(category => {
        const categoryFeatures = getFeaturesByCategory(category)
        if (categoryFeatures.length === 0) return null

        return (
          <div key={category} className="space-y-4">
            <div className="flex items-center gap-2">
              <h4 className="text-base font-medium capitalize">{category} Features</h4>
              <Badge className={categoryColors[category as keyof typeof categoryColors]}>
                {categoryFeatures.length}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categoryFeatures.map(([featureName, feature]) => {
                const Icon = featureIcons[featureName as keyof typeof featureIcons]
                
                return (
                  <Card key={featureName} className={!feature.enabled ? "opacity-60" : ""}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5" />
                          <div>
                            <CardTitle className="text-sm">{feature.name}</CardTitle>
                            <CardDescription className="text-xs">
                              {feature.description}
                            </CardDescription>
                          </div>
                        </div>
                        <Switch
                          checked={feature.enabled}
                          onCheckedChange={(enabled) => handleFeatureToggle(featureName, enabled)}
                        />
                      </div>
                    </CardHeader>
                    
                    {feature.dependencies && feature.dependencies.length > 0 && (
                      <CardContent className="pt-0">
                        <div className="text-xs text-muted-foreground">
                          <span className="font-medium">Dependencies:</span>{' '}
                          {feature.dependencies.join(', ')}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                )
              })}
            </div>
          </div>
        )
      })}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Feature Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {categories.map(category => {
              const categoryFeatures = getFeaturesByCategory(category)
              const enabledCount = categoryFeatures.filter(([_, feature]) => feature.enabled).length
              
              return (
                <div key={category} className="text-center">
                  <div className="text-2xl font-bold">{enabledCount}</div>
                  <div className="text-muted-foreground capitalize">{category}</div>
                  <div className="text-xs text-muted-foreground">
                    of {categoryFeatures.length} enabled
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
