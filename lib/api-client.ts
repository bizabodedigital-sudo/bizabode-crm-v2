"use client"

interface ApiError {
  message: string
  errors?: Record<string, string[]>
}

class ApiClient {
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
        // If response is not JSON, use the text or default message
        errorMessage = responseText || errorMessage
      }
      
      // Handle authentication errors specifically
      if (response.status === 401) {
        // Clear stored auth data on 401 errors
        localStorage.removeItem("bizabode_token")
        localStorage.removeItem("bizabode_user")
        localStorage.removeItem("bizabode_company")
        // Redirect to login if in browser
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
      }
      
      throw new Error(errorMessage)
    }

    // Check if response is JSON
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json()
      
      // Handle different response structures
      // For login/register: { success: true, data: { token, user, company } }
      if (data.success && data.data) {
        return data.data as T
      } 
      // For some endpoints that return data directly
      else if (data.data) {
        return data.data as T
      }
      // For endpoints that return the whole object
      else {
        return data as T
      }
    }
    
    // For non-JSON responses (like PDFs), return the response as-is
    return response as any
  }

  // Auth endpoints
  async register(data: {
    email: string
    password: string
    name: string
    companyName: string
    licenseKey: string
  }) {
    const response = await fetch(`/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    return this.handleResponse<any>(response)
  }

  async login(email: string, password: string) {
    const response = await fetch(`/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    return this.handleResponse<any>(response)
  }

  async getMe() {
    const response = await fetch(`/api/auth/me`, {
      headers: this.getAuthHeader(),
    })
    return this.handleResponse<any>(response)
  }

  // Employee endpoints
  async getEmployees() {
    const response = await fetch('/api/employees', {
      headers: this.getAuthHeader(),
    })
    return this.handleResponse<any>(response)
  }

  async createEmployee(data: any) {
    const response = await fetch('/api/employees', {
      method: 'POST',
      headers: this.getAuthHeader(),
      body: JSON.stringify(data),
    })
    return this.handleResponse<any>(response)
  }

  async updateEmployee(id: string, data: any) {
    const response = await fetch(`/api/employees/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeader(),
      body: JSON.stringify(data),
    })
    return this.handleResponse<any>(response)
  }

  async deleteEmployee(id: string) {
    const response = await fetch(`/api/employees/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeader(),
    })
    return this.handleResponse<any>(response)
  }

  // Attendance endpoints
  async getAttendance() {
    const response = await fetch('/api/attendance', {
      headers: this.getAuthHeader(),
    })
    return this.handleResponse<any>(response)
  }

  async createAttendance(data: any) {
    const response = await fetch('/api/attendance', {
      method: 'POST',
      headers: this.getAuthHeader(),
      body: JSON.stringify(data),
    })
    return this.handleResponse<any>(response)
  }

  async updateAttendance(id: string, data: any) {
    const response = await fetch(`/api/attendance/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeader(),
      body: JSON.stringify(data),
    })
    return this.handleResponse<any>(response)
  }

  async deleteAttendance(id: string) {
    const response = await fetch(`/api/attendance/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeader(),
    })
    return this.handleResponse<any>(response)
  }

  // Payroll endpoints
  async getPayrolls() {
    const response = await fetch('/api/payroll', {
      headers: this.getAuthHeader(),
    })
    return this.handleResponse<any>(response)
  }

  async createPayroll(data: any) {
    const response = await fetch('/api/payroll', {
      method: 'POST',
      headers: this.getAuthHeader(),
      body: JSON.stringify(data),
    })
    return this.handleResponse<any>(response)
  }

  async updatePayroll(id: string, data: any) {
    const response = await fetch(`/api/payroll/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeader(),
      body: JSON.stringify(data),
    })
    return this.handleResponse<any>(response)
  }

  async deletePayroll(id: string) {
    const response = await fetch(`/api/payroll/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeader(),
    })
    return this.handleResponse<any>(response)
  }

  // Leave endpoints
  async getLeaves() {
    const response = await fetch('/api/leaves', {
      headers: this.getAuthHeader(),
    })
    return this.handleResponse<any>(response)
  }

  async createLeave(data: any) {
    const response = await fetch('/api/leaves', {
      method: 'POST',
      headers: this.getAuthHeader(),
      body: JSON.stringify(data),
    })
    return this.handleResponse<any>(response)
  }

  async updateLeave(id: string, data: any) {
    const response = await fetch(`/api/leaves/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeader(),
      body: JSON.stringify(data),
    })
    return this.handleResponse<any>(response)
  }

  async deleteLeave(id: string) {
    const response = await fetch(`/api/leaves/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeader(),
    })
    return this.handleResponse<any>(response)
  }

  // User management endpoints
  async getUsers() {
    const response = await fetch('/api/users', {
      headers: this.getAuthHeader(),
    })
    return this.handleResponse<any>(response)
  }

  async createUser(data: any) {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: this.getAuthHeader(),
      body: JSON.stringify(data),
    })
    return this.handleResponse<any>(response)
  }

  async updateUser(id: string, data: any) {
    const response = await fetch(`/api/users/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeader(),
      body: JSON.stringify(data),
    })
    return this.handleResponse<any>(response)
  }

  async deleteUser(id: string) {
    const response = await fetch(`/api/users/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeader(),
    })
    return this.handleResponse<any>(response)
  }

  async updateUserPermissions(id: string, permissions: any) {
    const response = await fetch(`/api/users/${id}/permissions`, {
      method: 'PUT',
      headers: this.getAuthHeader(),
      body: JSON.stringify({ permissions }),
    })
    return this.handleResponse<any>(response)
  }

  // PDF and Email endpoints
  async getInvoicePDF(id: string) {
    const response = await fetch(`/api/invoices/${id}/download-pdf`, {
      headers: this.getAuthHeader(),
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(text || `Failed to generate invoice PDF`)
    }

    // Return Blob directly for streaming PDF
    return await response.blob()
  }

  async emailInvoice(id: string, recipientEmail?: string) {
    const response = await fetch(`/api/invoices/${id}/email`, {
      method: 'POST',
      headers: this.getAuthHeader(),
      body: JSON.stringify({ recipientEmail }),
    })
    return this.handleResponse<any>(response)
  }

  async getQuotePDF(id: string) {
    const response = await fetch(`/api/quotes/${id}/download-pdf`, {
      headers: this.getAuthHeader(),
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(text || `Failed to generate quote PDF`)
    }

    return await response.blob()
  }

  async emailQuote(id: string, recipientEmail?: string) {
    const response = await fetch(`/api/quotes/${id}/email`, {
      method: 'POST',
      headers: this.getAuthHeader(),
      body: JSON.stringify({ recipientEmail }),
    })
    return this.handleResponse<any>(response)
  }

  // Company endpoints
  async getCompany() {
    const response = await fetch('/api/company', {
      headers: this.getAuthHeader(),
    })
    return this.handleResponse<any>(response)
  }

  async updateCompany(data: any) {
    const response = await fetch('/api/company', {
      method: 'PUT',
      headers: this.getAuthHeader(),
      body: JSON.stringify(data),
    })
    return this.handleResponse<any>(response)
  }

  async uploadCompanyLogo(file: File) {
    const formData = new FormData()
    formData.append('logo', file)
    
    const token = localStorage.getItem("bizabode_token")
    const response = await fetch('/api/company/logo', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    })
    return this.handleResponse<any>(response)
  }

  async deleteCompanyLogo() {
    const response = await fetch('/api/company/logo', {
      method: 'DELETE',
      headers: this.getAuthHeader(),
    })
    return this.handleResponse<any>(response)
  }

  // Items endpoints
  async getItems(params?: { page?: number; limit?: number; search?: string; category?: string; lowStock?: boolean }) {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.set("page", params.page.toString())
    if (params?.limit) queryParams.set("limit", params.limit.toString())
    if (params?.search) queryParams.set("search", params.search)
    if (params?.category) queryParams.set("category", params.category)
    if (params?.lowStock) queryParams.set("lowStock", "true")

    const response = await fetch(`/api/items?${queryParams}`, {
      headers: this.getAuthHeader(),
    })
    return this.handleResponse<any>(response)
  }

  async createItem(data: any) {
    const response = await fetch(`/api/items`, {
      method: "POST",
      headers: this.getAuthHeader(),
      body: JSON.stringify(data),
    })
    return this.handleResponse<any>(response)
  }

  async updateItem(id: string, data: any) {
    const response = await fetch(`/api/items/${id}`, {
      method: "PUT",
      headers: this.getAuthHeader(),
      body: JSON.stringify(data),
    })
    return this.handleResponse<any>(response)
  }

  async deleteItem(id: string) {
    const response = await fetch(`/api/items/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeader(),
    })
    return this.handleResponse<any>(response)
  }

  async adjustStock(id: string, adjustment: number, reason: string, type: string = "adjustment") {
    const response = await fetch(`/api/items/${id}/adjust-stock`, {
      method: "POST",
      headers: this.getAuthHeader(),
      body: JSON.stringify({ adjustment, reason, type }),
    })
    return this.handleResponse<any>(response)
  }

  async exportItemsCSV() {
    const response = await fetch('/api/items/export-csv', {
      headers: this.getAuthHeader(),
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Export failed: ${response.status} ${response.statusText}`)
    }
    
    return response.blob()
  }

  async exportItemsPDF() {
    const response = await fetch('/api/items/export-csv?format=pdf', {
      headers: this.getAuthHeader(),
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Export failed: ${response.status} ${response.statusText}`)
    }
    
    return response.blob()
  }

  // Leads endpoints
  async getLeads(params?: { page?: number; limit?: number; status?: string; search?: string }) {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.set("page", params.page.toString())
    if (params?.limit) queryParams.set("limit", params.limit.toString())
    if (params?.status) queryParams.set("status", params.status)
    if (params?.search) queryParams.set("search", params.search)

    const response = await fetch(`/api/leads?${queryParams}`, {
      headers: this.getAuthHeader(),
    })
    return this.handleResponse<any>(response)
  }

  async createLead(data: any) {
    const response = await fetch(`/api/leads`, {
      method: "POST",
      headers: this.getAuthHeader(),
      body: JSON.stringify(data),
    })
    return this.handleResponse<any>(response)
  }

  async updateLead(id: string, data: any) {
    const response = await fetch(`/api/leads/${id}`, {
      method: "PUT",
      headers: this.getAuthHeader(),
      body: JSON.stringify(data),
    })
    return this.handleResponse<any>(response)
  }

  async deleteLead(id: string) {
    const response = await fetch(`/api/leads/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeader(),
    })
    return this.handleResponse<any>(response)
  }

  async convertLeadToOpportunity(id: string, data: any) {
    const response = await fetch(`/api/leads/${id}/convert`, {
      method: "POST",
      headers: this.getAuthHeader(),
      body: JSON.stringify(data),
    })
    return this.handleResponse<any>(response)
  }

  // Opportunities endpoints
  async getOpportunities(params?: { page?: number; limit?: number; stage?: string }) {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.set("page", params.page.toString())
    if (params?.limit) queryParams.set("limit", params.limit.toString())
    if (params?.stage) queryParams.set("stage", params.stage)

    const response = await fetch(`/api/opportunities?${queryParams}`, {
      headers: this.getAuthHeader(),
    })
    return this.handleResponse<any>(response)
  }

  async createOpportunity(data: any) {
    const response = await fetch(`/api/opportunities`, {
      method: "POST",
      headers: this.getAuthHeader(),
      body: JSON.stringify(data),
    })
    return this.handleResponse<any>(response)
  }

  async updateOpportunity(id: string, data: any) {
    const response = await fetch(`/api/opportunities/${id}`, {
      method: "PUT",
      headers: this.getAuthHeader(),
      body: JSON.stringify(data),
    })
    return this.handleResponse<any>(response)
  }

  async deleteOpportunity(id: string) {
    const response = await fetch(`/api/opportunities/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeader(),
    })
    return this.handleResponse<any>(response)
  }

  // Quotes endpoints
  async getQuotes(params?: { page?: number; limit?: number; status?: string }) {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.set("page", params.page.toString())
    if (params?.limit) queryParams.set("limit", params.limit.toString())
    if (params?.status) queryParams.set("status", params.status)

    const response = await fetch(`/api/quotes?${queryParams}`, {
      headers: this.getAuthHeader(),
    })
    return this.handleResponse<any>(response)
  }

  async createQuote(data: any) {
    const response = await fetch(`/api/quotes`, {
      method: "POST",
      headers: this.getAuthHeader(),
      body: JSON.stringify(data),
    })
    return this.handleResponse<any>(response)
  }

  async updateQuote(id: string, data: any) {
    const response = await fetch(`/api/quotes/${id}`, {
      method: "PUT",
      headers: this.getAuthHeader(),
      body: JSON.stringify(data),
    })
    return this.handleResponse<any>(response)
  }

  async deleteQuote(id: string) {
    const response = await fetch(`/api/quotes/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeader(),
    })
    return this.handleResponse<any>(response)
  }

  async sendQuote(id: string) {
    const response = await fetch(`/api/quotes/${id}/send`, {
      method: "POST",
      headers: this.getAuthHeader(),
    })
    return this.handleResponse<any>(response)
  }

  // Invoices endpoints
  async getInvoices(params?: { page?: number; limit?: number; status?: string }) {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.set("page", params.page.toString())
    if (params?.limit) queryParams.set("limit", params.limit.toString())
    if (params?.status) queryParams.set("status", params.status)

    const response = await fetch(`/api/invoices?${queryParams}`, {
      headers: this.getAuthHeader(),
    })
    return this.handleResponse<any>(response)
  }

  async createInvoice(data: any) {
    const response = await fetch(`/api/invoices`, {
      method: "POST",
      headers: this.getAuthHeader(),
      body: JSON.stringify(data),
    })
    return this.handleResponse<any>(response)
  }

  async updateInvoice(id: string, data: any) {
    const response = await fetch(`/api/invoices/${id}`, {
      method: "PUT",
      headers: this.getAuthHeader(),
      body: JSON.stringify(data),
    })
    return this.handleResponse<any>(response)
  }

  async deleteInvoice(id: string) {
    const response = await fetch(`/api/invoices/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeader(),
    })
    return this.handleResponse<any>(response)
  }

  async markInvoicePaid(id: string, data: any) {
    const response = await fetch(`/api/invoices/${id}/mark-paid`, {
      method: "POST",
      headers: this.getAuthHeader(),
      body: JSON.stringify(data),
    })
    return this.handleResponse<any>(response)
  }

  // Payments endpoints
  async getPayments(params?: { page?: number; limit?: number; invoiceId?: string }) {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.set("page", params.page.toString())
    if (params?.limit) queryParams.set("limit", params.limit.toString())
    if (params?.invoiceId) queryParams.set("invoiceId", params.invoiceId)

    const response = await fetch(`/api/payments?${queryParams}`, {
      headers: this.getAuthHeader(),
    })
    return this.handleResponse<any>(response)
  }

  // Deliveries endpoints
  async getDeliveries(params?: { page?: number; limit?: number; status?: string }) {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.set("page", params.page.toString())
    if (params?.limit) queryParams.set("limit", params.limit.toString())
    if (params?.status) queryParams.set("status", params.status)

    const response = await fetch(`/api/deliveries?${queryParams}`, {
      headers: this.getAuthHeader(),
    })
    return this.handleResponse<any>(response)
  }

  async createDelivery(data: any) {
    const response = await fetch(`/api/deliveries`, {
      method: "POST",
      headers: this.getAuthHeader(),
      body: JSON.stringify(data),
    })
    return this.handleResponse<any>(response)
  }
}

export const apiClient = new ApiClient()

