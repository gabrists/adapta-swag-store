import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CheckoutDialog } from '@/components/CheckoutDialog'
import { cn } from '@/lib/utils'

export function CartSheet() {
  const { cart, removeFromCart, updateCartItemQuantity, checkoutCart } =
    useSwagStore()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0)

  const handleCheckoutConfirm = async (values: { destination: string }) => {
    try {
      await checkoutCart(values.destination)
      setIsCheckoutOpen(false)
      setIsOpen(false)
      // Redirect to orders page after successful checkout
      navigate('/orders')
    } catch (error) {
      // Error is handled in store (toast displayed there)
      console.error('Checkout failed', error)
    }
  }

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="relative border-slate-200 hover:bg-slate-50"
          >
            <ShoppingCart className="h-5 w-5 text-slate-700" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#0E9C8B] text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full shadow-sm border border-white">
                {totalItems}
              </span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-md flex flex-col h-full bg-white">
          <SheetHeader className="border-b pb-4 px-2">
            <SheetTitle className="flex items-center gap-2 text-[#0E9C8B]">
              <ShoppingCart className="h-5 w-5" /> Sua Sacola
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-hidden flex flex-col mt-4">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4 text-muted-foreground p-8">
                <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-2">
                  <ShoppingCart className="h-8 w-8 text-slate-300" />
                </div>
                <div>
                  <p className="font-medium text-slate-900 text-lg">
                    Sua sacola está vazia
                  </p>
                  <p className="text-sm mt-1 text-slate-500">
                    Adicione itens da vitrine para solicitar ao RH.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  className="mt-4 border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                  Voltar para a Vitrine
                </Button>
              </div>
            ) : (
              <ScrollArea className="flex-1 pr-4 -mr-4">
                <div className="space-y-4 pb-4 px-1">
                  {cart.map((item) => (
                    <div
                      key={`${item.productId}-${item.size}`}
                      className="flex gap-4 p-3 bg-white rounded-lg border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <Avatar className="h-16 w-16 border border-slate-100 rounded-md shrink-0">
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
                        <AvatarFallback className="rounded-md bg-slate-100 text-slate-500">
                          {item.productName.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <h4 className="font-semibold text-sm line-clamp-2 leading-tight text-slate-900">
                              {item.productName}
                            </h4>
                            {item.size && (
                              <Badge
                                variant="secondary"
                                className="mt-1.5 text-[10px] px-1.5 h-5 bg-slate-100 text-slate-600 border border-slate-200 font-medium"
                              >
                                Tamanho: {item.size}
                              </Badge>
                            )}
                          </div>
                          <button
                            onClick={() =>
                              removeFromCart(item.productId, item.size)
                            }
                            className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-all -mr-1"
                            aria-label="Remover item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-3 bg-slate-50 rounded-full p-0.5 border border-slate-200">
                            <button
                              className="h-6 w-6 rounded-full flex items-center justify-center hover:bg-white hover:shadow-sm text-slate-600 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:shadow-none transition-all"
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
                            <span className="text-sm font-semibold w-6 text-center tabular-nums text-slate-900">
                              {item.quantity}
                            </span>
                            <button
                              className="h-6 w-6 rounded-full flex items-center justify-center hover:bg-white hover:shadow-sm text-slate-600 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:shadow-none transition-all"
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
            <SheetFooter className="mt-auto border-t pt-6 bg-white pb-2 sm:pb-0">
              <div className="w-full space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium text-sm">
                    Total de itens
                  </span>
                  <span className="font-bold text-xl text-slate-900">
                    {totalItems}
                  </span>
                </div>
                <Button
                  className="w-full h-12 text-base font-semibold shadow-md bg-[#0E9C8B] hover:bg-[#0E9C8B]/90 transition-all active:scale-[0.99]"
                  onClick={() => setIsCheckoutOpen(true)}
                >
                  Finalizar Solicitação
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
