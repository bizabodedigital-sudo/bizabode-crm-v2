"use client"

import { create } from "zustand"
import type { Quote, Invoice, Payment } from "./types"
import { apiClient } from "./api-client"

interface QuotesInvoicesStore {
  quotes: Quote[]
  invoices: Invoice[]
  payments: Payment[]
  isLoading: boolean
  fetchQuotes: () => Promise<void>
  fetchInvoices: () => Promise<void>
  fetchPayments: () => Promise<void>
  addQuote: (quote: Omit<Quote, "id" | "createdAt" | "updatedAt">) => Promise<string>
  updateQuote: (id: string, updates: Partial<Quote>) => Promise<void>
  deleteQuote: (id: string) => Promise<void>
  convertQuoteToInvoice: (quoteId: string) => Promise<string>
  addInvoice: (invoice: Omit<Invoice, "id" | "createdAt" | "updatedAt">) => Promise<string>
  updateInvoice: (id: string, updates: Partial<Invoice>) => Promise<void>
  deleteInvoice: (id: string) => Promise<void>
  addPayment: (payment: Omit<Payment, "id" | "createdAt">) => Promise<void>
  getQuote: (id: string) => Quote | undefined
  getInvoice: (id: string) => Invoice | undefined
}

export const useQuotesInvoicesStore = create<QuotesInvoicesStore>((set, get) => ({
  quotes: [],
  invoices: [],
  payments: [],
  isLoading: false,

  fetchQuotes: async () => {
    try {
      set({ isLoading: true })
      const response = await apiClient.getQuotes({ limit: 1000 })
      set({ quotes: response.quotes || [], isLoading: false })
    } catch (error) {
      console.error("Failed to fetch quotes:", error)
      set({ isLoading: false })
    }
  },

  fetchInvoices: async () => {
    try {
      set({ isLoading: true })
      const response = await apiClient.getInvoices({ limit: 1000 })
      set({ invoices: response.invoices || [], isLoading: false })
    } catch (error) {
      console.error("Failed to fetch invoices:", error)
      set({ isLoading: false })
    }
  },

  fetchPayments: async () => {
    try {
      set({ isLoading: true })
      const response = await apiClient.getPayments({ limit: 1000 })
      set({ payments: response.payments || [], isLoading: false })
    } catch (error) {
      console.error("Failed to fetch payments:", error)
      set({ isLoading: false })
    }
  },

  addQuote: async (quote) => {
    try {
      const newQuote = await apiClient.createQuote(quote)
      set((state) => ({ quotes: [...state.quotes, newQuote] }))
      return newQuote._id || newQuote.id
    } catch (error) {
      console.error("Failed to add quote:", error)
      throw error
    }
  },

  updateQuote: async (id, updates) => {
    try {
      const updatedQuote = await apiClient.updateQuote(id, updates)
      set((state) => ({
        quotes: state.quotes.map((quote) => (quote.id === id || (quote as any)._id === id ? updatedQuote : quote)),
      }))
    } catch (error) {
      console.error("Failed to update quote:", error)
      throw error
    }
  },

  deleteQuote: async (id) => {
    try {
      await apiClient.deleteQuote(id)
      set((state) => ({ quotes: state.quotes.filter((quote) => quote.id !== id && (quote as any)._id !== id) }))
    } catch (error) {
      console.error("Failed to delete quote:", error)
      throw error
    }
  },

  convertQuoteToInvoice: async (quoteId) => {
    try {
      const quote = get().getQuote(quoteId)
      if (!quote) return ""

      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + 30)

      const invoiceData = {
        quoteId: (quote as any)._id || quote.id,
        customerName: quote.customerName,
        customerEmail: quote.customerEmail,
        items: quote.items,
        subtotal: quote.subtotal,
        tax: quote.tax,
        taxRate: 15,
        discount: 0,
        total: quote.total,
        dueDate,
        status: "draft" as const,
        notes: quote.notes,
      }

      const newInvoice = await apiClient.createInvoice(invoiceData)

      // Update quote status to accepted
      await get().updateQuote((quote as any)._id || quote.id, { status: "accepted" })

      set((state) => ({ invoices: [...state.invoices, newInvoice] }))

      return newInvoice._id || newInvoice.id
    } catch (error) {
      console.error("Failed to convert quote to invoice:", error)
      throw error
    }
  },

  addInvoice: async (invoice) => {
    try {
      const newInvoice = await apiClient.createInvoice(invoice)
      set((state) => ({ invoices: [...state.invoices, newInvoice] }))
      return newInvoice._id || newInvoice.id
    } catch (error) {
      console.error("Failed to add invoice:", error)
      throw error
    }
  },

  updateInvoice: async (id, updates) => {
    try {
      const updatedInvoice = await apiClient.updateInvoice(id, updates)
      set((state) => ({
        invoices: state.invoices.map((invoice) =>
          invoice.id === id || (invoice as any)._id === id ? updatedInvoice : invoice
        ),
      }))
    } catch (error) {
      console.error("Failed to update invoice:", error)
      throw error
    }
  },

  deleteInvoice: async (id) => {
    try {
      await apiClient.deleteInvoice(id)
      set((state) => ({ invoices: state.invoices.filter((invoice) => invoice.id !== id && (invoice as any)._id !== id) }))
    } catch (error) {
      console.error("Failed to delete invoice:", error)
      throw error
    }
  },

  addPayment: async (payment) => {
    try {
      // Use the mark-paid endpoint which handles both payment and invoice update
      await apiClient.markInvoicePaid(payment.invoiceId, {
        amount: payment.amount,
        method: payment.method,
        reference: payment.reference,
        notes: payment.notes,
      })

      // Refresh invoices and payments
      await get().fetchInvoices()
      await get().fetchPayments()
    } catch (error) {
      console.error("Failed to add payment:", error)
      throw error
    }
  },

  getQuote: (id) => {
    return get().quotes.find((quote) => quote.id === id || (quote as any)._id === id)
  },

  getInvoice: (id) => {
    return get().invoices.find((invoice) => invoice.id === id || (invoice as any)._id === id)
  },
}))
