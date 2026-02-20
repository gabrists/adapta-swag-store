import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import useSwagStore from '@/stores/useSwagStore'
import useAuthStore from '@/stores/useAuthStore'
import { ProductCard } from '@/components/ProductCard'
import { Product } from '@/types'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

export default function Index() {
  const { products, orders, isLoading, addToCart } = useSwagStore()
  const { user } = useAuthStore()
  const { toast } = useToast()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Todos')

  const categories = ['Todos', 'Vestuário', 'Utensílios', 'Kits']

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Filter out inactive products for the storefront
      if (!product.isActive) return false

      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase())

      const matchesCategory =
        selectedCategory === 'Todos' || product.category === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [products, searchQuery, selectedCategory])

  const handleAddToCart = (
    product: Product,
    size?: string,
    quantity: number = 1,
  ) => {
    addToCart(product, quantity, size)
    toast({
      title: 'Adicionado ao carrinho',
      description: `${quantity}x ${product.name} ${size ? `(${size})` : ''} ${quantity > 1 ? 'foram adicionados' : 'foi adicionado'}.`,
      duration: 2000,
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-6 w-full max-w-7xl mx-auto">
        <div className="flex gap-4">
          <Skeleton className="h-12 w-full rounded-xl bg-slate-200 dark:bg-white/5" />
        </div>
        <div className="flex gap-2 pb-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton
              key={i}
              className="h-9 w-24 rounded-full bg-slate-200 dark:bg-white/5"
            />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Skeleton
              key={i}
              className="h-[350px] w-full rounded-2xl bg-slate-200 dark:bg-white/5"
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 md:space-y-8 w-full max-w-7xl mx-auto pb-12">
      {/* Header Section */}
      <section className="glass-panel p-4 -mx-4 md:mx-0 md:rounded-xl bg-white dark:bg-[#081a17]/60">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 dark:text-white" />
          <Input
            placeholder="O que você procura hoje?"
            className="pl-11 h-12 text-lg rounded-xl bg-white dark:bg-black/20 border-slate-200 dark:border-white/10 focus-visible:border-[#0E9C8B] dark:focus-visible:border-primary/50 focus-visible:ring-[#0E9C8B]/50 dark:focus-visible:ring-primary/50 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/40"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </section>

      {/* Category Navigation (Pills) */}
      <section className="flex gap-2 overflow-x-auto py-4 px-4 -mx-4 md:px-6 md:-mx-6 scrollbar-none">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={cn(
              'px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 border',
              selectedCategory === category
                ? 'bg-[#0E9C8B] text-white border-[#0E9C8B] dark:btn-primary-glow shadow-md'
                : 'bg-white dark:bg-white/5 text-slate-700 dark:text-white border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white',
            )}
          >
            {category}
          </button>
        ))}
      </section>

      {/* Products Grid */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Todos os itens
          </h2>
          <Badge
            variant="secondary"
            className="bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white border border-slate-200 dark:border-transparent rounded-md px-3 py-1"
          >
            {filteredProducts.length} itens
          </Badge>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map((product, idx) => {
              const hasOrdered =
                user && product.isSingleQuota
                  ? orders.some(
                      (o) =>
                        o.employeeId === user.id &&
                        o.itemId === product.id &&
                        (o.status === 'Pendente' || o.status === 'Entregue'),
                    )
                  : false

              return (
                <div
                  key={product.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <ProductCard
                    product={product}
                    onAddToCart={handleAddToCart}
                    hasOrdered={hasOrdered}
                  />
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-4 glass-panel rounded-2xl bg-white dark:bg-[#081a17]/60 border-slate-200 dark:border-white/5">
            <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center shadow-inner border border-slate-200 dark:border-transparent">
              <Search className="w-10 h-10 text-slate-400 dark:text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                Nenhum item encontrado
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 max-w-sm mx-auto">
                Tente mudar a busca ou a categoria para encontrar o que procura.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
