"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"
import { BUSINESS_TYPES } from "@/config/business-types"

interface BusinessTypeSelectorProps {
  onBusinessTypeChange: (businessType: string) => void
}

const businessTypeDescriptions = {
  'retail': 'Retail stores and e-commerce businesses',
  'manufacturing': 'Manufacturing and production companies',
  'service': 'Service-based businesses and consultancies',
  'construction': 'Construction and contracting companies',
  'healthcare': 'Healthcare providers and medical practices',
  'jamaica-retail': 'Retail businesses in Jamaica',
  'jamaica-manufacturing': 'Manufacturing companies in Jamaica'
}

const businessTypeIcons = {
  'retail': '🛍️',
  'manufacturing': '🏭',
  'service': '💼',
  'construction': '🏗️',
  'healthcare': '🏥',
  'jamaica-retail': '🇯🇲',
  'jamaica-manufacturing': '🇯🇲'
}

export function BusinessTypeSelector({ onBusinessTypeChange }: BusinessTypeSelectorProps) {
  const [selectedBusinessType, setSelectedBusinessType] = useState('retail')

  const handleBusinessTypeSelect = (businessType: string) => {
    setSelectedBusinessType(businessType)
    onBusinessTypeChange(businessType)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Business Type</h3>
        <p className="text-sm text-muted-foreground">
          Select your business type to customize modules and features
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(BUSINESS_TYPES).map(([businessType, config]) => (
          <Card 
            key={businessType}
            className={`cursor-pointer transition-all ${
              selectedBusinessType === businessType 
                ? 'ring-2 ring-primary border-primary' 
                : 'hover:border-primary/50'
            }`}
            onClick={() => handleBusinessTypeSelect(businessType)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {businessTypeIcons[businessType as keyof typeof businessTypeIcons]}
                  </span>
                  <div>
                    <CardTitle className="text-base capitalize">
                      {businessType.replace('-', ' ')}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {businessTypeDescriptions[businessType as keyof typeof businessTypeDescriptions]}
                    </CardDescription>
                  </div>
                </div>
                {selectedBusinessType === businessType && (
                  <Check className="h-5 w-5 text-primary" />
                )}
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Currency:</span>
                  <Badge variant="outline">{config.defaultCurrency}</Badge>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Modules:</span>
                  <span className="font-medium">{config.modules.length}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">HR Features:</span>
                  <span className="font-medium">{config.hrFeatures.length}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">CRM Features:</span>
                  <span className="font-medium">{config.crmFeatures.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedBusinessType && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Selected Configuration: {selectedBusinessType.replace('-', ' ')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">Modules</h4>
                <div className="flex flex-wrap gap-1">
                  {BUSINESS_TYPES[selectedBusinessType].modules.map(module => (
                    <Badge key={module} variant="secondary" className="text-xs">
                      {module}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">HR Features</h4>
                <div className="flex flex-wrap gap-1">
                  {BUSINESS_TYPES[selectedBusinessType].hrFeatures.map(feature => (
                    <Badge key={feature} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
