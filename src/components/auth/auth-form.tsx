"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import {
  Building,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Sparkles,
  User,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

// Add Google icon from SVG
const GoogleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="currentColor"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="currentColor"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="currentColor"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="currentColor"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

interface AuthFormProps {
  redirectTo?: string;
}

export function AuthForm({ redirectTo = "/dashboard" }: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const supabase = createClient();
  const searchParams = useSearchParams();

  // Get redirect URL from search params or use default
  const redirectUrl = searchParams.get("redirectTo") || redirectTo;

  // Check for OAuth errors in URL
  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      setMessage({
        type: "error",
        text: decodeURIComponent(error),
      });
      // Clean up URL
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("error");
      window.history.replaceState({}, "", newUrl.toString());
    }
  }, [searchParams]);

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      setMessage(null);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${
            window.location.origin
          }/auth/callback?next=${encodeURIComponent(redirectUrl)}`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        setMessage({ type: "error", text: error.message });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to sign in with Google" });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage({ type: "error", text: error.message });
      } else {
        setMessage({ type: "success", text: "Signed in successfully!" });
        window.location.href = redirectUrl;
      }
    } catch (error) {
      setMessage({ type: "error", text: "An unexpected error occurred" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const fullName = formData.get("fullName") as string;
    const clinicName = formData.get("clinicName") as string;

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            clinic_name: clinicName,
            role: "admin",
          },
        },
      });

      if (error) {
        setMessage({ type: "error", text: error.message });
      } else {
        setMessage({
          type: "success",
          text: "Check your email for the confirmation link!",
        });
      }
    } catch (error) {
      setMessage({ type: "error", text: "An unexpected error occurred" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="mb-10">
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/10">
                <Sparkles className="w-7 h-7" />
              </div>
              <h1 className="text-4xl font-bold font-display tracking-tight">
                NEONPRO
              </h1>
            </div>
            <h2 className="text-5xl font-bold font-display mb-6 leading-tight tracking-tight">
              Advanced Business
              <br />
              SaaS Platform
            </h2>
            <p className="text-lg text-white/90 mb-10 leading-relaxed max-w-md">
              Streamline your clinic operations with AI-powered insights and
              modern management tools designed for healthcare professionals.
            </p>
          </div>

          <div className="space-y-5">
            <div className="flex items-center space-x-4">
              <div className="w-2.5 h-2.5 bg-white/60 rounded-full shadow-sm" />
              <span className="text-white/90 text-base font-medium">
                Patient Management System
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2.5 h-2.5 bg-white/60 rounded-full shadow-sm" />
              <span className="text-white/90 text-base font-medium">
                AI-Powered Recommendations
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2.5 h-2.5 bg-white/60 rounded-full shadow-sm" />
              <span className="text-white/90 text-base font-medium">
                Advanced Analytics Dashboard
              </span>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-16 right-16 w-40 h-40 bg-white/8 rounded-full blur-2xl" />
        <div className="absolute bottom-16 left-16 w-32 h-32 bg-white/8 rounded-full blur-2xl" />
        <div className="absolute top-1/2 right-8 w-20 h-20 bg-white/5 rounded-full blur-xl" />
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold font-display text-foreground">
                NEONPRO
              </h1>
            </div>
            <p className="text-muted-foreground">
              Advanced Business SaaS Platform
            </p>
          </div>

          {/* Auth Card */}
          <Card className="w-full border-border/50 shadow-lg">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-3xl font-bold font-display text-foreground">
                {isSignUp ? "Create Account" : "Welcome Back"}
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {isSignUp
                  ? "Start your journey with NEONPRO today"
                  : "Sign in to your account to continue"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Toggle Buttons */}
              <div
                className="flex bg-surface rounded-lg p-1"
                role="tablist"
                aria-label="Authentication mode"
              >
                <button
                  id="signin-tab"
                  type="button"
                  role="tab"
                  aria-selected={!isSignUp}
                  aria-controls="auth-form-panel"
                  onClick={() => setIsSignUp(false)}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                    !isSignUp
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Sign In
                </button>
                <button
                  id="signup-tab"
                  type="button"
                  role="tab"
                  aria-selected={isSignUp}
                  aria-controls="auth-form-panel"
                  onClick={() => setIsSignUp(true)}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                    isSignUp
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {/* Forms */}
              <div
                id="auth-form-panel"
                role="tabpanel"
                aria-labelledby={!isSignUp ? "signin-tab" : "signup-tab"}
              >
                {/* Google Sign In Button */}
                <div className="mb-6">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 relative border-border hover:bg-accent"
                    onClick={handleGoogleSignIn}
                    disabled={isGoogleLoading || isLoading}
                  >
                    {isGoogleLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <GoogleIcon className="mr-2 h-4 w-4" />
                    )}
                    Continue with Google
                  </Button>
                </div>

                {/* Divider */}
                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with email
                    </span>
                  </div>
                </div>

                {!isSignUp ? (
                  <form
                    onSubmit={handleSignIn}
                    className="space-y-6"
                    aria-label="Sign in form"
                  >
                    <div className="space-y-4">
                      <div>
                        <Label
                          htmlFor="signin-email"
                          className="text-sm font-medium text-foreground"
                        >
                          Email
                        </Label>
                        <div className="mt-1 relative">
                          <Mail
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
                            aria-hidden="true"
                          />
                          <Input
                            id="signin-email"
                            name="email"
                            type="email"
                            placeholder="Enter your email"
                            className="pl-10 h-12 border-border focus:border-primary focus:ring-primary focus:ring-offset-2"
                            required
                            autoComplete="email"
                          />
                        </div>
                      </div>
                      <div>
                        <Label
                          htmlFor="signin-password"
                          className="text-sm font-medium text-foreground"
                        >
                          Password
                        </Label>
                        <div className="mt-1 relative">
                          <Lock
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
                            aria-hidden="true"
                          />
                          <Input
                            id="signin-password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            className="pl-10 pr-10 h-12 border-border focus:border-primary focus:ring-primary focus:ring-offset-2"
                            required
                            autoComplete="current-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm"
                            aria-label={
                              showPassword ? "Hide password" : "Show password"
                            }
                            aria-pressed={showPassword}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" aria-hidden="true" />
                            ) : (
                              <Eye className="h-4 w-4" aria-hidden="true" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                      disabled={isLoading}
                      aria-describedby={
                        isLoading ? "signin-loading" : undefined
                      }
                    >
                      {isLoading && (
                        <Loader2
                          className="mr-2 h-4 w-4 animate-spin"
                          aria-hidden="true"
                        />
                      )}
                      <span id="signin-loading" className="sr-only">
                        {isLoading ? "Signing in..." : ""}
                      </span>
                      Sign In
                    </Button>
                  </form>
                ) : (
                  <form
                    onSubmit={handleSignUp}
                    className="space-y-6"
                    aria-label="Sign up form"
                  >
                    <div className="space-y-4">
                      <div>
                        <Label
                          htmlFor="signup-fullname"
                          className="text-sm font-medium text-foreground"
                        >
                          Full Name
                        </Label>
                        <div className="mt-1 relative">
                          <User
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
                            aria-hidden="true"
                          />
                          <Input
                            id="signup-fullname"
                            name="fullName"
                            type="text"
                            placeholder="Enter your full name"
                            className="pl-10 h-12 border-border focus:border-primary focus:ring-primary focus:ring-offset-2"
                            required
                            autoComplete="name"
                          />
                        </div>
                      </div>
                      <div>
                        <Label
                          htmlFor="signup-clinic"
                          className="text-sm font-medium text-foreground"
                        >
                          Clinic Name
                        </Label>
                        <div className="mt-1 relative">
                          <Building
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
                            aria-hidden="true"
                          />
                          <Input
                            id="signup-clinic"
                            name="clinicName"
                            type="text"
                            placeholder="Enter your clinic name"
                            className="pl-10 h-12 border-border focus:border-primary focus:ring-primary focus:ring-offset-2"
                            required
                            autoComplete="organization"
                          />
                        </div>
                      </div>
                      <div>
                        <Label
                          htmlFor="signup-email"
                          className="text-sm font-medium text-foreground"
                        >
                          Email
                        </Label>
                        <div className="mt-1 relative">
                          <Mail
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
                            aria-hidden="true"
                          />
                          <Input
                            id="signup-email"
                            name="email"
                            type="email"
                            placeholder="Enter your email"
                            className="pl-10 h-12 border-border focus:border-primary focus:ring-primary focus:ring-offset-2"
                            required
                            autoComplete="email"
                          />
                        </div>
                      </div>
                      <div>
                        <Label
                          htmlFor="signup-password"
                          className="text-sm font-medium text-foreground"
                        >
                          Password
                        </Label>
                        <div className="mt-1 relative">
                          <Lock
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
                            aria-hidden="true"
                          />
                          <Input
                            id="signup-password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Create a password"
                            className="pl-10 pr-10 h-12 border-border focus:border-primary focus:ring-primary focus:ring-offset-2"
                            required
                            autoComplete="new-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm"
                            aria-label={
                              showPassword ? "Hide password" : "Show password"
                            }
                            aria-pressed={showPassword}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" aria-hidden="true" />
                            ) : (
                              <Eye className="h-4 w-4" aria-hidden="true" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                      disabled={isLoading}
                      aria-describedby={
                        isLoading ? "signup-loading" : undefined
                      }
                    >
                      {isLoading && (
                        <Loader2
                          className="mr-2 h-4 w-4 animate-spin"
                          aria-hidden="true"
                        />
                      )}
                      <span id="signup-loading" className="sr-only">
                        {isLoading ? "Creating account..." : ""}
                      </span>
                      Create Account
                    </Button>
                  </form>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Message Alert */}
          {message && (
            <Alert
              role={message.type === "error" ? "alert" : "status"}
              aria-live={message.type === "error" ? "assertive" : "polite"}
              className={`${
                message.type === "error"
                  ? "border-error/20 bg-error/5"
                  : "border-success/20 bg-success/5"
              }`}
            >
              <AlertDescription
                className={
                  message.type === "error" ? "text-error" : "text-success"
                }
              >
                {message.text}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}
