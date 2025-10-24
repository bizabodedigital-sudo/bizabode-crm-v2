import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface InventoryItem {
  id: string
  sku: string
  name: string
  quantity: number
  reorderLevel: number
  unitPrice: number
  costPrice: number
  category: string
  supplier: string
  location: string
  status: 'active' | 'inactive' | 'discontinued'
  lastUpdated: Date
}

interface InventoryState {
  items: InventoryItem[]
  loading: boolean
  error: string | null
  filters: {
    category: string
    status: string
    search: string
  }
  pagination: {
    page: number
    limit: number
    total: number
  }
}

interface InventoryActions {
  setItems: (items: InventoryItem[]) => void
  addItem: (item: Omit<InventoryItem, 'id' | 'lastUpdated'>) => void
  updateItem: (id: string, updates: Partial<InventoryItem>) => void
  deleteItem: (id: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setFilters: (filters: Partial<InventoryState['filters']>) => void
  setPagination: (pagination: Partial<InventoryState['pagination']>) => void
  reset: () => void
}

const initialState: InventoryState = {
  items: [],
  loading: false,
  error: null,
  filters: {
    category: '',
    status: '',
    search: ''
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0
  }
}

export const useInventoryStore = create<InventoryState & InventoryActions>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setItems: (items) => set({ items }),
      
      addItem: (item) => {
        const newItem: InventoryItem = {
          ...item,
          id: crypto.randomUUID(),
          lastUpdated: new Date()
        }
        set((state) => ({ items: [...state.items, newItem] }))
      },
      
      updateItem: (id, updates) => set((state) => ({
        items: state.items.map(item => 
          item.id === id 
            ? { ...item, ...updates, lastUpdated: new Date() }
            : item
        )
      })),
      
      deleteItem: (id) => set((state) => ({
        items: state.items.filter(item => item.id !== id)
      })),
      
      setLoading: (loading) => set({ loading }),
      
      setError: (error) => set({ error }),
      
      setFilters: (filters) => set((state) => ({
        filters: { ...state.filters, ...filters }
      })),
      
      setPagination: (pagination) => set((state) => ({
        pagination: { ...state.pagination, ...pagination }
      })),
      
      reset: () => set(initialState)
    }),
    {
      name: 'inventory-store',
      partialize: (state) => ({
        items: state.items,
        filters: state.filters,
        pagination: state.pagination
      })
    }
  )
)
