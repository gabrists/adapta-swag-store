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

  // Construct summary string: "2x Item A, 1x Item B (M)"
  const summaryText = entry.items
    .map(
      (item) =>
        `${item.quantity}x ${item.productName}${item.size ? ` (${item.size})` : ''}`,
    )
    .join(', ')

  // Total Value formatting
  const formattedTotalValue = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(entry.totalValue)

  return (
    <Accordion
      type="single"
      collapsible
      className="w-full bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all"
    >
      <AccordionItem value={entry.id} className="border-none">
        <AccordionTrigger className="px-5 py-4 hover:bg-slate-50/50 hover:no-underline rounded-t-lg data-[state=open]:bg-slate-50 transition-all">
          <div className="flex flex-col md:flex-row md:items-center w-full text-left gap-4 pr-4">
            {/* User Info Section */}
            <div className="flex items-center gap-3 md:w-1/4 min-w-[200px]">
              <Avatar className="h-10 w-10 border border-slate-200">
                <AvatarImage src={userAvatarUrl} alt={entry.user} />
                <AvatarFallback>
                  {entry.user.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-semibold text-sm text-slate-900 line-clamp-1">
                  {entry.user}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  ID: {entry.id.substring(0, 8)}...
                </span>
              </div>
            </div>

            {/* Summary Text Section */}
            <div className="flex-1 min-w-0 hidden md:block">
              <p
                className="text-sm text-slate-600 truncate"
                title={summaryText}
              >
                {summaryText}
              </p>
            </div>

            {/* Date and Value Section */}
            <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-1 md:w-[120px] shrink-0">
              <span className="font-bold text-sm text-slate-900">
                {formattedTotalValue}
              </span>
              <span className="text-xs text-slate-500">
                {format(date, 'd MMM, HH:mm', { locale: ptBR })}
              </span>
            </div>

            {/* Mobile Only Summary (below) */}
            <div className="md:hidden w-full pt-1">
              <p className="text-sm text-slate-600 truncate">{summaryText}</p>
            </div>
          </div>
        </AccordionTrigger>

        <AccordionContent className="px-5 pb-5 pt-2 bg-slate-50/50 rounded-b-lg border-t border-slate-100">
          <div className="space-y-3 mt-2">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Detalhes da Retirada
            </h4>
            {entry.items.map((item, idx) => {
              const itemTotal = item.quantity * item.unitCost
              const formattedItemTotal = new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(itemTotal)

              return (
                <div
                  key={`${entry.id}-${idx}`}
                  className="flex items-center gap-3 p-3 bg-white rounded-md border border-slate-100 shadow-sm"
                >
                  <Avatar className="h-10 w-10 border border-slate-100 rounded-md">
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
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {item.productName}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {item.size && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] h-4 px-1 rounded-sm bg-slate-100 text-slate-600 border border-slate-200"
                        >
                          {item.size}
                        </Badge>
                      )}
                      <span className="text-xs text-slate-500">
                        Qtd: {item.quantity}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-medium text-slate-900">
                      {formattedItemTotal}
                    </span>
                    <div className="text-[10px] text-slate-400">
                      Unid: {item.unitCost.toFixed(2)}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
