import useSwagStore from '@/stores/useSwagStore'
import { HistoryItem } from '@/components/HistoryItem'
import { Skeleton } from '@/components/ui/skeleton'
import { History as HistoryIcon, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

export default function HistoryPage() {
  const { history, isLoading } = useSwagStore()

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Histórico de Saídas
          </h1>
          <p className="text-sm text-slate-500">
            Registro de todas as retiradas de brindes.
          </p>
        </div>
      </div>

      {history.length > 0 ? (
        <div className="space-y-3">
          {history.map((entry) => (
            <div key={entry.id} className="animate-fade-in-up">
              <HistoryItem entry={entry} />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center space-y-6 bg-white rounded-xl border border-dashed border-slate-200">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
            <HistoryIcon className="w-10 h-10 text-slate-300" />
          </div>
          <div className="max-w-xs">
            <h3 className="text-lg font-semibold text-slate-900">
              Nenhum registro ainda
            </h3>
            <p className="text-slate-500 mt-2 text-sm">
              As retiradas feitas na vitrine aparecerão aqui. Comece
              distribuindo felicidade!
            </p>
          </div>
          <Button asChild variant="default">
            <Link to="/">Ir para Vitrine</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
