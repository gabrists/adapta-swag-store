import { Product } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface ProductCardProps {
  product: Product
  onSelect: (product: Product) => void
}

export function ProductCard({ product, onSelect }: ProductCardProps) {
  const isOutOfStock = product.stock === 0
  const isLowStock = product.stock > 0 && product.stock <= 5

  return (
    <Card className="overflow-hidden border-border/50 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group bg-white">
      <div className="aspect-[4/3] relative overflow-hidden bg-muted">
        <img
          src={`https://img.usecurling.com/p/400/300?q=${product.imageQuery}&dpr=2`}
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

      <CardContent className="p-4 space-y-2">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-semibold text-lg leading-tight text-slate-800 line-clamp-2 min-h-[3rem]">
            {product.name}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {isOutOfStock ? (
            <Badge
              variant="outline"
              className="bg-slate-100 text-slate-500 border-slate-200"
            >
              Esgotado
            </Badge>
          ) : isLowStock ? (
            <Badge
              variant="outline"
              className="bg-red-50 text-red-600 border-red-200 animate-pulse"
            >
              Acabando: {product.stock} un
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="bg-emerald-50 text-emerald-600 border-emerald-200"
            >
              Disponível
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full bg-primary hover:bg-primary/90 text-white font-medium active:scale-95 transition-all"
          onClick={() => onSelect(product)}
          disabled={isOutOfStock}
        >
          {isOutOfStock ? 'Indisponível' : 'Pegar Esse'}
        </Button>
      </CardFooter>
    </Card>
  )
}
