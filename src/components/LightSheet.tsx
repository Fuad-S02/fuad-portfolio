"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useMotionValueEvent, useScroll } from "motion/react";

/**
 * The white sheet that holds the work sphere and Experience. While any part
 * of it sits under the fixed header, flags `html[data-surface="light"]` so the
 * header ink turns dark (see `.nav-ink` rules in globals.css).
 */
export function LightSheet({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 72px", "end 72px"],
  });
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const root = document.documentElement;
    if (v > 0 && v < 1) root.dataset.surface = "light";
    else delete root.dataset.surface;
  });
  useEffect(() => () => void delete document.documentElement.dataset.surface, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
