import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { CheckCircle, Loader2, ImageIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import useSwagStore from '@/stores/useSwagStore'
import useAuthStore from '@/stores/useAuthStore'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

export default function CampaignResponse() {
  const { id } = useParams()
  const { campaigns, campaignResponses, submitCampaignResponse, isLoading } =
    useSwagStore()
  const { user } = useAuthStore()
  const { toast } = useToast()

  const [choice, setChoice] = useState<string>('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const campaign = campaigns.find((c) => c.id === id)
  const myResponse = campaignResponses.find(
    (r) => r.campaignId === id && r.employeeId === user?.id,
  )

  useEffect(() => {
    if (myResponse && !choice) {
      setChoice(myResponse.choice)
    }
  }, [myResponse, choice])

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#061412]">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="mt-4 text-slate-500 font-medium animate-pulse">
          Carregando informações da campanha...
        </p>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#061412] p-4 text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Campanha não encontrada
        </h2>
        <p className="text-slate-500 mt-2">
          Verifique o link enviado ou contate o RH.
        </p>
      </div>
    )
  }

  const isClosed = campaign.status === 'Fechada'

  const handleSubmit = async () => {
    if (!choice || !user) return
    setIsSubmitting(true)
    try {
      await submitCampaignResponse(campaign.id, user.id, choice)
      setIsSuccess(true)
    } catch (e) {
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar a sua resposta. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#061412] p-4">
        <div className="max-w-md w-full glass-panel p-8 text-center rounded-3xl animate-in zoom-in-95 duration-300 border-white/10 shadow-2xl">
          <CheckCircle className="w-20 h-20 text-emerald-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
            ✅ Resposta registrada!
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
            Obrigado pela sua participação. Sua escolha foi salva com sucesso e
            será processada pelo RH.
          </p>
          {!isClosed && (
            <Button
              variant="outline"
              onClick={() => setIsSuccess(false)}
              className="w-full h-12 btn-secondary-outline"
            >
              Alterar minha resposta
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#061412] p-4 sm:p-6">
      <div className="max-w-md w-full glass-panel p-6 sm:p-8 rounded-3xl border-white/10 shadow-2xl animate-fade-in-up">
        <div className="text-center mb-8">
          {campaign.imageUrl ? (
            <Avatar className="mx-auto w-32 h-32 mb-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-lg">
              <AvatarImage src={campaign.imageUrl} className="object-cover" />
              <AvatarFallback className="bg-slate-100 dark:bg-white/5 rounded-2xl">
                <ImageIcon className="w-12 h-12 text-slate-400" />
              </AvatarFallback>
            </Avatar>
          ) : (
            <Badge
              variant="outline"
              className="mb-4 bg-primary/10 text-primary border-primary/20"
            >
              Coleta de Tamanho
            </Badge>
          )}
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
            {campaign.name}
          </h1>
          {campaign.description && (
            <p className="text-slate-500 dark:text-slate-400 mt-3 text-sm leading-relaxed">
              {campaign.description}
            </p>
          )}
          {isClosed && (
            <Badge variant="destructive" className="mt-5 text-sm py-1">
              Campanha Encerrada
            </Badge>
          )}
        </div>

        <RadioGroup
          value={choice}
          onValueChange={setChoice}
          disabled={isClosed}
          className="grid grid-cols-2 gap-4"
        >
          {campaign.options.map((opt) => (
            <Label
              key={opt}
              className={cn(
                'cursor-pointer group',
                isClosed && 'cursor-not-allowed opacity-70',
              )}
            >
              <RadioGroupItem value={opt} className="peer sr-only" />
              <div className="flex flex-col items-center justify-center py-6 px-4 rounded-2xl border-2 border-slate-200 dark:border-white/10 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-all shadow-sm group-active:scale-95">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">
                  {opt}
                </span>
              </div>
            </Label>
          ))}
        </RadioGroup>

        <Button
          className="w-full mt-8 h-14 text-lg font-bold btn-primary-glow rounded-xl shadow-lg"
          onClick={handleSubmit}
          disabled={!choice || isClosed || isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            'Confirmar Minha Escolha'
          )}
        </Button>
      </div>
    </div>
  )
}
