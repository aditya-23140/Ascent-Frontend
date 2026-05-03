"use client";

import {
  SidebarNav,
  MobileMenuButton,
  MobileBottomNav,
} from "@/components/Navigation";
import { OnboardingGuard } from "@/components/OnboardingGuard";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OnboardingGuard>
      {/* Desktop Sidebar */}
      <SidebarNav />

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen flex flex-col pb-20 lg:pb-0">
        <div className="w-full max-w-screen-2xl mx-auto flex-1 flex flex-col">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </OnboardingGuard>
  );
}
