import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  ReactNode,
} from 'react'
import { Product, HistoryEntry, ProductSizeGrid, Collaborator } from '@/types'
import { triggerConfetti } from '@/lib/confetti'

interface SwagContextType {
  products: Product[]
  history: HistoryEntry[]
  team: Collaborator[]
  collaborators: string[] // Derived names for backward compatibility
  withdrawItem: (
    productId: string,
    user: string,
    destination: string,
    date: Date,
    amount: number,
    size?: string,
  ) => void
  addProduct: (
    product: Omit<Product, 'id' | 'stock'> & {
      stock?: number
      grid?: ProductSizeGrid
    },
  ) => void
  updateProduct: (product: Product) => void
  deleteProduct: (productId: string) => void
  adjustStock: (productId: string, amount: number, size?: string) => void
  addCollaborator: (collaborator: Omit<Collaborator, 'id'>) => void
  updateCollaborator: (collaborator: Collaborator) => void
  deleteCollaborator: (id: string) => void
  isLoading: boolean
}

const SwagContext = createContext<SwagContextType | undefined>(undefined)

const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Camiseta Adapta Tech (Preta)',
    category: 'Vestuário',
    imageQuery: 't-shirt black',
    stock: 22,
    hasGrid: true,
    grid: { PP: 0, P: 2, M: 15, G: 0, GG: 5 },
    description: 'Camiseta de algodão egípcio com estampa minimalista.',
  },
  {
    id: '2',
    name: 'Moletom "Vibe Coding" (Cinza)',
    category: 'Vestuário',
    imageQuery: 'hoodie grey',
    stock: 20,
    hasGrid: true,
    grid: { PP: 0, P: 5, M: 5, G: 5, GG: 5 },
    description: 'Moletom confortável para os dias de código intenso.',
  },
  {
    id: '3',
    name: 'Garrafa Térmica 500ml',
    category: 'Utensílios',
    imageQuery: 'thermos bottle black',
    stock: 30,
    hasGrid: false,
    description: 'Mantém sua bebida na temperatura ideal por horas.',
  },
  {
    id: '4',
    name: 'Kit Onboarding Deluxe',
    category: 'Kits',
    imageQuery: 'welcome kit gift box',
    stock: 8,
    hasGrid: false,
    description: 'O kit completo para receber novos talentos com estilo.',
  },
]

const INITIAL_COLLABORATOR_NAMES = [
  'Allan Baptista',
  'Angelo Nuncio Pinheiro',
  'Arthur da Fonte Guerra',
  'Axel Ríos',
  'Ben Schulze',
  'Bia',
  'Braga',
  'Caio Filip Juliaci',
  'Davi Cunha',
  'Davy Pedrosa',
  'Edson Muniz',
  'Eduarda Almeida',
  'Eduardo Coelho',
  'Erica Ayumi',
  'Ezequiel',
  'Felipe Batista',
  'Felipe Mamede',
  'Felipe Navaar',
  'Felipe Oliveira Garcia',
  'Felipe Peixoto',
  'Fellipe Carvalho',
  'Fellipe Carvalho',
  'Fernando Mascarenhas',
  'Fernando Sousa',
  'Gabriel Carvalho',
  'Gabriel Henrique',
  'Gabriel Jesus',
  'Gabriel Pavão',
  'Gabriel Santos',
  'Giampaolo Lepore',
  'Guilherme Lago',
  'Guilherme Teofilo',
  'Gustavo Fonseca',
  'Hamú',
  'Ian Ede',
  'Ingrid Costa',
  'Isadora Magri',
  'Izabel Villyn',
  'Jadson Consolini',
  'Jamilson Scarcella',
  'Jessica Ferreira',
  'João Augusto',
  'João Ferrari',
  'João Locatelli',
  'João Vitor Andrade Estrela',
  'Joao Vitor Ferrari',
  'Juan Bonfim',
  'Julia Pereira Cruz',
  'Kaike Mota',
  'Kelvi Maycon',
  'Kelvin Dutra',
  'Kelvyn Holovecki',
  'Kimberly Prestes',
  'Léo Camargo',
  'Léo Marinho',
  'Lucas Andrade',
  'Lucas Bueno',
  'Lucas Dias',
  'Lucas Machado',
  'lucas paiva',
  'Lucas Pereira',
  'Lucas Richard',
  'Lucas Romcy',
  'Lucas Vin',
  'Lucas Yuri',
  'Luis Fernando',
  'Luis Miguel',
  'Lydia',
  'Márcia Ertel',
  'Marcos Cury',
  'Mateus Tápias',
  'Matheus Kubo',
  'Matheus Prado',
  'Matheus Sotto',
  'Max',
  'miguel',
  'Miguel Souza Dias',
  'Monike Leal',
  'Patrick Peters',
  'Paulo Zanquetta',
  'Priscilla Petry',
  'Rafael Cabral',
  'Raphael Araujo',
  'Raphaela Castro',
  'Rodrigo A. Santos',
  'Romario',
  'Ruan Azevedo',
  'Ruan Azevedo',
  'Samyla Vidal',
  'Tainara Oliveira',
  'Themila Andrade',
  'Thiago Machado',
  'Vinicius Galetti',
  'Yuri',
]

const generateInitialTeam = (): Collaborator[] => {
  const departments = [
    'Engenharia',
    'Produto',
    'Vendas',
    'Marketing',
    'RH',
    'Financeiro',
  ]
  return INITIAL_COLLABORATOR_NAMES.map((name, i) => ({
    id: `c-${i}`,
    name,
    email: `${name.toLowerCase().split(' ')[0]}@adapta.com.br`,
    department: departments[i % departments.length],
    role: 'Colaborador',
    avatarUrl: `https://img.usecurling.com/ppl/thumbnail?gender=${i % 2 === 0 ? 'male' : 'female'}&seed=${i}`,
  }))
}

export function SwagProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([])
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [team, setTeam] = useState<Collaborator[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const collaborators = useMemo(() => team.map((c) => c.name).sort(), [team])

  useEffect(() => {
    const loadData = () => {
      try {
        const storedProducts = localStorage.getItem('adapta-swag-products-v2')
        const storedHistory = localStorage.getItem('adapta-swag-history')
        const storedTeam = localStorage.getItem('adapta-swag-team')

        if (storedProducts) {
          setProducts(JSON.parse(storedProducts))
        } else {
          setProducts(INITIAL_PRODUCTS)
        }

        if (storedHistory) {
          setHistory(JSON.parse(storedHistory))
        }

        if (storedTeam) {
          setTeam(JSON.parse(storedTeam))
        } else {
          setTeam(generateInitialTeam())
        }
      } catch (error) {
        console.error('Failed to load data from local storage', error)
        setProducts(INITIAL_PRODUCTS)
        setTeam(generateInitialTeam())
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('adapta-swag-products-v2', JSON.stringify(products))
      localStorage.setItem('adapta-swag-history', JSON.stringify(history))
      localStorage.setItem('adapta-swag-team', JSON.stringify(team))
    }
  }, [products, history, team, isLoading])

  const withdrawItem = (
    productId: string,
    user: string,
    destination: string,
    date: Date,
    amount: number,
    size?: string,
  ) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p

        if (p.hasGrid && size && p.grid) {
          const newGrid = {
            ...p.grid,
            [size]: Math.max(0, p.grid[size] - amount),
          }
          const newStock = Object.values(newGrid).reduce(
            (acc, curr) => acc + curr,
            0,
          )
          return { ...p, grid: newGrid, stock: newStock }
        } else {
          return { ...p, stock: Math.max(0, p.stock - amount) }
        }
      }),
    )

    const product = products.find((p) => p.id === productId)
    if (product) {
      const newEntry: HistoryEntry = {
        id: crypto.randomUUID(),
        productId,
        productName: product.name,
        productImageQuery: product.imageQuery,
        user,
        destination,
        date: date.toISOString(),
        size,
        quantity: amount,
      }
      setHistory((prev) => [newEntry, ...prev])
      triggerConfetti()
    }
  }

  const addProduct = (
    productData: Omit<Product, 'id' | 'stock'> & {
      stock?: number
      grid?: ProductSizeGrid
    },
  ) => {
    let finalStock = 0
    if (productData.hasGrid && productData.grid) {
      finalStock = Object.values(productData.grid).reduce(
        (acc, curr) => acc + curr,
        0,
      )
    } else {
      finalStock = productData.stock || 0
    }

    const newProduct: Product = {
      ...productData,
      stock: finalStock,
      id: crypto.randomUUID(),
    }
    setProducts((prev) => [newProduct, ...prev])
  }

  const updateProduct = (updatedProduct: Product) => {
    let finalStock = updatedProduct.stock
    if (updatedProduct.hasGrid && updatedProduct.grid) {
      finalStock = Object.values(updatedProduct.grid).reduce(
        (acc, curr) => acc + curr,
        0,
      )
    }
    const finalProduct = { ...updatedProduct, stock: finalStock }
    setProducts((prev) =>
      prev.map((p) => (p.id === finalProduct.id ? finalProduct : p)),
    )
  }

  const deleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId))
  }

  const adjustStock = (productId: string, amount: number, size?: string) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p
        if (p.hasGrid && size && p.grid) {
          const newGrid = {
            ...p.grid,
            [size]: Math.max(0, p.grid[size] + amount),
          }
          const newStock = Object.values(newGrid).reduce(
            (acc, curr) => acc + curr,
            0,
          )
          return { ...p, grid: newGrid, stock: newStock }
        } else {
          return { ...p, stock: Math.max(0, p.stock + amount) }
        }
      }),
    )
  }

  const addCollaborator = (data: Omit<Collaborator, 'id'>) => {
    const newCollaborator = { ...data, id: crypto.randomUUID() }
    setTeam((prev) => [newCollaborator, ...prev])
  }

  const updateCollaborator = (data: Collaborator) => {
    setTeam((prev) => prev.map((c) => (c.id === data.id ? data : c)))
  }

  const deleteCollaborator = (id: string) => {
    setTeam((prev) => prev.filter((c) => c.id !== id))
  }

  return (
    <SwagContext.Provider
      value={{
        products,
        history,
        team,
        collaborators,
        withdrawItem,
        addProduct,
        updateProduct,
        deleteProduct,
        adjustStock,
        addCollaborator,
        updateCollaborator,
        deleteCollaborator,
        isLoading,
      }}
    >
      {children}
    </SwagContext.Provider>
  )
}

export default function useSwagStore() {
  const context = useContext(SwagContext)
  if (context === undefined) {
    throw new Error('useSwagStore must be used within a SwagProvider')
  }
  return context
}
