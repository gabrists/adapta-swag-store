import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  ReactNode,
} from 'react'
import {
  Product,
  HistoryEntry,
  ProductSizeGrid,
  Collaborator,
  CartItem,
} from '@/types'
import { triggerConfetti } from '@/lib/confetti'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface SwagContextType {
  products: Product[]
  cart: CartItem[]
  history: HistoryEntry[]
  team: Collaborator[]
  collaborators: string[]
  addToCart: (product: Product, quantity: number, size?: string) => void
  removeFromCart: (productId: string, size?: string) => void
  updateCartItemQuantity: (
    productId: string,
    quantity: number,
    size?: string,
  ) => void
  clearCart: () => void
  checkoutCart: (
    userName: string,
    destination: string,
    date: Date,
  ) => Promise<void>
  addProduct: (
    product: Omit<Product, 'id' | 'stock'> & {
      stock?: number
      grid?: ProductSizeGrid
    },
  ) => Promise<void>
  updateProduct: (product: Product) => Promise<void>
  deleteProduct: (productId: string) => Promise<void>
  adjustStock: (
    productId: string,
    amount: number,
    size?: string,
  ) => Promise<void>
  addCollaborator: (collaborator: Omit<Collaborator, 'id'>) => Promise<void>
  updateCollaborator: (collaborator: Collaborator) => Promise<void>
  deleteCollaborator: (id: string) => Promise<void>
  isLoading: boolean
}

const SwagContext = createContext<SwagContextType | undefined>(undefined)

export function SwagProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [team, setTeam] = useState<Collaborator[]>([])
  const [departments, setDepartments] = useState<Record<string, string>>({}) // id -> name
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  const collaborators = useMemo(() => team.map((c) => c.name).sort(), [team])

  // Fetch initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        await Promise.all([fetchDepartments(), fetchItems(), fetchEmployees()])
        await fetchHistory() // Depends on items/employees
      } catch (error) {
        console.error('Error loading data:', error)
        toast({
          title: 'Erro de Conexão',
          description: 'Não foi possível carregar os dados do servidor.',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const fetchDepartments = async () => {
    const { data, error } = await supabase.from('departments').select('*')
    if (error) throw error
    const deptMap: Record<string, string> = {}
    data?.forEach((d) => {
      deptMap[d.id] = d.name
    })
    setDepartments(deptMap)
  }

  const fetchItems = async () => {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .order('name')
    if (error) throw error

    const mappedProducts: Product[] =
      data?.map((item) => ({
        id: item.id,
        name: item.name,
        category: item.category,
        imageQuery: item.image_url || '',
        stock: item.current_stock,
        hasGrid: item.has_grid,
        grid: item.grid as unknown as ProductSizeGrid,
        description: item.description || '',
        price: Number(item.price) || 0,
        unitCost: Number(item.unit_cost) || 0,
        supplierUrl: item.supplier_url || '',
      })) || []

    setProducts(mappedProducts)
  }

  const fetchEmployees = async () => {
    const { data, error } = await supabase
      .from('employees')
      .select('*, departments(name)')
      .order('name')

    if (error) throw error

    const mappedTeam: Collaborator[] =
      data?.map((emp: any) => ({
        id: emp.id,
        name: emp.name,
        email: emp.email,
        department: emp.departments?.name || 'Geral',
        role: emp.role || 'Colaborador',
        avatarUrl: emp.avatar_url,
      })) || []

    setTeam(mappedTeam)
  }

  const fetchHistory = async () => {
    const { data, error } = await supabase
      .from('inventory_movements')
      .select(
        `
        *,
        items (name, image_url),
        employees (name)
      `,
      )
      .eq('type', 'OUT')
      .order('created_at', { ascending: false })

    if (error) throw error

    const groups: Record<string, HistoryEntry> = {}

    data?.forEach((row: any) => {
      if (!groups[row.group_id]) {
        groups[row.group_id] = {
          id: row.group_id,
          items: [],
          user: row.employees?.name || 'Desconhecido',
          destination: row.destination || '',
          date: row.created_at,
          totalQuantity: 0,
        }
      }

      groups[row.group_id].items.push({
        productId: row.item_id,
        productName: row.items?.name || 'Item Removido',
        productImageQuery: row.items?.image_url || '',
        size: row.size,
        quantity: row.quantity,
      })

      groups[row.group_id].totalQuantity += row.quantity
    })

    setHistory(Object.values(groups))
  }

  const addToCart = (product: Product, quantity: number, size?: string) => {
    setCart((prev) => {
      const existingItemIndex = prev.findIndex(
        (item) => item.productId === product.id && item.size === size,
      )

      let maxStock = product.stock
      if (product.hasGrid && size && product.grid) {
        maxStock = product.grid[size]
      }

      if (existingItemIndex >= 0) {
        const newCart = [...prev]
        const newQuantity = Math.min(
          newCart[existingItemIndex].quantity + quantity,
          maxStock,
        )
        newCart[existingItemIndex] = {
          ...newCart[existingItemIndex],
          quantity: newQuantity,
        }
        return newCart
      } else {
        return [
          ...prev,
          {
            productId: product.id,
            productName: product.name,
            productImageQuery: product.imageQuery,
            size,
            quantity: Math.min(quantity, maxStock),
            maxStock,
          },
        ]
      }
    })
  }

  const removeFromCart = (productId: string, size?: string) => {
    setCart((prev) =>
      prev.filter(
        (item) => !(item.productId === productId && item.size === size),
      ),
    )
  }

  const updateCartItemQuantity = (
    productId: string,
    quantity: number,
    size?: string,
  ) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.productId === productId && item.size === size) {
          return {
            ...item,
            quantity: Math.min(Math.max(1, quantity), item.maxStock),
          }
        }
        return item
      }),
    )
  }

  const clearCart = () => {
    setCart([])
  }

  const checkoutCart = async (
    userName: string,
    destination: string,
    date: Date,
  ) => {
    if (cart.length === 0) return

    try {
      const employee = team.find((c) => c.name === userName)
      const employeeId = employee?.id

      const groupId = crypto.randomUUID()
      const movements = []

      for (const item of cart) {
        movements.push({
          group_id: groupId,
          item_id: item.productId,
          employee_id: employeeId,
          type: 'OUT',
          quantity: item.quantity,
          size: item.size,
          destination: destination,
          created_at: date.toISOString(),
        })

        const product = products.find((p) => p.id === item.productId)
        if (product && product.hasGrid && item.size && product.grid) {
          const newGrid = {
            ...product.grid,
            [item.size]: Math.max(0, product.grid[item.size] - item.quantity),
          }
          updateProductState(item.productId, { grid: newGrid })
          await supabase
            .from('items')
            .update({ grid: newGrid })
            .eq('id', item.productId)
        }
      }

      const { error } = await supabase
        .from('inventory_movements')
        .insert(movements)

      if (error) throw error

      setCart([])
      triggerConfetti()

      await fetchItems()
      await fetchHistory()
    } catch (error) {
      console.error('Checkout error:', error)
      toast({
        title: 'Erro no Checkout',
        description: 'Não foi possível finalizar a retirada.',
        variant: 'destructive',
      })
    }
  }

  const updateProductState = (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p
        const updated = { ...p, ...updates }
        if (updated.hasGrid && updated.grid) {
          updated.stock = Object.values(updated.grid).reduce((a, b) => a + b, 0)
        }
        return updated
      }),
    )
  }

  const addProduct = async (
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

    const newItem = {
      name: productData.name,
      description: productData.description,
      image_url: productData.imageQuery,
      category: productData.category,
      price: productData.price,
      unit_cost: productData.unitCost,
      supplier_url: productData.supplierUrl,
      has_grid: productData.hasGrid,
      grid: productData.grid ? JSON.stringify(productData.grid) : null,
      current_stock: finalStock,
      critical_level: 5,
    }

    const { error } = await supabase.from('items').insert(newItem as any)

    if (error) {
      console.error(error)
      throw error
    }

    await fetchItems()
  }

  const updateProduct = async (updatedProduct: Product) => {
    let finalStock = updatedProduct.stock
    if (updatedProduct.hasGrid && updatedProduct.grid) {
      finalStock = Object.values(updatedProduct.grid).reduce(
        (acc, curr) => acc + curr,
        0,
      )
    }

    const updates = {
      name: updatedProduct.name,
      description: updatedProduct.description,
      image_url: updatedProduct.imageQuery,
      category: updatedProduct.category,
      price: updatedProduct.price,
      unit_cost: updatedProduct.unitCost,
      supplier_url: updatedProduct.supplierUrl,
      has_grid: updatedProduct.hasGrid,
      grid: updatedProduct.grid ? updatedProduct.grid : null,
      current_stock: finalStock,
    }

    const { error } = await supabase
      .from('items')
      .update(updates as any)
      .eq('id', updatedProduct.id)

    if (error) {
      console.error(error)
      throw error
    }

    await fetchItems()
  }

  const deleteProduct = async (productId: string) => {
    const { error } = await supabase.from('items').delete().eq('id', productId)
    if (error) {
      console.error(error)
      toast({
        title: 'Erro ao excluir',
        description:
          'Verifique se existem movimentações associadas a este item.',
        variant: 'destructive',
      })
      throw error
    }
    setProducts((prev) => prev.filter((p) => p.id !== productId))
  }

  const adjustStock = async (
    productId: string,
    amount: number,
    size?: string,
  ) => {
    try {
      const type = amount > 0 ? 'IN' : 'OUT'
      const absAmount = Math.abs(amount)

      const { error } = await supabase.from('inventory_movements').insert({
        group_id: crypto.randomUUID(),
        item_id: productId,
        type: type,
        quantity: absAmount,
        size: size,
        destination: 'Ajuste de Estoque',
      })

      if (error) throw error

      if (size) {
        const product = products.find((p) => p.id === productId)
        if (product && product.grid) {
          const newGrid = {
            ...product.grid,
            [size]: Math.max(0, product.grid[size] + amount),
          }
          await supabase
            .from('items')
            .update({ grid: newGrid })
            .eq('id', productId)
        }
      }

      await fetchItems()
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  const addCollaborator = async (data: Omit<Collaborator, 'id'>) => {
    let deptId = Object.keys(departments).find(
      (key) => departments[key] === data.department,
    )

    if (!deptId) {
      const { data: deptData } = await supabase
        .from('departments')
        .select('id')
        .eq('name', data.department)
        .single()

      if (deptData) {
        deptId = deptData.id
      } else {
        const { data: newDept } = await supabase
          .from('departments')
          .insert({ name: data.department })
          .select()
          .single()
        if (newDept) deptId = newDept.id
      }
    }

    if (!deptId) throw new Error('Department not found')

    const newEmp = {
      name: data.name,
      email: data.email,
      department_id: deptId,
      role: data.role,
      avatar_url: data.avatarUrl,
    }

    const { error } = await supabase.from('employees').insert(newEmp)
    if (error) throw error

    await fetchEmployees()
  }

  const updateCollaborator = async (data: Collaborator) => {
    let deptId = Object.keys(departments).find(
      (key) => departments[key] === data.department,
    )
    if (!deptId) {
      const { data: deptData } = await supabase
        .from('departments')
        .select('id')
        .eq('name', data.department)
        .single()
      if (deptData) deptId = deptData.id
    }

    const updates = {
      name: data.name,
      email: data.email,
      department_id: deptId,
      role: data.role,
      avatar_url: data.avatarUrl,
    }

    const { error } = await supabase
      .from('employees')
      .update(updates)
      .eq('id', data.id)
    if (error) throw error

    await fetchEmployees()
  }

  const deleteCollaborator = async (id: string) => {
    const { error } = await supabase.from('employees').delete().eq('id', id)
    if (error) throw error
    setTeam((prev) => prev.filter((c) => c.id !== id))
  }

  return (
    <SwagContext.Provider
      value={{
        products,
        cart,
        history,
        team,
        collaborators,
        addToCart,
        removeFromCart,
        updateCartItemQuantity,
        clearCart,
        checkoutCart,
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
