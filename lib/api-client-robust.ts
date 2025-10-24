import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'

interface ApiClientConfig {
  baseURL: string
  timeout: number
  retries: number
  retryDelay: number
}

interface RequestConfig extends AxiosRequestConfig {
  retries?: number
  retryDelay?: number
}

class RobustApiClient {
  private client: AxiosInstance
  private config: ApiClientConfig

  constructor(config: ApiClientConfig) {
    this.config = config
    
    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = localStorage.getItem('authToken')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor with retry logic
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const config = error.config as RequestConfig
        
        if (!config || !this.shouldRetry(error, config)) {
          return Promise.reject(error)
        }

        const retries = config.retries ?? this.config.retries
        const retryDelay = config.retryDelay ?? this.config.retryDelay

        if (config.retryCount === undefined) {
          config.retryCount = 0
        }

        if (config.retryCount < retries) {
          config.retryCount++
          
          // Wait before retrying
          await this.delay(retryDelay * Math.pow(2, config.retryCount - 1))
          
          return this.client(config)
        }

        return Promise.reject(error)
      }
    )
  }

  private shouldRetry(error: AxiosError, config: RequestConfig): boolean {
    // Don't retry if retries are disabled
    if (config.retries === 0) return false

    // Retry on network errors or 5xx status codes
    return (
      !error.response ||
      (error.response.status >= 500 && error.response.status < 600)
    )
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // HTTP Methods
  async get<T = any>(url: string, config?: RequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config)
    return response.data
  }

  async post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config)
    return response.data
  }

  async put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config)
    return response.data
  }

  async patch<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config)
    return response.data
  }

  async delete<T = any>(url: string, config?: RequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config)
    return response.data
  }

  // Utility methods
  setAuthToken(token: string) {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }

  removeAuthToken() {
    delete this.client.defaults.headers.common['Authorization']
  }

  setBaseURL(baseURL: string) {
    this.client.defaults.baseURL = baseURL
  }

  getBaseURL(): string {
    return this.client.defaults.baseURL || ''
  }
}

// Create default instance
const apiClient = new RobustApiClient({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 30000,
  retries: 3,
  retryDelay: 1000
})

export default apiClient
export { RobustApiClient }
export type { RequestConfig, ApiClientConfig }
