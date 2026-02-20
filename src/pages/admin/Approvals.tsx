import { useState, useMemo } from 'react'
import useSwagStore from '@/stores/useSwagStore'
import {
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Check,
  X,
  User,
  AlertCircle,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { Order } from '@/types'

export default function ApprovalsPage() {
  const { orders, approveOrder, rejectOrder, isLoading } = useSwagStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [rejectDialog, setRejectDialog] = useState<{
    open: boolean
    order: Order | null
    reason: string
  }>({
    open: false,
    order: null,
    reason: '',
  })

  const pendingOrders = useMemo(() => {
    return orders
      .filter((order) => order.status === 'Pendente')
      .filter(
        (order) =>
          order.employeeName
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          order.productName?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
  }, [orders, searchQuery])

  const handleApprove = (order: Order) => {
    approveOrder(order)
  }

  const handleRejectClick = (order: Order) => {
    setRejectDialog({
      open: true,
      order,
      reason: '',
    })
  }

  const confirmReject = async () => {
    if (rejectDialog.order && rejectDialog.reason.trim()) {
      await rejectOrder(rejectDialog.order.id, rejectDialog.reason)
      setRejectDialog({ open: false, order: null, reason: '' })
    }
  }

  if (isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto space-y-6">
        <div className="h-10 w-48 bg-gray-200 dark:bg-white/5 rounded-lg animate-pulse" />
        <div className="h-32 w-full bg-gray-100 dark:bg-white/5 rounded-2xl animate-pulse" />
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-fade-in-up pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Fila de Pedidos
          </h1>
          <p className="text-base text-gray-600 dark:text-[#ADADAD]">
            Gerencie as solicitações de brindes pendentes de aprovação.
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 dark:text-[#ADADAD]" />
          <Input
            placeholder="Buscar por nome ou item..."
            className="pl-11 h-12 text-slate-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {pendingOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center glass-panel rounded-2xl border-dashed">
          <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-4 shadow-inner">
            <CheckCircle className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
            Fila vazia!
          </h3>
          <p className="text-gray-500 dark:text-[#ADADAD] text-sm mt-2">
            Não há solicitações pendentes no momento.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {pendingOrders.map((order) => (
            <Card
              key={order.id}
              className="overflow-hidden group border-gray-200 dark:border-white/10"
            >
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row md:items-center">
                  <div className="w-full md:w-2 h-2 md:h-auto md:self-stretch bg-sky-400" />

                  <div className="flex-1 p-5 md:p-6 flex flex-col sm:flex-row gap-6 md:items-center">
                    {/* User Info */}
                    <div className="flex items-center gap-4 min-w-[220px]">
                      <Avatar className="h-12 w-12 border border-gray-200 dark:border-white/10 shrink-0">
                        <AvatarImage
                          src={order.employeeAvatar}
                          alt={order.employeeName}
                        />
                        <AvatarFallback className="bg-primary/20 text-primary font-bold">
                          {order.employeeName?.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white text-base">
                          {order.employeeName}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-[#ADADAD] flex items-center gap-1.5 mt-0.5">
                          <Clock className="w-3.5 h-3.5" />
                          {format(parseISO(order.createdAt), 'd MMM, HH:mm', {
                            locale: ptBR,
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="flex items-center gap-4 flex-1 bg-gray-50 dark:bg-black/20 p-3 rounded-xl border border-gray-200 dark:border-white/5">
                      <div className="h-14 w-14 rounded-lg bg-gray-100 dark:bg-black/40 border border-gray-200 dark:border-white/10 overflow-hidden shrink-0">
                        <img
                          src={
                            order.productImage?.startsWith('http') ||
                            order.productImage?.startsWith('data:')
                              ? order.productImage
                              : `https://img.usecurling.com/p/100/100?q=${order.productImage}&dpr=2`
                          }
                          alt={order.productName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white text-sm">
                          {order.productName}
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                          <Badge
                            variant="secondary"
                            className="text-[10px] h-5 px-2 font-medium bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-[#ADADAD] hover:bg-gray-300 dark:hover:bg-white/20 border-transparent dark:border-white/5"
                          >
                            Qtd: {order.quantity}
                          </Badge>
                          {order.size && (
                            <Badge
                              variant="outline"
                              className="text-[10px] h-5 px-2 font-medium border-gray-300 dark:border-white/20 text-gray-600 dark:text-[#ADADAD]"
                            >
                              Tam: {order.size}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 mt-4 sm:mt-0">
                      <Button
                        variant="outline"
                        className="btn-secondary-outline h-10 px-4 text-gray-600 dark:text-[#ADADAD] border-gray-200 dark:border-white/10 hover:text-red-600 dark:hover:text-red-500 hover:border-red-600 dark:hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-300"
                        onClick={() => handleRejectClick(order)}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Rejeitar
                      </Button>
                      <Button
                        className="btn-primary-glow h-10 px-6"
                        onClick={() => handleApprove(order)}
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Aprovar
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={rejectDialog.open}
        onOpenChange={(open) => setRejectDialog((prev) => ({ ...prev, open }))}
      >
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-white">
              Rejeitar Solicitação
            </DialogTitle>
            <DialogDescription className="text-gray-500 dark:text-[#ADADAD]">
              Informe o motivo da rejeição para que o colaborador saiba o que
              aconteceu.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Ex: Item indisponível no estoque físico..."
              value={rejectDialog.reason}
              onChange={(e) =>
                setRejectDialog((prev) => ({
                  ...prev,
                  reason: e.target.value,
                }))
              }
              className="min-h-[120px] text-slate-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setRejectDialog({ open: false, order: null, reason: '' })
              }
              className="btn-secondary-outline border-gray-200 dark:border-white/10 text-slate-900 dark:text-white"
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmReject}
              disabled={!rejectDialog.reason.trim()}
              className="bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Confirmar Rejeição
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
