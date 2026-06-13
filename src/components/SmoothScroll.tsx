"use client";

import { ReactLenis } from "lenis/react";
import { MotionConfig, useReducedMotion } from "motion/react";

/**
 * Site-wide motion foundation:
 *  - MotionConfig reducedMotion="user" → every motion reveal drops its
 *    transform (movement) but keeps opacity when the user prefers reduced
 *    motion, so the whole reveal system degrades gracefully in one place.
 *  - Lenis smooth scroll (root mode). Lenis scrolls the real document, so
 *    motion's useScroll and IntersectionObserver whileInView keep working.
 *
 * When reduced motion is set we skip Lenis entirely and let the browser
 * scroll natively. Root mode renders no wrapper element, so both branches
 * produce identical DOM (no hydration mismatch).
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();

  return (
    <MotionConfig reducedMotion="user">
      {reduce ? (
        children
      ) : (
        <ReactLenis
          root
          options={{
            lerp: 0.1,
            duration: 1.1,
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 1.6,
          }}
        >
          {children}
        </ReactLenis>
      )}
    </MotionConfig>
  );
}
