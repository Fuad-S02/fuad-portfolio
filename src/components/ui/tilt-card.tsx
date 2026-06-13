"use client";

import { useRef } from "react";
import { motion, useSpring, useReducedMotion } from "motion/react";

const SPRING = { damping: 30, stiffness: 110, mass: 1.4 };

/**
 * Wraps a card so it tilts in 3D toward the cursor (rotateX/rotateY) and lifts
 * a touch on hover — adapted from React Bits' TiltedCard. The child should fill
 * the wrapper (h-full w-full). Disabled under reduced motion; touch devices
 * never fire the mouse events so they get the flat card.
 */
export function TiltCard({
  children,
  className,
  amplitude = 9,
  hoverScale = 1.03,
}: {
  children: React.ReactNode;
  className?: string;
  amplitude?: number;
  hoverScale?: number;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const rotateX = useSpring(0, SPRING);
  const rotateY = useSpring(0, SPRING);
  const scale = useSpring(1, SPRING);

  if (reduce) return <div className={className}>{children}</div>;

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const ox = e.clientX - r.left - r.width / 2;
    const oy = e.clientY - r.top - r.height / 2;
    rotateX.set((oy / (r.height / 2)) * -amplitude);
    rotateY.set((ox / (r.width / 2)) * amplitude);
  }
  function onEnter() {
    scale.set(hoverScale);
  }
  function onLeave() {
    scale.set(1);
    rotateX.set(0);
    rotateY.set(0);
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className={className}
      style={{ perspective: 900 }}
    >
      <motion.div
        style={{ rotateX, rotateY, scale, transformStyle: "preserve-3d" }}
        className="h-full w-full [will-change:transform]"
      >
        {children}
      </motion.div>
    </div>
  );
}
