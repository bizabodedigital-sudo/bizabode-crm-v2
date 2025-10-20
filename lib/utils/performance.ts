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
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Throttle function for scroll events
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
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
      return cache.get(key)
    }

    const result = func(...args)
    cache.set(key, result)
    return result
  }) as T
}

// Lazy loading utility
export function createLazyComponent<T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> {
  return React.lazy(importFunc)
}

// Virtual scrolling helper
export function calculateVirtualScrollItems(
  containerHeight: number,
  itemHeight: number,
  scrollTop: number,
  totalItems: number
) {
  const visibleCount = Math.ceil(containerHeight / itemHeight)
  const startIndex = Math.floor(scrollTop / itemHeight)
  const endIndex = Math.min(startIndex + visibleCount, totalItems)
  
  return {
    startIndex,
    endIndex,
    visibleCount,
    totalHeight: totalItems * itemHeight
  }
}

// Image optimization helper
export function optimizeImageUrl(
  url: string,
  width?: number,
  height?: number,
  quality: number = 80
): string {
  // This would integrate with your image optimization service
  // For example, with Next.js Image Optimization or Cloudinary
  const params = new URLSearchParams()
  
  if (width) params.set('w', width.toString())
  if (height) params.set('h', height.toString())
  params.set('q', quality.toString())
  
  return `${url}?${params.toString()}`
}

// Bundle size analyzer helper
export function analyzeBundleSize() {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    // This would integrate with webpack-bundle-analyzer or similar
    console.log('Bundle analysis would be available in development mode')
  }
}

// Memory usage monitoring
export function monitorMemoryUsage() {
  if (typeof window !== 'undefined' && 'memory' in performance) {
    const memory = (performance as any).memory
    return {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      limit: memory.jsHeapSizeLimit,
      usage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
    }
  }
  return null
}

// Performance metrics collector
export class PerformanceMetrics {
  private metrics: Map<string, number[]> = new Map()

  startTiming(label: string): () => void {
    const start = performance.now()
    
    return () => {
      const duration = performance.now() - start
      this.recordMetric(label, duration)
    }
  }

  recordMetric(label: string, value: number): void {
    if (!this.metrics.has(label)) {
      this.metrics.set(label, [])
    }
    this.metrics.get(label)!.push(value)
  }

  getMetrics(): Record<string, { avg: number; min: number; max: number; count: number }> {
    const result: Record<string, { avg: number; min: number; max: number; count: number }> = {}
    
    for (const [label, values] of this.metrics.entries()) {
      const avg = values.reduce((a, b) => a + b, 0) / values.length
      const min = Math.min(...values)
      const max = Math.max(...values)
      
      result[label] = { avg, min, max, count: values.length }
    }
    
    return result
  }

  clearMetrics(): void {
    this.metrics.clear()
  }
}

// Singleton instance
export const performanceMetrics = new PerformanceMetrics()

// React performance hooks
export function usePerformanceTiming(label: string) {
  const [timing, setTiming] = React.useState<number | null>(null)
  
  const startTiming = React.useCallback(() => {
    const start = performance.now()
    return () => {
      const duration = performance.now() - start
      setTiming(duration)
      performanceMetrics.recordMetric(label, duration)
    }
  }, [label])
  
  return { timing, startTiming }
}

// Database query optimization helpers
export function optimizeQuery(query: any, options: {
  limit?: number
  skip?: number
  sort?: Record<string, 1 | -1>
  select?: string
  populate?: string[]
}): any {
  let optimizedQuery = query

  if (options.limit) {
    optimizedQuery = optimizedQuery.limit(options.limit)
  }

  if (options.skip) {
    optimizedQuery = optimizedQuery.skip(options.skip)
  }

  if (options.sort) {
    optimizedQuery = optimizedQuery.sort(options.sort)
  }

  if (options.select) {
    optimizedQuery = optimizedQuery.select(options.select)
  }

  if (options.populate) {
    options.populate.forEach(field => {
      optimizedQuery = optimizedQuery.populate(field)
    })
  }

  return optimizedQuery
}

// Cache management
export class CacheManager {
  private cache = new Map<string, { data: any; expiry: number }>()
  private defaultTTL = 5 * 60 * 1000 // 5 minutes

  set(key: string, data: any, ttl: number = this.defaultTTL): void {
    const expiry = Date.now() + ttl
    this.cache.set(key, { data, expiry })
  }

  get(key: string): any | null {
    const item = this.cache.get(key)
    
    if (!item) {
      return null
    }

    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }
}

// Singleton cache instance
export const cacheManager = new CacheManager()
