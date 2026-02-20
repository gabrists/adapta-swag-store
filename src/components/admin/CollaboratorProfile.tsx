import { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Collaborator } from '@/types'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { History, Package, Plus, Calendar, Box } from 'lucide-react'
import useSwagStore from '@/stores/useSwagStore'
import { ManualDeliveryDialog } from '@/components/admin/ManualDeliveryDialog'

interface CollaboratorProfileProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  collaborator: Collaborator | null
}

export function CollaboratorProfile({
  open,
  onOpenChange,
  collaborator,
}: CollaboratorProfileProps) {
  const { orders } = useSwagStore()
  const [showManualDelivery, setShowManualDelivery] = useState(false)

  if (!collaborator) return null

  // Filter and sort orders (newest first)
  const employeeOrders = orders
    .filter((o) => o.employeeId === collaborator.id && o.status === 'Entregue')
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )

  const totalItems = employeeOrders.reduce((acc, o) => acc + o.quantity, 0)

  const getImageSrc = (image?: string, query?: string) => {
    if (image && (image.startsWith('http') || image.startsWith('data:'))) {
      return image
    }
    const q = image || query || 'swag item'
    return `https://img.usecurling.com/p/100/100?q=${encodeURIComponent(q)}&dpr=2`
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="sm:max-w-md flex flex-col h-full p-0 gap-0 border-l shadow-xl">
          <SheetHeader className="p-6 bg-slate-50 border-b border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Package className="w-32 h-32" />
            </div>
            <SheetTitle className="sr-only">Perfil do Colaborador</SheetTitle>
            <div className="flex flex-col items-center relative z-10">
              <Avatar className="h-24 w-24 border-4 border-white shadow-md mb-4 ring-1 ring-slate-200">
                <AvatarImage
                  src={collaborator.avatarUrl}
                  alt={collaborator.name}
                  className="object-cover"
                />
                <AvatarFallback className="text-2xl font-bold text-[#0E9C8B] bg-[#0E9C8B]/10">
                  {collaborator.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold text-slate-900 text-center">
                {collaborator.name}
              </h2>
              <div className="flex items-center gap-2 mt-1 text-sm text-[#ADADAD]">
                <span className="font-medium text-[#ADADAD]">
                  {collaborator.role}
                </span>
                <span className="text-[#ADADAD]">•</span>
                <span>{collaborator.department}</span>
              </div>

              <div className="mt-6 flex items-center gap-6">
                <div className="flex flex-col items-center">
                  <span className="text-xs text-[#ADADAD] font-medium uppercase tracking-wider mb-1">
                    Itens Recebidos
                  </span>
                  <Badge
                    variant="secondary"
                    className="text-lg px-4 py-1 bg-white border border-slate-200 text-[#0E9C8B] shadow-sm"
                  >
                    {totalItems}
                  </Badge>
                </div>
              </div>
            </div>
            <SheetDescription className="text-center mt-4 text-xs text-[#ADADAD]">
              Membro desde {format(new Date(), 'MMMM yyyy', { locale: ptBR })}
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-hidden flex flex-col bg-slate-50/30">
            <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between shadow-sm z-10">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <History className="w-4 h-4 text-[#0E9C8B]" />
                Histórico de Brindes
              </h3>
              <Badge
                variant="outline"
                className="text-xs font-normal text-[#ADADAD] bg-slate-50"
              >
                {employeeOrders.length} entregas
              </Badge>
            </div>

            <ScrollArea className="flex-1 p-5">
              {employeeOrders.length > 0 ? (
                <div className="space-y-0 pl-2">
                  {employeeOrders.map((order, idx) => {
                    const isLast = idx === employeeOrders.length - 1
                    return (
                      <div key={order.id} className="relative pb-8 last:pb-0">
                        {/* Timeline Connector */}
                        {!isLast && (
                          <div className="absolute left-[11px] top-3 bottom-0 w-px bg-slate-200" />
                        )}

                        {/* Timeline Dot */}
                        <div className="absolute left-0 top-3 h-[22px] w-[22px] rounded-full border-[3px] border-slate-50 bg-[#0E9C8B] shadow-sm flex items-center justify-center z-10">
                          <div className="h-1.5 w-1.5 bg-white rounded-full" />
                        </div>

                        {/* Card Content */}
                        <div className="ml-10">
                          <div className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden group">
                            <div className="p-3 flex items-start gap-3">
                              {/* Product Image */}
                              <Avatar className="h-12 w-12 border border-slate-100 rounded-md bg-slate-50">
                                <AvatarImage
                                  src={getImageSrc(
                                    order.productImage,
                                    order.productName,
                                  )}
                                  alt={order.productName}
                                  className="object-cover"
                                />
                                <AvatarFallback className="rounded-md text-[#ADADAD] text-xs font-bold bg-slate-100">
                                  {order.productName
                                    ?.substring(0, 2)
                                    .toUpperCase() || 'IT'}
                                </AvatarFallback>
                              </Avatar>

                              {/* Details */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <h4 className="text-sm font-bold text-slate-900 leading-tight line-clamp-2">
                                    {order.productName || 'Brinde sem nome'}
                                  </h4>
                                </div>

                                <div className="flex items-center gap-2 mt-1.5">
                                  <div className="flex items-center text-[11px] text-[#ADADAD] font-medium">
                                    <Calendar className="w-3 h-3 mr-1 text-[#ADADAD]" />
                                    {format(
                                      parseISO(order.createdAt),
                                      'dd/MM/yyyy',
                                    )}
                                  </div>
                                  {order.size && (
                                    <>
                                      <span className="text-[10px] text-[#ADADAD]">
                                        •
                                      </span>
                                      <Badge
                                        variant="secondary"
                                        className="text-[10px] px-1 h-4 bg-slate-100 text-[#ADADAD] border-none"
                                      >
                                        Tam: {order.size}
                                      </Badge>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            <Separator className="bg-slate-50" />

                            <div className="bg-slate-50/50 px-3 py-2 flex items-center justify-between text-xs">
                              <span className="text-[#ADADAD] flex items-center gap-1.5">
                                <Box className="w-3 h-3" />
                                Entregue
                              </span>
                              <Badge
                                variant="default"
                                className="bg-[#0E9C8B] hover:bg-[#0E9C8B]/90 text-[10px] h-5 px-2 font-semibold"
                              >
                                {order.quantity}{' '}
                                {order.quantity === 1 ? 'unid.' : 'unids.'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center p-8">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <Package className="w-8 h-8 text-[#ADADAD]" />
                  </div>
                  <h3 className="text-slate-900 font-medium mb-1">
                    Nenhum item retirado
                  </h3>
                  <p className="text-[#ADADAD] text-sm max-w-[200px]">
                    Nenhum item retirado até o momento por este colaborador.
                  </p>
                </div>
              )}
            </ScrollArea>
          </div>

          <SheetFooter className="p-4 border-t border-slate-100 bg-white">
            <Button
              className="w-full bg-[#0E9C8B] hover:bg-[#0E9C8B]/90 text-white gap-2 shadow-sm transition-all hover:shadow-md"
              onClick={() => setShowManualDelivery(true)}
            >
              <Plus className="w-4 h-4" />
              Registrar Entrega Manual
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <ManualDeliveryDialog
        open={showManualDelivery}
        onOpenChange={setShowManualDelivery}
        employeeId={collaborator.id}
        onSuccess={() => {
          // Success handled by store updates
        }}
      />
    </>
  )
}
