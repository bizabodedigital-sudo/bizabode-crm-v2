"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { User, AuthState } from "./types"
import { apiClient, API_ENDPOINTS } from "./api-client-config"

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  register: (email: string, password: string, name: string, companyName?: string, licenseKey?: string) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    company: null,
    isAuthenticated: false,
    isLoading: true,
  })

  useEffect(() => {
    // Check for stored auth on mount
    const storedToken = localStorage.getItem("bizabode_token")
    const storedUser = localStorage.getItem("bizabode_user")
    const storedCompany = localStorage.getItem("bizabode_company")

    if (storedToken && storedUser && storedCompany) {
      // Set token in API client
      apiClient.setAuthToken(storedToken)
      
      setAuthState({
        user: JSON.parse(storedUser),
        company: JSON.parse(storedCompany),
        isAuthenticated: true,
        isLoading: false,
      })
    } else {
      setAuthState((prev) => ({ ...prev, isLoading: false }))
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, {
        email,
        password,
      })

      if (!response.success) {
        throw new Error(response.error || "Login failed")
      }

      const { token, user, company } = response.data

      // Store token and user data
      localStorage.setItem("bizabode_token", token)
      localStorage.setItem("bizabode_user", JSON.stringify(user))
      localStorage.setItem("bizabode_company", JSON.stringify(company))

      // Set token in API client for future requests
      apiClient.setAuthToken(token)

      setAuthState({
        user,
        company,
        isAuthenticated: true,
        isLoading: false,
      })

      return true
    } catch (error) {
      console.error("Login failed:", error)
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem("bizabode_token")
    localStorage.removeItem("bizabode_user")
    localStorage.removeItem("bizabode_company")

    // Clear token from API client
    apiClient.clearAuthToken()

    setAuthState({
      user: null,
      company: null,
      isAuthenticated: false,
      isLoading: false,
    })
  }

  const register = async (
    email: string,
    password: string,
    name: string,
    companyName?: string,
    licenseKey?: string
  ): Promise<boolean> => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, {
        email,
        password,
        name,
        companyName: companyName || "My Company",
        licenseKey: licenseKey || "DEMO-LICENSE-KEY",
      })

      if (!response.success) {
        throw new Error(response.error || "Registration failed")
      }

      const { token, user, company } = response.data

      // Store token and user data
      localStorage.setItem("bizabode_token", token)
      localStorage.setItem("bizabode_user", JSON.stringify(user))
      localStorage.setItem("bizabode_company", JSON.stringify(company))

      // Set token in API client for future requests
      apiClient.setAuthToken(token)

      setAuthState({
        user,
        company,
        isAuthenticated: true,
        isLoading: false,
      })

      return true
    } catch (error) {
      console.error("Registration failed:", error)
      return false
    }
  }

  return <AuthContext.Provider value={{ ...authState, login, logout, register }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
