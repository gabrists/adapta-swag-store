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
      navigate('/orders')
    } catch (error) {
      console.error('Checkout failed', error)
    }
  }

  const handleGoToStore = () => {
    setIsOpen(false)
    navigate('/')
  }

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="relative border-white/10 hover:bg-white/10 bg-black/20 text-white"
          >
            <ShoppingCart className="h-5 w-5 text-slate-200" />
            {totalItems > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center rounded-full p-0 text-[10px] bg-primary border-none shadow-[0_0_10px_rgba(20,240,214,0.5)] pointer-events-none text-primary-foreground font-bold">
                {totalItems}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-md flex flex-col h-full bg-[#081a17]/90 backdrop-blur-2xl border-white/10 text-white">
          <SheetHeader className="border-b border-white/10 pb-4 px-2">
            <SheetTitle className="flex items-center gap-2 text-white font-bold">
              <ShoppingCart className="h-5 w-5 text-primary" /> Sua Sacola
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-hidden flex flex-col mt-4">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4 text-slate-400 p-8">
                <div className="h-20 w-20 bg-white/5 rounded-full flex items-center justify-center mb-2 shadow-inner">
                  <ShoppingCart className="h-10 w-10 text-slate-500" />
                </div>
                <div>
                  <p className="font-semibold text-white text-xl">
                    Sua sacola está vazia
                  </p>
                  <p className="text-sm mt-2 text-slate-400">
                    Adicione itens da vitrine para solicitar ao RH.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleGoToStore}
                  className="mt-6 btn-secondary-outline"
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
                      className="flex gap-4 p-4 glass-panel rounded-2xl hover:border-primary/30 transition-colors group"
                    >
                      <Avatar className="h-20 w-20 border border-white/10 rounded-xl shrink-0 bg-black/40">
                        <AvatarImage
                          src={
                            item.productImageQuery.startsWith('http') ||
                            item.productImageQuery.startsWith('data:')
                              ? item.productImageQuery
                              : `https://img.usecurling.com/p/100/100?q=${item.productImageQuery}&dpr=2`
                          }
                          alt={item.productName}
                          className="object-cover rounded-xl"
                        />
                        <AvatarFallback className="rounded-xl bg-white/5 text-slate-400">
                          {item.productName.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <h4 className="font-semibold text-sm line-clamp-2 leading-tight text-white">
                              {item.productName}
                            </h4>
                            {item.size && (
                              <Badge
                                variant="secondary"
                                className="mt-2 text-[10px] px-2 h-5 bg-white/10 text-slate-300 border border-white/5 font-medium"
                              >
                                Tamanho: {item.size}
                              </Badge>
                            )}
                          </div>
                          <button
                            onClick={() =>
                              removeFromCart(item.productId, item.size)
                            }
                            className="text-slate-400 hover:text-red-400 hover:bg-red-500/10 p-1.5 rounded-lg transition-all -mr-1"
                            aria-label="Remover item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-3 bg-black/30 rounded-full p-1 border border-white/10">
                            <button
                              className="h-7 w-7 rounded-full flex items-center justify-center hover:bg-white/10 text-slate-300 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
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
                            <span className="text-sm font-semibold w-6 text-center tabular-nums text-white">
                              {item.quantity}
                            </span>
                            <button
                              className="h-7 w-7 rounded-full flex items-center justify-center hover:bg-white/10 text-slate-300 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
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
            <SheetFooter className="mt-auto border-t border-white/10 pt-6 pb-2 sm:pb-0">
              <div className="w-full space-y-5">
                <div className="flex justify-between items-center px-1">
                  <span className="text-slate-400 font-medium text-sm">
                    Total de itens
                  </span>
                  <span className="font-bold text-2xl text-white">
                    {totalItems}
                  </span>
                </div>
                <Button
                  className="w-full h-12 text-base font-semibold btn-primary-glow rounded-xl"
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
