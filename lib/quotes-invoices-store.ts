import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Quote {
  id: string
  quoteNumber: string
  customerId: string
  customerName: string
  items: QuoteItem[]
  subtotal: number
  tax: number
  total: number
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'
  validUntil: Date
  notes: string
  createdAt: Date
  updatedAt: Date
}

interface QuoteItem {
  id: string
  productId: string
  productName: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

interface Invoice {
  id: string
  invoiceNumber: string
  customerId: string
  customerName: string
  items: InvoiceItem[]
  subtotal: number
  tax: number
  total: number
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  dueDate: Date
  paidDate?: Date
  paymentMethod?: string
  notes: string
  createdAt: Date
  updatedAt: Date
}

interface InvoiceItem {
  id: string
  productId: string
  productName: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

interface QuotesInvoicesState {
  quotes: Quote[]
  invoices: Invoice[]
  loading: boolean
  error: string | null
  filters: {
    status: string
    customer: string
    dateRange: {
      start: Date | null
      end: Date | null
    }
    search: string
  }
  pagination: {
    page: number
    limit: number
    total: number
  }
}

interface QuotesInvoicesActions {
  setQuotes: (quotes: Quote[]) => void
  addQuote: (quote: Omit<Quote, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateQuote: (id: string, updates: Partial<Quote>) => void
  deleteQuote: (id: string) => void
  
  setInvoices: (invoices: Invoice[]) => void
  addInvoice: (invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateInvoice: (id: string, updates: Partial<Invoice>) => void
  deleteInvoice: (id: string) => void
  
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setFilters: (filters: Partial<QuotesInvoicesState['filters']>) => void
  setPagination: (pagination: Partial<QuotesInvoicesState['pagination']>) => void
  reset: () => void
}

const initialState: QuotesInvoicesState = {
  quotes: [],
  invoices: [],
  loading: false,
  error: null,
  filters: {
    status: '',
    customer: '',
    dateRange: {
      start: null,
      end: null
    },
    search: ''
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0
  }
}

export const useQuotesInvoicesStore = create<QuotesInvoicesState & QuotesInvoicesActions>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setQuotes: (quotes) => set({ quotes }),
      
      addQuote: (quote) => {
        const newQuote: Quote = {
          ...quote,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date()
        }
        set((state) => ({ quotes: [...state.quotes, newQuote] }))
      },
      
      updateQuote: (id, updates) => set((state) => ({
        quotes: state.quotes.map(quote => 
          quote.id === id 
            ? { ...quote, ...updates, updatedAt: new Date() }
            : quote
        )
      })),
      
      deleteQuote: (id) => set((state) => ({
        quotes: state.quotes.filter(quote => quote.id !== id)
      })),
      
      setInvoices: (invoices) => set({ invoices }),
      
      addInvoice: (invoice) => {
        const newInvoice: Invoice = {
          ...invoice,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date()
        }
        set((state) => ({ invoices: [...state.invoices, newInvoice] }))
      },
      
      updateInvoice: (id, updates) => set((state) => ({
        invoices: state.invoices.map(invoice => 
          invoice.id === id 
            ? { ...invoice, ...updates, updatedAt: new Date() }
            : invoice
        )
      })),
      
      deleteInvoice: (id) => set((state) => ({
        invoices: state.invoices.filter(invoice => invoice.id !== id)
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
      name: 'quotes-invoices-store',
      partialize: (state) => ({
        quotes: state.quotes,
        invoices: state.invoices,
        filters: state.filters,
        pagination: state.pagination
      })
    }
  )
)
