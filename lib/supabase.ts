import { createClient } from "@supabase/supabase-js"

// Obter variáveis de ambiente e falhar cedo se estiverem em falta
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()

if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL não configurada')
}

if (!supabaseAnonKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY não configurada')
}

// Create a single instance of the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Auth helper functions
export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  } catch (err) {
    return { data: null, error: err }
  }
}

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    return { error }
  } catch (err) {
    return { error: err }
  }
}

export const getCurrentUser = async () => {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()
    if (error) throw error
    return user
  } catch (err) {
    return null
  }
}
