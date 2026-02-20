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
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-fade-in-up pb-12">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Configurações
        </h1>
        <p className="text-base text-gray-500 dark:text-[#ADADAD]">
          Gerencie as integrações e preferências do sistema.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start gap-5 space-y-0 pb-8 border-b border-gray-200 dark:border-white/5 mb-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-slate-700 dark:text-white shadow-inner shrink-0">
            <Slack className="h-7 w-7 text-primary" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-xl">Integração com Slack</CardTitle>
            <CardDescription className="text-base">
              Receba notificações automáticas sobre novos pedidos, aprovações e
              alertas de estoque baixo diretamente no seu canal.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="webhookUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-900 dark:text-slate-200">
                      URL do Webhook do Slack
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="h-12"
                        placeholder="https://hooks.slack.com/services/..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-gray-500 dark:text-[#ADADAD]">
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
                  <FormItem className="flex flex-row items-center justify-between rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 p-5">
                    <div className="space-y-1">
                      <FormLabel className="text-base text-slate-900 dark:text-slate-200">
                        Ativar notificações
                      </FormLabel>
                      <FormDescription className="text-gray-500 dark:text-[#ADADAD]">
                        O sistema enviará alertas automáticos para a URL
                        configurada.
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

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-4 pt-4 border-t border-gray-200 dark:border-white/5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleTestConnection}
                  disabled={isTesting || !form.getValues('webhookUrl')}
                  className="w-full sm:w-auto btn-secondary-outline h-12 text-base px-8"
                >
                  {isTesting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Testando...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-5 w-5" />
                      Testar Conexão
                    </>
                  )}
                </Button>

                <Button
                  type="submit"
                  className="w-full sm:w-auto btn-primary-glow h-12 text-base px-8"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Salvando
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-5 w-5" />
                      Salvar Definições
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
