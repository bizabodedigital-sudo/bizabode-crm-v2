/**
 * Centralized API Client Configuration
 * 
 * This file contains all API endpoint definitions and typed fetch wrappers
 * to eliminate hardcoded endpoint strings throughout the application.
 */

// Base API configuration
export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || '',
  timeout: 30000,
  retries: 3,
}

// API Endpoint Definitions
export const API_ENDPOINTS = {
  // CRM Endpoints
  crm: {
    customers: '/api/crm/customers',
    activities: '/api/crm/activities',
    salesOrders: '/api/crm/sales-orders',
    products: '/api/crm/products',
    promotions: '/api/crm/promotions',
    documents: '/api/crm/documents',
    creditLimits: '/api/crm/credit-limits',
    approvals: '/api/crm/approvals',
    tasks: '/api/crm/tasks',
    communicationTemplates: '/api/crm/communication-templates',
    marketingCampaigns: '/api/crm/marketing-campaigns',
    customerSatisfaction: '/api/crm/customer-satisfaction',
  },

  // Procurement Endpoints
  procurement: {
    suppliers: '/api/procurement/suppliers',
    purchaseOrders: '/api/procurement/purchase-orders',
    deliveries: '/api/crm/deliveries',
  },

  // HR Endpoints
  hr: {
    reports: '/api/hr/reports',
    leaves: '/api/hr/leaves',
    attendance: '/api/hr/attendance',
    payroll: '/api/hr/payroll',
    employees: '/api/employees',
    performance: '/api/hr/performance',
    training: '/api/hr/training',
  },

  // Inventory Endpoints
  inventory: {
    items: '/api/inventory/items',
    movements: '/api/inventory/movements',
    analytics: '/api/inventory/analytics',
    stockMovements: '/api/inventory/stock-movements',
    lowStockPurchaseOrder: '/api/inventory/items/low-stock-purchase-order',
    bulkImport: '/api/inventory/items/bulk-import',
    exportCsv: '/api/inventory/items/export-csv',
  },

  // Quotes & Invoices
  quotes: {
    list: '/api/quotes',
    downloadPdf: (id: string) => `/api/quotes/${id}/download-pdf`,
    email: (id: string) => `/api/quotes/${id}/email`,
  },

  invoices: {
    list: '/api/invoices',
    downloadPdf: (id: string) => `/api/invoices/${id}/download-pdf`,
    email: (id: string) => `/api/invoices/${id}/email`,
  },

  // Other Endpoints
  feedback: '/api/feedback',
  supportTickets: '/api/support-tickets',
  license: {
    status: '/api/license/status',
    activate: '/api/license/activate',
  },
  files: {
    upload: '/api/files/upload',
  },
} as const

// Request configuration types
export interface ApiRequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  body?: any
  params?: Record<string, string | number | boolean>
  timeout?: number
}

// Response wrapper type
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  pagination?: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

// Error types
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: Response
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * Get auth token from localStorage
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('bizabode_token')
}

/**
 * Build query string from parameters
 */
function buildQueryString(params: Record<string, string | number | boolean>): string {
  const searchParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value))
    }
  })
  
  const queryString = searchParams.toString()
  return queryString ? `?${queryString}` : ''
}

/**
 * Typed fetch wrapper with auth token injection
 */
export async function apiRequest<T = any>(
  endpoint: string,
  config: ApiRequestConfig = {}
): Promise<ApiResponse<T>> {
  const {
    method = 'GET',
    headers = {},
    body,
    params,
    timeout = API_CONFIG.timeout,
  } = config

  // Build full URL
  let url = `${API_CONFIG.baseUrl}${endpoint}`
  if (params) {
    url += buildQueryString(params)
  }

  // Prepare headers
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  }

  // Add auth token if available
  const token = getAuthToken()
  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`
  }

  // Prepare request options
  const requestOptions: RequestInit = {
    method,
    headers: requestHeaders,
  }

  // Add body for non-GET requests
  if (body && method !== 'GET') {
    requestOptions.body = JSON.stringify(body)
  }

  try {
    // Create abort controller for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    const response = await fetch(url, {
      ...requestOptions,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    // Parse response
    const data = await response.json()

    if (!response.ok) {
      throw new ApiError(
        data.error || data.message || `HTTP ${response.status}`,
        response.status,
        response
      )
    }

    return data
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    if (error.name === 'AbortError') {
      throw new ApiError('Request timeout', 408)
    }

    throw new ApiError(
      error.message || 'Network error',
      0
    )
  }
}

/**
 * Convenience methods for common HTTP verbs
 */
export const api = {
  get: <T = any>(endpoint: string, params?: Record<string, string | number | boolean>) =>
    apiRequest<T>(endpoint, { method: 'GET', params }),

  post: <T = any>(endpoint: string, body?: any, params?: Record<string, string | number | boolean>) =>
    apiRequest<T>(endpoint, { method: 'POST', body, params }),

  put: <T = any>(endpoint: string, body?: any, params?: Record<string, string | number | boolean>) =>
    apiRequest<T>(endpoint, { method: 'PUT', body, params }),

  patch: <T = any>(endpoint: string, body?: any, params?: Record<string, string | number | boolean>) =>
    apiRequest<T>(endpoint, { method: 'PATCH', body, params }),

  delete: <T = any>(endpoint: string, params?: Record<string, string | number | boolean>) =>
    apiRequest<T>(endpoint, { method: 'DELETE', params }),
}

// Export endpoints for direct access
export { API_ENDPOINTS as endpoints }
