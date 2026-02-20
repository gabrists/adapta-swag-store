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
  Order,
  SlackSettings,
} from '@/types'
import { triggerConfetti } from '@/lib/confetti'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import useAuthStore from '@/stores/useAuthStore'

interface SwagContextType {
  products: Product[]
  cart: CartItem[]
  history: HistoryEntry[]
  orders: Order[]
  team: Collaborator[]
  collaborators: string[]
  slackSettings: SlackSettings | null
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
  approveOrder: (order: Order) => Promise<void>
  rejectOrder: (orderId: string, reason: string) => Promise<void>
  registerManualDelivery: (
    employeeId: string,
    itemId: string,
    quantity: number,
    size?: string,
  ) => Promise<void>
  saveSlackSettings: (settings: Partial<SlackSettings>) => Promise<void>
  testSlackConnection: () => Promise<void>
  isLoading: boolean
}

const SwagContext = createContext<SwagContextType | undefined>(undefined)

export function SwagProvider({ children }: { children: ReactNode }) {
  const { user } = useAuthStore()
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [team, setTeam] = useState<Collaborator[]>([])
  const [departments, setDepartments] = useState<Record<string, string>>({}) // id -> name
  const [slackSettings, setSlackSettings] = useState<SlackSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  const collaborators = useMemo(() => team.map((c) => c.name).sort(), [team])

  // Fetch initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        await Promise.all([
          fetchDepartments(),
          fetchItems(),
          fetchEmployees(),
          fetchOrders(),
          fetchSlackSettings(),
        ])
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
        isSingleQuota: item.is_single_quota || false,
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

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select(
        `
        *,
        items (name, image_url),
        employees (name, email, avatar_url)
      `,
      )
      .order('created_at', { ascending: false })

    if (error) throw error

    const mappedOrders: Order[] =
      data?.map((order: any) => ({
        id: order.id,
        employeeId: order.employee_id,
        itemId: order.item_id,
        quantity: order.quantity,
        size: order.size,
        status: order.status,
        rejectionReason: order.rejection_reason,
        createdAt: order.created_at,
        productName: order.items?.name,
        productImage: order.items?.image_url,
        employeeName: order.employees?.name,
        employeeEmail: order.employees?.email,
        employeeAvatar: order.employees?.avatar_url,
      })) || []

    setOrders(mappedOrders)
  }

  const fetchHistory = async () => {
    const { data, error } = await supabase
      .from('inventory_movements')
      .select(
        `
        *,
        items (name, image_url),
        employees (name, avatar_url)
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
          userAvatar: row.employees?.avatar_url,
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

  const fetchSlackSettings = async () => {
    const { data, error } = await supabase
      .from('slack_settings')
      .select('*')
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching slack settings:', error)
      return
    }

    if (data) {
      setSlackSettings({
        id: data.id,
        webhookUrl: data.webhook_url,
        isEnabled: data.is_enabled,
      })
    } else {
      const { data: newData, error: newError } = await supabase
        .from('slack_settings')
        .insert({ webhook_url: '', is_enabled: false })
        .select()
        .single()

      if (!newError && newData) {
        setSlackSettings({
          id: newData.id,
          webhookUrl: newData.webhook_url,
          isEnabled: newData.is_enabled,
        })
      }
    }
  }

  const sendSlackNotification = async (text: string) => {
    if (!slackSettings?.isEnabled || !slackSettings?.webhookUrl) return

    try {
      const response = await fetch(slackSettings.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      })

      if (!response.ok && response.type !== 'opaque') {
        throw new Error(`Slack API error: ${response.statusText}`)
      }
    } catch (error) {
      console.error('Failed to send Slack notification:', error)
      console.log('Slack Payload:', JSON.stringify({ text }))
    }
  }

  const checkAdminPermission = () => {
    if (user?.role !== 'admin') {
      toast({
        title: 'Acesso Negado',
        description:
          'Você não tem permissão de administrador para realizar esta ação.',
        variant: 'destructive',
      })
      return false
    }
    return true
  }

  const saveSlackSettings = async (settings: Partial<SlackSettings>) => {
    if (!checkAdminPermission()) return
    if (!slackSettings?.id) return

    const updates = {
      webhook_url: settings.webhookUrl,
      is_enabled: settings.isEnabled,
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase
      .from('slack_settings')
      .update(updates)
      .eq('id', slackSettings.id)

    if (error) throw error

    setSlackSettings((prev) => (prev ? { ...prev, ...settings } : null))
  }

  const testSlackConnection = async () => {
    if (!checkAdminPermission()) return
    await sendSlackNotification(
      '🔔 *Teste de Conexão:* O sistema Adapta Swag Store está conectado ao Slack com sucesso!',
    )
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
      if (!employee) throw new Error('Colaborador não encontrado')

      const orderInserts = cart.map((item) => ({
        employee_id: employee.id,
        item_id: item.productId,
        quantity: item.quantity,
        size: item.size,
        status: 'Pendente',
        created_at: new Date().toISOString(),
      }))

      const { error } = await supabase.from('orders').insert(orderInserts)

      if (error) throw error

      for (const item of cart) {
        const message = `🚨 *Novo Pedido de Swag:* ${userName} solicitou ${item.quantity}x ${item.productName}${item.size ? ` (Tam: ${item.size})` : ''}. <${window.location.origin}/admin/approvals|Clique para aprovar>`
        sendSlackNotification(message)
      }

      setCart([])
      toast({
        title: 'Pedido enviado para aprovação do RH!',
        description: 'Acompanhe o status em "Meus Pedidos".',
        className: 'bg-yellow-50 border-yellow-200 text-yellow-900',
      })

      await fetchOrders()
    } catch (error) {
      console.error('Checkout error:', error)
      toast({
        title: 'Erro na Solicitação',
        description: 'Não foi possível enviar o pedido.',
        variant: 'destructive',
      })
    }
  }

  const approveOrder = async (order: Order) => {
    if (!checkAdminPermission()) return

    try {
      const { error: moveError } = await supabase
        .from('inventory_movements')
        .insert({
          group_id: crypto.randomUUID(),
          item_id: order.itemId,
          employee_id: order.employeeId,
          type: 'OUT',
          quantity: order.quantity,
          size: order.size,
          destination: 'Solicitação Aprovada',
        })

      if (moveError) throw moveError

      const { error: updateError } = await supabase
        .from('orders')
        .update({ status: 'Entregue' })
        .eq('id', order.id)

      if (updateError) throw updateError

      await updateLocalStock(order.itemId, order.quantity, order.size)

      const approvalMsg = `✅ *Pedido Aprovado:* Seu pedido de ${order.productName} foi separado e está pronto para retirada com o RH!`
      sendSlackNotification(approvalMsg)

      toast({
        title: 'Pedido Aprovado',
        description: 'Estoque atualizado e pedido marcado como entregue.',
        className: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      })
      triggerConfetti()

      await Promise.all([fetchOrders(), fetchHistory()])
    } catch (error) {
      console.error('Approve error:', error)
      toast({
        title: 'Erro ao aprovar',
        description: 'Não foi possível processar a aprovação.',
        variant: 'destructive',
      })
    }
  }

  const registerManualDelivery = async (
    employeeId: string,
    itemId: string,
    quantity: number,
    size?: string,
  ) => {
    if (!checkAdminPermission()) return

    try {
      // 1. Create Order as Delivered
      const { error: orderError } = await supabase.from('orders').insert({
        employee_id: employeeId,
        item_id: itemId,
        quantity,
        size,
        status: 'Entregue',
        created_at: new Date().toISOString(),
      })

      if (orderError) throw orderError

      // 2. Inventory Movement
      const { error: moveError } = await supabase
        .from('inventory_movements')
        .insert({
          group_id: crypto.randomUUID(),
          item_id: itemId,
          employee_id: employeeId,
          type: 'OUT',
          quantity,
          size,
          destination: 'Entrega Manual',
        })

      if (moveError) throw moveError

      await updateLocalStock(itemId, quantity, size)

      toast({
        title: 'Entrega registrada!',
        description: 'O pedido foi criado e o estoque atualizado.',
        className: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      })
      triggerConfetti()

      await Promise.all([fetchOrders(), fetchHistory()])
    } catch (error) {
      console.error('Manual Delivery error:', error)
      toast({
        title: 'Erro ao registrar',
        description: 'Não foi possível salvar a entrega.',
        variant: 'destructive',
      })
      throw error
    }
  }

  const updateLocalStock = async (
    itemId: string,
    quantity: number,
    size?: string,
  ) => {
    let newStockLevel = 0
    let productSupplierUrl = ''
    let productName = ''

    if (size) {
      const product = products.find((p) => p.id === itemId)
      if (product && product.grid) {
        productName = product.name
        const newGrid = {
          ...product.grid,
          [size]: Math.max(0, product.grid[size] - quantity),
        }
        const finalStock = Object.values(newGrid).reduce(
          (acc, curr) => acc + curr,
          0,
        )
        newStockLevel = finalStock
        productSupplierUrl = product.supplierUrl || ''

        setProducts((prev) =>
          prev.map((p) =>
            p.id === itemId ? { ...p, grid: newGrid, stock: finalStock } : p,
          ),
        )
      }
    } else {
      const product = products.find((p) => p.id === itemId)
      if (product) {
        productName = product.name
        newStockLevel = Math.max(0, product.stock - quantity)
        productSupplierUrl = product.supplierUrl || ''

        setProducts((prev) =>
          prev.map((p) =>
            p.id === itemId ? { ...p, stock: newStockLevel } : p,
          ),
        )
      }
    }

    // Critical Stock Alert
    if (newStockLevel < 5 && productName) {
      const stockMsg = `⚠️ *Alerta de Estoque:* O item ${productName} está acabando! Restam apenas ${newStockLevel} unidades. ${productSupplierUrl ? `<${productSupplierUrl}|Link para fornecedor>` : '(Sem link do fornecedor)'}`
      sendSlackNotification(stockMsg)
    }

    // Refetch items to sync with server (since triggers might update DB)
    await fetchItems()
  }

  const rejectOrder = async (orderId: string, reason: string) => {
    if (!checkAdminPermission()) return

    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'Rejeitado',
          rejection_reason: reason,
        })
        .eq('id', orderId)

      if (error) throw error

      const order = orders.find((o) => o.id === orderId)
      const productName = order?.productName || 'Item'

      const rejectionMsg = `❌ *Pedido Rejeitado:* Seu pedido de ${productName} não pôde ser atendido.${reason ? ` Motivo: ${reason}` : ''}`
      sendSlackNotification(rejectionMsg)

      toast({
        title: 'Pedido Rejeitado',
        description: 'O status do pedido foi atualizado.',
      })

      await fetchOrders()
    } catch (error) {
      console.error('Reject error:', error)
      toast({
        title: 'Erro ao rejeitar',
        description: 'Tente novamente.',
        variant: 'destructive',
      })
    }
  }

  const addProduct = async (
    productData: Omit<Product, 'id' | 'stock'> & {
      stock?: number
      grid?: ProductSizeGrid
    },
  ) => {
    if (!checkAdminPermission()) return

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
      is_single_quota: productData.isSingleQuota,
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
    if (!checkAdminPermission()) return

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
      is_single_quota: updatedProduct.isSingleQuota,
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
    if (!checkAdminPermission()) return

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
    if (!checkAdminPermission()) return

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
    if (!checkAdminPermission()) return

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
    if (!checkAdminPermission()) return

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
    if (!checkAdminPermission()) return

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
        orders,
        team,
        collaborators,
        slackSettings,
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
        approveOrder,
        rejectOrder,
        registerManualDelivery,
        saveSlackSettings,
        testSlackConnection,
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
