"use client";

import { useTheme } from "next-themes";

import { Icons } from "~/components/icons";
import { Button } from "~/components/ui/button";

export function ModeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <Icons.sun className="scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
      <Icons.moon className="absolute scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
