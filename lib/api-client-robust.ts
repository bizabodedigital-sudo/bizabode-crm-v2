interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

interface RetryConfig {
  maxRetries: number
  baseDelay: number
  maxDelay: number
}

interface ApiClientConfig {
  baseUrl: string
  retryConfig: RetryConfig
  offlineStorage: boolean
}

class RobustApiClient {
  private config: ApiClientConfig
  private isOnline: boolean = typeof window !== 'undefined' ? navigator.onLine : true
  private pendingRequests: Map<string, Promise<any>> = new Map()

  constructor(config: ApiClientConfig) {
    this.config = config
    if (typeof window !== 'undefined') {
      this.setupOnlineListener()
    }
  }

  private setupOnlineListener() {
    window.addEventListener('online', () => {
      this.isOnline = true
      this.syncOfflineData()
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
    })
  }

  private async syncOfflineData() {
    const offlineData = this.getOfflineData()
    for (const [key, data] of offlineData.entries()) {
      try {
        await this.executeRequest(data.url, data.options)
        this.removeOfflineData(key)
      } catch (error) {
        console.error('Failed to sync offline data:', error)
      }
    }
  }

  private getOfflineData(): Map<string, any> {
    const data = localStorage.getItem('offline-requests')
    return data ? new Map(JSON.parse(data)) : new Map()
  }

  private saveOfflineData(key: string, data: any) {
    const offlineData = this.getOfflineData()
    offlineData.set(key, data)
    localStorage.setItem('offline-requests', JSON.stringify([...offlineData]))
  }

  private removeOfflineData(key: string) {
    const offlineData = this.getOfflineData()
    offlineData.delete(key)
    localStorage.setItem('offline-requests', JSON.stringify([...offlineData]))
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private async retryWithBackoff<T>(
    fn: () => Promise<T>,
    retryCount: number = 0
  ): Promise<T> {
    try {
      return await fn()
    } catch (error) {
      if (retryCount >= this.config.retryConfig.maxRetries) {
        throw error
      }

      const delay = Math.min(
        this.config.retryConfig.baseDelay * Math.pow(2, retryCount),
        this.config.retryConfig.maxDelay
      )

      await this.sleep(delay)
      return this.retryWithBackoff(fn, retryCount + 1)
    }
  }

  private generateRequestKey(url: string, options: RequestInit): string {
    return btoa(JSON.stringify({ url, method: options.method, body: options.body }))
  }

  private async executeRequest<T>(url: string, options: RequestInit): Promise<ApiResponse<T>> {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return await response.json()
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.config.baseUrl}${endpoint}`
    const requestKey = this.generateRequestKey(url, options)

    // Check if we already have a pending request for this
    if (this.pendingRequests.has(requestKey)) {
      return this.pendingRequests.get(requestKey)!
    }

    const requestPromise = this.performRequest<T>(url, options, requestKey)
    this.pendingRequests.set(requestKey, requestPromise)

    try {
      const result = await requestPromise
      return result
    } finally {
      this.pendingRequests.delete(requestKey)
    }
  }

  private async performRequest<T>(
    url: string,
    options: RequestInit,
    requestKey: string
  ): Promise<ApiResponse<T>> {
    if (!this.isOnline && this.config.offlineStorage) {
      // Store request for later sync
      this.saveOfflineData(requestKey, { url, options })
      return {
        success: false,
        error: 'Offline - request queued for sync',
        data: { offline: true, queued: true } as T
      }
    }

    try {
      return await this.retryWithBackoff(() => this.executeRequest<T>(url, options))
    } catch (error) {
      console.error('API request failed:', error)
      
      if (this.config.offlineStorage) {
        this.saveOfflineData(requestKey, { url, options })
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Request failed',
        data: undefined as T
      }
    }
  }

  // Employee-specific methods
  async loginEmployee(employeeId: string, password: string): Promise<ApiResponse> {
    return this.request('/api/auth/employee-login', {
      method: 'POST',
      body: JSON.stringify({ employeeId, password })
    })
  }

  async getAttendance(employeeId: string, today: boolean = false, token?: string): Promise<ApiResponse> {
    const params = new URLSearchParams({ employeeId })
    if (today) params.append('today', 'true')
    
    const headers: Record<string, string> = {}
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    return this.request(`/api/attendance?${params}`, {
      headers
    })
  }

  async clockIn(employeeId: string, token: string): Promise<ApiResponse> {
    return this.request('/api/attendance', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        employeeId,
        date: new Date().toISOString().split('T')[0],
        checkIn: new Date().toISOString(),
        status: 'present'
      })
    })
  }

  async clockOut(employeeId: string, token: string): Promise<ApiResponse> {
    return this.request('/api/attendance', {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        employeeId,
        date: new Date().toISOString().split('T')[0],
        checkOut: new Date().toISOString()
      })
    })
  }

  async startBreak(employeeId: string, token: string): Promise<ApiResponse> {
    return this.request('/api/attendance', {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        employeeId,
        date: new Date().toISOString().split('T')[0],
        breakStart: new Date().toISOString()
      })
    })
  }

  async endBreak(employeeId: string, token: string): Promise<ApiResponse> {
    return this.request('/api/attendance', {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        employeeId,
        date: new Date().toISOString().split('T')[0],
        breakEnd: new Date().toISOString()
      })
    })
  }
}

// Create singleton instance
export const apiClient = new RobustApiClient({
  baseUrl: '',
  retryConfig: {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000
  },
  offlineStorage: true
})

export default apiClient
