import { useState, useMemo } from 'react'
import {
  Plus,
  Search,
  MoreHorizontal,
  AlertTriangle,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  Folder,
} from 'lucide-react'
import useSwagStore from '@/stores/useSwagStore'
import { Product } from '@/types'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { ProductDialog } from '@/components/admin/ProductDialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const categoryColors: Record<string, string> = {
  Vendas: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  RH: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  Marketing: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30',
  Tech: 'bg-sky-500/20 text-sky-400 border border-sky-500/30',
  Institucional: 'bg-slate-500/20 text-slate-300 border border-slate-500/30',
  Vestuário: 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30',
  Utensílios: 'bg-teal-500/20 text-teal-400 border border-teal-500/30',
  Kits: 'bg-primary/20 text-primary border border-primary/30',
}

export default function Inventory() {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    adjustStock,
    toggleProductStatus,
  } = useSwagStore()
  const { toast } = useToast()

  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('Todas')
  const [criticalStockFilter, setCriticalStockFilter] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [deleteProductData, setDeleteProductData] = useState<Product | null>(
    null,
  )
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase())

      const matchesCategory =
        categoryFilter === 'Todas' || product.category === categoryFilter

      const matchesCritical = !criticalStockFilter || product.stock < 3

      return matchesSearch && matchesCategory && matchesCritical
    })
  }, [products, searchQuery, categoryFilter, criticalStockFilter])

  const handleCreate = () => {
    setSelectedProduct(null)
    setDialogOpen(true)
  }

  const handleEdit = (product: Product) => {
    setSelectedProduct(product)
    setDialogOpen(true)
  }

  const handleDelete = (product: Product) => {
    setDeleteProductData(product)
  }

  const confirmDelete = () => {
    if (deleteProductData) {
      deleteProduct(deleteProductData.id)
      setDeleteProductData(null)
      toast({
        title: 'Item excluído',
        description: `${deleteProductData.name} foi removido do inventário.`,
      })
    }
  }

  const handleSaveProduct = async (values: any) => {
    await new Promise((resolve) => setTimeout(resolve, 500))

    if (selectedProduct) {
      updateProduct({
        ...selectedProduct,
        ...values,
      })
      toast({
        title: 'Item salvo com sucesso!',
        description: 'As alterações foram atualizadas.',
      })
    } else {
      addProduct(values)
      toast({
        title: 'Item criado!',
        description: 'Novo item adicionado ao inventário.',
      })
    }
  }

  const handleAdjustStock = (id: string, amount: number, size?: string) => {
    adjustStock(id, amount, size)
    toast({
      title: 'Estoque atualizado',
      description: `Quantidade de ${size ? size : 'item'} ajustada em ${amount > 0 ? '+' : ''}${amount}.`,
      duration: 1500,
    })
  }

  const handleToggleStatus = (id: string, currentStatus: boolean) => {
    toggleProductStatus(id, !currentStatus)
    toast({
      title: !currentStatus ? 'Item ativado' : 'Item desativado',
      description: !currentStatus
        ? 'O item agora está visível na vitrine.'
        : 'O item foi ocultado da vitrine.',
    })
  }

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(new Set(filteredProducts.map((p) => p.id)))
    } else {
      setSelectedRows(new Set())
    }
  }

  const toggleSelectRow = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedRows)
    if (checked) {
      newSelected.add(id)
    } else {
      newSelected.delete(id)
    }
    setSelectedRows(newSelected)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Gestão de Inventário
          </h1>
          <p className="text-base text-slate-400">
            Gerencie todos os brindes e estoque da loja.
          </p>
        </div>
        <Button
          onClick={handleCreate}
          className="btn-primary-glow h-12 px-6 text-base rounded-xl"
        >
          <Plus className="w-5 h-5 mr-2" />
          Novo Item
        </Button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-4 glass-panel p-4 md:p-5 rounded-2xl">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            placeholder="Buscar item..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 h-12"
          />
        </div>

        <div className="flex items-center gap-5 flex-wrap">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px] h-12">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todas">Todas</SelectItem>
              <SelectItem value="Vestuário">Vestuário</SelectItem>
              <SelectItem value="Utensílios">Utensílios</SelectItem>
              <SelectItem value="Kits">Kits</SelectItem>
              <SelectItem value="Institucional">Institucional</SelectItem>
              <SelectItem value="Tech">Tech</SelectItem>
              <SelectItem value="Vendas">Vendas</SelectItem>
              <SelectItem value="Marketing">Marketing</SelectItem>
              <SelectItem value="RH">RH</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center space-x-3 border-l pl-5 border-white/10 h-12">
            <Switch
              id="critical-stock"
              checked={criticalStockFilter}
              onCheckedChange={setCriticalStockFilter}
            />
            <Label
              htmlFor="critical-stock"
              className="text-sm font-medium text-slate-300 cursor-pointer"
            >
              Alertas apenas
            </Label>
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-white/10 bg-black/20">
              <TableHead className="w-[50px] pl-6">
                <Checkbox
                  checked={
                    filteredProducts.length > 0 &&
                    selectedRows.size === filteredProducts.length
                  }
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead className="w-[300px] text-slate-400">Item</TableHead>
              <TableHead className="text-slate-400">Categoria</TableHead>
              <TableHead className="text-slate-400">Custo Unitário</TableHead>
              <TableHead className="min-w-[200px] text-slate-400">
                Estoque
              </TableHead>
              <TableHead className="text-slate-400">Status</TableHead>
              <TableHead className="text-right pr-6 text-slate-400">
                Ações
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center space-y-4 text-slate-400">
                    <div className="bg-white/5 p-5 rounded-full shadow-inner">
                      <Folder className="w-10 h-10 text-slate-500" />
                    </div>
                    <p className="font-medium text-base">
                      Nenhum item encontrado para este filtro
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow
                  key={product.id}
                  className="hover:bg-white/5 border-white/5 transition-colors"
                >
                  <TableCell className="pl-6">
                    <Checkbox
                      checked={selectedRows.has(product.id)}
                      onCheckedChange={(checked) =>
                        toggleSelectRow(product.id, checked as boolean)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 border border-white/10 rounded-lg shrink-0 bg-black/40">
                        <AvatarImage
                          src={
                            product.imageQuery.startsWith('http') ||
                            product.imageQuery.startsWith('data:')
                              ? product.imageQuery
                              : `https://img.usecurling.com/p/100/100?q=${product.imageQuery}`
                          }
                          alt={product.name}
                          className="object-cover rounded-lg"
                        />
                        <AvatarFallback className="rounded-lg bg-white/5 text-slate-400">
                          {product.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-semibold text-white text-sm">
                          {product.name}
                        </span>
                        {product.stock < 3 && (
                          <div className="flex items-center text-xs text-sky-400 font-medium mt-1">
                            <AlertTriangle className="w-3 h-3 mr-1.5" /> Baixo
                            Estoque
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        'font-medium rounded-md px-2',
                        categoryColors[product.category] ||
                          categoryColors['Institucional'],
                      )}
                    >
                      {product.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium text-slate-300">
                    {formatCurrency(product.unitCost)}
                  </TableCell>
                  <TableCell>
                    {product.hasGrid && product.grid ? (
                      <div className="flex gap-3">
                        {['P', 'M', 'G', 'GG'].map((size) => (
                          <div
                            key={size}
                            className="flex flex-col items-center gap-1.5"
                          >
                            <span
                              className={cn(
                                'text-[10px] font-bold',
                                product.grid![size] === 0
                                  ? 'text-slate-500'
                                  : 'text-slate-300',
                              )}
                            >
                              {size}
                            </span>
                            <div className="flex items-center gap-0.5 bg-black/20 rounded border border-white/5">
                              <button
                                className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 rounded-l"
                                onClick={() =>
                                  handleAdjustStock(product.id, -1, size)
                                }
                                disabled={product.grid![size] <= 0}
                              >
                                <ArrowDown className="w-3 h-3" />
                              </button>
                              <span
                                className={cn(
                                  'text-xs font-semibold w-5 text-center',
                                  product.grid![size] < 3
                                    ? 'text-sky-400'
                                    : 'text-slate-200',
                                )}
                              >
                                {product.grid![size]}
                              </span>
                              <button
                                className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 rounded-r"
                                onClick={() =>
                                  handleAdjustStock(product.id, 1, size)
                                }
                              >
                                <ArrowUp className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-lg bg-black/20 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"
                          onClick={() => handleAdjustStock(product.id, -1)}
                          disabled={product.stock <= 0}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <span
                          className={cn(
                            'text-base w-10 text-center flex items-center justify-center',
                            product.stock < 3
                              ? 'text-sky-400 font-bold bg-sky-500/10 px-1 py-0.5 rounded border border-sky-500/20'
                              : 'text-white font-semibold',
                          )}
                        >
                          {product.stock}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-lg bg-black/20 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"
                          onClick={() => handleAdjustStock(product.id, 1)}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={product.isActive}
                        onCheckedChange={() =>
                          handleToggleStatus(product.id, product.isActive)
                        }
                      />
                      <span
                        className={cn(
                          'text-xs font-medium px-2 py-0.5 rounded border',
                          product.isActive
                            ? 'bg-primary/20 text-primary border-primary/30'
                            : 'bg-white/5 text-slate-400 border-white/10',
                        )}
                      >
                        {product.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0 rounded-lg hover:bg-white/10"
                        >
                          <span className="sr-only">Menu</span>
                          <MoreHorizontal className="h-4 w-4 text-slate-300" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEdit(product)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Editar Detalhes
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(product)}
                          className="text-slate-400 focus:text-slate-300 focus:bg-white/5"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir Item
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ProductDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        product={selectedProduct}
        onSave={handleSaveProduct}
      />

      <AlertDialog
        open={!!deleteProductData}
        onOpenChange={(open) => !open && setDeleteProductData(null)}
      >
        <AlertDialogContent className="rounded-2xl glass-panel">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Tem certeza absoluta?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Essa ação não pode ser desfeita. Isso excluirá permanentemente o
              item
              <span className="font-bold text-white">
                {' '}
                {deleteProductData?.name}{' '}
              </span>
              do inventário.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl border-white/10 bg-transparent text-white hover:bg-white/5">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700"
            >
              Sim, excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
