/**
 * Centralized API Client Configuration
 * Provides typed API endpoints and fetch wrapper for consistent API usage
 */

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// API Endpoint definitions
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    PROFILE: '/api/auth/me',
  },

  // CRM Endpoints
  CRM: {
    LEADS: '/api/leads',
    LEAD_BY_ID: (id: string) => `/api/leads/${id}`,
    OPPORTUNITIES: '/api/opportunities',
    OPPORTUNITY_BY_ID: (id: string) => `/api/opportunities/${id}`,
    QUOTES: '/api/quotes',
    QUOTE_BY_ID: (id: string) => `/api/quotes/${id}`,
    INVOICES: '/api/crm/invoices',
    INVOICE_BY_ID: (id: string) => `/api/crm/invoices/${id}`,
    CUSTOMERS: '/api/crm/customers',
    CUSTOMER_BY_ID: (id: string) => `/api/crm/customers/${id}`,
    SALES_ORDERS: '/api/crm/sales-orders',
    SALES_ORDER_BY_ID: (id: string) => `/api/crm/sales-orders/${id}`,
    ACTIVITIES: '/api/crm/activities',
    ACTIVITY_BY_ID: (id: string) => `/api/crm/activities/${id}`,
    TASKS: '/api/crm/tasks',
    TASK_BY_ID: (id: string) => `/api/crm/tasks/${id}`,
    DOCUMENTS: '/api/crm/documents',
    DOCUMENT_BY_ID: (id: string) => `/api/crm/documents/${id}`,
    PRODUCTS: '/api/crm/products',
    PRODUCT_BY_ID: (id: string) => `/api/crm/products/${id}`,
    PROMOTIONS: '/api/crm/promotions',
    PROMOTION_BY_ID: (id: string) => `/api/crm/promotions/${id}`,
    CREDIT_LIMITS: '/api/crm/credit-limits',
    CREDIT_LIMIT_BY_ID: (id: string) => `/api/crm/credit-limits/${id}`,
    APPROVALS: '/api/crm/approvals',
    APPROVAL_BY_ID: (id: string) => `/api/crm/approvals/${id}`,
    MARKETING_CAMPAIGNS: '/api/crm/marketing-campaigns',
    MARKETING_CAMPAIGN_BY_ID: (id: string) => `/api/crm/marketing-campaigns/${id}`,
    CUSTOMER_SATISFACTION: '/api/crm/customer-satisfaction',
    COMMUNICATION_TEMPLATES: '/api/crm/communication-templates',
    NOTIFICATIONS: '/api/notifications',
    NOTIFICATION_BY_ID: (id: string) => `/api/notifications/${id}`,
  },

  // HR Endpoints
  HR: {
    EMPLOYEES: '/api/hr/employees',
    EMPLOYEE_BY_ID: (id: string) => `/api/hr/employees/${id}`,
    ATTENDANCE: '/api/hr/attendance',
    ATTENDANCE_BY_ID: (id: string) => `/api/hr/attendance/${id}`,
    LEAVE_REQUESTS: '/api/hr/leave-requests',
    LEAVE_REQUEST_BY_ID: (id: string) => `/api/hr/leave-requests/${id}`,
    PAYROLL: '/api/hr/payroll',
    PAYROLL_BY_ID: (id: string) => `/api/hr/payroll/${id}`,
    PERFORMANCE_REVIEWS: '/api/hr/performance-reviews',
    PERFORMANCE_REVIEW_BY_ID: (id: string) => `/api/hr/performance-reviews/${id}`,
    TRAINING: '/api/hr/training',
    TRAINING_BY_ID: (id: string) => `/api/hr/training/${id}`,
    REPORTS: '/api/hr/reports',
  },

  // Inventory Endpoints
  INVENTORY: {
    ITEMS: '/api/inventory/items',
    ITEM_BY_ID: (id: string) => `/api/inventory/items/${id}`,
    CATEGORIES: '/api/inventory/categories',
    CATEGORY_BY_ID: (id: string) => `/api/inventory/categories/${id}`,
    SUPPLIERS: '/api/inventory/suppliers',
    SUPPLIER_BY_ID: (id: string) => `/api/inventory/suppliers/${id}`,
    STOCK_MOVEMENTS: '/api/inventory/stock-movements',
    STOCK_MOVEMENT_BY_ID: (id: string) => `/api/inventory/stock-movements/${id}`,
    LOW_STOCK_ALERTS: '/api/inventory/low-stock-alerts',
    ANALYTICS: '/api/inventory/analytics',
  },

  // Procurement Endpoints
  PROCUREMENT: {
    PURCHASE_ORDERS: '/api/procurement/purchase-orders',
    PURCHASE_ORDER_BY_ID: (id: string) => `/api/procurement/purchase-orders/${id}`,
    VENDORS: '/api/procurement/vendors',
    VENDOR_BY_ID: (id: string) => `/api/procurement/vendors/${id}`,
    REQUISITIONS: '/api/procurement/requisitions',
    REQUISITION_BY_ID: (id: string) => `/api/procurement/requisitions/${id}`,
    CONTRACTS: '/api/procurement/contracts',
    CONTRACT_BY_ID: (id: string) => `/api/procurement/contracts/${id}`,
  },

  // After Sales Endpoints
  AFTER_SALES: {
    TICKETS: '/after-sales/tickets',
    TICKET_BY_ID: (id: string) => `/after-sales/tickets/${id}`,
    WARRANTIES: '/after-sales/warranties',
    WARRANTY_BY_ID: (id: string) => `/after-sales/warranties/${id}`,
    REPAIRS: '/after-sales/repairs',
    REPAIR_BY_ID: (id: string) => `/after-sales/repairs/${id}`,
  },

  // File Management
  FILES: {
    UPLOAD: '/api/files/upload',
    LIST: '/api/files',
    SERVE: (companyId: string, type: string, entityId: string, filename: string) => 
      `/api/files/serve/${companyId}/${type}/${entityId}/${filename}`,
    DELETE: '/api/files',
  },

  // System Endpoints
  SYSTEM: {
    HEALTH: '/api/health',
    COMPANY: '/api/company',
    USERS: '/api/users',
    USER_BY_ID: (id: string) => `/api/users/${id}`,
    SETTINGS: '/api/settings/configuration',
    NOTIFICATIONS: '/cron/notifications',
  },

  // License
  LICENSE: {
    STATUS: '/api/license/status',
    ACTIVATE: '/api/license/activate',
    DEACTIVATE: '/api/license/deactivate',
  },
} as const;

// HTTP Methods
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// Request options
export interface ApiRequestOptions {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, string | number | boolean>;
  timeout?: number;
}

// API Client class
export class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string): void {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Remove authentication token
   */
  clearAuthToken(): void {
    delete this.defaultHeaders['Authorization'];
  }

  /**
   * Refresh authentication token
   */
  private async refreshToken(): Promise<boolean> {
    try {
      if (typeof window === 'undefined') return false;
      
      const storedToken = localStorage.getItem("bizabode_token");
      if (!storedToken) return false;

      // Temporarily remove the expired token to avoid infinite recursion
      const originalToken = this.defaultHeaders['Authorization'];
      delete this.defaultHeaders['Authorization'];

      const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.AUTH.REFRESH}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${storedToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const newToken = data.token || data.data?.token;
        
        if (newToken) {
          localStorage.setItem("bizabode_token", newToken);
          this.setAuthToken(newToken);
          return true;
        }
      }

      // Restore original token if refresh failed
      if (originalToken) {
        this.defaultHeaders['Authorization'] = originalToken;
      }

      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  /**
   * Build full URL with query parameters
   */
  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean>): string {
    const url = new URL(endpoint, this.baseUrl);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }
    
    return url.toString();
  }

  /**
   * Make HTTP request with error handling
   */
  async request<T = any>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      params,
      timeout = 30000,
    } = options;

    const url = this.buildUrl(endpoint, params);
    const requestHeaders = { ...this.defaultHeaders, ...headers };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        // Handle 401 Unauthorized - attempt token refresh
        if (response.status === 401 && endpoint !== API_ENDPOINTS.AUTH.LOGIN && endpoint !== API_ENDPOINTS.AUTH.REGISTER) {
          const refreshResult = await this.refreshToken();
          if (refreshResult) {
            // Retry the original request with new token
            return this.request(endpoint, options);
          } else {
            // Token refresh failed - redirect to login
            if (typeof window !== 'undefined') {
              localStorage.removeItem("bizabode_token")
              localStorage.removeItem("bizabode_user")
              localStorage.removeItem("bizabode_company")
              window.location.href = '/login';
            }
          }
        }

        return {
          success: false,
          error: data.error || data.message || `HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message,
        pagination: data.pagination,
      };
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return {
          success: false,
          error: 'Request timeout',
        };
      }

      return {
        success: false,
        error: error.message || 'Network error',
      };
    }
  }

  /**
   * GET request
   */
  async get<T = any>(endpoint: string, params?: Record<string, string | number | boolean>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET', params });
  }

  /**
   * POST request
   */
  async post<T = any>(endpoint: string, body?: any, params?: Record<string, string | number | boolean>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'POST', body, params });
  }

  /**
   * PUT request
   */
  async put<T = any>(endpoint: string, body?: any, params?: Record<string, string | number | boolean>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PUT', body, params });
  }

  /**
   * DELETE request
   */
  async delete<T = any>(endpoint: string, params?: Record<string, string | number | boolean>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE', params });
  }

  /**
   * PATCH request
   */
  async patch<T = any>(endpoint: string, body?: any, params?: Record<string, string | number | boolean>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PATCH', body, params });
  }
}

// Default API client instance
export const apiClient = new ApiClient();

// Convenience functions for common operations
export const api = {
  // CRM operations
  crm: {
    leads: {
      list: (params?: Record<string, string | number | boolean>) => 
        apiClient.get(API_ENDPOINTS.CRM.LEADS, params),
      get: (id: string) => 
        apiClient.get(API_ENDPOINTS.CRM.LEAD_BY_ID(id)),
      create: (data: any) => 
        apiClient.post(API_ENDPOINTS.CRM.LEADS, data),
      update: (id: string, data: any) => 
        apiClient.put(API_ENDPOINTS.CRM.LEAD_BY_ID(id), data),
      delete: (id: string) => 
        apiClient.delete(API_ENDPOINTS.CRM.LEAD_BY_ID(id)),
    },
    opportunities: {
      list: (params?: Record<string, string | number | boolean>) => 
        apiClient.get(API_ENDPOINTS.CRM.OPPORTUNITIES, params),
      get: (id: string) => 
        apiClient.get(API_ENDPOINTS.CRM.OPPORTUNITY_BY_ID(id)),
      create: (data: any) => 
        apiClient.post(API_ENDPOINTS.CRM.OPPORTUNITIES, data),
      update: (id: string, data: any) => 
        apiClient.put(API_ENDPOINTS.CRM.OPPORTUNITY_BY_ID(id), data),
      delete: (id: string) => 
        apiClient.delete(API_ENDPOINTS.CRM.OPPORTUNITY_BY_ID(id)),
    },
    customers: {
      list: (params?: Record<string, string | number | boolean>) => 
        apiClient.get(API_ENDPOINTS.CRM.CUSTOMERS, params),
      get: (id: string) => 
        apiClient.get(API_ENDPOINTS.CRM.CUSTOMER_BY_ID(id)),
      create: (data: any) => 
        apiClient.post(API_ENDPOINTS.CRM.CUSTOMERS, data),
      update: (id: string, data: any) => 
        apiClient.put(API_ENDPOINTS.CRM.CUSTOMER_BY_ID(id), data),
      delete: (id: string) => 
        apiClient.delete(API_ENDPOINTS.CRM.CUSTOMER_BY_ID(id)),
    },
    quotes: {
      list: (params?: Record<string, string | number | boolean>) => 
        apiClient.get(API_ENDPOINTS.CRM.QUOTES, params),
      get: (id: string) => 
        apiClient.get(API_ENDPOINTS.CRM.QUOTE_BY_ID(id)),
      create: (data: any) => 
        apiClient.post(API_ENDPOINTS.CRM.QUOTES, data),
      update: (id: string, data: any) => 
        apiClient.put(API_ENDPOINTS.CRM.QUOTE_BY_ID(id), data),
      delete: (id: string) => 
        apiClient.delete(API_ENDPOINTS.CRM.QUOTE_BY_ID(id)),
      downloadPdf: (id: string) => 
        apiClient.get(`/api/crm/quotes/${id}/download-pdf`),
      email: (id: string, data: any) => 
        apiClient.post(`/api/crm/quotes/${id}/email`, data),
    },
    invoices: {
      list: (params?: Record<string, string | number | boolean>) => 
        apiClient.get(API_ENDPOINTS.CRM.INVOICES, params),
      get: (id: string) => 
        apiClient.get(API_ENDPOINTS.CRM.INVOICE_BY_ID(id)),
      create: (data: any) => 
        apiClient.post(API_ENDPOINTS.CRM.INVOICES, data),
      update: (id: string, data: any) => 
        apiClient.put(API_ENDPOINTS.CRM.INVOICE_BY_ID(id), data),
      delete: (id: string) => 
        apiClient.delete(API_ENDPOINTS.CRM.INVOICE_BY_ID(id)),
      downloadPdf: (id: string) => 
        apiClient.get(`/api/crm/invoices/${id}/download-pdf`),
      email: (id: string, data: any) => 
        apiClient.post(`/api/crm/invoices/${id}/email`, data),
      markPaid: (id: string, data: any) => 
        apiClient.post(`/api/invoices/${id}/mark-paid`, data),
    },
    payments: {
      list: (params?: Record<string, string | number | boolean>) => 
        apiClient.get('/api/payments', params),
      get: (id: string) => 
        apiClient.get(`/api/payments/${id}`),
      create: (data: any) => 
        apiClient.post('/api/payments', data),
      update: (id: string, data: any) => 
        apiClient.put(`/api/payments/${id}`, data),
      delete: (id: string) => 
        apiClient.delete(`/api/payments/${id}`),
    },
    salesOrders: {
      list: (params?: Record<string, string | number | boolean>) => 
        apiClient.get(API_ENDPOINTS.CRM.SALES_ORDERS, params),
      get: (id: string) => 
        apiClient.get(API_ENDPOINTS.CRM.SALES_ORDER_BY_ID(id)),
      create: (data: any) => 
        apiClient.post(API_ENDPOINTS.CRM.SALES_ORDERS, data),
      update: (id: string, data: any) => 
        apiClient.put(API_ENDPOINTS.CRM.SALES_ORDER_BY_ID(id), data),
      delete: (id: string) => 
        apiClient.delete(API_ENDPOINTS.CRM.SALES_ORDER_BY_ID(id)),
    },
    activities: {
      list: (params?: Record<string, string | number | boolean>) => 
        apiClient.get(API_ENDPOINTS.CRM.ACTIVITIES, params),
      get: (id: string) => 
        apiClient.get(API_ENDPOINTS.CRM.ACTIVITY_BY_ID(id)),
      create: (data: any) => 
        apiClient.post(API_ENDPOINTS.CRM.ACTIVITIES, data),
      update: (id: string, data: any) => 
        apiClient.put(API_ENDPOINTS.CRM.ACTIVITY_BY_ID(id), data),
      delete: (id: string) => 
        apiClient.delete(API_ENDPOINTS.CRM.ACTIVITY_BY_ID(id)),
    },
    tasks: {
      list: (params?: Record<string, string | number | boolean>) => 
        apiClient.get(API_ENDPOINTS.CRM.TASKS, params),
      get: (id: string) => 
        apiClient.get(API_ENDPOINTS.CRM.TASK_BY_ID(id)),
      create: (data: any) => 
        apiClient.post(API_ENDPOINTS.CRM.TASKS, data),
      update: (id: string, data: any) => 
        apiClient.put(API_ENDPOINTS.CRM.TASK_BY_ID(id), data),
      delete: (id: string) => 
        apiClient.delete(API_ENDPOINTS.CRM.TASK_BY_ID(id)),
    },
    documents: {
      list: (params?: Record<string, string | number | boolean>) => 
        apiClient.get(API_ENDPOINTS.CRM.DOCUMENTS, params),
      get: (id: string) => 
        apiClient.get(API_ENDPOINTS.CRM.DOCUMENT_BY_ID(id)),
      create: (data: any) => 
        apiClient.post(API_ENDPOINTS.CRM.DOCUMENTS, data),
      update: (id: string, data: any) => 
        apiClient.put(API_ENDPOINTS.CRM.DOCUMENT_BY_ID(id), data),
      delete: (id: string) => 
        apiClient.delete(API_ENDPOINTS.CRM.DOCUMENT_BY_ID(id)),
    },
    products: {
      list: (params?: Record<string, string | number | boolean>) => 
        apiClient.get(API_ENDPOINTS.CRM.PRODUCTS, params),
      get: (id: string) => 
        apiClient.get(API_ENDPOINTS.CRM.PRODUCT_BY_ID(id)),
      create: (data: any) => 
        apiClient.post(API_ENDPOINTS.CRM.PRODUCTS, data),
      update: (id: string, data: any) => 
        apiClient.put(API_ENDPOINTS.CRM.PRODUCT_BY_ID(id), data),
      delete: (id: string) => 
        apiClient.delete(API_ENDPOINTS.CRM.PRODUCT_BY_ID(id)),
    },
    promotions: {
      list: (params?: Record<string, string | number | boolean>) => 
        apiClient.get(API_ENDPOINTS.CRM.PROMOTIONS, params),
      get: (id: string) => 
        apiClient.get(API_ENDPOINTS.CRM.PROMOTION_BY_ID(id)),
      create: (data: any) => 
        apiClient.post(API_ENDPOINTS.CRM.PROMOTIONS, data),
      update: (id: string, data: any) => 
        apiClient.put(API_ENDPOINTS.CRM.PROMOTION_BY_ID(id), data),
      delete: (id: string) => 
        apiClient.delete(API_ENDPOINTS.CRM.PROMOTION_BY_ID(id)),
    },
    creditLimits: {
      list: (params?: Record<string, string | number | boolean>) => 
        apiClient.get(API_ENDPOINTS.CRM.CREDIT_LIMITS, params),
      get: (id: string) => 
        apiClient.get(API_ENDPOINTS.CRM.CREDIT_LIMIT_BY_ID(id)),
      create: (data: any) => 
        apiClient.post(API_ENDPOINTS.CRM.CREDIT_LIMITS, data),
      update: (id: string, data: any) => 
        apiClient.put(API_ENDPOINTS.CRM.CREDIT_LIMIT_BY_ID(id), data),
      delete: (id: string) => 
        apiClient.delete(API_ENDPOINTS.CRM.CREDIT_LIMIT_BY_ID(id)),
    },
    approvals: {
      list: (params?: Record<string, string | number | boolean>) => 
        apiClient.get(API_ENDPOINTS.CRM.APPROVALS, params),
      get: (id: string) => 
        apiClient.get(API_ENDPOINTS.CRM.APPROVAL_BY_ID(id)),
      create: (data: any) => 
        apiClient.post(API_ENDPOINTS.CRM.APPROVALS, data),
      update: (id: string, data: any) => 
        apiClient.put(API_ENDPOINTS.CRM.APPROVAL_BY_ID(id), data),
      delete: (id: string) => 
        apiClient.delete(API_ENDPOINTS.CRM.APPROVAL_BY_ID(id)),
    },
    notifications: {
      list: (params?: Record<string, string | number | boolean>) => 
        apiClient.get(API_ENDPOINTS.CRM.NOTIFICATIONS, params),
      get: (id: string) => 
        apiClient.get(API_ENDPOINTS.CRM.NOTIFICATION_BY_ID(id)),
      create: (data: any) => 
        apiClient.post(API_ENDPOINTS.CRM.NOTIFICATIONS, data),
      update: (id: string, data: any) => 
        apiClient.put(API_ENDPOINTS.CRM.NOTIFICATION_BY_ID(id), data),
      delete: (id: string) => 
        apiClient.delete(API_ENDPOINTS.CRM.NOTIFICATION_BY_ID(id)),
      markAsRead: (notificationIds: string[]) => 
        apiClient.put(API_ENDPOINTS.CRM.NOTIFICATIONS, {
          notificationIds,
          action: 'markAsRead'
        }),
      markAsUnread: (notificationIds: string[]) => 
        apiClient.put(API_ENDPOINTS.CRM.NOTIFICATIONS, {
          notificationIds,
          action: 'markAsUnread'
        }),
      deleteMultiple: (notificationIds: string[]) => 
        apiClient.put(API_ENDPOINTS.CRM.NOTIFICATIONS, {
          notificationIds,
          action: 'delete'
        }),
    },
  },

  // HR operations
  hr: {
    employees: {
      list: (params?: Record<string, string | number | boolean>) => 
        apiClient.get(API_ENDPOINTS.HR.EMPLOYEES, params),
      get: (id: string) => 
        apiClient.get(API_ENDPOINTS.HR.EMPLOYEE_BY_ID(id)),
      create: (data: any) => 
        apiClient.post(API_ENDPOINTS.HR.EMPLOYEES, data),
      update: (id: string, data: any) => 
        apiClient.put(API_ENDPOINTS.HR.EMPLOYEE_BY_ID(id), data),
      delete: (id: string) => 
        apiClient.delete(API_ENDPOINTS.HR.EMPLOYEE_BY_ID(id)),
    },
    attendance: {
      list: (params?: Record<string, string | number | boolean>) => 
        apiClient.get(API_ENDPOINTS.HR.ATTENDANCE, params),
      get: (id: string) => 
        apiClient.get(API_ENDPOINTS.HR.ATTENDANCE_BY_ID(id)),
      create: (data: any) => 
        apiClient.post(API_ENDPOINTS.HR.ATTENDANCE, data),
      update: (id: string, data: any) => 
        apiClient.put(API_ENDPOINTS.HR.ATTENDANCE_BY_ID(id), data),
      delete: (id: string) => 
        apiClient.delete(API_ENDPOINTS.HR.ATTENDANCE_BY_ID(id)),
    },
    leaveRequests: {
      list: (params?: Record<string, string | number | boolean>) => 
        apiClient.get(API_ENDPOINTS.HR.LEAVE_REQUESTS, params),
      get: (id: string) => 
        apiClient.get(API_ENDPOINTS.HR.LEAVE_REQUEST_BY_ID(id)),
      create: (data: any) => 
        apiClient.post(API_ENDPOINTS.HR.LEAVE_REQUESTS, data),
      update: (id: string, data: any) => 
        apiClient.put(API_ENDPOINTS.HR.LEAVE_REQUEST_BY_ID(id), data),
      delete: (id: string) => 
        apiClient.delete(API_ENDPOINTS.HR.LEAVE_REQUEST_BY_ID(id)),
    },
    payroll: {
      list: (params?: Record<string, string | number | boolean>) => 
        apiClient.get(API_ENDPOINTS.HR.PAYROLL, params),
      get: (id: string) => 
        apiClient.get(API_ENDPOINTS.HR.PAYROLL_BY_ID(id)),
      create: (data: any) => 
        apiClient.post(API_ENDPOINTS.HR.PAYROLL, data),
      update: (id: string, data: any) => 
        apiClient.put(API_ENDPOINTS.HR.PAYROLL_BY_ID(id), data),
      delete: (id: string) => 
        apiClient.delete(API_ENDPOINTS.HR.PAYROLL_BY_ID(id)),
    },
    reports: {
      get: (params?: Record<string, string | number | boolean>) => 
        apiClient.get(API_ENDPOINTS.HR.REPORTS, params),
    },
  },

  // Inventory operations
  inventory: {
    items: {
      list: (params?: Record<string, string | number | boolean>) => 
        apiClient.get(API_ENDPOINTS.INVENTORY.ITEMS, params),
      get: (id: string) => 
        apiClient.get(API_ENDPOINTS.INVENTORY.ITEM_BY_ID(id)),
      create: (data: any) => 
        apiClient.post(API_ENDPOINTS.INVENTORY.ITEMS, data),
      update: (id: string, data: any) => 
        apiClient.put(API_ENDPOINTS.INVENTORY.ITEM_BY_ID(id), data),
      delete: (id: string) => 
        apiClient.delete(API_ENDPOINTS.INVENTORY.ITEM_BY_ID(id)),
      exportCsv: (params?: Record<string, string | number | boolean>) => 
        apiClient.get('/inventory/items/export-csv', params),
    },
    analytics: {
      get: (params?: Record<string, string | number | boolean>) => 
        apiClient.get(API_ENDPOINTS.INVENTORY.ANALYTICS, params),
    },
  },

  // System operations
  system: {
    health: () => 
      apiClient.get(API_ENDPOINTS.SYSTEM.HEALTH),
    company: {
      get: () => 
        apiClient.get(API_ENDPOINTS.SYSTEM.COMPANY),
      update: (data: any) => 
        apiClient.put(API_ENDPOINTS.SYSTEM.COMPANY, data),
    },
    users: {
      list: (params?: Record<string, string | number | boolean>) => 
        apiClient.get(API_ENDPOINTS.SYSTEM.USERS, params),
      get: (id: string) => 
        apiClient.get(API_ENDPOINTS.SYSTEM.USER_BY_ID(id)),
      create: (data: any) => 
        apiClient.post(API_ENDPOINTS.SYSTEM.USERS, data),
      update: (id: string, data: any) => 
        apiClient.put(API_ENDPOINTS.SYSTEM.USER_BY_ID(id), data),
      delete: (id: string) => 
        apiClient.delete(API_ENDPOINTS.SYSTEM.USER_BY_ID(id)),
    },
  },

  // License operations
  license: {
    getStatus: () => 
      apiClient.get(API_ENDPOINTS.LICENSE.STATUS),
    activate: (data: { licenseKey: string }) => 
      apiClient.post(API_ENDPOINTS.LICENSE.ACTIVATE, data),
    deactivate: () => 
      apiClient.post(API_ENDPOINTS.LICENSE.DEACTIVATE),
  },
};

export default apiClient;

// Export endpoints for backward compatibility
export { API_ENDPOINTS as endpoints };