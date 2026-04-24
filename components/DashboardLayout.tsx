"use client";

import React from "react";
import { UserButton } from "@clerk/nextjs";
import { Sparkles, Bell } from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

/**
 * Main dashboard layout wrapper
 * Refined, professional design with consistent spacing and typography
 */
export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
}) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header - Sticky Navigation */}
      <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Context/Location indicator - Optional, but feels professional */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 text-sm font-medium text-rum-600">
                <span>Workspace</span>
                <span className="text-rum-400 dark:text-rum-700">/</span>
                <span className="text-foreground">Main Dashboard</span>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-3 sm:gap-5">
              {/* Notifications - Refined */}
              <button className="p-2 text-rum-600 hover:text-foreground transition-colors">
                <Bell className="w-5 h-5" />
              </button>

              {/* Points Display - No Emoji, Lucide instead */}
              <div className="flex items-center gap-2.5 px-3.5 py-1.5 bg-primary/10 rounded-full border border-primary/20">
                <Sparkles className="w-4 h-4 text-primary" />
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[11px] text-primary/70 uppercase tracking-widest font-bold">
                    XP
                  </span>
                  <span className="text-sm font-bold text-primary">
                    2,450
                  </span>
                </div>
              </div>

              {/* User Button */}
              <div className="h-8 w-px bg-border mx-1" />
              <div className="flex items-center">
                <UserButton 
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "w-8 h-8 rounded-lg"
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;









