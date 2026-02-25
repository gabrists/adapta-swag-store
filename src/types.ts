export type ProductSize = 'PP' | 'P' | 'M' | 'G' | 'GG'

export interface ProductSizeGrid {
  PP: number
  P: number
  M: number
  G: number
  GG: number
  [key: string]: number
}

export interface Product {
  id: string
  name: string
  category: string
  imageQuery: string
  description?: string
  stock: number
  hasGrid: boolean
  grid?: ProductSizeGrid
  price: number
  unitCost: number
  supplierUrl?: string
  isSingleQuota: boolean
  isActive: boolean
  criticalLevel?: number
}

export interface CartItem {
  productId: string
  productName: string
  productImageQuery: string
  size?: string
  quantity: number
  maxStock: number
}

export interface HistoryItemEntry {
  productId: string
  productName: string
  productImageQuery: string
  size?: string
  quantity: number
  unitCost: number
}

export interface HistoryEntry {
  id: string
  items: HistoryItemEntry[]
  user: string
  userAvatar?: string
  destination: string
  date: string
  totalQuantity: number
  totalValue: number
}

export interface Order {
  id: string
  employeeId: string
  itemId: string
  quantity: number
  size?: string
  status: 'Pendente' | 'Entregue' | 'Rejeitado'
  rejectionReason?: string
  createdAt: string
  productName?: string
  productImage?: string
  employeeName?: string
  employeeEmail?: string
  employeeAvatar?: string
}

export interface Collaborator {
  id: string
  name: string
  email: string
  department: string
  departmentId?: string
  role: string
  avatarUrl?: string
  onboardingKitStatus: 'Pendente' | 'Entregue'
}

export interface SlackSettings {
  id: string
  webhookUrl: string
  botToken?: string
  isEnabled: boolean
}

export interface Campaign {
  id: string
  name: string
  description?: string
  imageUrl?: string
  status: 'Aberta' | 'Fechada'
  options: string[]
  targetType: 'all' | 'departments' | 'employees'
  targetIds?: string[]
  createdAt: string
}

export interface CampaignResponse {
  id: string
  campaignId: string
  employeeId: string
  choice: string
  updatedAt: string
}

export type Category =
  | 'Todos'
  | 'Vendas'
  | 'RH'
  | 'Marketing'
  | 'Tech'
  | 'Institucional'
  | 'Vestuário'
  | 'Utensílios'
  | 'Kits'
