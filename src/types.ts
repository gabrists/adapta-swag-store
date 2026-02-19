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
  stock: number // Total stock
  hasGrid: boolean
  grid?: ProductSizeGrid
  price: number // Added for Dashboard KPI
  unitCost: number // Added for Financial KPI
  supplierUrl?: string // Added for Restock
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
}

export interface HistoryEntry {
  id: string
  items: HistoryItemEntry[]
  user: string
  destination: string
  date: string // ISO string
  totalQuantity: number
}

export interface Collaborator {
  id: string
  name: string
  email: string
  department: string
  role: string
  avatarUrl?: string
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
