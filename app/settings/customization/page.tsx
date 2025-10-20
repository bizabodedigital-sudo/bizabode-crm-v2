"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Save, RotateCcw, Settings, Building, Globe, Zap } from "lucide-react"
import { ModuleSelector } from "@/components/settings/module-selector"
import { BusinessTypeSelector } from "@/components/settings/business-type-selector"
import { FeatureFlags } from "@/components/settings/feature-flags"
import { RegionalSettings } from "@/components/settings/regional-settings"
import { toast } from "sonner"

export default function CustomizationPage() {
  const [activeTab, setActiveTab] = useState("modules")
  const [hasChanges, setHasChanges] = useState(false)
  const [configuration, setConfiguration] = useState({
    businessType: 'retail',
    region: 'usa',
    modules: {},
    features: {}
  })

  const handleModuleToggle = (module: string, enabled: boolean) => {
    setConfiguration(prev => ({
      ...prev,
      modules: { ...prev.modules, [module]: enabled }
    }))
    setHasChanges(true)
  }

  const handleFeatureToggle = (module: string, feature: string, enabled: boolean) => {
    setConfiguration(prev => ({
      ...prev,
      features: { ...prev.features, [`${module}.${feature}`]: enabled }
    }))
    setHasChanges(true)
  }

  const handleBusinessTypeChange = (businessType: string) => {
    setConfiguration(prev => ({ ...prev, businessType }))
    setHasChanges(true)
  }

  const handleRegionChange = (region: string) => {
    setConfiguration(prev => ({ ...prev, region }))
    setHasChanges(true)
  }

  const handleSave = () => {
    // Here you would save the configuration to your backend
    console.log('Saving configuration:', configuration)
    toast.success("Configuration saved successfully!")
    setHasChanges(false)
  }

  const handleReset = () => {
    setConfiguration({
      businessType: 'retail',
      region: 'usa',
      modules: {},
      features: {}
    })
    setHasChanges(false)
    toast.info("Configuration reset to defaults")
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Customization</h1>
          <p className="text-muted-foreground">
            Configure your Bizabode CRM based on your business needs
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Badge variant="outline" className="text-orange-600 border-orange-600">
              Unsaved Changes
            </Badge>
          )}
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="modules" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Modules
          </TabsTrigger>
          <TabsTrigger value="business" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Business Type
          </TabsTrigger>
          <TabsTrigger value="regional" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Regional
          </TabsTrigger>
          <TabsTrigger value="features" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Features
          </TabsTrigger>
        </TabsList>

        <TabsContent value="modules" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Module Configuration</CardTitle>
              <CardDescription>
                Enable or disable modules and their features based on your business needs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ModuleSelector 
                onModuleToggle={handleModuleToggle}
                onFeatureToggle={handleFeatureToggle}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="business" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Business Type</CardTitle>
              <CardDescription>
                Select your business type to automatically configure relevant modules and features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BusinessTypeSelector onBusinessTypeChange={handleBusinessTypeChange} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regional" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Regional Compliance</CardTitle>
              <CardDescription>
                Configure compliance requirements and field configurations for your region
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RegionalSettings onRegionChange={handleRegionChange} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Feature Flags</CardTitle>
              <CardDescription>
                Enable or disable advanced features and integrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FeatureFlags onFeatureToggle={(feature, enabled) => 
                handleFeatureToggle('system', feature, enabled)
              } />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Configuration Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Current Configuration</CardTitle>
          <CardDescription>
            Summary of your current system configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Business Type</h4>
              <Badge variant="outline">{configuration.businessType}</Badge>
            </div>
            <div>
              <h4 className="font-medium mb-2">Region</h4>
              <Badge variant="outline">{configuration.region}</Badge>
            </div>
            <div>
              <h4 className="font-medium mb-2">Enabled Modules</h4>
              <span className="text-muted-foreground">
                {Object.keys(configuration.modules).length} configured
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
