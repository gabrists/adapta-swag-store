import { HistoryEntry } from '@/types'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'
import { MapPin, Package, ShoppingBag } from 'lucide-react'

interface HistoryItemProps {
  entry: HistoryEntry
}

export function HistoryItem({ entry }: HistoryItemProps) {
  const date = parseISO(entry.date)

  const userAvatarUrl =
    entry.userAvatar ||
    `https://img.usecurling.com/ppl/thumbnail?gender=male&seed=${encodeURIComponent(entry.user)}`

  // Get first item image for the card thumbnail
  const firstItem = entry.items[0]
  const isQuery =
    !firstItem.productImageQuery.startsWith('http') &&
    !firstItem.productImageQuery.startsWith('data:')

  const thumbnail = isQuery
    ? `https://img.usecurling.com/p/100/100?q=${firstItem.productImageQuery}&dpr=2`
    : firstItem.productImageQuery

  const itemCount = entry.totalQuantity

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="group flex items-center p-4 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md hover:border-[#0E9C8B]/30 transition-all cursor-pointer relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#0E9C8B] opacity-0 group-hover:opacity-100 transition-opacity" />

          <div className="relative mr-4 shrink-0">
            <Avatar className="h-12 w-12 border border-slate-200">
              <AvatarImage
                src={thumbnail}
                alt={firstItem.productName}
                className="object-cover"
              />
              <AvatarFallback>
                {firstItem.productName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {entry.items.length > 1 && (
              <div className="absolute -bottom-1 -right-1 bg-slate-900 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border border-white">
                +{entry.items.length - 1}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-slate-900 truncate group-hover:text-[#0E9C8B] transition-colors">
                Pedido #{entry.id.substring(0, 6)}
              </h4>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-[#ADADAD]">
              <Avatar className="h-5 w-5 shrink-0">
                <AvatarImage src={userAvatarUrl} alt={entry.user} />
                <AvatarFallback className="text-[8px] bg-slate-100 text-[#ADADAD]">
                  {entry.user.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="truncate max-w-[150px]">{entry.user}</span>
            </div>
          </div>

          <div className="text-right pl-2 flex flex-col items-end gap-1">
            <Badge
              variant="secondary"
              className="font-mono text-xs bg-slate-100 text-slate-700 group-hover:bg-[#0E9C8B]/10 group-hover:text-[#0E9C8B] transition-colors"
            >
              {itemCount} {itemCount === 1 ? 'item' : 'itens'}
            </Badge>
            <span className="text-xs text-[#ADADAD] whitespace-nowrap">
              {format(date, 'd MMM, HH:mm', { locale: ptBR })}
            </span>
          </div>
        </div>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[450px] p-0 gap-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Detalhes do Pedido</DialogTitle>
          <DialogDescription>
            Detalhes completos da retirada #{entry.id}
          </DialogDescription>
        </DialogHeader>

        <div className="bg-[#0E9C8B] p-6 text-white flex flex-col items-center justify-center relative">
          <div className="bg-white/20 absolute inset-0 backdrop-blur-[2px]" />
          <div className="relative z-10 flex flex-col items-center w-full">
            <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm mb-3 border border-white/30">
              <ShoppingBag className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-center leading-tight">
              Resumo do Pedido
            </h2>
            <span className="mt-1 text-sm text-white/80">
              {format(date, "d 'de' MMMM 'às' HH:mm", { locale: ptBR })}
            </span>
          </div>
        </div>

        <div className="flex flex-col max-h-[60vh]">
          <div className="p-6 pb-0 space-y-4">
            <div className="flex items-center p-3 rounded-lg bg-slate-50 border border-slate-100">
              <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[#ADADAD] mr-3 shrink-0 overflow-hidden">
                <img
                  src={userAvatarUrl}
                  alt={entry.user}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="text-xs text-[#ADADAD]">Retirado por</div>
                <div className="font-medium text-slate-900">{entry.user}</div>
              </div>
              <div className="h-8 w-px bg-slate-200 mx-3" />
              <div className="flex-1">
                <div className="text-xs text-[#ADADAD] flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Destino
                </div>
                <div className="font-medium text-slate-900 truncate">
                  {entry.destination}
                </div>
              </div>
            </div>

            <h3 className="text-sm font-medium text-slate-900 flex items-center gap-2 pt-2">
              <Package className="w-4 h-4 text-[#ADADAD]" /> Itens Retirados (
              {itemCount})
            </h3>
          </div>

          <ScrollArea className="flex-1 p-6 pt-2">
            <div className="space-y-3">
              {entry.items.map((item, idx) => (
                <div
                  key={`${item.productId}-${idx}`}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <Avatar className="h-12 w-12 border border-slate-100 rounded-md">
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
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 text-sm truncate">
                      {item.productName}
                    </p>
                    {item.size && (
                      <Badge
                        variant="outline"
                        className="text-[10px] h-5 px-1.5 border-slate-200 text-[#ADADAD] bg-white mt-1"
                      >
                        Tamanho: {item.size}
                      </Badge>
                    )}
                  </div>
                  <div className="font-mono text-sm font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded">
                    x{item.quantity}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <div className="bg-slate-50 px-6 py-4 flex justify-end border-t border-slate-100">
          <DialogClose asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              Fechar
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
}
