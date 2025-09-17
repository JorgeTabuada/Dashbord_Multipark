"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import type { UserRole } from "@/lib/permissions"

type User = {
  id: string
  email?: string
  name: string
  role: UserRole
  selectedPark: string
}

type AuthContextType = {
  user: User | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signInDemo: () => void
  signOut: () => Promise<void>
  updateSelectedPark: (park: string) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        // First check if we have a demo user
        const isDemoUser = localStorage.getItem("isDemoUser") === "true"

        if (isDemoUser) {
          setUser({
            id: "demo-user",
            name: localStorage.getItem("nome") || "DEMO USER",
            role: (localStorage.getItem("role") as UserRole) || "admin",
            selectedPark: localStorage.getItem("parqueSelecionado") || "lisboa",
          })
          setLoading(false)
          return
        }

        // Then try to get the Supabase session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        // Se houver erro de token, limpa tudo
        if (sessionError?.message?.includes('Invalid Refresh Token')) {
          await supabase.auth.signOut()
          localStorage.clear()
          setUser(null)
          return
        }

        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email,
            name: localStorage.getItem("nome") || session.user.email?.split("@")[0] || "Utilizador",
            role: (localStorage.getItem("role") as UserRole) || "admin",
            selectedPark: localStorage.getItem("parqueSelecionado") || "lisboa",
          })
        } else {
          setUser(null)
        }
      } catch (err) {
        console.error("Auth check error:", err)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkSession()
  }, [])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw new Error(error.message)
      }

      if (data.user) {
        // Set user data
        const userName = data.user.email?.split("@")[0] || "Utilizador"

        setUser({
          id: data.user.id,
          email: data.user.email,
          name: userName,
          role: "admin", // Default role for now
          selectedPark: "lisboa",
        })

        // Store in localStorage
        localStorage.setItem("nome", userName)
        localStorage.setItem("role", "admin")
        localStorage.setItem("parqueSelecionado", "lisboa")
        localStorage.setItem("isDemoUser", "false")

        router.push("/dashboard")
      }
    } catch (err: any) {
      console.error("Login error:", err)
      setError(err.message || "Erro ao fazer login")
    } finally {
      setLoading(false)
    }
  }

  const signInDemo = () => {
    // Demo login without Supabase auth
    const demoUser = {
      id: "demo-user",
      name: "DEMO USER",
      role: "admin" as UserRole,
      selectedPark: "lisboa",
    }

    setUser(demoUser)

    // Store in localStorage
    localStorage.setItem("nome", demoUser.name)
    localStorage.setItem("role", demoUser.role)
    localStorage.setItem("parqueSelecionado", demoUser.selectedPark)
    localStorage.setItem("isDemoUser", "true")

    router.push("/dashboard")
  }

  const signOut = async () => {
    setLoading(true)

    try {
      const isDemoUser = localStorage.getItem("isDemoUser") === "true"

      if (!isDemoUser) {
        await supabase.auth.signOut()
      }

      // Clear all storage
      localStorage.clear()
      setUser(null)
      router.push("/")
    } catch (err) {
      console.error("Logout error:", err)
    } finally {
      setLoading(false)
    }
  }

  const updateSelectedPark = (park: string) => {
    if (user) {
      setUser({
        ...user,
        selectedPark: park,
      })
      localStorage.setItem("parqueSelecionado", park)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        signIn,
        signInDemo,
        signOut,
        updateSelectedPark,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
