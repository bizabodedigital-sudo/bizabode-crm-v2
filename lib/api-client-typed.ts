"use client"

import { 
  UserCreateInput, 
  UserUpdateInput, 
  LoginInput,
  EmployeeCreateInput,
  EmployeeUpdateInput,
  LeadCreateInput,
  LeadUpdateInput,
  OpportunityCreateInput,
  OpportunityUpdateInput,
  ItemCreateInput,
  ItemUpdateInput,
  QuoteCreateInput,
  QuoteUpdateInput,
  InvoiceCreateInput,
  InvoiceUpdateInput,
  CompanyCreateInput,
  CompanyUpdateInput,
  StockAdjustmentInput,
  ItemQueryInput,
  LeadQueryInput,
  OpportunityQueryInput
} from '@/lib/validation/schemas'

// Type-safe API response interfaces
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'manager' | 'sales' | 'warehouse' | 'viewer'
  companyId: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Employee {
  id: string
  employeeId: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  position: string
  department: string
  hireDate: string
  salary: number
  employmentType: 'full-time' | 'part-time' | 'contract' | 'intern'
  status: 'active' | 'inactive' | 'terminated' | 'on-leave'
  createdAt: string
  updatedAt: string
}

export interface Lead {
  id: string
  name: string
  email: string
  phone: string
  company: string
  source: string
  status: 'new' | 'contacted' | 'qualified' | 'unqualified'
  notes?: string
  assignedTo?: string
  tags?: string[]
  createdAt: string
  updatedAt: string
}

export interface Opportunity {
  id: string
  leadId?: string
  name: string
  value: number
  stage: 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost'
  probability: number
  expectedCloseDate?: string
  notes?: string
  assignedTo?: string
  createdAt: string
  updatedAt: string
}

export interface Item {
  id: string
  sku: string
  name: string
  description?: string
  category: string
  quantity: number
  reorderLevel: number
  unitPrice: number
  costPrice?: number
  isActive: boolean
  critical: boolean
  createdAt: string
  updatedAt: string
}

export interface Quote {
  id: string
  customerId?: string
  customerName: string
  customerEmail?: string
  customerPhone?: string
  items: Array<{
    itemId: string
    name: string
    quantity: number
    unitPrice: number
    total: number
  }>
  subtotal: number
  taxRate: number
  tax: number
  discount?: number
  total: number
  notes?: string
  validUntil?: string
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'
  createdAt: string
  updatedAt: string
}

export interface Invoice {
  id: string
  customerId?: string
  customerName: string
  customerEmail?: string
  customerPhone?: string
  items: Array<{
    itemId: string
    name: string
    quantity: number
    unitPrice: number
    total: number
  }>
  subtotal: number
  taxRate: number
  tax: number
  discount?: number
  total: number
  notes?: string
  dueDate?: string
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  createdAt: string
  updatedAt: string
}

export interface Company {
  id: string
  name: string
  address?: string
  phone?: string
  email?: string
  website?: string
  logo?: string
  licenseKey: string
  licenseStatus: 'active' | 'expired' | 'suspended'
  licenseExpiry: string
  businessType?: string
  region?: string
  createdAt: string
  updatedAt: string
}

// Type-safe API client class
class TypedApiClient {
  private getAuthHeader(): HeadersInit {
    const token = localStorage.getItem("bizabode_token")
    if (!token) {
      throw new Error("No authentication token found. Please log in again.")
    }
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const responseText = await response.text()
      let errorMessage = `Request failed with status ${response.status}`
      
      try {
        const errorData = JSON.parse(responseText)
        errorMessage = errorData.error || errorData.message || errorMessage
      } catch {
        errorMessage = responseText || errorMessage
      }
      
      if (response.status === 401) {
        localStorage.removeItem("bizabode_token")
        localStorage.removeItem("bizabode_user")
        localStorage.removeItem("bizabode_company")
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
      }
      
      throw new Error(errorMessage)
    }

    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json()
      
      if (data.success && data.data) {
        return data.data as T
      } else if (data.data) {
        return data.data as T
      } else {
        return data as T
      }
    }
    
    return response as any
  }

  // Auth endpoints
  async register(data: UserCreateInput): Promise<{ token: string; user: User; company: Company }> {
    const response = await fetch(`/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    return this.handleResponse<{ token: string; user: User; company: Company }>(response)
  }

  async login(email: string, password: string): Promise<{ token: string; user: User; company: Company }> {
    const response = await fetch(`/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    return this.handleResponse<{ token: string; user: User; company: Company }>(response)
  }

  async getMe(): Promise<User> {
    const response = await fetch(`/api/auth/me`, {
      headers: this.getAuthHeader(),
    })
    return this.handleResponse<User>(response)
  }

  // Employee endpoints
  async getEmployees(): Promise<Employee[]> {
    const response = await fetch('/api/employees', {
      headers: this.getAuthHeader(),
    })
    return this.handleResponse<Employee[]>(response)
  }

  async createEmployee(data: EmployeeCreateInput): Promise<Employee> {
    const response = await fetch('/api/employees', {
      method: 'POST',
      headers: this.getAuthHeader(),
      body: JSON.stringify(data),
    })
    return this.handleResponse<Employee>(response)
  }

  async updateEmployee(id: string, data: EmployeeUpdateInput): Promise<Employee> {
    const response = await fetch(`/api/employees/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeader(),
      body: JSON.stringify(data),
    })
    return this.handleResponse<Employee>(response)
  }

  async deleteEmployee(id: string): Promise<void> {
    const response = await fetch(`/api/employees/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeader(),
    })
    return this.handleResponse<void>(response)
  }

  // Lead endpoints
  async getLeads(params?: LeadQueryInput): Promise<PaginatedResponse<Lead>> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.set("page", params.page.toString())
    if (params?.limit) queryParams.set("limit", params.limit.toString())
    if (params?.search) queryParams.set("search", params.search)
    if (params?.status) queryParams.set("status", params.status)
    if (params?.assignedTo) queryParams.set("assignedTo", params.assignedTo)

    const response = await fetch(`/api/leads?${queryParams}`, {
      headers: this.getAuthHeader(),
    })
    return this.handleResponse<PaginatedResponse<Lead>>(response)
  }

  async createLead(data: LeadCreateInput): Promise<Lead> {
    const response = await fetch(`/api/leads`, {
      method: "POST",
      headers: this.getAuthHeader(),
      body: JSON.stringify(data),
    })
    return this.handleResponse<Lead>(response)
  }

  async updateLead(id: string, data: LeadUpdateInput): Promise<Lead> {
    const response = await fetch(`/api/leads/${id}`, {
      method: "PUT",
      headers: this.getAuthHeader(),
      body: JSON.stringify(data),
    })
    return this.handleResponse<Lead>(response)
  }

  async deleteLead(id: string): Promise<void> {
    const response = await fetch(`/api/leads/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeader(),
    })
    return this.handleResponse<void>(response)
  }

  // Opportunity endpoints
  async getOpportunities(params?: OpportunityQueryInput): Promise<PaginatedResponse<Opportunity>> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.set("page", params.page.toString())
    if (params?.limit) queryParams.set("limit", params.limit.toString())
    if (params?.stage) queryParams.set("stage", params.stage)
    if (params?.assignedTo) queryParams.set("assignedTo", params.assignedTo)

    const response = await fetch(`/api/opportunities?${queryParams}`, {
      headers: this.getAuthHeader(),
    })
    return this.handleResponse<PaginatedResponse<Opportunity>>(response)
  }

  async createOpportunity(data: OpportunityCreateInput): Promise<Opportunity> {
    const response = await fetch(`/api/opportunities`, {
      method: "POST",
      headers: this.getAuthHeader(),
      body: JSON.stringify(data),
    })
    return this.handleResponse<Opportunity>(response)
  }

  async updateOpportunity(id: string, data: OpportunityUpdateInput): Promise<Opportunity> {
    const response = await fetch(`/api/opportunities/${id}`, {
      method: "PUT",
      headers: this.getAuthHeader(),
      body: JSON.stringify(data),
    })
    return this.handleResponse<Opportunity>(response)
  }

  async deleteOpportunity(id: string): Promise<void> {
    const response = await fetch(`/api/opportunities/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeader(),
    })
    return this.handleResponse<void>(response)
  }

  // Item endpoints
  async getItems(params?: ItemQueryInput): Promise<PaginatedResponse<Item>> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.set("page", params.page.toString())
    if (params?.limit) queryParams.set("limit", params.limit.toString())
    if (params?.search) queryParams.set("search", params.search)
    if (params?.category) queryParams.set("category", params.category)
    if (params?.lowStock) queryParams.set("lowStock", params.lowStock.toString())
    if (params?.critical) queryParams.set("critical", params.critical.toString())

    const response = await fetch(`/api/items?${queryParams}`, {
      headers: this.getAuthHeader(),
    })
    return this.handleResponse<PaginatedResponse<Item>>(response)
  }

  async createItem(data: ItemCreateInput): Promise<Item> {
    const response = await fetch(`/api/items`, {
      method: "POST",
      headers: this.getAuthHeader(),
      body: JSON.stringify(data),
    })
    return this.handleResponse<Item>(response)
  }

  async updateItem(id: string, data: ItemUpdateInput): Promise<Item> {
    const response = await fetch(`/api/items/${id}`, {
      method: "PUT",
      headers: this.getAuthHeader(),
      body: JSON.stringify(data),
    })
    return this.handleResponse<Item>(response)
  }

  async deleteItem(id: string): Promise<void> {
    const response = await fetch(`/api/items/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeader(),
    })
    return this.handleResponse<void>(response)
  }

  async adjustStock(id: string, data: StockAdjustmentInput): Promise<Item> {
    const response = await fetch(`/api/items/${id}/adjust-stock`, {
      method: "POST",
      headers: this.getAuthHeader(),
      body: JSON.stringify(data),
    })
    return this.handleResponse<Item>(response)
  }

  // Quote endpoints
  async getQuotes(params?: { page?: number; limit?: number; status?: string }): Promise<PaginatedResponse<Quote>> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.set("page", params.page.toString())
    if (params?.limit) queryParams.set("limit", params.limit.toString())
    if (params?.status) queryParams.set("status", params.status)

    const response = await fetch(`/api/quotes?${queryParams}`, {
      headers: this.getAuthHeader(),
    })
    return this.handleResponse<PaginatedResponse<Quote>>(response)
  }

  async createQuote(data: QuoteCreateInput): Promise<Quote> {
    const response = await fetch(`/api/quotes`, {
      method: "POST",
      headers: this.getAuthHeader(),
      body: JSON.stringify(data),
    })
    return this.handleResponse<Quote>(response)
  }

  async updateQuote(id: string, data: QuoteUpdateInput): Promise<Quote> {
    const response = await fetch(`/api/quotes/${id}`, {
      method: "PUT",
      headers: this.getAuthHeader(),
      body: JSON.stringify(data),
    })
    return this.handleResponse<Quote>(response)
  }

  async deleteQuote(id: string): Promise<void> {
    const response = await fetch(`/api/quotes/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeader(),
    })
    return this.handleResponse<void>(response)
  }

  // Invoice endpoints
  async getInvoices(params?: { page?: number; limit?: number; status?: string }): Promise<PaginatedResponse<Invoice>> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.set("page", params.page.toString())
    if (params?.limit) queryParams.set("limit", params.limit.toString())
    if (params?.status) queryParams.set("status", params.status)

    const response = await fetch(`/api/invoices?${queryParams}`, {
      headers: this.getAuthHeader(),
    })
    return this.handleResponse<PaginatedResponse<Invoice>>(response)
  }

  async createInvoice(data: InvoiceCreateInput): Promise<Invoice> {
    const response = await fetch(`/api/invoices`, {
      method: "POST",
      headers: this.getAuthHeader(),
      body: JSON.stringify(data),
    })
    return this.handleResponse<Invoice>(response)
  }

  async updateInvoice(id: string, data: InvoiceUpdateInput): Promise<Invoice> {
    const response = await fetch(`/api/invoices/${id}`, {
      method: "PUT",
      headers: this.getAuthHeader(),
      body: JSON.stringify(data),
    })
    return this.handleResponse<Invoice>(response)
  }

  async deleteInvoice(id: string): Promise<void> {
    const response = await fetch(`/api/invoices/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeader(),
    })
    return this.handleResponse<void>(response)
  }

  // Company endpoints
  async getCompany(): Promise<Company> {
    const response = await fetch('/api/company', {
      headers: this.getAuthHeader(),
    })
    return this.handleResponse<Company>(response)
  }

  async updateCompany(data: CompanyUpdateInput): Promise<Company> {
    const response = await fetch('/api/company', {
      method: 'PUT',
      headers: this.getAuthHeader(),
      body: JSON.stringify(data),
    })
    return this.handleResponse<Company>(response)
  }

  // PDF endpoints
  async getInvoicePDF(id: string): Promise<Blob> {
    const response = await fetch(`/api/invoices/${id}/download-pdf`, {
      headers: this.getAuthHeader(),
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(text || `Failed to generate invoice PDF`)
    }

    return await response.blob()
  }

  async getQuotePDF(id: string): Promise<Blob> {
    const response = await fetch(`/api/quotes/${id}/download-pdf`, {
      headers: this.getAuthHeader(),
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(text || `Failed to generate quote PDF`)
    }

    return await response.blob()
  }
}

export const typedApiClient = new TypedApiClient()
