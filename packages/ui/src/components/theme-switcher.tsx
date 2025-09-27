"use client";

import { useEffect, useState } from "react";

type Theme = "system" | "light" | "dark";

// ✅ CORREÇÃO: Mudar de "export default" para "export function"
export function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = (localStorage.getItem("theme") as Theme) || "system";
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (newTheme: Theme) => {
    const root = window.document.documentElement;
    
    root.classList.remove("light", "dark");
    
    if (newTheme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches 
        ? "dark" 
        : "light";
      root.classList.add(systemTheme);
      root.style.colorScheme = systemTheme;
    } else {
      root.classList.add(newTheme);
      root.style.colorScheme = newTheme;
    }
  };

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    applyTheme(newTheme);
  };

  if (!mounted) {
    return (
      <div className="flex w-fit rounded-full border bg-background p-0.5">
        <div className="flex size-6" />
        <div className="flex size-6" />
        <div className="flex size-6" />
      </div>
    );
  }

  return (
    <div className="flex w-fit rounded-full border bg-background p-0.5">
      <span className="h-full">
        <input 
          className="peer sr-only" 
          id="theme-switch-system" 
          type="radio" 
          value="system" 
          name="theme"
          checked={theme === "system"}
          onChange={() => handleThemeChange("system")}
        />
        <label 
          htmlFor="theme-switch-system" 
          className="flex size-6 cursor-pointer items-center justify-center rounded-full text-muted-foreground peer-checked:bg-accent peer-checked:text-foreground" 
          aria-label="System theme"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="lucide lucide-laptop size-4 shrink-0"
          >
            <path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16" />
          </svg>
        </label>
      </span>
      <span className="h-full">
        <input 
          className="peer sr-only" 
          id="theme-switch-light" 
          type="radio" 
          value="light" 
          name="theme"
          checked={theme === "light"}
          onChange={() => handleThemeChange("light")}
        />
        <label 
          htmlFor="theme-switch-light" 
          className="flex size-6 cursor-pointer items-center justify-center rounded-full text-muted-foreground peer-checked:bg-accent peer-checked:text-foreground" 
          aria-label="Light theme"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="lucide lucide-sun size-4 shrink-0"
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2" />
            <path d="M12 20v2" />
            <path d="m4.93 4.93 1.41 1.41" />
            <path d="m17.66 17.66 1.41 1.41" />
            <path d="M2 12h2" />
            <path d="M20 12h2" />
            <path d="m6.34 17.66-1.41 1.41" />
            <path d="m19.07 4.93-1.41 1.41" />
          </svg>
        </label>
      </span>
      <span className="h-full">
        <input 
          className="peer sr-only" 
          id="theme-switch-dark" 
          type="radio" 
          value="dark" 
          name="theme"
          checked={theme === "dark"}
          onChange={() => handleThemeChange("dark")}
        />
        <label 
          htmlFor="theme-switch-dark" 
          className="flex size-6 cursor-pointer items-center justify-center rounded-full text-muted-foreground peer-checked:bg-accent peer-checked:text-foreground" 
          aria-label="Dark theme"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="lucide lucide-moon size-4 shrink-0"
          >
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
          </svg>
        </label>
      </span>
    </div>
  );
}
