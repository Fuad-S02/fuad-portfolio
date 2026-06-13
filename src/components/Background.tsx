"use client";

import { useTheme } from "./theme";
import { CursorAura } from "./ui/cursor-aura";

/**
 * Fixed page backdrop: a base wash + a single lightweight cursor aura
 * (soft light + sparkles clustered around the cursor). Smooth — it only renders
 * while the cursor moves and halts when idle.
 */
export function Background() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base wash */}
      <div
        className={
          isDark
            ? "absolute inset-0 bg-[radial-gradient(130%_130%_at_50%_20%,#0c1430_0%,#08090d_60%)]"
            : "absolute inset-0 bg-[radial-gradient(130%_130%_at_50%_20%,#f3f7ff_0%,#ffffff_60%)]"
        }
      />

      {/* Cursor light + sparkles */}
      <CursorAura
        key={theme}
        className="absolute inset-0 h-full w-full"
        glowRgb={isDark ? "96,165,250" : "37,99,235"}
        sparkColors={
          isDark
            ? ["#dbeafe", "#93c5fd", "#ffffff"]
            : ["#3b82f6", "#1d4ed8", "#60a5fa"]
        }
        revealRadius={isDark ? 165 : 140}
        density={isDark ? 120 : 95}
        additive={isDark}
      />
    </div>
  );
}
