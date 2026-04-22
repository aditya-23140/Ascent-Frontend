"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  LayoutDashboard,
  CheckSquare,
  Clock,
  Settings,
  ChevronRight,
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

/**
 * Navigation items
 */
const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Tasks",
    href: "/tasks",
    icon: CheckSquare,
  },
  {
    label: "Focus",
    href: "/focus",
    icon: Clock,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

/**
 * Desktop Sidebar Navigation
 */
export function SidebarNav() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-64 lg:flex-col bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 shadow-[1px_0_0_0_rgba(0,0,0,0.05)]">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-8">
        <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-indigo-100 dark:shadow-none">
          <span className="text-white font-bold text-base tracking-tight">A</span>
        </div>
        <span className="font-bold text-xl text-slate-900 dark:text-white tracking-tight">Ascent</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1.5 mt-2">
        <p className="px-3 mb-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em]">
          Overview
        </p>
        
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link key={item.href} href={item.href} className="block">
              <div
                className={cn(
                  "group flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer",
                  isActive
                    ? "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400"
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-200"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className={cn("w-5 h-5 transition-colors", isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600")} />
                  <span className="font-semibold text-sm">{item.label}</span>
                </div>
                {isActive && (
                  <motion.div layoutId="active-nav-indicator">
                    <ChevronRight className="w-3.5 h-3.5 text-indigo-600/50" />
                  </motion.div>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-900">
        <div className="flex items-center gap-3 px-3 py-2">
          <UserButton 
            appearance={{
              elements: {
                userButtonAvatarBox: "w-9 h-9 rounded-lg",
                userButtonTrigger: "focus:shadow-none"
              }
            }} 
          />
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold text-slate-900 dark:text-slate-200 truncate leading-none">Account</span>
            <span className="text-[11px] text-slate-400 mt-1 truncate">Manage profile</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

/**
 * Mobile Bottom Navbar
 */
export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 z-40 pb-safe">
      <div className="flex items-center justify-around px-4 py-3">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1.5 px-3 py-1 rounded-xl transition-all duration-200 relative",
                isActive
                  ? "text-indigo-600 dark:text-indigo-400"
                  : "text-slate-400"
              )}
            >
              <Icon className="w-6 h-6" />
              <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
              {isActive && (
                <motion.div 
                  layoutId="mobile-indicator"
                  className="absolute -top-3 w-1 h-1 bg-indigo-600 rounded-full"
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

/**
 * Mobile Menu Button (Hamburger - usually for top bar)
 */
export function MobileMenuButton() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2.5 bg-white dark:bg-slate-900 shadow-premium border border-slate-200 dark:border-slate-800 rounded-xl"
      >
        {isOpen ? <X className="w-5 h-5 text-slate-600" /> : <Menu className="w-5 h-5 text-slate-600" />}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="lg:hidden fixed inset-y-0 right-0 w-[280px] bg-white dark:bg-slate-950 z-50 shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-900">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-base">A</span>
                  </div>
                  <span className="font-bold text-xl tracking-tight">Ascent</span>
                </div>
              </div>

              <nav className="flex-1 px-4 py-8 space-y-2">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="block"
                    >
                      <div
                        className={cn(
                          "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200",
                          isActive
                            ? "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400"
                            : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900"
                        )}
                      >
                        <Icon className="w-6 h-6" />
                        <span className="font-bold text-base">{item.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </nav>

              <div className="p-6 border-t border-slate-100 dark:border-slate-900">
                <div className="flex items-center gap-4">
                  <UserButton />
                  <span className="font-bold text-slate-900 dark:text-slate-200">Account settings</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
