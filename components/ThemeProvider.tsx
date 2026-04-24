"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useUserStats } from "@/hooks/useUserStats";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile } = useUserStats();
  const [theme, setThemeState] = useState<Theme>("light");

  // Load initial theme from profile or localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme;
    const profileTheme = (profile?.preferences as any)?.theme as Theme;
    
    if (profileTheme) {
      setThemeState(profileTheme);
    } else if (savedTheme) {
      setThemeState(savedTheme);
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setThemeState("dark");
    }
  }, [profile]);

  // Apply theme to DOM
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};









