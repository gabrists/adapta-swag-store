import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'

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
  login: (email: string, password?: string) => Promise<void>
  logout: () => void
  isLoading: boolean
  updateProfile: (data: { name: string; avatar?: string }) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem('adapta-swag-auth-user')
        if (storedUser) {
          setUser(JSON.parse(storedUser))
          setIsAuthenticated(true)
        }
      } catch (error) {
        console.error('Failed to parse user from local storage', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Determine user role and name based on email for demo purposes
    const isAdmin = email.toLowerCase().includes('admin')
    const namePart = email.split('@')[0]
    const formattedName =
      namePart.charAt(0).toUpperCase() + namePart.slice(1).replace('.', ' ')

    const newUser: User = {
      id: crypto.randomUUID(),
      name: formattedName || 'Colaborador',
      email,
      avatar: `https://img.usecurling.com/ppl/medium?gender=male&seed=${namePart}`, // Seed ensures consistent avatar
      role: isAdmin ? 'admin' : 'user',
    }

    setUser(newUser)
    setIsAuthenticated(true)
    localStorage.setItem('adapta-swag-auth-user', JSON.stringify(newUser))
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('adapta-swag-auth-user')
  }

  const updateProfile = (data: { name: string; avatar?: string }) => {
    if (!user) return

    const updatedUser = {
      ...user,
      name: data.name,
      avatar: data.avatar || user.avatar,
    }

    setUser(updatedUser)
    localStorage.setItem('adapta-swag-auth-user', JSON.stringify(updatedUser))
  }

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, login, logout, isLoading, updateProfile }}
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
