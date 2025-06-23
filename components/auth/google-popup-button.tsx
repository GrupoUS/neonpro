"use client"

import { useState } from "react"
import { Chrome } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface SignInWithGooglePopupButtonProps {
  text?: string
  loadingText?: string
  className?: string
  disabled?: boolean
}

export function SignInWithGooglePopupButton({
  text = "Entrar com Google",
  loadingText = "Aguarde...",
  className,
  disabled,
}: SignInWithGooglePopupButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { signInWithGoogle } = useAuth()

  const handleSignIn = async () => {
    setIsLoading(true)
    try {
      const { error } = await signInWithGoogle()
      if (error) {
        toast.error(error.message || "Falha ao autenticar com o Google.")
      }
      // Em caso de sucesso, o listener onAuthStateChange no AuthProvider
      // cuidará do redirecionamento e atualização do estado.
    } catch (err: any) {
      toast.error(err.message || "Ocorreu um erro inesperado.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button variant="outline" className={className} onClick={handleSignIn} disabled={isLoading || disabled}>
      {isLoading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
          {loadingText}
        </>
      ) : (
        <>
          <Chrome className="mr-2 h-4 w-4" />
          {text}
        </>
      )}
    </Button>
  )
}
