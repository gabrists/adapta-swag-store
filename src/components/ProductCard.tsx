import { useState } from 'react'
import { Product } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Plus, Check, Minus, ShoppingCart, ExternalLink } from 'lucide-react'
import useAuthStore from '@/stores/useAuthStore'
import { useToast } from '@/hooks/use-toast'

interface ProductCardProps {
  product: Product
  onAddToCart: (product: Product, size?: string, quantity?: number) => void
  hasOrdered?: boolean
}

export function ProductCard({
  product,
  onAddToCart,
  hasOrdered = false,
}: ProductCardProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [quantity, setQuantity] = useState<number>(1)
  const { user } = useAuthStore()
  const { toast } = useToast()

  const isAdmin = user?.role === 'admin'
  const isOutOfStock = product.stock === 0

  const getDisplayStock = () => {
    if (product.hasGrid && selectedSize && product.grid) {
      return product.grid[selectedSize] || 0
    }
    return product.stock
  }

  const currentStock = getDisplayStock()
  const displayLowStock = currentStock > 0 && currentStock < 3

  // Single quota limits max quantity to 1
  const maxQuantity = product.isSingleQuota ? 1 : currentStock

  // Determine image source: URL, Data URI, or Placeholder Query
  const imageUrl =
    product.imageQuery.startsWith('http') ||
    product.imageQuery.startsWith('data:')
      ? product.imageQuery
      : `https://img.usecurling.com/p/400/300?q=${product.imageQuery}&dpr=2`

  const handleSizeSelect = (size: string, stock: number) => {
    if (stock > 0) {
      setSelectedSize(size)
      // Adjust quantity down if current quantity exceeds new size's stock
      if (quantity > stock) {
        setQuantity(stock)
      }
    }
  }

  // Disable interaction if out of stock, requires size selection, or already ordered single quota
  const isDisabled =
    isOutOfStock ||
    (product.hasGrid && !selectedSize) ||
    (product.isSingleQuota && hasOrdered)

  const isStepperDisabled = isDisabled

  const handleAddToCartClick = () => {
    onAddToCart(product, selectedSize || undefined, quantity)
    setQuantity(1)
  }

  return (
    <Card className="overflow-hidden border-slate-200 dark:border-white/5 bg-white dark:bg-[#081a17]/60 glass-panel glass-panel-hover flex flex-col h-full rounded-2xl group">
      <div className="aspect-[4/3] relative overflow-hidden bg-slate-100 dark:bg-black/40">
        <img
          src={imageUrl}
          alt={product.name}
          className={cn(
            'w-full h-full object-cover transition-transform duration-500 group-hover:scale-105',
            isOutOfStock && 'grayscale opacity-50',
          )}
          loading="lazy"
        />
        {/* Subtle inner shadow overlay */}
        <div className="absolute inset-0 shadow-[inset_0_-20px_40px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_-20px_40px_rgba(0,0,0,0.5)] pointer-events-none" />

        <div className="absolute top-3 left-3">
          <Badge
            variant="secondary"
            className="bg-white/90 dark:bg-black/50 text-slate-900 dark:text-white backdrop-blur-md shadow-sm font-medium border border-slate-200 dark:border-white/10"
          >
            {product.category}
          </Badge>
        </div>
        {product.isSingleQuota && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-[#0E9C8B]/90 dark:bg-primary/90 text-white backdrop-blur-md shadow-[0_0_10px_rgba(14,156,139,0.3)] dark:shadow-[0_0_10px_rgba(20,240,214,0.3)] font-medium border-none">
              Cota Única
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-5 space-y-4 flex-grow">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-semibold text-lg leading-tight text-slate-900 dark:text-white line-clamp-2 min-h-[3rem]">
            {product.name}
          </h3>
        </div>

        {product.hasGrid && product.grid && (
          <div className="flex flex-wrap gap-2">
            {['P', 'M', 'G', 'GG'].map((size) => {
              const sizeStock = product.grid![size] || 0
              const hasStock = sizeStock > 0
              const isSelected = selectedSize === size

              return (
                <button
                  key={size}
                  onClick={() => handleSizeSelect(size, sizeStock)}
                  disabled={!hasStock}
                  className={cn(
                    'w-9 h-9 rounded-full text-xs font-bold transition-all border flex items-center justify-center',
                    isSelected
                      ? 'bg-[#0E9C8B]/10 dark:bg-primary/20 text-[#0E9C8B] dark:text-primary border-[#0E9C8B] dark:border-primary shadow-[0_0_10px_rgba(14,156,139,0.2)] dark:shadow-[0_0_10px_rgba(20,240,214,0.3)]'
                      : hasStock
                        ? 'bg-white dark:bg-black/20 text-slate-700 dark:text-white border-slate-200 dark:border-white/10 hover:border-[#0E9C8B]/50 hover:text-[#0E9C8B] dark:hover:border-primary/50 dark:hover:text-primary hover:bg-[#0E9C8B]/5 dark:hover:bg-primary/10'
                        : 'bg-slate-50 dark:bg-black/10 text-slate-400 dark:text-white border-slate-200 dark:border-white/5 cursor-not-allowed line-through opacity-50',
                  )}
                >
                  {size}
                </button>
              )
            })}
          </div>
        )}

        <div className="flex items-center gap-2">
          {product.hasGrid && !selectedSize && !isOutOfStock ? (
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Selecione um tamanho
            </span>
          ) : (
            <>
              {isOutOfStock ? (
                <Badge
                  variant="outline"
                  className="bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-gray-400 border-slate-200 dark:border-white/10"
                >
                  Esgotado
                </Badge>
              ) : displayLowStock ? (
                <Badge
                  variant="outline"
                  className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20 animate-pulse"
                >
                  Acabando: {currentStock} un
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="bg-[#0E9C8B]/10 dark:bg-primary/10 text-[#0E9C8B] dark:text-primary border-[#0E9C8B]/20 dark:border-primary/20"
                >
                  {selectedSize && (
                    <span className="mr-1 font-bold">{selectedSize}:</span>
                  )}
                  Disponível: {currentStock} un
                </Badge>
              )}
            </>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-0 mt-auto flex flex-row items-center w-full">
        {/* Quantity Stepper - Hidden when out of stock or size not selected */}
        {!isOutOfStock && (
          <div
            className={cn(
              'transition-all duration-300 ease-in-out overflow-hidden shrink-0 flex items-center',
              product.hasGrid && !selectedSize
                ? 'max-w-0 opacity-0 mr-0'
                : 'max-w-[120px] opacity-100 mr-3',
            )}
          >
            <div
              className={cn(
                'flex items-center shrink-0 bg-slate-50 dark:bg-black/20 rounded-xl p-1 border border-slate-200 dark:border-white/5 w-[104px] justify-between',
                isStepperDisabled && 'opacity-50 pointer-events-none',
              )}
            >
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 rounded-lg text-slate-700 dark:text-white hover:bg-white dark:hover:bg-white/10"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1 || isStepperDisabled}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-sm font-semibold w-6 shrink-0 text-center tabular-nums text-slate-900 dark:text-white select-none">
                {quantity}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 rounded-lg text-slate-700 dark:text-white hover:bg-white dark:hover:bg-white/10"
                onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
                disabled={quantity >= maxQuantity || isStepperDisabled}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {isOutOfStock && isAdmin ? (
          <Button
            className="flex-1 font-medium active:scale-[0.98] transition-all rounded-xl shadow-md min-w-0 bg-transparent border border-orange-500 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10"
            onClick={() => {
              if (!product.supplierUrl) {
                toast({
                  description:
                    'Nenhum contato de fornecedor cadastrado para este item.',
                  variant: 'destructive',
                })
              } else {
                window.open(product.supplierUrl, '_blank')
              }
            }}
          >
            <ExternalLink className="w-4 h-4 mr-1 sm:mr-2 shrink-0" />
            <span className="truncate text-xs sm:text-sm">Repor Estoque</span>
          </Button>
        ) : (
          <Button
            variant={
              product.hasGrid &&
              !selectedSize &&
              !isOutOfStock &&
              !(hasOrdered && product.isSingleQuota)
                ? 'ghost'
                : 'default'
            }
            className={cn(
              'flex-1 font-medium active:scale-[0.98] transition-all duration-300 rounded-xl min-w-0 border',
              hasOrdered && product.isSingleQuota
                ? 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-white cursor-not-allowed hover:bg-slate-100 dark:hover:bg-white/10 shadow-none border-slate-200 dark:border-white/5'
                : isOutOfStock
                  ? 'bg-slate-200 dark:bg-gray-700 text-slate-500 dark:text-gray-300 cursor-not-allowed hover:bg-slate-200 dark:hover:bg-gray-700 shadow-none border-transparent'
                  : product.hasGrid && !selectedSize
                    ? 'text-slate-600 dark:text-slate-300 shadow-sm border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-100 cursor-default'
                    : 'bg-[#0E9C8B] text-white hover:bg-[#09695d] dark:btn-primary-glow shadow-md border-transparent disabled:opacity-50',
            )}
            onClick={handleAddToCartClick}
            disabled={isDisabled}
          >
            {product.isSingleQuota && hasOrdered ? (
              <>
                <Check className="w-4 h-4 mr-1 sm:mr-2 shrink-0" />
                <span className="truncate text-xs sm:text-sm">Resgatado</span>
              </>
            ) : isOutOfStock ? (
              <span className="truncate text-xs sm:text-sm">Indisponível</span>
            ) : product.hasGrid && !selectedSize ? (
              <span className="truncate text-xs sm:text-sm">
                Selec. Tamanho
              </span>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 mr-1 sm:mr-2 shrink-0" />
                <span className="truncate text-xs sm:text-sm">Adicionar</span>
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
