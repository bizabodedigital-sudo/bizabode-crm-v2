import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Customer {
  id: string
  companyName: string
  contactPerson: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  postalCode: string
  country: string
  category: string
  customerType: 'Commercial' | 'Retail' | 'Individual'
  paymentTerms: string
  creditLimit: number
  status: 'Active' | 'Inactive' | 'Suspended'
  rating: number
  tags: string[]
  notes: string
  createdAt: Date
  lastContact: Date
}

interface Lead {
  id: string
  name: string
  email: string
  phone: string
  company: string
  source: string
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost'
  category: string
  productInterest: string[]
  monthlyVolume: number
  territory: string
  leadScore: number
  customerType: string
  notes: string
  createdAt: Date
  lastActivity: Date
}

interface Opportunity {
  id: string
  title: string
  customerId: string
  customerName: string
  value: number
  probability: number
  stage: 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost'
  expectedCloseDate: Date
  description: string
  assignedTo: string
  createdAt: Date
  updatedAt: Date
}

interface CRMState {
  customers: Customer[]
  leads: Lead[]
  opportunities: Opportunity[]
  loading: boolean
  error: string | null
  filters: {
    customerType: string
    status: string
    search: string
  }
  pagination: {
    page: number
    limit: number
    total: number
  }
}

interface CRMActions {
  setCustomers: (customers: Customer[]) => void
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'lastContact'>) => void
  updateCustomer: (id: string, updates: Partial<Customer>) => void
  deleteCustomer: (id: string) => void
  
  setLeads: (leads: Lead[]) => void
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'lastActivity'>) => void
  updateLead: (id: string, updates: Partial<Lead>) => void
  deleteLead: (id: string) => void
  
  setOpportunities: (opportunities: Opportunity[]) => void
  addOpportunity: (opportunity: Omit<Opportunity, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateOpportunity: (id: string, updates: Partial<Opportunity>) => void
  deleteOpportunity: (id: string) => void
  
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setFilters: (filters: Partial<CRMState['filters']>) => void
  setPagination: (pagination: Partial<CRMState['pagination']>) => void
  reset: () => void
}

const initialState: CRMState = {
  customers: [],
  leads: [],
  opportunities: [],
  loading: false,
  error: null,
  filters: {
    customerType: '',
    status: '',
    search: ''
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0
  }
}

export const useCRMStore = create<CRMState & CRMActions>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setCustomers: (customers) => set({ customers }),
      
      addCustomer: (customer) => {
        const newCustomer: Customer = {
          ...customer,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          lastContact: new Date()
        }
        set((state) => ({ customers: [...state.customers, newCustomer] }))
      },
      
      updateCustomer: (id, updates) => set((state) => ({
        customers: state.customers.map(customer => 
          customer.id === id ? { ...customer, ...updates } : customer
        )
      })),
      
      deleteCustomer: (id) => set((state) => ({
        customers: state.customers.filter(customer => customer.id !== id)
      })),
      
      setLeads: (leads) => set({ leads }),
      
      addLead: (lead) => {
        const newLead: Lead = {
          ...lead,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          lastActivity: new Date()
        }
        set((state) => ({ leads: [...state.leads, newLead] }))
      },
      
      updateLead: (id, updates) => set((state) => ({
        leads: state.leads.map(lead => 
          lead.id === id ? { ...lead, ...updates } : lead
        )
      })),
      
      deleteLead: (id) => set((state) => ({
        leads: state.leads.filter(lead => lead.id !== id)
      })),
      
      setOpportunities: (opportunities) => set({ opportunities }),
      
      addOpportunity: (opportunity) => {
        const newOpportunity: Opportunity = {
          ...opportunity,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date()
        }
        set((state) => ({ opportunities: [...state.opportunities, newOpportunity] }))
      },
      
      updateOpportunity: (id, updates) => set((state) => ({
        opportunities: state.opportunities.map(opportunity => 
          opportunity.id === id 
            ? { ...opportunity, ...updates, updatedAt: new Date() }
            : opportunity
        )
      })),
      
      deleteOpportunity: (id) => set((state) => ({
        opportunities: state.opportunities.filter(opportunity => opportunity.id !== id)
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
      name: 'crm-store',
      partialize: (state) => ({
        customers: state.customers,
        leads: state.leads,
        opportunities: state.opportunities,
        filters: state.filters,
        pagination: state.pagination
      })
    }
  )
)
