"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUserStats } from "@/hooks/useUserStats";
import { Loader2 } from "lucide-react";

export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useUserStats();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && profile && !profile.onboarded && pathname !== "/role-selection") {
      router.push("/role-selection");
    }
  }, [profile, loading, pathname, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // If not onboarded and not on the role selection page, show nothing while redirecting
  if (profile && !profile.onboarded && pathname !== "/role-selection") {
    return null;
  }

  return <>{children}</>;
}
