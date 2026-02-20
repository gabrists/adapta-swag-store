import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Package2, Loader2, ArrowRight, AlertCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import useAuthStore from '@/stores/useAuthStore'
import { useToast } from '@/hooks/use-toast'

const formSchema = z.object({
  email: z.string().email('Digite um e-mail válido'),
  password: z.string().min(1, 'A senha é obrigatória'),
})

export default function Login() {
  const { login } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const from = location.state?.from?.pathname || '/'

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)
    setErrorMessage(null)
    try {
      const { data, error } = await login(values.email, values.password)
      if (error) {
        if (error.message === 'Invalid login credentials') {
          throw new Error(
            'Credenciais inválidas. Verifique seu e-mail e senha.',
          )
        }
        throw error
      }

      toast({
        title: 'Bem-vindo de volta!',
        description: 'Login realizado com sucesso.',
      })

      if (data?.user?.email === 'admin@adapta.org') {
        navigate('/admin', { replace: true })
      } else {
        navigate(from, { replace: true })
      }
    } catch (error: any) {
      console.error('Login error', error)
      const message = error.message || 'Falha na autenticação'
      setErrorMessage(message)
      toast({
        title: 'Erro ao entrar',
        description: message,
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="w-full max-w-7xl mx-auto flex items-center justify-center relative z-10">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="flex justify-center mb-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-primary-foreground shadow-[0_0_20px_rgba(20,240,214,0.4)]">
                <Package2 className="w-7 h-7" />
              </div>
              <span className="font-display font-bold text-3xl tracking-tight text-white">
                Neura <span className="text-primary">Swag</span>
              </span>
            </div>
          </div>

          <Card className="glass-panel border-white/10 shadow-2xl backdrop-blur-2xl">
            <CardHeader className="space-y-2 pb-6">
              <CardTitle className="text-2xl font-bold text-center text-white">
                Acesse sua conta
              </CardTitle>
              <CardDescription className="text-center text-slate-400 text-base">
                Entre com seu e-mail corporativo para acessar a loja
              </CardDescription>
            </CardHeader>
            <CardContent>
              {errorMessage && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Erro</AlertTitle>
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-5"
                >
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">E-mail</FormLabel>
                        <FormControl>
                          <Input
                            className="h-12"
                            placeholder="seu.nome@neura.ai"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Senha</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            className="h-12"
                            placeholder="••••••••"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="pt-2">
                    <Button
                      type="submit"
                      className="w-full h-12 text-base font-bold btn-primary-glow"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Entrando...
                        </>
                      ) : (
                        <>
                          Entrar <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex flex-col items-center justify-center text-sm text-slate-500 gap-2 pt-6 border-t border-white/5">
              <p>
                Esqueceu sua senha?{' '}
                <span className="text-primary font-medium cursor-pointer hover:underline transition-colors">
                  Recuperar acesso
                </span>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
