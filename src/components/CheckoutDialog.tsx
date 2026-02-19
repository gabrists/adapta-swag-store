import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarIcon, Loader2, Check, ChevronsUpDown } from 'lucide-react'

import { useIsMobile } from '@/hooks/use-mobile'
import { Button } from '@/components/ui/button'
import useSwagStore from '@/stores/useSwagStore'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from '@/components/ui/drawer'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { cn } from '@/lib/utils'

const formSchema = z.object({
  user: z.string().min(1, 'Selecione quem está retirando'),
  destination: z.string().min(3, 'Informe o destino (cliente ou evento)'),
  date: z.date({ required_error: 'Selecione a data da retirada' }),
})

interface CheckoutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (values: z.infer<typeof formSchema>) => void
  totalItems: number
}

export function CheckoutDialog({
  open,
  onOpenChange,
  onConfirm,
  totalItems,
}: CheckoutDialogProps) {
  const isMobile = useIsMobile()
  const { collaborators } = useSwagStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [comboboxOpen, setComboboxOpen] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      user: '',
      destination: '',
      date: new Date(),
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        user: '',
        destination: '',
        date: new Date(),
      })
      setComboboxOpen(false)
    }
  }, [open, form])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800))
    onConfirm(values)
    setIsSubmitting(false)
    onOpenChange(false)
  }

  const Content = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 px-1">
        <FormField
          control={form.control}
          name="user"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Quem está retirando?</FormLabel>
              <Popover
                open={comboboxOpen}
                onOpenChange={setComboboxOpen}
                modal={true}
              >
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={comboboxOpen}
                      className={cn(
                        'w-full justify-between rounded-lg',
                        !field.value && 'text-muted-foreground',
                      )}
                    >
                      {field.value
                        ? collaborators.find(
                            (collaborator) => collaborator === field.value,
                          ) || field.value
                        : 'Selecione um colaborador'}
                      <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[--radix-popover-trigger-width] p-0"
                  align="start"
                >
                  <Command>
                    <CommandInput placeholder="Buscar colaborador..." />
                    <CommandList>
                      <CommandEmpty>Colaborador não encontrado.</CommandEmpty>
                      <CommandGroup>
                        {collaborators.map((collaborator, index) => (
                          <CommandItem
                            value={collaborator}
                            key={`${collaborator}-${index}`}
                            onSelect={() => {
                              form.setValue('user', collaborator)
                              setComboboxOpen(false)
                            }}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                collaborator === field.value
                                  ? 'opacity-100'
                                  : 'opacity-0',
                              )}
                            />
                            {collaborator}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="destination"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Para quem é?</FormLabel>
              <FormControl>
                <Input
                  placeholder="Nome do Cliente ou Evento"
                  className="rounded-lg"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data da Retirada</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-full pl-3 text-left font-normal rounded-lg',
                        !field.value && 'text-muted-foreground',
                      )}
                    >
                      {field.value ? (
                        format(field.value, 'PPP', { locale: ptBR })
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date('1900-01-01')
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full font-bold bg-primary text-white rounded-lg"
          disabled={isSubmitting}
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Confirmar Retirada
        </Button>
      </form>
    </Form>
  )

  const description = (
    <span className="block mt-1">
      Confirme os detalhes para finalizar a retirada de{' '}
      <span className="font-bold text-foreground">
        {totalItems} {totalItems === 1 ? 'item' : 'itens'}
      </span>
      .
    </span>
  )

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="px-4 pb-8 max-h-[95vh] mt-0 rounded-t-xl">
          <DrawerHeader className="text-left px-1">
            <DrawerTitle>Finalizar Pedido</DrawerTitle>
            <DrawerDescription>{description}</DrawerDescription>
          </DrawerHeader>
          {Content}
          <DrawerFooter className="pt-2 px-1"></DrawerFooter>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-xl">
        <DialogHeader>
          <DialogTitle>Finalizar Pedido</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {Content}
      </DialogContent>
    </Dialog>
  )
}
