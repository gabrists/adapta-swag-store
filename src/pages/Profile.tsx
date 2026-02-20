import { useState, useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Loader2,
  Save,
  User as UserIcon,
  Mail,
  Camera,
  CloudUpload,
} from 'lucide-react'

import useAuthStore from '@/stores/useAuthStore'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { uploadToR2 } from '@/lib/storage'
import { cn } from '@/lib/utils'

const formSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email().readonly(),
})

export default function Profile() {
  const { user, updateProfile } = useAuthStore()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
  })

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        email: user.email,
      })
    }
  }, [user, form])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        setIsUploading(true)
        const reader = new FileReader()
        reader.onloadend = () => {
          setAvatarPreview(reader.result as string)
        }
        reader.readAsDataURL(file)

        const url = await uploadToR2(file)
        setAvatarPreview(url)

        toast({
          title: 'Foto enviada',
          description: 'Nova foto de perfil atualizada com sucesso.',
        })
      } catch (error) {
        toast({
          title: 'Erro ao enviar foto',
          description:
            error instanceof Error ? error.message : 'Tente novamente.',
          variant: 'destructive',
        })
        setAvatarPreview(user?.avatar || null)
      } finally {
        setIsUploading(false)
      }
    }
  }

  const handleAvatarClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click()
    }
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 800))

    updateProfile({
      name: values.name,
      avatar: avatarPreview || undefined,
    })

    toast({
      title: 'Perfil atualizado!',
      description: `As alterações foram salvas com sucesso.`,
    })

    setIsSubmitting(false)
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-fade-in-up pb-12">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Gerenciar Conta
        </h1>
        <p className="text-base text-[#ADADAD]">
          Atualize suas informações pessoais e foto de perfil.
        </p>
      </div>

      <Card>
        <CardHeader className="border-b border-white/5 pb-8 mb-6">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div
              className={cn(
                'relative group cursor-pointer',
                isUploading && 'cursor-wait',
              )}
              onClick={handleAvatarClick}
            >
              <Avatar className="h-28 w-28 border-4 border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.5)] group-hover:border-primary/50 transition-all bg-black/40">
                <AvatarImage
                  src={avatarPreview || user?.avatar}
                  className={cn(
                    'object-cover transition-opacity',
                    isUploading && 'opacity-50',
                  )}
                />
                <AvatarFallback className="text-3xl bg-white/5 text-[#ADADAD]">
                  {user?.name?.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {isUploading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full backdrop-blur-sm">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                  <CloudUpload className="w-8 h-8 text-white" />
                </div>
              )}

              <div className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-2 rounded-full shadow-[0_0_10px_rgba(20,240,214,0.4)] border-2 border-background">
                <Camera className="w-4 h-4" />
              </div>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isUploading}
            />

            <div className="text-center md:text-left space-y-2">
              <CardTitle className="text-2xl">{user?.name}</CardTitle>
              <CardDescription className="text-base">
                {user?.role === 'admin' ? 'Administrador' : 'Colaborador'}
              </CardDescription>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 gap-2 border-white/20 hover:bg-white/10"
                onClick={handleAvatarClick}
                disabled={isUploading}
              >
                {isUploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CloudUpload className="w-4 h-4" />
                )}
                Trocar Foto
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#ADADAD]">
                      Nome Completo
                    </FormLabel>
                    <div className="relative">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#ADADAD]" />
                      <Input className="pl-11 h-12" {...field} />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#ADADAD]">E-mail</FormLabel>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#ADADAD]" />
                      <Input
                        className="pl-11 h-12 bg-black/40 text-[#ADADAD] border-white/5 opacity-70"
                        {...field}
                        readOnly
                        disabled
                      />
                    </div>
                    <FormDescription className="text-[#ADADAD] mt-2">
                      O e-mail não pode ser alterado. Contate o suporte se
                      necessário.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  className="min-w-[180px] h-12 text-base gap-2 btn-primary-glow"
                  disabled={isSubmitting || isUploading}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      Salvar Alterações
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
