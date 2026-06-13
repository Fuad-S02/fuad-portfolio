import type { Variants } from "motion/react";

/**
 * One choreography language for the whole site.
 * Signature easing — a soft, confident "out-expo"-style settle.
 * GUARDRAIL: animate transform/opacity only (keeps scroll smooth).
 */
export const EASE = [0.16, 1, 0.3, 1] as const;

export const DUR = {
  fast: 0.6,
  base: 0.75,
  slow: 0.95,
} as const;

/** Reveal once, slightly before the block is fully in view. */
export const viewportOnce = { once: true, margin: "-100px" } as const;

/**
 * Container that staggers its direct children when it enters view.
 * Children animate in DOM order → eyebrow → headline → body → media.
 */
export const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.09, delayChildren: 0.05 },
  },
};

/** Standard element: rise + fade. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: DUR.base, ease: EASE } },
};

/**
 * A single headline line that wipes up from behind a clip edge.
 * The PARENT element must have `overflow-hidden` for the mask to work.
 */
export const maskLine: Variants = {
  hidden: { y: "118%" },
  show: { y: 0, transition: { duration: DUR.slow, ease: EASE } },
};
