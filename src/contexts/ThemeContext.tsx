import React, { createContext, useContext, useEffect } from "react";

interface ThemeContextType {
  theme: "dark";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Apply dark theme class to document on mount
  useEffect(() => {
    const root = document.documentElement;
    // Remove any other theme classes
    root.classList.remove("light", "high-contrast");
    // Dark theme is default, no class needed
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: "dark" }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
