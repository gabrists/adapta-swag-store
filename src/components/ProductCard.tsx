import { useState } from 'react'
import { Product } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { ShoppingCart } from 'lucide-react'

interface ProductCardProps {
  product: Product
  onAddToCart: (product: Product, size?: string) => void
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
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

  return (
    <Card className="overflow-hidden border-border/50 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group bg-white flex flex-col h-full rounded-xl">
      <div className="aspect-[4/3] relative overflow-hidden bg-muted">
        <img
          src={imageUrl}
          alt={product.name}
          className={cn(
            'w-full h-full object-cover transition-transform duration-500 group-hover:scale-105',
            isOutOfStock && 'grayscale opacity-60',
          )}
          loading="lazy"
        />
        <div className="absolute top-3 left-3">
          <Badge
            variant="secondary"
            className="bg-white/90 text-slate-700 backdrop-blur-sm shadow-sm font-medium"
          >
            {product.category}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4 space-y-3 flex-grow">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-semibold text-lg leading-tight text-slate-800 line-clamp-2 min-h-[3rem]">
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
                    'w-8 h-8 rounded-full text-xs font-bold transition-all border',
                    isSelected
                      ? 'bg-primary text-primary-foreground border-primary ring-2 ring-offset-2 ring-primary/50'
                      : hasStock
                        ? 'bg-white text-slate-700 border-slate-200 hover:border-primary hover:text-primary'
                        : 'bg-slate-100 text-slate-300 border-slate-100 cursor-not-allowed line-through',
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
            <span className="text-sm text-slate-500">Selecione um tamanho</span>
          ) : (
            <>
              {currentStock === 0 ? (
                <Badge
                  variant="outline"
                  className="bg-slate-100 text-slate-500 border-slate-200"
                >
                  Esgotado
                </Badge>
              ) : displayLowStock ? (
                <Badge
                  variant="outline"
                  className="bg-red-50 text-red-600 border-red-200 animate-pulse"
                >
                  Acabando: {currentStock} un
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="bg-emerald-50 text-emerald-600 border-emerald-200"
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

      <CardFooter className="p-4 pt-0 mt-auto">
        <Button
          className="w-full bg-primary hover:bg-primary/90 text-white font-medium active:scale-95 transition-all rounded-lg"
          onClick={() => onAddToCart(product, selectedSize || undefined)}
          disabled={product.hasGrid ? !selectedSize : isOutOfStock}
        >
          {isOutOfStock ? (
            'Indisponível'
          ) : product.hasGrid && !selectedSize ? (
            'Selecione Tamanho'
          ) : (
            <>
              <ShoppingCart className="w-4 h-4 mr-2" />
              Adicionar
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
