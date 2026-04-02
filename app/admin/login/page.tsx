"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useTranslations } from 'next-intl';
import { toast } from "sonner";

export default function AdminLoginPage() {
  const router = useRouter();
  const t = useTranslations('admin.login');
  const tAuth = useTranslations('auth');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLoggingIn) {
      return;
    }

    setError("");
    setLoading(true);
    setIsLoggingIn(true);

    try {
      const response = await fetch("/api/auth/sign-in/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Login failed");
      }

      const data = await response.json();

      if (data.user) {
        // Wait for browser to process cookies
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Verify cookie is set by making a test request
        try {
          const testResponse = await fetch("/api/auth/get-session", {
            credentials: "include",
          });

          if (testResponse.ok) {
            const sessionData = await testResponse.json();

            if (sessionData) {
              // Show success toast
              toast.success("Login successful! Redirecting...");

              // Redirect to dashboard
              setTimeout(() => {
                window.location.href = "/admin";
              }, 500);
            } else {
              // Session doesn't exist yet, wait longer
              await new Promise(resolve => setTimeout(resolve, 1000));
              window.location.href = "/admin";
            }
          } else {
            throw new Error("Session verification failed");
          }
        } catch (testError) {
          // If verification fails, still redirect (session might be valid)
          window.location.href = "/admin";
        }
      } else {
        throw new Error("Login failed - no user data returned");
      }
    } catch (err) {
      let message = err instanceof Error ? err.message : "An error occurred";
      // If user is inactive/unverified, show generic error instead of specific verification message
      if (message.toLowerCase().includes("verified")) {
        message = tAuth('invalidCredentials');
      }
      setError(message);
      setIsLoggingIn(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card rounded-2xl p-8 shadow-sm border border-border">
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-2">
            <img
              src="/assets/oliv-logo.png"
              alt="OLIV Logo"
              className="h-16 w-auto"
              style={{ width: 'auto', height: '4rem' }}
            />
          </div>
          <p className="text-muted-foreground">
            {t('signIn')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              {t('email')}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-border bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder={t('emailPlaceholder')}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              {t('password')}
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 pr-12 rounded-lg border border-border bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder={t('passwordPlaceholder')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || isLoggingIn}
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-secondary hover:text-secondary-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading || isLoggingIn ? t('signingIn') : t('signInBtn')}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>{t('protectedAccess')}</p>
        </div>
      </div>
    </div>
  );
}
