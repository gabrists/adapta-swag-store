import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import useSwagStore from '@/stores/useSwagStore'
import { ProductCard } from '@/components/ProductCard'
import { Product } from '@/types'
import { useToast } from '@/hooks/use-toast'

export default function Index() {
  const { products, isLoading, addToCart } = useSwagStore()
  const { toast } = useToast()

  const [searchQuery, setSearchQuery] = useState('')

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
      return matchesSearch
    })
  }, [products, searchQuery])

  const handleAddToCart = (product: Product, size?: string) => {
    addToCart(product, 1, size)
    toast({
      title: 'Adicionado ao carrinho',
      description: `${product.name} ${size ? `(${size})` : ''} foi adicionado.`,
      duration: 2000,
      className: 'bg-slate-900 text-white border-none',
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex gap-4">
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-[350px] w-full rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header Section */}
      <section className="bg-white p-4 -mx-4 md:mx-0 md:rounded-xl md:shadow-sm md:border md:border-slate-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="O que você procura hoje?"
            className="pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-colors rounded-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </section>

      {/* Products Grid */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800">Todos os itens</h2>
          <Badge
            variant="secondary"
            className="bg-slate-100 text-slate-500 rounded-md"
          >
            {filteredProducts.length} itens
          </Badge>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
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
              <p className="text-slate-500 text-sm">Tente mudar a busca.</p>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
