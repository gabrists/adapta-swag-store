import { useState } from 'react'
import { ShoppingCart, X, Plus, Minus, Trash2 } from 'lucide-react'
import useSwagStore from '@/stores/useSwagStore'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CheckoutDialog } from '@/components/CheckoutDialog'
import { useToast } from '@/hooks/use-toast'

export function CartSheet() {
  const { cart, removeFromCart, updateCartItemQuantity, checkoutCart } =
    useSwagStore()
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0)

  const handleCheckoutConfirm = (values: any) => {
    checkoutCart(values.user, values.destination, values.date)
    setIsCheckoutOpen(false)
    setIsOpen(false)
    toast({
      title: 'Pedido realizado!',
      description: 'Retirada de brindes concluída com sucesso.',
      className: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    })
  }

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="relative">
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full shadow-sm border border-white">
                {totalItems}
              </span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-md flex flex-col h-full">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" /> Carrinho de Retirada
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-hidden flex flex-col mt-4">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4 text-muted-foreground p-8">
                <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center">
                  <ShoppingCart className="h-8 w-8 text-slate-300" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">
                    Seu carrinho está vazio
                  </p>
                  <p className="text-sm mt-1">
                    Adicione itens da vitrine para realizar uma retirada.
                  </p>
                </div>
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Voltar para Vitrine
                </Button>
              </div>
            ) : (
              <ScrollArea className="flex-1 pr-4 -mr-4">
                <div className="space-y-4 pb-4">
                  {cart.map((item) => (
                    <div
                      key={`${item.productId}-${item.size}`}
                      className="flex gap-4 p-3 bg-white rounded-lg border border-slate-100 shadow-sm"
                    >
                      <Avatar className="h-16 w-16 border border-slate-200 rounded-md">
                        <AvatarImage
                          src={
                            item.productImageQuery.startsWith('http') ||
                            item.productImageQuery.startsWith('data:')
                              ? item.productImageQuery
                              : `https://img.usecurling.com/p/100/100?q=${item.productImageQuery}&dpr=2`
                          }
                          alt={item.productName}
                          className="object-cover"
                        />
                        <AvatarFallback className="rounded-md">
                          {item.productName.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="font-semibold text-sm line-clamp-2 leading-tight">
                              {item.productName}
                            </h4>
                            <button
                              onClick={() =>
                                removeFromCart(item.productId, item.size)
                              }
                              className="text-slate-400 hover:text-red-500 transition-colors p-1 -mr-1"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          {item.size && (
                            <Badge
                              variant="secondary"
                              className="mt-1 text-[10px] px-1.5 h-5 bg-slate-100 text-slate-600 border border-slate-200"
                            >
                              Tamanho: {item.size}
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-3">
                            <button
                              className="h-6 w-6 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-50"
                              onClick={() =>
                                updateCartItemQuantity(
                                  item.productId,
                                  item.quantity - 1,
                                  item.size,
                                )
                              }
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="text-sm font-semibold w-6 text-center tabular-nums">
                              {item.quantity}
                            </span>
                            <button
                              className="h-6 w-6 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-50"
                              onClick={() =>
                                updateCartItemQuantity(
                                  item.productId,
                                  item.quantity + 1,
                                  item.size,
                                )
                              }
                              disabled={item.quantity >= item.maxStock}
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>

          {cart.length > 0 && (
            <SheetFooter className="mt-auto border-t pt-4">
              <div className="w-full space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Total de itens</span>
                  <span className="font-bold text-lg">{totalItems}</span>
                </div>
                <Button
                  className="w-full h-12 text-base"
                  onClick={() => setIsCheckoutOpen(true)}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Finalizar Retirada
                </Button>
              </div>
            </SheetFooter>
          )}
        </SheetContent>
      </Sheet>

      <CheckoutDialog
        open={isCheckoutOpen}
        onOpenChange={setIsCheckoutOpen}
        onConfirm={handleCheckoutConfirm}
        totalItems={totalItems}
      />
    </>
  )
}
