"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/<>[]{}#*+=";

/**
 * Text that "decodes" into place: characters cycle through random glyphs and
 * resolve left → right each time `active` turns true.
 *
 * Layout-stable: the real text sits invisible underneath and the scrambled
 * copy is overlaid on top, so lines never re-wrap mid-animation.
 */
export function ScrambleText({
  text,
  active,
  duration = 900,
  className,
  fillClassName,
  glyphs = GLYPHS,
}: {
  text: string;
  active: boolean;
  duration?: number;
  className?: string;
  /** Characters to cycle through (e.g. lowercase for body-size sentences). */
  glyphs?: string;
  /** Classes for the visible text layer (e.g. a bg-clip-text gradient). */
  fillClassName?: string;
}) {
  const reduce = useReducedMotion();
  const [out, setOut] = useState(text);

  const animating = active && !reduce;
  const shown = animating ? out : text;

  useEffect(() => {
    if (!animating) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const k = Math.min(1, (now - t0) / duration);
      const resolved = Math.floor(k * text.length);
      let s = "";
      for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (ch === " " || ch === "\n" || i < resolved) s += ch;
        else s += glyphs[(Math.random() * glyphs.length) | 0];
      }
      setOut(s);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [animating, text, duration, glyphs]);

  return (
    <span className={cn("relative inline-block", className)} aria-label={text}>
      <span aria-hidden className="invisible">
        {text}
      </span>
      <span aria-hidden className={cn("absolute inset-0", fillClassName)}>
        {shown}
      </span>
    </span>
  );
}
