"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Building, Upload, Trash2, Save } from "lucide-react"
import { apiClient } from "@/lib/api-client"

interface CompanyData {
  name: string
  address?: string
  phone?: string
  email?: string
  website?: string
  logo?: string
}

export default function CompanySettingsPage() {
  const [companyData, setCompanyData] = useState<CompanyData>({
    name: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    logo: ""
  })
  const [loading, setLoading] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string>("")
  const { toast } = useToast()

  useEffect(() => {
    loadCompanyData()
  }, [])

  const loadCompanyData = async () => {
    try {
      const data = await apiClient.getCompany()
      setCompanyData(data)
      if (data.logo) {
        setLogoPreview(data.logo)
      }
    } catch (error) {
      console.error('Failed to load company data:', error)
    }
  }

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleLogoUploadSubmit = async () => {
    if (!logoFile) return

    try {
      setLoading(true)
      await apiClient.uploadCompanyLogo(logoFile)
      
      toast({
        title: "Success",
        description: "Company logo uploaded successfully",
      })
      
      // Reload company data to get updated logo URL
      await loadCompanyData()
    } catch (error) {
      console.error('Logo upload failed:', error)
      toast({
        title: "Error",
        description: "Failed to upload logo",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLogoDelete = async () => {
    try {
      setLoading(true)
      await apiClient.deleteCompanyLogo()
      
      toast({
        title: "Success",
        description: "Company logo removed successfully",
      })
      
      setLogoPreview("")
      setLogoFile(null)
      await loadCompanyData()
    } catch (error) {
      console.error('Logo delete failed:', error)
      toast({
        title: "Error",
        description: "Failed to remove logo",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      await apiClient.updateCompany(companyData)
      
      toast({
        title: "Success",
        description: "Company information updated successfully",
      })
    } catch (error) {
      console.error('Company update failed:', error)
      toast({
        title: "Error",
        description: "Failed to update company information",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          <Building className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Company Settings</h1>
          <p className="text-muted-foreground">Manage your company information and branding</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
            <CardDescription>
              Update your company details and contact information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Company Name</Label>
              <Input
                id="name"
                value={companyData.name}
                onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
                placeholder="Enter company name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={companyData.address || ""}
                onChange={(e) => setCompanyData({ ...companyData, address: e.target.value })}
                placeholder="Enter company address"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={companyData.phone || ""}
                  onChange={(e) => setCompanyData({ ...companyData, phone: e.target.value })}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={companyData.email || ""}
                  onChange={(e) => setCompanyData({ ...companyData, email: e.target.value })}
                  placeholder="Enter email address"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={companyData.website || ""}
                onChange={(e) => setCompanyData({ ...companyData, website: e.target.value })}
                placeholder="Enter website URL"
              />
            </div>

            <Button onClick={handleSave} disabled={loading} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              Save Company Information
            </Button>
          </CardContent>
        </Card>

        {/* Logo Management */}
        <Card>
          <CardHeader>
            <CardTitle>Company Logo</CardTitle>
            <CardDescription>
              Upload your company logo to appear on invoices and documents
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current Logo Preview */}
            {logoPreview && (
              <div className="space-y-2">
                <Label>Current Logo</Label>
                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <img
                    src={logoPreview}
                    alt="Company Logo"
                    className="h-16 w-16 object-contain"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Logo will appear on invoices and documents</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogoDelete}
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Logo Upload */}
            <div className="space-y-2">
              <Label htmlFor="logo">Upload New Logo</Label>
              <Input
                id="logo"
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground">
                Recommended: PNG or JPG, max 2MB, square aspect ratio works best
              </p>
            </div>

            {logoFile && (
              <div className="space-y-2">
                <Label>Preview</Label>
                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <img
                    src={logoPreview}
                    alt="Logo Preview"
                    className="h-16 w-16 object-contain"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{logoFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(logoFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleLogoUploadSubmit}
                  disabled={loading}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Logo
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
