"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Settings, Users, Building, FileText, BarChart3, ShoppingCart, Package, Truck } from "lucide-react"

interface ModuleSelectorProps {
  onModuleToggle: (module: string, enabled: boolean) => void
  onFeatureToggle: (module: string, feature: string, enabled: boolean) => void
}

const moduleIcons = {
  dashboard: Settings,
  inventory: Package,
  procurement: ShoppingCart,
  hr: Users,
  crm: Building,
  reports: BarChart3,
  afterSales: Truck,
  settings: Settings
}

const moduleDescriptions = {
  dashboard: "Overview and analytics dashboard",
  inventory: "Product catalog and stock management",
  procurement: "Purchase orders and vendor management",
  hr: "Human resources and employee management",
  crm: "Customer relationship management",
  reports: "Analytics and business intelligence",
  afterSales: "Customer support and service tracking",
  settings: "System configuration and preferences"
}

export function ModuleSelector({ onModuleToggle, onFeatureToggle }: ModuleSelectorProps) {
  const [modules, setModules] = useState({
    dashboard: { enabled: true, required: true },
    inventory: { enabled: true, required: false },
    procurement: { enabled: true, required: false },
    hr: { 
      enabled: true, 
      required: false,
      features: {
        employees: true,
        payroll: true,
        leave: true,
        attendance: true,
        performance: true
      }
    },
    crm: { 
      enabled: true, 
      required: true,
      features: {
        leads: true,
        opportunities: true,
        quotes: true,
        invoices: true,
        payments: true,
        deliveries: true
      }
    },
    reports: { enabled: true, required: false },
    afterSales: { enabled: false, required: false },
    settings: { enabled: true, required: true }
  })

  const handleModuleToggle = (moduleName: string, enabled: boolean) => {
    if (modules[moduleName as keyof typeof modules].required) return
    
    setModules(prev => ({
      ...prev,
      [moduleName]: { ...prev[moduleName as keyof typeof modules], enabled }
    }))
    
    onModuleToggle(moduleName, enabled)
  }

  const handleFeatureToggle = (moduleName: string, featureName: string, enabled: boolean) => {
    setModules(prev => ({
      ...prev,
      [moduleName]: {
        ...prev[moduleName as keyof typeof modules],
        features: {
          ...prev[moduleName as keyof typeof modules].features,
          [featureName]: enabled
        }
      }
    }))
    
    onFeatureToggle(moduleName, featureName, enabled)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Module Configuration</h3>
        <p className="text-sm text-muted-foreground">
          Enable or disable modules based on your business needs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(modules).map(([moduleName, config]) => {
          const Icon = moduleIcons[moduleName as keyof typeof moduleIcons]
          const isRequired = config.required
          
          return (
            <Card key={moduleName} className={!config.enabled ? "opacity-50" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5" />
                    <div>
                      <CardTitle className="text-base capitalize">
                        {moduleName.replace(/([A-Z])/g, ' $1').trim()}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {moduleDescriptions[moduleName as keyof typeof moduleDescriptions]}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isRequired && <Badge variant="secondary">Required</Badge>}
                    <Switch
                      checked={config.enabled}
                      onCheckedChange={(enabled) => handleModuleToggle(moduleName, enabled)}
                      disabled={isRequired}
                    />
                  </div>
                </div>
              </CardHeader>
              
              {config.features && config.enabled && (
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Features</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(config.features).map(([featureName, enabled]) => (
                        <div key={featureName} className="flex items-center space-x-2">
                          <Switch
                            checked={enabled}
                            onCheckedChange={(checked) => 
                              handleFeatureToggle(moduleName, featureName, checked)
                            }
                            size="sm"
                          />
                          <Label className="text-xs capitalize">
                            {featureName.replace(/([A-Z])/g, ' $1').trim()}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
