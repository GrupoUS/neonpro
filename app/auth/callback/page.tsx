"use client";

import { supabase } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log("=== OAuth Callback Processing ===");
        console.log("Current URL:", window.location.href);

        // Give Supabase a moment to process the callback
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Check if we have a session
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          console.log("OAuth successful - redirecting to dashboard");
          router.push("/dashboard");
        } else {
          console.error("No session after OAuth callback");
          router.push("/login?error=Authentication failed");
        }
      } catch (err) {
        console.error("Unexpected error in OAuth callback:", err);
        router.push("/login?error=Unexpected error");
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold">Processando autenticação...</h2>
        <p className="mt-2 text-gray-600">
          Por favor, aguarde enquanto completamos seu login.
        </p>
      </div>
    </div>
  );
}
