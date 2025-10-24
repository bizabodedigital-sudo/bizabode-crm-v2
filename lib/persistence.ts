interface PersistenceConfig {
  storage: 'localStorage' | 'sessionStorage' | 'memory'
  keyPrefix: string
  encryption: boolean
}

interface StoredData {
  [key: string]: any
}

class DataPersistence {
  private config: PersistenceConfig
  private memoryStore: Map<string, any> = new Map()

  constructor(config: PersistenceConfig) {
    this.config = config
  }

  private getStorage(): Storage | Map<string, any> {
    switch (this.config.storage) {
      case 'localStorage':
        return typeof window !== 'undefined' ? localStorage : this.memoryStore
      case 'sessionStorage':
        return typeof window !== 'undefined' ? sessionStorage : this.memoryStore
      case 'memory':
      default:
        return this.memoryStore
    }
  }

  private getKey(key: string): string {
    return `${this.config.keyPrefix}${key}`
  }

  private encrypt(data: any): string {
    if (!this.config.encryption) {
      return JSON.stringify(data)
    }
    
    // Simple base64 encoding for demo purposes
    // In production, use proper encryption
    return btoa(JSON.stringify(data))
  }

  private decrypt(encryptedData: string): any {
    if (!this.config.encryption) {
      return JSON.parse(encryptedData)
    }
    
    try {
      // Simple base64 decoding for demo purposes
      // In production, use proper decryption
      return JSON.parse(atob(encryptedData))
    } catch (error) {
      console.error('Failed to decrypt data:', error)
      return null
    }
  }

  // Core persistence methods
  set(key: string, value: any): boolean {
    try {
      const storage = this.getStorage()
      const fullKey = this.getKey(key)
      const encryptedValue = this.encrypt(value)
      
      if (storage instanceof Map) {
        storage.set(fullKey, encryptedValue)
      } else {
        storage.setItem(fullKey, encryptedValue)
      }
      
      return true
    } catch (error) {
      console.error('Failed to persist data:', error)
      return false
    }
  }

  get<T = any>(key: string, defaultValue?: T): T | null {
    try {
      const storage = this.getStorage()
      const fullKey = this.getKey(key)
      
      let storedValue: string | null = null
      
      if (storage instanceof Map) {
        storedValue = storage.get(fullKey) || null
      } else {
        storedValue = storage.getItem(fullKey)
      }
      
      if (storedValue === null) {
        return defaultValue || null
      }
      
      return this.decrypt(storedValue)
    } catch (error) {
      console.error('Failed to retrieve data:', error)
      return defaultValue || null
    }
  }

  remove(key: string): boolean {
    try {
      const storage = this.getStorage()
      const fullKey = this.getKey(key)
      
      if (storage instanceof Map) {
        storage.delete(fullKey)
      } else {
        storage.removeItem(fullKey)
      }
      
      return true
    } catch (error) {
      console.error('Failed to remove data:', error)
      return false
    }
  }

  clear(): boolean {
    try {
      const storage = this.getStorage()
      
      if (storage instanceof Map) {
        // Clear only keys with our prefix
        for (const key of storage.keys()) {
          if (key.startsWith(this.config.keyPrefix)) {
            storage.delete(key)
          }
        }
      } else {
        // Clear only keys with our prefix
        const keysToRemove: string[] = []
        for (let i = 0; i < storage.length; i++) {
          const key = storage.key(i)
          if (key && key.startsWith(this.config.keyPrefix)) {
            keysToRemove.push(key)
          }
        }
        keysToRemove.forEach(key => storage.removeItem(key))
      }
      
      return true
    } catch (error) {
      console.error('Failed to clear data:', error)
      return false
    }
  }

  // Utility methods
  has(key: string): boolean {
    const storage = this.getStorage()
    const fullKey = this.getKey(key)
    
    if (storage instanceof Map) {
      return storage.has(fullKey)
    } else {
      return storage.getItem(fullKey) !== null
    }
  }

  keys(): string[] {
    const storage = this.getStorage()
    const prefix = this.config.keyPrefix
    
    if (storage instanceof Map) {
      return Array.from(storage.keys())
        .filter(key => key.startsWith(prefix))
        .map(key => key.substring(prefix.length))
    } else {
      const keys: string[] = []
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i)
        if (key && key.startsWith(prefix)) {
          keys.push(key.substring(prefix.length))
        }
      }
      return keys
    }
  }

  size(): number {
    return this.keys().length
  }

  // Batch operations
  setMultiple(data: StoredData): boolean {
    try {
      for (const [key, value] of Object.entries(data)) {
        this.set(key, value)
      }
      return true
    } catch (error) {
      console.error('Failed to set multiple values:', error)
      return false
    }
  }

  getMultiple<T = any>(keys: string[]): Record<string, T | null> {
    const result: Record<string, T | null> = {}
    
    for (const key of keys) {
      result[key] = this.get<T>(key)
    }
    
    return result
  }

  removeMultiple(keys: string[]): boolean {
    try {
      for (const key of keys) {
        this.remove(key)
      }
      return true
    } catch (error) {
      console.error('Failed to remove multiple values:', error)
      return false
    }
  }
}

// Create default instance
const dataPersistence = new DataPersistence({
  storage: 'localStorage',
  keyPrefix: 'bizabode_crm_',
  encryption: false // Set to true for production
})

export default dataPersistence
export { DataPersistence }
export type { PersistenceConfig, StoredData }
