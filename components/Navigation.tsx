"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  CheckSquare, 
  Clock, 
  Settings, 
  ShoppingBag, 
  Shield, 
  Store,
  Menu,
  X
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { useUserStats } from "@/hooks/useUserStats";

export function SidebarNav() {
  const pathname = usePathname();
  const { profile } = useUserStats();

  const getNavItems = () => {
    const role = profile?.role || "standard";
    
    if (role === "parent") {
      return [
        { label: "Dashboard", href: "/guardian", icon: LayoutDashboard },
        { label: "Store Setup", href: "/guardian/store", icon: Store },
        { label: "Manage Family", href: "/guardian/settings", icon: Shield },
        { label: "Settings", href: "/settings", icon: Settings },
      ];
    }

    const items = [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Tasks", href: "/tasks", icon: CheckSquare },
      { label: "Focus", href: "/focus", icon: Clock },
    ];

    if (role === "student") {
      items.push({ label: "Reward Store", href: "/store", icon: ShoppingBag });
    }

    items.push({ label: "Settings", href: "/settings", icon: Settings });
    return items;
  };

  const navItems = getNavItems();

  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-64 lg:flex-col bg-background border-r border-border">
      <div className="flex items-center gap-2 px-6 py-10">
        <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-sm">A</span>
        </div>
        <span className="font-bold text-lg text-foreground">Ascent</span>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className="block">
              <div className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded text-sm font-bold transition-all",
                isActive 
                  ? "bg-primary/10 text-primary border-l-2 border-primary pl-2.5" 
                  : "text-rum-600 hover:text-foreground hover:bg-muted"
              )}>
                <Icon className="w-4 h-4" />
                {item.label}
              </div>
            </Link>
          );
        })}

      </nav>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 px-2 py-2">
          <UserButton appearance={{ elements: { userButtonAvatarBox: "w-8 h-8 rounded" } }} />
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold truncate">My Account</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const { profile } = useUserStats();
  
  const getNavItems = () => {
    const role = profile?.role || "standard";
    if (role === "parent") {
      return [
        { label: "Dashboard", href: "/guardian", icon: LayoutDashboard },
        { label: "Store", href: "/guardian/store", icon: Store },
        { label: "Family", href: "/guardian/settings", icon: Shield },
        { label: "Settings", href: "/settings", icon: Settings },
      ];
    }
    const items = [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Tasks", href: "/tasks", icon: CheckSquare },
      { label: "Focus", href: "/focus", icon: Clock },
    ];
    if (role === "student") items.push({ label: "Store", href: "/store", icon: ShoppingBag });
    items.push({ label: "Settings", href: "/settings", icon: Settings });
    return items;
  };

  const navItems = getNavItems();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border z-40">
      <div className="flex items-center justify-around px-2 py-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className={cn(
              "flex flex-col items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase tracking-wider",
              isActive ? "text-primary" : "text-rum-600"
            )}>
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function MobileMenuButton() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { profile } = useUserStats();

  const getNavItems = () => {
    const role = profile?.role || "standard";
    if (role === "parent") {
      return [
        { label: "Dashboard", href: "/guardian", icon: LayoutDashboard },
        { label: "Store Setup", href: "/guardian/store", icon: Store },
        { label: "Manage Family", href: "/guardian/settings", icon: Shield },
        { label: "Settings", href: "/settings", icon: Settings },
      ];
    }
    const items = [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Tasks", href: "/tasks", icon: CheckSquare },
      { label: "Focus", href: "/focus", icon: Clock },
    ];
    if (role === "student") items.push({ label: "Reward Store", href: "/store", icon: ShoppingBag });
    items.push({ label: "Settings", href: "/settings", icon: Settings });
    return items;
  };

  const navItems = getNavItems();

  return (
    <>
      <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-card border border-border rounded shadow-premium">
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
      {isOpen && (
        <div className="lg:hidden fixed inset-0 bg-background z-40 p-10 flex flex-col gap-6">
          <div className="text-xl font-black text-primary">Ascent</div>
          <nav className="flex flex-col gap-4">
            {navItems.map(item => (
              <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)} className="text-lg font-bold text-foreground hover:text-primary transition-colors">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}









