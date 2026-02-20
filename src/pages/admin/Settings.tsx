import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Slack, Save, Loader2, Send } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import useSwagStore from '@/stores/useSwagStore'
import { useToast } from '@/hooks/use-toast'

const formSchema = z.object({
  webhookUrl: z.string().url('Insira uma URL válida'),
  isEnabled: z.boolean().default(false),
})

export default function Settings() {
  const { slackSettings, saveSlackSettings, testSlackConnection } =
    useSwagStore()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isTesting, setIsTesting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      webhookUrl: '',
      isEnabled: false,
    },
  })

  useEffect(() => {
    if (slackSettings) {
      form.reset({
        webhookUrl: slackSettings.webhookUrl,
        isEnabled: slackSettings.isEnabled,
      })
    }
  }, [slackSettings, form])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)
    try {
      await saveSlackSettings(values)
      toast({
        title: 'Configurações salvas!',
        description: 'As configurações do Slack foram atualizadas.',
        className: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      })
    } catch (error) {
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar as configurações.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleTestConnection = async () => {
    setIsTesting(true)
    try {
      await testSlackConnection()
      // Success toast is handled in the store's sendSlackNotification method (or its fallback)
    } catch (error) {
      toast({
        title: 'Falha no teste',
        description: 'Não foi possível enviar a mensagem de teste.',
        variant: 'destructive',
      })
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Configurações
        </h1>
        <p className="text-sm text-slate-500">
          Gerencie as integrações e preferências do sistema.
        </p>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="flex flex-row items-start gap-4 space-y-0">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#4A154B] text-white">
            <Slack className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <CardTitle>Integração com Slack</CardTitle>
            <CardDescription>
              Receba notificações automáticas sobre novos pedidos, aprovações e
              alertas de estoque baixo diretamente no seu canal do Slack.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="webhookUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      URL do Webhook do Slack (Canal de Alertas)
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://hooks.slack.com/services/..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Copie a URL do Webhook nas configurações do seu App no
                      Slack.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Ativar notificações via Slack
                      </FormLabel>
                      <FormDescription>
                        Quando ativado, o sistema enviará mensagens para a URL
                        configurada acima.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex items-center gap-4 pt-2">
                <Button
                  type="submit"
                  className="bg-[#0E9C8B] hover:bg-[#0E9C8B]/90 text-white min-w-[100px]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleTestConnection}
                  disabled={isTesting || !form.getValues('webhookUrl')}
                >
                  {isTesting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Testando...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Testar Conexão
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
