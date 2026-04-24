"use client";

import { useState } from "react";
import { useSignUp, useAuth, useClerk, useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, User, Loader2, ArrowRight, ShieldCheck } from "lucide-react";

export default function SignUpPage() {
  const { isLoaded } = useAuth();
  const { signUp } = useSignUp();
  const { signIn } = useSignIn();
  const clerk = useClerk();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [code, setCode] = useState("");

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted dark:bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUp) return;
    setError("");
    setLoading(true);

    try {
      // @ts-ignore
      await (signUp as any).create({
        firstName,
        lastName,
        emailAddress: email,
        password,
      });

      // @ts-ignore
      await (signUp as any).prepareEmailAddressVerification({ strategy: "email_code" });
      setVerifying(true);
    } catch (err: unknown) {
      const errorObj = err as { errors?: { message: string }[] };
      setError(
        errorObj.errors?.[0]?.message || "Failed to sign up. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUp) return;
    setError("");
    setLoading(true);

    try {
      // @ts-ignore
      const completeSignUp = await (signUp as any).attemptEmailAddressVerification({
        code,
      });

      // @ts-ignore
      if (completeSignUp.status === "complete") {
        // @ts-ignore
        await clerk.setActive({ session: completeSignUp.createdSessionId });
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      const errorObj = err as { errors?: { message: string }[] };
      setError(
        errorObj.errors?.[0]?.message || "Invalid verification code."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
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
  if (verifying) {
    return (
      <div className="min-h-screen bg-muted dark:bg-background flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-[400px]">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary rounded-xl mb-4 shadow-lg shadow-primary/20 dark:shadow-none">
              <ShieldCheck className="text-white w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Check your email</h1>
            <p className="text-rum-900 dark:text-rum-800 mt-2">We sent a verification code to {email}</p>
          </div>

          <div className="bg-background dark:bg-card border border-border rounded-2xl shadow-sm p-8">
            <form onSubmit={handleVerification} className="space-y-5">
              {error && (
                <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground dark:text-rum-700 ml-1">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  placeholder="Enter 6-digit code"
                  className="w-full bg-muted border-none rounded-xl px-4 py-3 text-center text-2xl font-bold tracking-[0.5em] text-foreground placeholder-rum-500 focus:ring-2 focus:ring-primary transition-all outline-none"
                  maxLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-primary hover:bg-rum-600 disabled:opacity-50 text-primary-foreground font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 dark:shadow-none"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Verify email
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setVerifying(false)}
                className="w-full text-sm text-rum-900 hover:text-foreground font-medium pt-2"
              >
                Change email address
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted dark:bg-background flex flex-col items-center justify-center p-6 py-12">
      <div className="w-full max-w-[440px]">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary rounded-xl mb-4 shadow-lg shadow-primary/20 dark:shadow-none"><span className="text-primary-foreground font-bold text-xl">A</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Create your account</h1>
          <p className="text-rum-900 dark:text-rum-800 mt-2">Get started with Ascent productivity hub</p>
        </div>

        <div className="bg-background dark:bg-card border border-border rounded-2xl shadow-sm p-8">
          <form onSubmit={handleSignUp} className="space-y-4">
            {error && (
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground dark:text-rum-700 ml-1">
                  First name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-rum-800" />
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    placeholder="John"
                    className="w-full bg-muted border-none rounded-xl pl-10 pr-4 py-2.5 text-foreground placeholder-rum-600 focus:ring-2 focus:ring-primary transition-all outline-none"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground dark:text-rum-700 ml-1">
                  Last name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-rum-800" />
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    placeholder="Doe"
                    className="w-full bg-muted border-none rounded-xl pl-10 pr-4 py-2.5 text-foreground placeholder-rum-600 focus:ring-2 focus:ring-primary transition-all outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground dark:text-rum-700 ml-1">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-rum-800" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@company.com"
                  className="w-full bg-muted border-none rounded-xl pl-10 pr-4 py-2.5 text-foreground placeholder-rum-600 focus:ring-2 focus:ring-primary transition-all outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground dark:text-rum-700 ml-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-rum-800" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Create a password"
                  className="w-full bg-muted border-none rounded-xl pl-10 pr-4 py-2.5 text-foreground placeholder-rum-600 focus:ring-2 focus:ring-primary transition-all outline-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-primary hover:bg-rum-600 disabled:opacity-50 text-primary-foreground font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 dark:shadow-none"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Create account
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
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
              onClick={handleGoogleAuth}
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
              Already have an account?{" "}
              <Link
                href="/sign-in"
                className="text-primary dark:text-rum-800 font-semibold hover:underline underline-offset-4"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-rum-800 max-w-sm mx-auto">
          By creating an account, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}















