import { AuthForm } from "@/components/auth/AuthForm";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/login")({
  component: LoginPage,
});

function LoginPage() {
  return (
    <div className="min-h-full h-full flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <AuthForm defaultMode="sign-in" onSuccessRedirectTo="/dashboard" />
      </div>
    </div>
  );
}
