"use client"

import { create } from "zustand"
import type { Lead, Opportunity } from "./types"
import { apiClient } from "./api-client"

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
      const response = await apiClient.getLeads({ limit: 1000 })
      set({ leads: response.leads || [], isLoading: false })
    } catch (error) {
      console.error("Failed to fetch leads:", error)
      set({ isLoading: false })
      // Don't throw the error to prevent unhandled promise rejections
      // The API client will handle authentication errors
    }
  },

  fetchOpportunities: async () => {
    try {
      set({ isLoading: true })
      const response = await apiClient.getOpportunities({ limit: 1000 })
      set({ opportunities: response.opportunities || [], isLoading: false })
    } catch (error) {
      console.error("Failed to fetch opportunities:", error)
      set({ isLoading: false })
      // Don't throw the error to prevent unhandled promise rejections
      // The API client will handle authentication errors
    }
  },

  addLead: async (lead) => {
    try {
      const newLead = await apiClient.createLead(lead)
      set((state) => ({ leads: [...state.leads, newLead] }))
    } catch (error) {
      console.error("Failed to add lead:", error)
      throw error
    }
  },

  updateLead: async (id, updates) => {
    try {
      const updatedLead = await apiClient.updateLead(id, updates)
      set((state) => ({
        leads: state.leads.map((lead) => (lead.id === id || (lead as any)._id === id ? updatedLead : lead)),
      }))
    } catch (error) {
      console.error("Failed to update lead:", error)
      throw error
    }
  },

  deleteLead: async (id) => {
    try {
      await apiClient.deleteLead(id)
      set((state) => ({ leads: state.leads.filter((lead) => lead.id !== id && (lead as any)._id !== id) }))
    } catch (error) {
      console.error("Failed to delete lead:", error)
      throw error
    }
  },

  convertLeadToOpportunity: async (leadId, opportunityData) => {
    try {
      const response = await apiClient.convertLeadToOpportunity(leadId, opportunityData)
      const { opportunity, lead } = response

      set((state) => ({
        opportunities: [...state.opportunities, opportunity],
        leads: state.leads.map((l) => (l.id === leadId || (l as any)._id === leadId ? lead : l)),
      }))

      return opportunity._id || opportunity.id
    } catch (error) {
      console.error("Failed to convert lead:", error)
      throw error
    }
  },

  addOpportunity: async (opportunity) => {
    try {
      const newOpportunity = await apiClient.createOpportunity(opportunity)
      set((state) => ({ opportunities: [...state.opportunities, newOpportunity] }))
    } catch (error) {
      console.error("Failed to add opportunity:", error)
      throw error
    }
  },

  updateOpportunity: async (id, updates) => {
    try {
      const updatedOpportunity = await apiClient.updateOpportunity(id, updates)
      set((state) => ({
        opportunities: state.opportunities.map((opp) =>
          opp.id === id || (opp as any)._id === id ? updatedOpportunity : opp
        ),
      }))
    } catch (error) {
      console.error("Failed to update opportunity:", error)
      throw error
    }
  },

  deleteOpportunity: async (id) => {
    try {
      await apiClient.deleteOpportunity(id)
      set((state) => ({ opportunities: state.opportunities.filter((opp) => opp.id !== id && (opp as any)._id !== id) }))
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
