"use client";

import {
  SidebarNav,
  MobileMenuButton,
  MobileBottomNav,
} from "@/components/Navigation";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Desktop Sidebar */}
      <SidebarNav />

      {/* Mobile Menu Button */}
      <MobileMenuButton />

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen flex flex-col pb-20 lg:pb-0">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </>
  );
}
