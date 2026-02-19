import { HistoryEntry } from '@/types'
import { Card } from '@/components/ui/card'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { User, ArrowRight, Calendar } from 'lucide-react'

interface HistoryItemProps {
  entry: HistoryEntry
}

export function HistoryItem({ entry }: HistoryItemProps) {
  return (
    <Card className="p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-white border-border/40 shadow-sm hover:shadow transition-shadow">
      <div className="h-12 w-12 rounded-lg bg-slate-100 flex-shrink-0 overflow-hidden border border-slate-200">
        <img
          src={`https://img.usecurling.com/p/100/100?q=${entry.productImageQuery}&dpr=1`}
          alt={entry.productName}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-slate-900 truncate">
          {entry.productName}
        </h4>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-slate-500">
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" />
            <span className="truncate max-w-[120px]">{entry.user}</span>
          </div>
          <ArrowRight className="w-3 h-3 text-slate-300" />
          <span className="font-medium text-slate-700 truncate max-w-[150px]">
            {entry.destination}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full whitespace-nowrap self-start sm:self-center">
        <Calendar className="w-3 h-3" />
        {format(new Date(entry.date), "dd 'de' MMM, HH:mm", { locale: ptBR })}
      </div>
    </Card>
  )
}
