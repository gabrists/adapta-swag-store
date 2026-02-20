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

  // Filter pending orders
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
      <div className="w-full max-w-7xl mx-auto space-y-4">
        <div className="h-8 w-48 bg-slate-100 rounded animate-pulse" />
        <div className="h-24 w-full bg-slate-100 rounded-xl animate-pulse" />
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Fila de Pedidos
          </h1>
          <p className="text-sm text-slate-500">
            Gerencie as solicitações de brindes pendentes de aprovação.
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar por nome ou item..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {pendingOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white border border-dashed border-slate-200 rounded-xl">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-medium text-slate-900">Tudo em dia!</h3>
          <p className="text-slate-500 text-sm mt-1">
            Não há solicitações pendentes no momento.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {pendingOrders.map((order) => (
            <Card
              key={order.id}
              className="overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row md:items-center">
                  <div className="w-full md:w-2 h-2 md:h-auto md:self-stretch bg-yellow-400" />

                  <div className="flex-1 p-4 md:p-6 flex flex-col sm:flex-row gap-6 md:items-center">
                    {/* User Info */}
                    <div className="flex items-center gap-3 min-w-[200px]">
                      <Avatar className="h-10 w-10 border border-slate-100">
                        <AvatarImage
                          src={order.employeeAvatar}
                          alt={order.employeeName}
                        />
                        <AvatarFallback>
                          {order.employeeName?.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-slate-900 text-sm">
                          {order.employeeName}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(parseISO(order.createdAt), 'd MMM, HH:mm', {
                            locale: ptBR,
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="flex items-center gap-4 flex-1">
                      <div className="h-12 w-12 rounded bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
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
                        <div className="font-medium text-slate-900 text-sm">
                          {order.productName}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant="secondary"
                            className="text-[10px] h-5 px-1.5 font-normal bg-slate-100"
                          >
                            Qtd: {order.quantity}
                          </Badge>
                          {order.size && (
                            <Badge
                              variant="outline"
                              className="text-[10px] h-5 px-1.5 font-normal"
                            >
                              Tam: {order.size}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-2 sm:mt-0">
                      <Button
                        variant="outline"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                        onClick={() => handleRejectClick(order)}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Rejeitar
                      </Button>
                      <Button
                        className="bg-[#0E9C8B] hover:bg-[#0E9C8B]/90 text-white"
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
        <DialogContent className="sm:max-w-[425px] rounded-xl">
          <DialogHeader>
            <DialogTitle>Rejeitar Solicitação</DialogTitle>
            <DialogDescription>
              Informe o motivo da rejeição para que o colaborador saiba o que
              aconteceu.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Textarea
              placeholder="Ex: Item indisponível no estoque físico..."
              value={rejectDialog.reason}
              onChange={(e) =>
                setRejectDialog((prev) => ({
                  ...prev,
                  reason: e.target.value,
                }))
              }
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setRejectDialog({ open: false, order: null, reason: '' })
              }
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmReject}
              disabled={!rejectDialog.reason.trim()}
            >
              Confirmar Rejeição
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
