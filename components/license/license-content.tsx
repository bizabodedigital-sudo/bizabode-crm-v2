"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Key, CheckCircle, AlertCircle, Calendar, Users, Crown } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"

export function LicenseContent() {
  const [licenseKey, setLicenseKey] = useState("")
  const [isActivating, setIsActivating] = useState(false)

  // Mock license data
  const currentLicense = {
    key: "DEMO-LICENSE-KEY-2024",
    plan: "Professional",
    status: "active",
    activatedOn: "2024-01-01",
    expiresOn: "2025-12-31",
    maxUsers: 10,
    currentUsers: 3,
    features: [
      "Unlimited Inventory Items",
      "Advanced CRM Features",
      "Quote & Invoice Generation",
      "QR Code Delivery Tracking",
      "Analytics & Reports",
      "Email Notifications",
      "Priority Support",
      "API Access",
    ],
  }

  const handleActivate = () => {
    setIsActivating(true)
    // Simulate API call
    setTimeout(() => {
      setIsActivating(false)
      setLicenseKey("")
    }, 2000)
  }

  const daysRemaining = Math.floor(
    (new Date(currentLicense.expiresOn).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          <Key className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">License Management</h1>
          <p className="text-muted-foreground">Manage your Bizabode license and subscription</p>
        </div>
      </div>

      {currentLicense.status === "active" && (
        <Alert className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-900 dark:text-green-100">License Active</AlertTitle>
          <AlertDescription className="text-green-800 dark:text-green-200">
            Your {currentLicense.plan} license is active and valid until{" "}
            {new Date(currentLicense.expiresOn).toLocaleDateString()}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">License Plan</CardTitle>
            <Crown className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentLicense.plan}</div>
            <p className="text-xs text-muted-foreground">
              <Badge variant="secondary" className="bg-green-500/10 text-green-700 dark:text-green-400">
                {currentLicense.status}
              </Badge>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Days Remaining</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{daysRemaining}</div>
            <p className="text-xs text-muted-foreground">
              Expires {new Date(currentLicense.expiresOn).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Licenses</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentLicense.currentUsers}/{currentLicense.maxUsers}
            </div>
            <Progress value={(currentLicense.currentUsers / currentLicense.maxUsers) * 100} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>License Details</CardTitle>
            <CardDescription>Your current license information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">License Key</Label>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded bg-muted px-3 py-2 font-mono text-sm">{currentLicense.key}</code>
                <Button variant="outline" size="sm">
                  Copy
                </Button>
              </div>
            </div>
            <Separator />
            <div className="grid gap-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Plan Type</span>
                <span className="font-medium">{currentLicense.plan}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="secondary" className="bg-green-500/10 text-green-700 dark:text-green-400">
                  {currentLicense.status}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Activated On</span>
                <span className="font-medium">{new Date(currentLicense.activatedOn).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Expires On</span>
                <span className="font-medium">{new Date(currentLicense.expiresOn).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Max Users</span>
                <span className="font-medium">{currentLicense.maxUsers}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Current Users</span>
                <span className="font-medium">{currentLicense.currentUsers}</span>
              </div>
            </div>
            <Separator />
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 bg-transparent">
                Upgrade Plan
              </Button>
              <Button variant="outline" className="flex-1 bg-transparent">
                Renew License
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Included Features</CardTitle>
            <CardDescription>Features available in your {currentLicense.plan} plan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentLicense.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/10">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activate New License</CardTitle>
          <CardDescription>Enter a new license key to activate or upgrade your plan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="license-key">License Key</Label>
            <Input
              id="license-key"
              placeholder="XXXX-XXXX-XXXX-XXXX"
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value)}
            />
          </div>
          <Button onClick={handleActivate} disabled={!licenseKey || isActivating} className="w-full">
            {isActivating ? "Activating..." : "Activate License"}
          </Button>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Need a license?</AlertTitle>
            <AlertDescription>
              Contact Bizabode support or visit our website to purchase a license key.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}
