import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import useSwagStore from '@/stores/useSwagStore'
import { ProductCard } from '@/components/ProductCard'
import { CheckoutDialog } from '@/components/CheckoutDialog'
import { Product, Category } from '@/types'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

const CATEGORIES: Category[] = [
  'Todos',
  'Vendas',
  'RH',
  'Marketing',
  'Tech',
  'Institucional',
]

export default function Index() {
  const { products, isLoading, withdrawItem } = useSwagStore()
  const { toast } = useToast()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<Category>('Todos')
  const [checkoutProduct, setCheckoutProduct] = useState<Product | null>(null)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
      const matchesCategory =
        selectedCategory === 'Todos' || product.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [products, searchQuery, selectedCategory])

  const handleSelectProduct = (product: Product) => {
    setCheckoutProduct(product)
    setIsCheckoutOpen(true)
  }

  const handleConfirmCheckout = (values: any) => {
    if (checkoutProduct) {
      withdrawItem(
        checkoutProduct.id,
        values.user,
        values.destination,
        values.date,
      )

      toast({
        title: 'Retirada confirmada!',
        description: `${checkoutProduct.name} foi registrado com sucesso.`,
        duration: 3000,
        className: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex gap-4">
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-[300px] w-full rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header Section */}
      <section className="space-y-4 bg-white p-4 -mx-4 md:mx-0 md:rounded-xl md:shadow-sm md:border md:border-slate-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="O que você procura hoje?"
            className="pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex space-x-2 pb-2">
            {CATEGORIES.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  'rounded-full px-4 text-xs font-medium border-slate-200',
                  selectedCategory === category
                    ? 'shadow-md shadow-primary/20'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                )}
              >
                {category}
              </Button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="invisible" />
        </ScrollArea>
      </section>

      {/* Products Grid */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800">
            {selectedCategory === 'Todos' ? 'Todos os itens' : selectedCategory}
          </h2>
          <Badge variant="secondary" className="bg-slate-100 text-slate-500">
            {filteredProducts.length} itens
          </Badge>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={handleSelectProduct}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
              <Search className="w-8 h-8 text-slate-300" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-slate-900">
                Nenhum item encontrado
              </h3>
              <p className="text-slate-500 text-sm">
                Tente mudar o filtro ou a busca.
              </p>
            </div>
          </div>
        )}
      </section>

      <CheckoutDialog
        open={isCheckoutOpen}
        onOpenChange={setIsCheckoutOpen}
        product={checkoutProduct}
        onConfirm={handleConfirmCheckout}
      />
    </div>
  )
}
