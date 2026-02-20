import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2, Send } from 'lucide-react'
import { format } from 'date-fns'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import useAuthStore from '@/stores/useAuthStore'

const formSchema = z.object({
  destination: z
    .string()
    .min(3, 'Informe o destino ou motivo (ex: Uso Pessoal, Evento X)'),
})

interface CheckoutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (values: { destination: string }) => void
  totalItems: number
}

export function CheckoutDialog({
  open,
  onOpenChange,
  onConfirm,
  totalItems,
}: CheckoutDialogProps) {
  const { user } = useAuthStore()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      destination: '',
    },
  })

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      form.reset({ destination: '' })
      setIsSubmitting(false)
    }
  }, [open, form])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) return

    setIsSubmitting(true)

    // Call parent handler
    onConfirm({
      destination: values.destination,
    })

    // Reset submitting state is handled by parent closing the dialog usually,
    // but we reset here to be safe if dialog stays open (though it shouldn't)
    setIsSubmitting(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-xl">
        <DialogHeader>
          <DialogTitle>Confirmar Solicitação</DialogTitle>
          <DialogDescription>
            Você está solicitando {totalItems}{' '}
            {totalItems === 1 ? 'item' : 'itens'}. O pedido será enviado para
            aprovação do RH.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 text-right col-span-1">
                  Solicitante
                </span>
                <span className="text-sm font-semibold text-slate-900 dark:text-white col-span-3">
                  {user?.name}
                </span>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 text-right col-span-1">
                  Data
                </span>
                <span className="text-sm font-semibold text-slate-900 dark:text-white col-span-3">
                  {format(new Date(), 'dd/MM/yyyy')}
                </span>
              </div>

              <FormField
                control={form.control}
                name="destination"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4 space-y-0">
                    <FormLabel className="text-right col-span-1">
                      Motivo
                    </FormLabel>
                    <div className="col-span-3">
                      <FormControl>
                        <Input
                          placeholder="Ex: Onboarding, Uso pessoal..."
                          className="col-span-3"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="mt-1" />
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-[#00CA7E] hover:bg-[#00CA7E]/90 text-white gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Enviar Pedido
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
