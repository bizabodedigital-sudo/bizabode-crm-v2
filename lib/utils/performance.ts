// Performance optimization utilities

// Debounce function for search inputs
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    
    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

// Throttle function for scroll events
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// Memoization for expensive calculations
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>()
  
  return ((...args: Parameters<T>) => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args)
    
    if (cache.has(key)) {
      return cache.get(key)!
    }
    
    const result = func(...args)
    cache.set(key, result)
    return result
  }) as T
}

// Lazy loading utility
export function createLazyLoader<T>(
  loader: () => Promise<T>,
  cache: Map<string, T> = new Map()
) {
  return async (key: string): Promise<T> => {
    if (cache.has(key)) {
      return cache.get(key)!
    }
    
    const result = await loader()
    cache.set(key, result)
    return result
  }
}

// Batch processing for API calls
export function createBatchProcessor<T, R>(
  processor: (items: T[]) => Promise<R[]>,
  batchSize: number = 10,
  delay: number = 100
) {
  const queue: T[] = []
  let timeout: NodeJS.Timeout | null = null
  
  return (item: T): Promise<R> => {
    return new Promise((resolve, reject) => {
      queue.push(item)
      
      if (timeout) {
        clearTimeout(timeout)
      }
      
      timeout = setTimeout(async () => {
        if (queue.length >= batchSize || queue.length > 0) {
          try {
            const batch = queue.splice(0, batchSize)
            const results = await processor(batch)
            resolve(results[0]) // Return first result for simplicity
          } catch (error) {
            reject(error)
          }
        }
      }, delay)
    })
  }
}

// Image optimization
export function optimizeImageUrl(
  url: string,
  width?: number,
  height?: number,
  quality: number = 80
): string {
  const params = new URLSearchParams()
  
  if (width) params.set('w', width.toString())
  if (height) params.set('h', height.toString())
  params.set('q', quality.toString())
  
  return `${url}?${params.toString()}`
}

// Memory usage monitoring
export function getMemoryUsage(): {
  used: number
  total: number
  percentage: number
} {
  if (typeof process !== 'undefined' && process.memoryUsage) {
    const usage = process.memoryUsage()
    return {
      used: usage.heapUsed,
      total: usage.heapTotal,
      percentage: (usage.heapUsed / usage.heapTotal) * 100
    }
  }
  
  return { used: 0, total: 0, percentage: 0 }
}

// Performance timing
export class PerformanceTimer {
  private startTime: number = 0
  private endTime: number = 0
  
  start(): void {
    this.startTime = performance.now()
  }
  
  end(): number {
    this.endTime = performance.now()
    return this.endTime - this.startTime
  }
  
  getDuration(): number {
    return this.endTime - this.startTime
  }
}

// Cache management
export class CacheManager<T> {
  private cache = new Map<string, { data: T; timestamp: number; ttl: number }>()
  
  set(key: string, data: T, ttl: number = 300000): void { // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }
  
  get(key: string): T | null {
    const item = this.cache.get(key)
    
    if (!item) {
      return null
    }
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return item.data
  }
  
  clear(): void {
    this.cache.clear()
  }
  
  size(): number {
    return this.cache.size
  }
}

// Database query optimization
export function createQueryOptimizer() {
  const queryCache = new Map<string, any>()
  
  return {
    // Add lean() to queries for better performance
    optimizeQuery: (query: any) => {
      return query.lean()
    },
    
    // Cache frequently accessed data
    cacheQuery: (key: string, query: any, ttl: number = 300000) => {
      const cached = queryCache.get(key)
      if (cached && Date.now() - cached.timestamp < ttl) {
        return cached.data
      }
      
      return null
    },
    
    // Set query cache
    setQueryCache: (key: string, data: any) => {
      queryCache.set(key, {
        data,
        timestamp: Date.now()
      })
    }
  }
}