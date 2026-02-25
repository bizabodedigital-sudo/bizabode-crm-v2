"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { User, AuthState } from "./types"
import { demoUsers, demoCompany } from "./mock-data"

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
    const storedUser = localStorage.getItem("bizabode_user")
    const storedCompany = localStorage.getItem("bizabode_company")

    if (storedUser && storedCompany) {
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
      const { apiClient } = await import("./api-client")
      const response = await apiClient.login(email, password)

      const { token, user, company } = response

      // Store token and user data
      localStorage.setItem("bizabode_token", token)
      localStorage.setItem("bizabode_user", JSON.stringify(user))
      localStorage.setItem("bizabode_company", JSON.stringify(company))

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
      const { apiClient } = await import("./api-client")
      const response = await apiClient.register({
        email,
        password,
        name,
        companyName: companyName || "My Company",
        licenseKey: licenseKey || "",
      })

      const { token, user, company } = response

      // Store token and user data
      localStorage.setItem("bizabode_token", token)
      localStorage.setItem("bizabode_user", JSON.stringify(user))
      localStorage.setItem("bizabode_company", JSON.stringify(company))

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
