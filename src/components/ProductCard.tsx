import { useState } from 'react'
import { Product } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Plus, Check } from 'lucide-react'

interface ProductCardProps {
  product: Product
  onAddToCart: (product: Product, size?: string) => void
  hasOrdered?: boolean
}

export function ProductCard({
  product,
  onAddToCart,
  hasOrdered = false,
}: ProductCardProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null)

  const isOutOfStock = product.stock === 0
  const isLowStock = product.stock > 0 && product.stock < 3

  // Determine image source: URL, Data URI, or Placeholder Query
  const imageUrl =
    product.imageQuery.startsWith('http') ||
    product.imageQuery.startsWith('data:')
      ? product.imageQuery
      : `https://img.usecurling.com/p/400/300?q=${product.imageQuery}&dpr=2`

  const handleSizeSelect = (size: string, stock: number) => {
    if (stock > 0) {
      setSelectedSize(size)
    }
  }

  const getDisplayStock = () => {
    if (product.hasGrid && selectedSize && product.grid) {
      return product.grid[selectedSize]
    }
    return product.stock
  }

  const currentStock = getDisplayStock()
  const displayLowStock = currentStock > 0 && currentStock < 3

  // Disable if single quota and already ordered
  const isDisabled =
    isOutOfStock ||
    (product.hasGrid && !selectedSize) ||
    (product.isSingleQuota && hasOrdered)

  return (
    <Card className="overflow-hidden border-white/5 bg-transparent glass-panel glass-panel-hover flex flex-col h-full rounded-2xl group">
      <div className="aspect-[4/3] relative overflow-hidden bg-black/40">
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
        <div className="absolute inset-0 shadow-[inset_0_-20px_40px_rgba(0,0,0,0.5)] pointer-events-none" />

        <div className="absolute top-3 left-3">
          <Badge
            variant="secondary"
            className="bg-black/50 text-white backdrop-blur-md shadow-sm font-medium border border-white/10"
          >
            {product.category}
          </Badge>
        </div>
        {product.isSingleQuota && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-primary/90 text-white backdrop-blur-md shadow-[0_0_10px_rgba(20,240,214,0.3)] font-medium border-none">
              Cota Única
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-5 space-y-4 flex-grow">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-semibold text-lg leading-tight text-white line-clamp-2 min-h-[3rem]">
            {product.name}
          </h3>
        </div>

        {product.hasGrid && product.grid && (
          <div className="flex flex-wrap gap-2">
            {['P', 'M', 'G', 'GG'].map((size) => {
              const sizeStock = product.grid![size]
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
                      ? 'bg-primary/20 text-primary border-primary shadow-[0_0_10px_rgba(20,240,214,0.3)]'
                      : hasStock
                        ? 'bg-black/20 text-[#ADADAD] border-white/10 hover:border-primary/50 hover:text-primary hover:bg-primary/10'
                        : 'bg-black/10 text-[#ADADAD] border-white/5 cursor-not-allowed line-through opacity-50',
                  )}
                >
                  {size}
                </button>
              )
            })}
          </div>
        )}

        <div className="flex items-center gap-2">
          {product.hasGrid && !selectedSize ? (
            <span className="text-sm text-[#ADADAD]">Selecione um tamanho</span>
          ) : (
            <>
              {currentStock === 0 ? (
                <Badge
                  variant="outline"
                  className="bg-white/5 text-[#ADADAD] border-white/10"
                >
                  Esgotado
                </Badge>
              ) : displayLowStock ? (
                <Badge
                  variant="outline"
                  className="bg-red-500/10 text-red-400 border-red-500/20 animate-pulse"
                >
                  Acabando: {currentStock} un
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="bg-primary/10 text-primary border-primary/20"
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

      <CardFooter className="p-5 pt-0 mt-auto">
        <Button
          className={cn(
            'w-full font-medium active:scale-[0.98] transition-all rounded-xl',
            hasOrdered && product.isSingleQuota
              ? 'bg-white/10 text-[#ADADAD] cursor-not-allowed hover:bg-white/10 shadow-none border border-white/5'
              : 'btn-primary-glow',
          )}
          onClick={() => onAddToCart(product, selectedSize || undefined)}
          disabled={isDisabled}
        >
          {product.isSingleQuota && hasOrdered ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Item já resgatado
            </>
          ) : isOutOfStock ? (
            'Indisponível'
          ) : product.hasGrid && !selectedSize ? (
            'Selecione Tamanho'
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Solicitar Resgate
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
