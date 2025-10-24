import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

interface ApiClientConfig {
  baseURL: string
  timeout: number
}

class ApiClient {
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
        const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        // Handle common errors
        if (error.response?.status === 401) {
          // Handle unauthorized access
          if (typeof window !== 'undefined') {
            localStorage.removeItem('authToken')
            window.location.href = '/login'
          }
        }
        return Promise.reject(error)
      }
    )
  }

  // HTTP Methods
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config)
    return response.data
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config)
    return response.data
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config)
    return response.data
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config)
    return response.data
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
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
const apiClient = new ApiClient({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 30000
})

export default apiClient
export { ApiClient }
export type { ApiClientConfig }
