import { HistoryEntry } from '@/types'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

interface HistoryCardProps {
  entry: HistoryEntry
}

export function HistoryCard({ entry }: HistoryCardProps) {
  const date = parseISO(entry.date)

  const userAvatarUrl =
    entry.userAvatar ||
    `https://img.usecurling.com/ppl/thumbnail?gender=male&seed=${encodeURIComponent(entry.user)}`

  const summaryText = entry.items
    .map(
      (item) =>
        `${item.quantity}x ${item.productName}${item.size ? ` (${item.size})` : ''}`,
    )
    .join(', ')

  const formattedTotalValue = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(entry.totalValue)

  return (
    <Accordion
      type="single"
      collapsible
      className="w-full glass-panel rounded-2xl hover:border-primary/30 transition-all"
    >
      <AccordionItem value={entry.id} className="border-none">
        <AccordionTrigger className="px-5 py-4 hover:bg-white/5 hover:no-underline rounded-t-2xl data-[state=open]:bg-white/5 transition-all text-white">
          <div className="flex flex-col md:flex-row md:items-center w-full text-left gap-4 pr-4">
            {/* User Info Section */}
            <div className="flex items-center gap-4 md:w-1/4 min-w-[220px]">
              <Avatar className="h-12 w-12 border border-white/10 shadow-sm">
                <AvatarImage src={userAvatarUrl} alt={entry.user} />
                <AvatarFallback className="bg-primary/20 text-primary font-bold">
                  {entry.user.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-semibold text-base text-white line-clamp-1">
                  {entry.user}
                </span>
                <span className="text-xs text-slate-400 font-mono mt-0.5 bg-black/20 px-2 py-0.5 rounded border border-white/5 w-fit">
                  ID: {entry.id.substring(0, 8)}
                </span>
              </div>
            </div>

            {/* Summary Text Section */}
            <div className="flex-1 min-w-0 hidden md:block">
              <p
                className="text-sm text-slate-300 truncate"
                title={summaryText}
              >
                {summaryText}
              </p>
            </div>

            {/* Date and Value Section */}
            <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-1.5 md:w-[130px] shrink-0">
              <span className="font-bold text-base text-primary">
                {formattedTotalValue}
              </span>
              <span className="text-xs text-slate-400 font-medium bg-black/20 px-2 py-1 rounded-md border border-white/5">
                {format(date, 'd MMM, HH:mm', { locale: ptBR })}
              </span>
            </div>

            {/* Mobile Only Summary */}
            <div className="md:hidden w-full pt-2">
              <p className="text-sm text-slate-400 truncate bg-black/20 p-2 rounded-lg border border-white/5">
                {summaryText}
              </p>
            </div>
          </div>
        </AccordionTrigger>

        <AccordionContent className="px-5 pb-5 pt-4 bg-black/20 rounded-b-2xl border-t border-white/5">
          <div className="space-y-4 mt-2">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <span className="w-4 h-px bg-slate-600"></span>
              Detalhes da Retirada
              <span className="flex-1 h-px bg-slate-600/30"></span>
            </h4>
            <div className="grid gap-3">
              {entry.items.map((item, idx) => {
                const itemTotal = item.quantity * item.unitCost
                const formattedItemTotal = new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(itemTotal)

                return (
                  <div
                    key={`${entry.id}-${idx}`}
                    className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors"
                  >
                    <Avatar className="h-12 w-12 border border-white/10 rounded-lg shrink-0 bg-black/40">
                      <AvatarImage
                        src={
                          item.productImageQuery.startsWith('http') ||
                          item.productImageQuery.startsWith('data:')
                            ? item.productImageQuery
                            : `https://img.usecurling.com/p/100/100?q=${item.productImageQuery}&dpr=2`
                        }
                        alt={item.productName}
                        className="object-cover rounded-lg"
                      />
                      <AvatarFallback className="rounded-lg bg-white/5 text-slate-400">
                        {item.productName.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">
                        {item.productName}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        {item.size && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] h-5 px-1.5 rounded-md bg-black/40 text-slate-300 border border-white/10"
                          >
                            {item.size}
                          </Badge>
                        )}
                        <span className="text-xs font-medium text-slate-400 bg-black/20 px-2 py-0.5 rounded-md border border-white/5">
                          Qtd: {item.quantity}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-bold text-white block">
                        {formattedItemTotal}
                      </span>
                      <div className="text-[10px] text-slate-500 mt-1">
                        Unid: {item.unitCost.toFixed(2)}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
