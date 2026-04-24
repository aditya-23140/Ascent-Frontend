"use client";

import { useState } from "react";
import { useSignIn, useAuth, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Loader2, ArrowRight } from "lucide-react";

export default function SignInPage() {
  const { isLoaded } = useAuth();
  const { signIn } = useSignIn();
  const clerk = useClerk();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted dark:bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signIn) return;
    setError("");
    setLoading(true);

    try {
      // @ts-ignore
      const result = await (signIn as any).create({
        identifier: email,
        password,
      });

      // @ts-ignore
      if (result.status === "complete") {
        // @ts-ignore
        await clerk.setActive({ session: result.createdSessionId });
        router.push("/dashboard");
      } else {
        console.log("Sign in result status:", (result as any).status);
        setError("Sign in requires additional steps. Please use the standard Clerk UI or contact support.");
      }
    } catch (err: unknown) {
      const errorObj = err as { errors?: { message: string }[] };
      setError(
        errorObj.errors?.[0]?.message || "Invalid email or password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!signIn) return;

    try {
      await signIn.sso({
        strategy: "oauth_google",
        redirectCallbackUrl: `${window.location.origin}/sso-callback`,
        redirectUrl: "/dashboard",
      });
    } catch (err: unknown) {
      const errorObj = err as { errors?: { message: string }[] };
      setError(errorObj.errors?.[0]?.message || "Google sign-in failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-muted dark:bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary rounded-xl mb-4 shadow-lg shadow-primary/20 dark:shadow-none"><span className="text-primary-foreground font-bold text-xl">A</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Welcome back</h1>
          <p className="text-rum-900 dark:text-rum-800 mt-2">Enter your credentials to access Ascent</p>
        </div>

        <div className="bg-background dark:bg-card border border-border rounded-2xl shadow-sm p-8">
          <form onSubmit={handleSignIn} className="space-y-5">
            {error && (
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground dark:text-rum-700 ml-1">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4.5 h-4.5 text-rum-800" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@company.com"
                  className="w-full bg-muted border-none rounded-xl pl-11 pr-4 py-3 text-foreground placeholder-rum-600 focus:ring-2 focus:ring-primary transition-all outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-sm font-medium text-foreground dark:text-rum-700">
                  Password
                </label>
                <Link href="#" className="text-xs font-semibold text-primary hover:text-primary">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4.5 h-4.5 text-rum-800" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  className="w-full bg-muted border-none rounded-xl pl-11 pr-4 py-3 text-foreground placeholder-rum-600 focus:ring-2 focus:ring-primary transition-all outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-primary hover:bg-rum-600 disabled:opacity-50 text-primary-foreground font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background dark:bg-card px-2 text-rum-800 font-bold tracking-widest leading-none">Or continue with</span>
              </div>
            </div>

            <button
              onClick={handleGoogleSignIn}
              className="w-full h-12 bg-background dark:bg-card border border-border hover:border-primary/30 dark:hover:border-primary/50 rounded-xl font-bold text-sm text-foreground flex items-center justify-center gap-3 transition-all"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 4.2 2.18 7.07 3.66 2.84 5.33 0 11.74 0 12v3.33c0 3.33-2.18 6.16-4.53 6.16z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-sm text-rum-900 dark:text-rum-800">
              New to Ascent?{" "}
              <Link
                href="/sign-up"
                className="text-primary dark:text-rum-800 font-semibold hover:underline underline-offset-4"
              >
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}















