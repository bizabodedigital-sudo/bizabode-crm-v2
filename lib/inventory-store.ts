"use client"

import { create } from "zustand"
import type { Item } from "./types"
import { apiClient } from "./api-client"

interface InventoryStore {
  items: Item[]
  isLoading: boolean
  fetchItems: () => Promise<void>
  addItem: (item: Omit<Item, "id" | "createdAt" | "updatedAt">) => Promise<void>
  updateItem: (id: string, updates: Partial<Item>) => Promise<void>
  deleteItem: (id: string) => Promise<void>
  adjustStock: (id: string, adjustment: number, reason: string) => Promise<void>
  getItem: (id: string) => Item | undefined
}

export const useInventoryStore = create<InventoryStore>((set, get) => ({
  items: [],
  isLoading: false,

  fetchItems: async () => {
    try {
      set({ isLoading: true })
      const response = await apiClient.getItems({ limit: 1000 })
      set({ items: response.items || [], isLoading: false })
    } catch (error) {
      console.error("Failed to fetch items:", error)
      set({ isLoading: false })
      // Don't throw the error to prevent unhandled promise rejections
      // The API client will handle authentication errors
    }
  },

  addItem: async (item) => {
    try {
      const newItem = await apiClient.createItem(item)
      set((state) => ({ items: [...state.items, newItem] }))
    } catch (error) {
      console.error("Failed to add item:", error)
      throw error
    }
  },

  updateItem: async (id, updates) => {
    try {
      const updatedItem = await apiClient.updateItem(id, updates)
      set((state) => ({
        items: state.items.map((item) => (item.id === id || (item as any)._id === id ? updatedItem : item)),
      }))
    } catch (error) {
      console.error("Failed to update item:", error)
      throw error
    }
  },

  deleteItem: async (id) => {
    try {
      await apiClient.deleteItem(id)
      set((state) => ({ items: state.items.filter((item) => item.id !== id && (item as any)._id !== id) }))
    } catch (error) {
      console.error("Failed to delete item:", error)
      throw error
    }
  },

  adjustStock: async (id, adjustment, reason) => {
    try {
      const response = await apiClient.adjustStock(id, adjustment, reason)
      set((state) => ({
        items: state.items.map((item) => (item.id === id || (item as any)._id === id ? response.item : item)),
      }))
    } catch (error) {
      console.error("Failed to adjust stock:", error)
      throw error
    }
  },

  getItem: (id) => {
    return get().items.find((item) => item.id === id || (item as any)._id === id)
  },
}))
