"use client";

import { motion, type HTMLMotionProps } from "motion/react";
import { cn } from "@/lib/utils";
import {
  staggerContainer,
  fadeUp,
  maskLine,
  viewportOnce,
} from "@/lib/motion";

/**
 * Choreographed reveal container. Staggers its direct children (which should
 * be <motion.*> nodes using the `fadeUp`/`maskLine` variants) in DOM order.
 *
 * trigger="view" (default) → reveals when scrolled into view, once.
 * trigger="load" → reveals on mount (use for the hero, above the fold).
 */
export function Reveal({
  trigger = "view",
  children,
  ...rest
}: HTMLMotionProps<"div"> & { trigger?: "view" | "load" }) {
  const triggerProps =
    trigger === "load"
      ? ({ initial: "hidden", animate: "show" } as const)
      : ({
          initial: "hidden",
          whileInView: "show",
          viewport: viewportOnce,
        } as const);

  return (
    <motion.div variants={staggerContainer} {...triggerProps} {...rest}>
      {children}
    </motion.div>
  );
}

/** A staggered child that rises + fades. Polymorphic-ish via `as`. */
export function RevealItem({
  as = "div",
  children,
  ...rest
}: HTMLMotionProps<"div"> & { as?: "div" | "p" | "ul" | "dl" | "li" }) {
  const Comp = motion[as] as typeof motion.div;
  return (
    <Comp variants={fadeUp} {...rest}>
      {children}
    </Comp>
  );
}

/**
 * One headline line that wipes up from behind a clip edge.
 * Render one per visual line inside a heading; the heading sits inside a
 * <Reveal> so these inherit the show/hidden state and stagger.
 */
export function MaskLine({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className="block overflow-hidden pb-[0.06em]">
      <motion.span variants={maskLine} className={cn("block", className)}>
        {children}
      </motion.span>
    </span>
  );
}
