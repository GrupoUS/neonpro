import type { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { useState } from "react";
import type { toast } from "sonner";

// Test Mode for Google OAuth - Mock Implementation
export function SignInWithGooglePopupButton() {
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClientComponentClient();

  const signInWithGoogleTest = async () => {
    try {
      setIsLoading(true);

      // Show test mode notification
      toast.info("🧪 TEST MODE: Simulando login com Google...");

      // Simulate loading delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock user data (similar to what Google would return)
      const mockUserData = {
        email: "test.user@gmail.com",
        name: "Test User Google",
        avatar_url: "https://lh3.googleusercontent.com/a/default-user=s96-c",
        provider: "google",
        email_verified: true,
      };

      // Log the mock login attempt
      console.log("🧪 Mock Google Login - User Data:", mockUserData);

      // For now, just show success message
      toast.success(`✅ Mock Login: ${mockUserData.email}`);
      toast.info("ℹ️ Para login real, configure as credenciais do Google OAuth no .env.local");
    } catch (error) {
      console.error("Test login error:", error);
      toast.error("Erro no teste de login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={signInWithGoogleTest}
      disabled={isLoading}
      className="flex w-full items-center justify-center gap-3 rounded-md bg-white px-3 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {isLoading ? (
        <>
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
          <span className="sm:inline hidden">Testando login...</span>
          <span className="sm:hidden">Testando...</span>
        </>
      ) : (
        <>
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span className="sm:inline hidden">Testar login com Google</span>
          <span className="sm:hidden">Testar Google</span>
        </>
      )}
    </button>
  );
}
