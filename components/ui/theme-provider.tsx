"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

// Any o'rniga aniqroq type beramiz
interface ThemeContextType {
  theme: string;
  setTheme: (theme: string) => void;
  resolvedTheme: string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // 1. LocalStorage dan o'qiymiz
    const saved = localStorage.getItem("theme") || "dark";
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setThemeState(saved);

    // 2. Klassni qo'shamiz
    if (saved === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // 3. MUHIM: Mounted'ni true qilamiz (sizda shu yo'q edi)
    setMounted(true);
  }, []);

  const setTheme = (newTheme: string) => {
    setThemeState(newTheme);
    localStorage.setItem("theme", newTheme);

    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const value = {
    theme,
    setTheme,
    resolvedTheme: theme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {/* Agar mounted bo'lmagan bo'lsa, children'ni shunchaki chiqaramiz, 
          lekin effektlar faqat client'da ishlaydi */}
      <div style={{ display: mounted ? "contents" : "none" }}>{children}</div>
      {!mounted && <div className="fixed inset-0 bg-background" />}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme Provider ichida ishlatilishi shart!");
  return context;
};
