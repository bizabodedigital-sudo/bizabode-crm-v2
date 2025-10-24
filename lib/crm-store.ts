"use client"

import { create } from "zustand"
import type { Lead, Opportunity } from "./types"
import { api } from "./api-client-config"

interface CRMStore {
  leads: Lead[]
  opportunities: Opportunity[]
  isLoading: boolean
  fetchLeads: () => Promise<void>
  fetchOpportunities: () => Promise<void>
  addLead: (lead: Omit<Lead, "id" | "createdAt" | "updatedAt">) => Promise<void>
  updateLead: (id: string, updates: Partial<Lead>) => Promise<void>
  deleteLead: (id: string) => Promise<void>
  convertLeadToOpportunity: (leadId: string, opportunityData: Partial<Opportunity>) => Promise<string>
  addOpportunity: (opportunity: Omit<Opportunity, "id" | "createdAt" | "updatedAt">) => Promise<void>
  updateOpportunity: (id: string, updates: Partial<Opportunity>) => Promise<void>
  deleteOpportunity: (id: string) => Promise<void>
  getLead: (id: string) => Lead | undefined
  getOpportunity: (id: string) => Opportunity | undefined
}

export const useCRMStore = create<CRMStore>((set, get) => ({
  leads: [],
  opportunities: [],
  isLoading: false,

  fetchLeads: async () => {
    try {
      set({ isLoading: true })
      const response = await api.crm.leads.list({ limit: 1000 })
      if (response.success) {
        set({ leads: response.data?.leads || [], isLoading: false })
      } else {
        console.error("Failed to fetch leads:", response.error)
        set({ isLoading: false })
      }
    } catch (error) {
      console.error("Failed to fetch leads:", error)
      set({ isLoading: false })
    }
  },

  fetchOpportunities: async () => {
    try {
      set({ isLoading: true })
      const response = await api.crm.opportunities.list({ limit: 1000 })
      if (response.success) {
        set({ opportunities: response.data?.opportunities || [], isLoading: false })
      } else {
        console.error("Failed to fetch opportunities:", response.error)
        set({ isLoading: false })
      }
    } catch (error) {
      console.error("Failed to fetch opportunities:", error)
      set({ isLoading: false })
    }
  },

  addLead: async (lead) => {
    try {
      const response = await api.crm.leads.create(lead)
      if (response.success) {
        set((state) => ({ leads: [...state.leads, response.data] }))
      } else {
        console.error("Failed to create lead:", response.error)
        throw new Error(response.error)
      }
    } catch (error) {
      console.error("Failed to add lead:", error)
      throw error
    }
  },

  updateLead: async (id, updates) => {
    try {
      const response = await api.crm.leads.update(id, updates)
      if (response.success) {
        set((state) => ({
          leads: state.leads.map((lead) => (lead.id === id || (lead as any)._id === id ? response.data : lead)),
        }))
      } else {
        console.error("Failed to update lead:", response.error)
        throw new Error(response.error)
      }
    } catch (error) {
      console.error("Failed to update lead:", error)
      throw error
    }
  },

  deleteLead: async (id) => {
    try {
      const response = await api.crm.leads.delete(id)
      if (response.success) {
        set((state) => ({ leads: state.leads.filter((lead) => lead.id !== id && (lead as any)._id !== id) }))
      } else {
        console.error("Failed to delete lead:", response.error)
        throw new Error(response.error)
      }
    } catch (error) {
      console.error("Failed to delete lead:", error)
      throw error
    }
  },

  convertLeadToOpportunity: async (leadId, opportunityData) => {
    try {
      // This is a custom operation that might need to be handled differently
      // For now, we'll create the opportunity and update the lead status
      const response = await api.crm.opportunities.create(opportunityData)
      if (response.success) {
        const opportunity = response.data
        // Update the lead status to 'converted'
        const leadResponse = await api.crm.leads.update(leadId, { status: 'converted' })
        
        if (leadResponse.success) {
          set((state) => ({
            opportunities: [...state.opportunities, opportunity],
            leads: state.leads.map((l) => (l.id === leadId || (l as any)._id === leadId ? leadResponse.data : l)),
          }))
          return opportunity._id || opportunity.id
        } else {
          throw new Error(leadResponse.error)
        }
      } else {
        throw new Error(response.error)
      }
    } catch (error) {
      console.error("Failed to convert lead:", error)
      throw error
    }
  },

  addOpportunity: async (opportunity) => {
    try {
      const response = await api.crm.opportunities.create(opportunity)
      if (response.success) {
        set((state) => ({ opportunities: [...state.opportunities, response.data] }))
      } else {
        console.error("Failed to create opportunity:", response.error)
        throw new Error(response.error)
      }
    } catch (error) {
      console.error("Failed to add opportunity:", error)
      throw error
    }
  },

  updateOpportunity: async (id, updates) => {
    try {
      const response = await api.crm.opportunities.update(id, updates)
      if (response.success) {
        set((state) => ({
          opportunities: state.opportunities.map((opp) =>
            opp.id === id || (opp as any)._id === id ? response.data : opp
          ),
        }))
      } else {
        console.error("Failed to update opportunity:", response.error)
        throw new Error(response.error)
      }
    } catch (error) {
      console.error("Failed to update opportunity:", error)
      throw error
    }
  },

  deleteOpportunity: async (id) => {
    try {
      const response = await api.crm.opportunities.delete(id)
      if (response.success) {
        set((state) => ({ opportunities: state.opportunities.filter((opp) => opp.id !== id && (opp as any)._id !== id) }))
      } else {
        console.error("Failed to delete opportunity:", response.error)
        throw new Error(response.error)
      }
    } catch (error) {
      console.error("Failed to delete opportunity:", error)
      throw error
    }
  },

  getLead: (id) => {
    return get().leads.find((lead) => lead.id === id || (lead as any)._id === id)
  },

  getOpportunity: (id) => {
    return get().opportunities.find((opp) => opp.id === id || (opp as any)._id === id)
  },
}))
