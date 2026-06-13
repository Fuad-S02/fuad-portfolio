"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";

const WORDS = ["Engineered.", "Crafted.", "Elevated."];
const PER = 1800; // ms per word
const EASE = [0.65, 0, 0.35, 1] as const;

/**
 * First-load intro: animated FS monogram + the hero headline cycling through
 * all three words once (Creativity Engineered / Crafted / Elevated), then it
 * fades out to the hero. Skipped under reduced motion.
 */
export function LoadingScreen() {
  const reduce = useReducedMotion();
  const [show, setShow] = useState(true);
  const [wi, setWi] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (reduce) {
      setShow(false);
      return;
    }
    videoRef.current?.play?.().catch(() => {});
    const timers: ReturnType<typeof setTimeout>[] = [];
    WORDS.forEach((_, k) => {
      if (k > 0) timers.push(setTimeout(() => setWi(k), PER * k));
    });
    // Hide shortly after the last word lands.
    timers.push(setTimeout(() => setShow(false), PER * WORDS.length + 350));
    return () => timers.forEach(clearTimeout);
  }, [reduce]);

  // Lock page scroll while the loader is up.
  useEffect(() => {
    document.documentElement.style.overflow = show ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [show]);

  if (reduce) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          aria-hidden
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-7 bg-white px-6 dark:bg-[#080a0f]"
        >
          <motion.video
            ref={videoRef}
            src="/fs-logo-anim.mp4"
            autoPlay
            muted
            loop
            playsInline
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="h-[clamp(72px,14vh,130px)] w-auto mix-blend-multiply dark:invert dark:mix-blend-screen"
          />

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-center font-display text-[clamp(2rem,7vw,4.5rem)] font-extrabold uppercase leading-[0.9] tracking-[-0.03em] text-[#0a0b0d] dark:text-white"
          >
            <span className="block">Creativity</span>
            <span className="relative block overflow-hidden pb-[0.08em]">
              <AnimatePresence mode="wait">
                <motion.span
                  key={WORDS[wi]}
                  initial={{ y: "42%", opacity: 0, filter: "blur(4px)" }}
                  animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                  exit={{ y: "-42%", opacity: 0, filter: "blur(4px)" }}
                  transition={{ duration: 0.5, ease: EASE }}
                  className="block text-gradient [will-change:transform,opacity,filter]"
                >
                  {WORDS[wi]}
                </motion.span>
              </AnimatePresence>
            </span>
          </motion.h1>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
