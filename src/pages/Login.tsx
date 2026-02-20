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

  // Get return url from location state or default to home
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
        // Handle specific Supabase Auth errors
        if (error.message === 'Invalid login credentials') {
          throw new Error(
            'Credenciais inválidas. Verifique seu e-mail e senha.',
          )
        }
        // Handle generic errors
        throw error
      }

      toast({
        title: 'Bem-vindo de volta!',
        description: 'Login realizado com sucesso.',
        className: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      })

      // Check for specific admin email to redirect to dashboard
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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-7xl mx-auto flex items-center justify-center">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                <Package2 className="w-6 h-6" />
              </div>
              <span className="font-display font-bold text-2xl tracking-tight text-slate-900">
                Adapta <span className="text-primary">Swag</span>
              </span>
            </div>
          </div>

          <Card className="border-slate-200 shadow-xl">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">
                Acesse sua conta
              </CardTitle>
              <CardDescription className="text-center">
                Entre com seu e-mail corporativo para acessar a loja
              </CardDescription>
            </CardHeader>
            <CardContent>
              {errorMessage && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Erro</AlertTitle>
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-mail</FormLabel>
                        <FormControl>
                          <Input placeholder="seu.nome@adapta.org" {...field} />
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
                        <FormLabel>Senha</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full font-bold bg-primary hover:bg-primary/90"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Entrando...
                      </>
                    ) : (
                      <>
                        Entrar <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex flex-col items-center justify-center text-sm text-slate-500 gap-2">
              <p>
                Esqueceu sua senha?{' '}
                <span className="text-primary cursor-pointer hover:underline">
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
