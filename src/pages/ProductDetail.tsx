import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  Ruler,
  Star,
  ArrowLeft,
  ShoppingCart,
  Check,
  Minus,
  Plus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import useSwagStore from '@/stores/useSwagStore'
import useAuthStore from '@/stores/useAuthStore'
import { useToast } from '@/hooks/use-toast'
import { ProductReview } from '@/types'
import { cn } from '@/lib/utils'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { products, orders, isLoading, addToCart, fetchProductReviews } =
    useSwagStore()
  const { user } = useAuthStore()
  const { toast } = useToast()

  const [reviews, setReviews] = useState<ProductReview[]>([])
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [mainImage, setMainImage] = useState(0)

  useEffect(() => {
    if (id) fetchProductReviews(id).then(setReviews)
  }, [id, fetchProductReviews])

  const product = products.find((p) => p.id === id)

  if (isLoading || (!product && products.length === 0)) {
    return (
      <div className="w-full max-w-7xl mx-auto space-y-8 animate-pulse p-4 md:p-0">
        <Skeleton className="h-6 w-32 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <Skeleton className="aspect-square rounded-2xl w-full" />
          <Skeleton className="h-96 rounded-2xl w-full" />
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="py-24 text-center">
        <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
          Produto não encontrado
        </h2>
        <Button onClick={() => navigate('/')}>Voltar para Vitrine</Button>
      </div>
    )
  }

  const isOutOfStock = product.stock === 0
  const currentStock =
    product.hasGrid && selectedSize && product.grid
      ? product.grid[selectedSize]
      : product.stock
  const maxQuantity = product.isSingleQuota ? 1 : currentStock
  const hasOrdered =
    user && product.isSingleQuota
      ? orders.some(
          (o) =>
            o.employeeId === user.id &&
            o.itemId === product.id &&
            (o.status === 'Pendente' || o.status === 'Entregue'),
        )
      : false
  const isDisabled =
    isOutOfStock ||
    (product.hasGrid && !selectedSize) ||
    (product.isSingleQuota && hasOrdered)

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedSize || undefined)
    toast({
      title: 'Adicionado ao carrinho',
      description: `${quantity}x ${product.name} ${selectedSize ? `(${selectedSize})` : ''} adicionado com sucesso.`,
    })
    setQuantity(1)
  }

  const images =
    product.imageQuery.startsWith('http') ||
    product.imageQuery.startsWith('data:')
      ? [product.imageQuery, product.imageQuery, product.imageQuery]
      : [
          `https://img.usecurling.com/p/800/800?q=${product.imageQuery}&dpr=2`,
          `https://img.usecurling.com/p/800/800?q=${product.imageQuery}%20side&dpr=2`,
          `https://img.usecurling.com/p/800/800?q=${product.imageQuery}%20detail&dpr=2`,
        ]

  const sizeGuide = [
    { size: 'PP', chest: '50', waist: '48', length: '68' },
    { size: 'P', chest: '52', waist: '50', length: '70' },
    { size: 'M', chest: '54', waist: '52', length: '72' },
    { size: 'G', chest: '56', waist: '54', length: '74' },
    { size: 'GG', chest: '58', waist: '56', length: '76' },
  ]

  return (
    <div className="w-full max-w-7xl mx-auto pb-12 animate-fade-in-up">
      <Link
        to="/"
        className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-primary mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para vitrine
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16">
        <div className="flex flex-col gap-4 w-full">
          <div className="w-full aspect-square bg-slate-100 dark:bg-black/40 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/5 relative">
            <img
              src={images[mainImage]}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500"
            />
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-none pb-2">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setMainImage(i)}
                className={cn(
                  'relative rounded-xl overflow-hidden aspect-square border-2 shrink-0 w-20 transition-all',
                  mainImage === i
                    ? 'border-[#00CA7E] shadow-sm'
                    : 'border-transparent opacity-70 hover:opacity-100',
                )}
              >
                <img
                  src={img}
                  alt={`Thumb ${i}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col">
          <Badge
            variant="secondary"
            className="w-max mb-4 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white border-slate-200 dark:border-white/10"
          >
            {product.category}
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
            {product.name}
          </h1>

          <div className="flex items-center gap-3 mb-8">
            {product.isSingleQuota && (
              <Badge className="bg-[#00CA7E]/20 text-[#00CA7E] border-none">
                Cota Única
              </Badge>
            )}
            <Badge
              variant="outline"
              className={cn(
                isOutOfStock
                  ? 'text-red-500 border-red-200'
                  : 'text-emerald-600 border-emerald-200',
              )}
            >
              {isOutOfStock ? 'Esgotado' : `${currentStock} disponíveis`}
            </Badge>
          </div>

          {product.hasGrid && product.grid && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-slate-900 dark:text-white">
                  Tamanho
                </span>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="link"
                      className="text-[#00CA7E] h-auto p-0 text-sm font-medium"
                    >
                      <Ruler className="w-4 h-4 mr-1.5" /> Guia de Medidas
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Guia de Medidas (cm)</DialogTitle>
                    </DialogHeader>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tamanho</TableHead>
                          <TableHead>Tórax</TableHead>
                          <TableHead>Cintura</TableHead>
                          <TableHead>Compr.</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sizeGuide.map((row) => (
                          <TableRow key={row.size}>
                            <TableCell className="font-bold">
                              {row.size}
                            </TableCell>
                            <TableCell>{row.chest}</TableCell>
                            <TableCell>{row.waist}</TableCell>
                            <TableCell>{row.length}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="flex flex-wrap gap-3">
                {['P', 'M', 'G', 'GG'].map((size) => {
                  const hasStock = (product.grid![size] || 0) > 0
                  return (
                    <button
                      key={size}
                      onClick={() => hasStock && setSelectedSize(size)}
                      disabled={!hasStock}
                      className={cn(
                        'w-12 h-12 rounded-xl text-sm font-bold transition-all border flex items-center justify-center',
                        selectedSize === size
                          ? 'bg-[#00CA7E] text-white border-[#00CA7E] shadow-[0_4px_15px_rgba(0,202,126,0.3)]'
                          : hasStock
                            ? 'bg-white dark:bg-black/20 text-slate-700 dark:text-white border-slate-200 dark:border-white/10 hover:border-[#00CA7E]/50'
                            : 'bg-slate-50 dark:bg-black/10 text-slate-400 dark:text-white/30 border-slate-200 dark:border-white/5 cursor-not-allowed opacity-50 line-through',
                      )}
                    >
                      {size}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 mt-auto pt-6 border-t border-slate-200 dark:border-gray-800">
            {!isOutOfStock && (
              <div className="flex items-center bg-slate-50 dark:bg-black/20 rounded-xl p-1 border border-slate-200 dark:border-white/10 h-14">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1 || isDisabled}
                  className="h-full w-10 text-slate-600 dark:text-white"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-10 text-center font-semibold tabular-nums text-slate-900 dark:text-white">
                  {quantity}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setQuantity((q) => Math.min(maxQuantity, q + 1))
                  }
                  disabled={quantity >= maxQuantity || isDisabled}
                  className="h-full w-10 text-slate-600 dark:text-white"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            )}
            <Button
              className="flex-1 h-14 text-base font-bold btn-primary-glow rounded-xl gap-2"
              onClick={handleAddToCart}
              disabled={isDisabled}
            >
              {hasOrdered && product.isSingleQuota ? (
                <>
                  <Check className="w-5 h-5" /> Resgatado
                </>
              ) : isOutOfStock ? (
                'Indisponível'
              ) : product.hasGrid && !selectedSize ? (
                'Selecione o Tamanho'
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" /> Adicionar à Sacola
                </>
              )}
            </Button>
          </div>

          <div className="mt-12 space-y-8">
            <div className="border-t border-slate-200 dark:border-gray-800 pt-8">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                Detalhes do Item
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                {product.description ||
                  'Brinde exclusivo Adapta, escolhido especialmente para você.'}
              </p>
            </div>
            <div className="border-t border-slate-200 dark:border-gray-800 pt-8">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                Material
              </h3>
              <ul className="list-disc pl-5 text-slate-600 dark:text-slate-400 space-y-2 marker:text-primary">
                <li>Acabamento premium de alta durabilidade</li>
                <li>Design exclusivo Adapta</li>
                <li>Conforto e versatilidade garantidos</li>
              </ul>
            </div>
            <div className="border-t border-slate-200 dark:border-gray-800 pt-8">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                Por que escolhemos este brinde
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Nós sabemos que os detalhes fazem a diferença. Escolhemos este
                item para levar a cultura da Adapta para o seu dia a dia,
                combinando estilo, utilidade e um toque especial do nosso time.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-20 border-t border-slate-200 dark:border-gray-800 pt-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            O que o time achou?
          </h2>
          <Badge
            variant="secondary"
            className="bg-primary/10 text-primary border-none px-3 py-1 text-sm font-semibold"
          >
            {reviews.length} avaliações
          </Badge>
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-16 glass-panel rounded-3xl border-dashed">
            <Star className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-lg font-medium text-slate-900 dark:text-white">
              Nenhum feedback ainda
            </p>
            <p className="text-slate-500">
              Seja o primeiro a solicitar e avaliar este brinde!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((review) => (
              <Card
                key={review.id}
                className="glass-panel border-slate-200 dark:border-white/5 rounded-2xl bg-white dark:bg-white/[0.02]"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 border border-slate-200 dark:border-white/10">
                        <AvatarImage src={review.employeeAvatar} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {review.employeeName.substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white leading-tight">
                          {review.employeeName}
                        </div>
                        <div className="text-sm text-slate-500 font-medium">
                          {review.employeeDepartment}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            'w-4 h-4',
                            i < review.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-200 dark:text-slate-700',
                          )}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    "{review.comment}"
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
