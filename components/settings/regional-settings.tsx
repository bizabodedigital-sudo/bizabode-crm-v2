"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Check } from "lucide-react"
import { REGIONAL_COMPLIANCE } from "@/config/regional-compliance"

interface RegionalSettingsProps {
  onRegionChange: (region: string) => void
}

const regionFlags = {
  'jamaica': '🇯🇲',
  'usa': '🇺🇸',
  'uk': '🇬🇧',
  'canada': '🇨🇦'
}

const regionDescriptions = {
  'jamaica': 'Jamaica - Caribbean business compliance',
  'usa': 'United States - US business compliance',
  'uk': 'United Kingdom - UK business compliance',
  'canada': 'Canada - Canadian business compliance'
}

export function RegionalSettings({ onRegionChange }: RegionalSettingsProps) {
  const [selectedRegion, setSelectedRegion] = useState('usa')

  const handleRegionSelect = (region: string) => {
    setSelectedRegion(region)
    onRegionChange(region)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Regional Compliance</h3>
        <p className="text-sm text-muted-foreground">
          Select your region for compliance requirements and field configurations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(REGIONAL_COMPLIANCE).map(([region, config]) => (
          <Card 
            key={region}
            className={`cursor-pointer transition-all ${
              selectedRegion === region 
                ? 'ring-2 ring-primary border-primary' 
                : 'hover:border-primary/50'
            }`}
            onClick={() => handleRegionSelect(region)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {regionFlags[region as keyof typeof regionFlags]}
                  </span>
                  <div>
                    <CardTitle className="text-base">{config.country}</CardTitle>
                    <CardDescription className="text-xs">
                      {regionDescriptions[region as keyof typeof regionDescriptions]}
                    </CardDescription>
                  </div>
                </div>
                {selectedRegion === region && (
                  <Check className="h-5 w-5 text-primary" />
                )}
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Currency:</span>
                  <Badge variant="outline">{config.currency}</Badge>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Date Format:</span>
                  <span className="font-medium">{config.dateFormat}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Required Fields:</span>
                  <span className="font-medium">{config.hrFields.required.length}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Optional Fields:</span>
                  <span className="font-medium">{config.hrFields.optional.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedRegion && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Compliance Requirements: {REGIONAL_COMPLIANCE[selectedRegion].country}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Required HR Fields</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {REGIONAL_COMPLIANCE[selectedRegion].hrFields.required.map(field => (
                      <div key={field.name} className="flex items-center gap-2 p-2 bg-red-50 rounded">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-sm font-medium">{field.label}</span>
                        <Badge variant="destructive" className="text-xs">Required</Badge>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Optional HR Fields</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {REGIONAL_COMPLIANCE[selectedRegion].hrFields.optional.map(field => (
                      <div key={field.name} className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium">{field.label}</span>
                        <Badge variant="secondary" className="text-xs">Optional</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Legal Requirements</h4>
                  <div className="flex flex-wrap gap-1">
                    {REGIONAL_COMPLIANCE[selectedRegion].legalRequirements.map(requirement => (
                      <Badge key={requirement} variant="outline" className="text-xs">
                        {requirement}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
