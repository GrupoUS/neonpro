import { createFileRoute } from '@tanstack/react-router'
import { LoginForm } from '@/features/auth/components/login-form'

function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Login</h1>
          <p className="text-muted-foreground mt-2">Entre com suas credenciais</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}

export const Route = createFileRoute('/login')({
  component: LoginPage,
})