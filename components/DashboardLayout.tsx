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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* Header - Sticky Navigation */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Context/Location indicator - Optional, but feels professional */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 text-sm font-medium text-slate-500">
                <span>Workspace</span>
                <span className="text-slate-300 dark:text-slate-700">/</span>
                <span className="text-slate-900 dark:text-slate-200">Main Dashboard</span>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-3 sm:gap-5">
              {/* Notifications - Refined */}
              <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                <Bell className="w-5 h-5" />
              </button>

              {/* Points Display - No Emoji, Lucide instead */}
              <div className="flex items-center gap-2.5 px-3.5 py-1.5 bg-indigo-50 dark:bg-indigo-950/20 rounded-full border border-indigo-100 dark:border-indigo-900/30">
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[11px] text-indigo-600/70 dark:text-indigo-400/70 uppercase tracking-widest font-bold">
                    XP
                  </span>
                  <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                    2,450
                  </span>
                </div>
              </div>

              {/* User Button */}
              <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-1" />
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
