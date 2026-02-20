import { useEffect, useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2, Save, User, Camera, Upload } from 'lucide-react'

import { Collaborator } from '@/types'
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
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const formSchema = z.object({
  name: z.string().min(2, 'Nome é obrigatório'),
  email: z
    .string()
    .email('E-mail inválido')
    .refine((val) => val.endsWith('@adapta.org'), {
      message: 'O e-mail deve pertencer ao domínio @adapta.org',
    }),
  department: z.string().min(1, 'Selecione um departamento'),
  role: z.string().min(2, 'Cargo é obrigatório'),
  avatarUrl: z.string().optional(),
  onboardingKitStatus: z.enum(['Pendente', 'Entregue']),
})

interface CollaboratorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  collaborator?: Collaborator | null
  onSave: (values: any) => Promise<void>
}

export function CollaboratorDialog({
  open,
  onOpenChange,
  collaborator,
  onSave,
}: CollaboratorDialogProps) {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      department: '',
      role: '',
      avatarUrl: '',
      onboardingKitStatus: 'Pendente',
    },
  })

  useEffect(() => {
    if (open) {
      if (collaborator) {
        form.reset({
          name: collaborator.name,
          email: collaborator.email,
          department: collaborator.department,
          role: collaborator.role,
          avatarUrl: collaborator.avatarUrl || '',
          onboardingKitStatus: collaborator.onboardingKitStatus,
        })
        setAvatarPreview(collaborator.avatarUrl || null)
      } else {
        form.reset({
          name: '',
          email: '',
          department: '',
          role: '',
          avatarUrl: '',
          onboardingKitStatus: 'Pendente',
        })
        setAvatarPreview(null)
      }
    }
  }, [open, collaborator, form])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await onSave(values)
    form.reset()
    onOpenChange(false)
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setAvatarPreview(result)
        form.setValue('avatarUrl', result)
      }
      reader.readAsDataURL(file)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const isEditing = !!collaborator

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Colaborador' : 'Novo Colaborador'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Atualize as informações do membro da equipe.'
              : 'Adicione um novo membro ao time para liberar acesso ao Swag.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="flex flex-col items-center justify-center mb-2 gap-3">
              <div
                className="relative group cursor-pointer"
                onClick={triggerFileInput}
              >
                <Avatar className="h-24 w-24 border-4 border-slate-50 dark:border-white/10 shadow-md transition-all group-hover:opacity-90">
                  <AvatarImage
                    src={avatarPreview || undefined}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-slate-100 text-slate-400 dark:bg-slate-800">
                    <User className="h-10 w-10" />
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="h-8 w-8 text-white drop-shadow-md" />
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={triggerFileInput}
                className="text-xs h-8 border-dashed"
              >
                <Upload className="h-3 w-3" />
                Carregar foto
              </Button>

              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: João da Silva" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail Corporativo</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="nome@adapta.org"
                      {...field}
                      onBlur={(e) => {
                        field.onBlur()
                        const value = e.target.value
                        if (value && !value.includes('@')) {
                          form.setValue('email', `${value}@adapta.org`, {
                            shouldValidate: true,
                          })
                        }
                      }}
                    />
                  </FormControl>
                  <FormDescription className="text-xs text-gray-500 dark:text-gray-400">
                    O domínio @adapta.org é adicionado automaticamente.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Área/Time</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="text-slate-900 dark:text-white">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                        <SelectItem value="B2B">B2B</SelectItem>
                        <SelectItem value="B2C">B2C</SelectItem>
                        <SelectItem value="Produto">Produto</SelectItem>
                        <SelectItem value="Engenharia">Engenharia</SelectItem>
                        <SelectItem value="RH">RH</SelectItem>
                        <SelectItem value="Financeiro">Financeiro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cargo</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Desenvolvedor" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="onboardingKitStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kit Onboarding</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="text-slate-900 dark:text-white">
                        <SelectValue placeholder="Status do Kit" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Pendente">Pendente</SelectItem>
                      <SelectItem value="Entregue">Entregue</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="bg-[#0E9C8B] hover:bg-[#0E9C8B]/90 text-white"
              >
                {form.formState.isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isEditing ? 'Salvar' : 'Adicionar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
