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
  Campaign,
  CampaignResponse,
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
  departments: Record<string, string>
  collaborators: string[]
  slackSettings: SlackSettings | null
  campaigns: Campaign[]
  campaignResponses: CampaignResponse[]
  addToCart: (product: Product, quantity: number, size?: string) => void
  removeFromCart: (productId: string, size?: string) => void
  updateCartItemQuantity: (
    productId: string,
    quantity: number,
    size?: string,
  ) => void
  clearCart: () => void
  checkoutCart: (destination: string) => Promise<void>
  addProduct: (
    product: Omit<Product, 'id' | 'stock' | 'isActive'> & {
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
  toggleProductStatus: (productId: string, isActive: boolean) => Promise<void>
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
  notifySlackChannel: (text: string) => Promise<void>
  notifySlackDM: (employeeId: string, text: string) => Promise<void>
  fetchCampaigns: () => Promise<void>
  fetchCampaignResponses: () => Promise<void>
  createCampaign: (
    data: Omit<Campaign, 'id' | 'createdAt' | 'status'>,
  ) => Promise<void>
  updateCampaign: (
    id: string,
    data: Partial<Omit<Campaign, 'id' | 'createdAt'>>,
  ) => Promise<void>
  updateCampaignStatus: (
    id: string,
    status: 'Aberta' | 'Fechada',
  ) => Promise<void>
  submitCampaignResponse: (
    campaignId: string,
    employeeId: string,
    choice: string,
  ) => Promise<void>
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
  const [departments, setDepartments] = useState<Record<string, string>>({})
  const [slackSettings, setSlackSettings] = useState<SlackSettings | null>(null)
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [campaignResponses, setCampaignResponses] = useState<
    CampaignResponse[]
  >([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  const collaborators = useMemo(() => team.map((c) => c.name).sort(), [team])

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
          fetchCampaigns(),
          fetchCampaignResponses(),
        ])
        await fetchHistory()
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
        hasGrid: item.has_grid || false,
        grid: (item.grid as unknown as ProductSizeGrid) || undefined,
        description: item.description || '',
        price: Number(item.price) || 0,
        unitCost: Number(item.unit_cost) || 0,
        supplierUrl: item.supplier_url || '',
        isSingleQuota: item.is_single_quota || false,
        isActive: item.is_active ?? true,
        criticalLevel: item.critical_level,
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
        onboardingKitStatus: emp.onboarding_kit_status || 'Pendente',
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
        items (name, image_url, unit_cost),
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
          totalValue: 0,
        }
      }

      const unitCost = Number(row.items?.unit_cost) || 0

      groups[row.group_id].items.push({
        productId: row.item_id,
        productName: row.items?.name || 'Item Removido',
        productImageQuery: row.items?.image_url || '',
        size: row.size,
        quantity: row.quantity,
        unitCost: unitCost,
      })

      groups[row.group_id].totalQuantity += row.quantity
      groups[row.group_id].totalValue += row.quantity * unitCost
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
        botToken: (data as any).bot_token,
        isEnabled: data.is_enabled,
      })
    } else {
      const { data: newData, error: newError } = await supabase
        .from('slack_settings')
        .insert({ webhook_url: '', is_enabled: false } as any)
        .select()
        .single()

      if (!newError && newData) {
        setSlackSettings({
          id: newData.id,
          webhookUrl: newData.webhook_url,
          botToken: (newData as any).bot_token,
          isEnabled: newData.is_enabled,
        })
      }
    }
  }

  const fetchCampaigns = async () => {
    const { data, error } = await supabase
      .from('swag_campaigns' as any)
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching campaigns:', error)
      return
    }

    const mapped: Campaign[] =
      data?.map((d: any) => ({
        id: d.id,
        name: d.name,
        description: d.description,
        imageUrl: d.image_url,
        status: d.status as 'Aberta' | 'Fechada',
        options: d.options as string[],
        createdAt: d.created_at,
      })) || []

    setCampaigns(mapped)
  }

  const fetchCampaignResponses = async () => {
    const { data, error } = await supabase
      .from('campaign_responses' as any)
      .select('*')

    if (error) {
      console.error('Error fetching responses:', error)
      return
    }

    const mapped: CampaignResponse[] =
      data?.map((d: any) => ({
        id: d.id,
        campaignId: d.campaign_id,
        employeeId: d.employee_id,
        choice: d.choice,
        updatedAt: d.updated_at,
      })) || []

    setCampaignResponses(mapped)
  }

  const createCampaign = async (
    data: Omit<Campaign, 'id' | 'createdAt' | 'status'>,
  ) => {
    if (!checkAdminPermission()) return
    const { error } = await supabase.from('swag_campaigns' as any).insert({
      name: data.name,
      description: data.description,
      image_url: data.imageUrl,
      options: data.options,
    })
    if (error) throw error
    await fetchCampaigns()
  }

  const updateCampaign = async (
    id: string,
    data: Partial<Omit<Campaign, 'id' | 'createdAt'>>,
  ) => {
    if (!checkAdminPermission()) return

    const updates: any = {}
    if (data.name !== undefined) updates.name = data.name
    if (data.description !== undefined) updates.description = data.description
    if (data.imageUrl !== undefined) updates.image_url = data.imageUrl
    if (data.options !== undefined) updates.options = data.options
    if (data.status !== undefined) updates.status = data.status

    const { error } = await supabase
      .from('swag_campaigns' as any)
      .update(updates)
      .eq('id', id)

    if (error) throw error
    await fetchCampaigns()
  }

  const updateCampaignStatus = async (
    id: string,
    status: 'Aberta' | 'Fechada',
  ) => {
    if (!checkAdminPermission()) return
    const { error } = await supabase
      .from('swag_campaigns' as any)
      .update({ status })
      .eq('id', id)
    if (error) throw error
    await fetchCampaigns()
  }

  const submitCampaignResponse = async (
    campaignId: string,
    employeeId: string,
    choice: string,
  ) => {
    const campaign = campaigns.find((c) => c.id === campaignId)
    if (campaign?.status !== 'Aberta') throw new Error('Campanha encerrada.')

    const { error } = await supabase.from('campaign_responses' as any).upsert(
      {
        campaign_id: campaignId,
        employee_id: employeeId,
        choice: choice,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'campaign_id,employee_id' },
    )

    if (error) throw error
    await fetchCampaignResponses()
  }

  const notifySlackChannel = async (text: string) => {
    const payloadInfo = { type: 'webhook', text }
    console.log('Sending Slack Channel Notification:', payloadInfo)

    toast({
      title: 'Slack Notificação',
      description: 'Notificação enviada no canal do RH',
    })

    if (!slackSettings?.webhookUrl || !slackSettings?.isEnabled) {
      console.log('Slack Webhook Missing or Disabled. Payload:', payloadInfo)
      return
    }

    try {
      const { data, error } = await supabase.functions.invoke(
        'send-slack-notification',
        {
          body: {
            type: 'webhook',
            webhook_url: slackSettings.webhookUrl,
            payload: { text },
          },
        },
      )

      if (error) throw new Error(error.message)
      if (data?.error) throw new Error(data.error)
    } catch (error) {
      console.error(
        'Failed to send Slack channel notification:',
        error,
        payloadInfo,
      )
    }
  }

  const notifySlackDM = async (employeeId: string, text: string) => {
    // 1. Ensure we always use the latest email from the employees table to avoid stale session data errors
    const { data: employee } = await supabase
      .from('employees')
      .select('email')
      .eq('id', employeeId)
      .single()

    const email = employee?.email

    if (!email) {
      console.log(
        `Slack DM skipped: Could not find up-to-date email for employee ID: ${employeeId}`,
      )
      return
    }

    const payloadInfo = { type: 'dm', email, text }
    console.log('Sending Slack DM:', payloadInfo)

    toast({
      title: 'Slack DM',
      description: 'DM enviada para o Slack do colaborador',
    })

    if (!slackSettings?.botToken || !slackSettings?.isEnabled) {
      console.log('Slack Bot Token Missing or Disabled. Payload:', payloadInfo)
      return
    }

    try {
      const { data, error } = await supabase.functions.invoke(
        'send-slack-notification',
        {
          body: {
            type: 'dm',
            bot_token: slackSettings.botToken,
            email,
            payload: { text },
          },
        },
      )

      if (error) throw new Error(error.message)
      if (data?.error) throw new Error(data.error)
    } catch (error) {
      console.error('Failed to send Slack DM:', error, payloadInfo)
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
      bot_token: settings.botToken,
      is_enabled: settings.isEnabled,
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase
      .from('slack_settings')
      .update(updates as any)
      .eq('id', slackSettings.id)

    if (error) throw error

    setSlackSettings((prev) => (prev ? { ...prev, ...settings } : null))
  }

  const testSlackConnection = async () => {
    if (!checkAdminPermission()) return
    await notifySlackChannel(
      '🔔 *Teste de Conexão:* O sistema Adapta Swag Store está conectado ao Slack com sucesso!',
    )
    if (user?.id) {
      await notifySlackDM(
        user.id,
        '🔔 *Teste de Conexão (DM):* O sistema Adapta Swag Store está conectado ao Slack com sucesso!',
      )
    }
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

  const checkoutCart = async (destination: string) => {
    if (cart.length === 0) return

    if (!user) {
      toast({
        title: 'Login Necessário',
        description: 'Você precisa estar logado para finalizar o pedido.',
        variant: 'destructive',
      })
      return
    }

    try {
      const productIds = cart.map((c) => c.productId)
      const { data: dbItems, error: itemsError } = await supabase
        .from('items')
        .select('*')
        .in('id', productIds)

      if (itemsError) throw itemsError

      for (const cartItem of cart) {
        const dbItem = dbItems?.find((i) => i.id === cartItem.productId)
        if (!dbItem)
          throw new Error(`Item "${cartItem.productName}" não encontrado.`)

        if (!dbItem.is_active)
          throw new Error(
            `Item "${cartItem.productName}" não está mais disponível.`,
          )

        if (dbItem.has_grid && cartItem.size) {
          const grid = dbItem.grid as unknown as ProductSizeGrid
          const available = grid?.[cartItem.size] || 0
          if (available < cartItem.quantity) {
            throw new Error(
              `Estoque insuficiente para "${cartItem.productName}" (Tamanho: ${cartItem.size}). Restam apenas ${available}.`,
            )
          }
        } else {
          if (dbItem.current_stock < cartItem.quantity) {
            throw new Error(
              `Estoque insuficiente para "${cartItem.productName}". Restam apenas ${dbItem.current_stock}.`,
            )
          }
        }
      }

      const orderInserts = cart.map((item) => ({
        employee_id: user.id,
        item_id: item.productId,
        quantity: item.quantity,
        size: item.size,
        status: 'Pendente',
        created_at: new Date().toISOString(),
      }))

      const { error } = await supabase.from('orders').insert(orderInserts)

      if (error) throw error

      // Get latest employee email to ensure no stale data in channel message
      const { data: currentEmp } = await supabase
        .from('employees')
        .select('email')
        .eq('id', user.id)
        .single()

      const currentEmail = currentEmp?.email || user.email

      const totalDistinctItems = cart.length
      const itemWord = totalDistinctItems === 1 ? 'item' : 'itens'
      const itemsList = cart
        .map((item) => `- ${item.quantity}x ${item.productName}`)
        .join('\n')
      const adminUrl = `${window.location.origin}/admin/approvals`

      const channelMessage = `:rotating_light: Novo Pedido de Swag: ${user.name} (${currentEmail}) solicitou ${totalDistinctItems} ${itemWord}:\n\n${itemsList}\n\nAcesse o painel para aprovar ou rejeitar: ${adminUrl}`
      notifySlackChannel(channelMessage)

      const dmMessage = `⏳ *Recebemos seu pedido!* Sua solicitação para os seguintes itens foi enviada ao RH:\n\n${itemsList}\n\nAvisaremos aqui quando houver atualização.`
      notifySlackDM(user.id, dmMessage)

      setCart([])
      toast({
        title: 'Pedido enviado para aprovação do RH!',
        description: 'Acompanhe o status em "Meus Pedidos".',
        className: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      })
      triggerConfetti()

      await fetchOrders()
    } catch (error: any) {
      console.error('Checkout error:', error)
      toast({
        title: 'Erro na Solicitação',
        description:
          error instanceof Error
            ? error.message
            : 'Não foi possível enviar o pedido.',
        variant: 'destructive',
      })
      throw error
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

      const approvalMsg = `✅ *Boas notícias!* Seu pedido do ${order.productName} foi aprovado. Você já pode retirá-lo com o time de Facilities/RH.`
      if (order.employeeId) {
        notifySlackDM(order.employeeId, approvalMsg)
      }

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
      const { error: orderError } = await supabase.from('orders').insert({
        employee_id: employeeId,
        item_id: itemId,
        quantity,
        size,
        status: 'Entregue',
        created_at: new Date().toISOString(),
      })

      if (orderError) throw orderError

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

    if (newStockLevel < 5 && productName) {
      const stockMsg = `⚠️ *Alerta de Estoque:* O item ${productName} está acabando! Restam apenas ${newStockLevel} unidades. ${productSupplierUrl ? `<${productSupplierUrl}|Link para fornecedor>` : '(Sem link do fornecedor)'}`
      notifySlackChannel(stockMsg)
    }

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

      const rejectionMsg = `❌ *Atualização do pedido:* Infelizmente seu pedido do ${productName} não pôde ser aprovado agora. Motivo: ${reason}`
      if (order?.employeeId) {
        notifySlackDM(order.employeeId, rejectionMsg)
      }

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
    productData: Omit<Product, 'id' | 'stock' | 'isActive'> & {
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
      critical_level: productData.criticalLevel ?? 5,
      is_active: true,
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
      is_active: updatedProduct.isActive,
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

  const toggleProductStatus = async (productId: string, isActive: boolean) => {
    if (!checkAdminPermission()) return

    const { error } = await supabase
      .from('items')
      .update({ is_active: isActive })
      .eq('id', productId)

    if (error) {
      console.error(error)
      toast({
        title: 'Erro ao atualizar status',
        description: 'Não foi possível alterar o status do item.',
        variant: 'destructive',
      })
      throw error
    }

    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, isActive } : p)),
    )
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
      onboarding_kit_status: data.onboardingKitStatus || 'Pendente',
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
      onboarding_kit_status: data.onboardingKitStatus,
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
        departments,
        collaborators,
        slackSettings,
        campaigns,
        campaignResponses,
        addToCart,
        removeFromCart,
        updateCartItemQuantity,
        clearCart,
        checkoutCart,
        addProduct,
        updateProduct,
        deleteProduct,
        adjustStock,
        toggleProductStatus,
        addCollaborator,
        updateCollaborator,
        deleteCollaborator,
        approveOrder,
        rejectOrder,
        registerManualDelivery,
        saveSlackSettings,
        testSlackConnection,
        notifySlackChannel,
        notifySlackDM,
        fetchCampaigns,
        fetchCampaignResponses,
        createCampaign,
        updateCampaign,
        updateCampaignStatus,
        submitCampaignResponse,
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
