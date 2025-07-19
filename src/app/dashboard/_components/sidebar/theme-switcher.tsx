"use client";

import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { updateThemeMode } from "@/lib/theme-utils";
import { usePreferencesStore } from "@/store/preferences/provider";
import { setValueToCookie } from "@/server/actions/preferences";

export function ThemeSwitcher() {
  const themeMode = usePreferencesStore((s) => s.themeMode);
  const setThemeMode = usePreferencesStore((s) => s.setThemeMode);

  const handleValueChange = async () => {
    const newTheme = themeMode === "dark" ? "light" : "dark";
    updateThemeMode(newTheme);
    setThemeMode(newTheme);
    await setValueToCookie("theme_mode", newTheme);
  };

  return (
    <Button size="icon" onClick={handleValueChange}>
      {themeMode === "dark" ? <Sun /> : <Moon />}
    </Button>
  );
}
