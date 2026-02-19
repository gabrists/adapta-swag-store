export interface Product {
  id: string
  name: string
  category: string
  imageQuery: string
  stock: number
}

export interface HistoryEntry {
  id: string
  productId: string
  productName: string
  productImageQuery: string
  user: string
  destination: string
  date: string // ISO string
}

export type Category =
  | 'Todos'
  | 'Vendas'
  | 'RH'
  | 'Marketing'
  | 'Tech'
  | 'Institucional'
