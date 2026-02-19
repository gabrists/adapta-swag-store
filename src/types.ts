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
}

export interface HistoryEntry {
  id: string
  productId: string
  productName: string
  productImageQuery: string
  user: string
  destination: string
  date: string // ISO string
  size?: string
  quantity: number
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
