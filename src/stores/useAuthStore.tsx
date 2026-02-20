import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'
import { Session, User as SupabaseUser, AuthError } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'

export interface User {
  id: string
  name: string
  email: string
  avatar: string
  role: 'admin' | 'user'
}

interface AuthContextType {
  isAuthenticated: boolean
  user: User | null
  session: Session | null
  login: (
    email: string,
    password?: string,
  ) => Promise<{ data?: any; error: AuthError | Error | null }>
  logout: () => Promise<void>
  isLoading: boolean
  updateProfile: (data: { name: string; avatar?: string }) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session?.user) {
        mapSupabaseUserToAppUser(session.user).then((appUser) => {
          setUser(appUser)
          setIsAuthenticated(true)
          setIsLoading(false)
        })
      } else {
        setUser(null)
        setIsAuthenticated(false)
        setIsLoading(false)
      }
    })

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        mapSupabaseUserToAppUser(session.user).then((appUser) => {
          setUser(appUser)
          setIsAuthenticated(true)
          setIsLoading(false)
        })
      } else {
        setIsLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const mapSupabaseUserToAppUser = async (
    sbUser: SupabaseUser,
  ): Promise<User> => {
    try {
      // First try to find by ID to ensure consistency if email changed
      let { data: employee, error } = await supabase
        .from('employees')
        .select('*')
        .eq('id', sbUser.id)
        .single()

      // Fallback to email if not found by ID
      if (!employee) {
        const { data: employeeByEmail } = await supabase
          .from('employees')
          .select('*')
          .eq('email', sbUser.email)
          .single()

        employee = employeeByEmail
      }

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching employee data:', error)
      }

      let role: 'admin' | 'user' = 'user'

      // Check role from database
      if (employee?.role === 'admin') {
        role = 'admin'
      }

      // Fallback: Ensure admin@adapta.org is always admin (useful for first login/recovery)
      if (sbUser.email === 'admin@adapta.org') {
        role = 'admin'
      }

      const name =
        employee?.name ||
        sbUser.user_metadata?.name ||
        sbUser.email?.split('@')[0].replace('.', ' ') ||
        'Usuário'

      const avatar =
        employee?.avatar_url ||
        sbUser.user_metadata?.avatar_url ||
        `https://img.usecurling.com/ppl/medium?gender=male&seed=${sbUser.email}`

      return {
        id: employee?.id || sbUser.id,
        name: name.charAt(0).toUpperCase() + name.slice(1),
        email: employee?.email || sbUser.email || '',
        avatar,
        role,
      }
    } catch (error) {
      console.error('Error mapping user:', error)
      // Fallback safe user
      return {
        id: sbUser.id,
        name: 'Usuário',
        email: sbUser.email || '',
        avatar: '',
        role: 'user',
      }
    }
  }

  const login = async (email: string, password?: string) => {
    try {
      if (!password) {
        return { error: new Error('A senha é obrigatória para autenticação') }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      return { data, error }
    } catch (error: any) {
      return { error }
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setIsAuthenticated(false)
  }

  const updateProfile = async (data: { name: string; avatar?: string }) => {
    if (!user) return

    const { error } = await supabase.auth.updateUser({
      data: {
        name: data.name,
        avatar_url: data.avatar,
      },
    })

    if (!error) {
      setUser((prev) =>
        prev
          ? {
              ...prev,
              name: data.name,
              avatar: data.avatar || prev.avatar,
            }
          : null,
      )
    }
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        session,
        login,
        logout,
        isLoading,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export default function useAuthStore() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthStore must be used within an AuthProvider')
  }
  return context
}
