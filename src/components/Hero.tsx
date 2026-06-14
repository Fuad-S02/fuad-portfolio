"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useReducedMotion,
} from "motion/react";
import Link from "next/link";
import { fadeUp } from "@/lib/motion";
import { Reveal, MaskLine } from "./ui/reveal";

const capabilities = [
  { label: "Brand Design", icon: IconDiamond },
  { label: "Motion Graphics", icon: IconWave },
  { label: "UI/UX Design", icon: IconGrid },
  { label: "AI Creative", icon: IconSpark },
];

/** Second headline word — rises up to appear, sinks down to leave, looping. */
const ROTATING_WORDS = ["Engineered.", "Crafted.", "Elevated."];
// Smooth ease-in-out so the rise/sink feels calm, not snappy.
const WORD_EASE = [0.65, 0, 0.35, 1] as const;

export function RotatingWord() {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(
      () => setI((p) => (p + 1) % ROTATING_WORDS.length),
      3600
    );
    return () => clearInterval(id);
  }, [reduce]);

  if (reduce) {
    return (
      <span className="block overflow-hidden pb-[0.06em]">
        <span className="block text-gradient">{ROTATING_WORDS[0]}</span>
      </span>
    );
  }

  return (
    <span className="relative block overflow-hidden pb-[0.08em]">
      <AnimatePresence mode="wait">
        <motion.span
          key={ROTATING_WORDS[i]}
          initial={{ y: "42%", opacity: 0, filter: "blur(4px)" }}
          animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
          exit={{ y: "-42%", opacity: 0, filter: "blur(4px)" }}
          transition={{ duration: 0.55, ease: WORD_EASE }}
          className="block text-gradient [will-change:transform,opacity,filter]"
        >
          {ROTATING_WORDS[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export function Hero() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  // Headline block drifts up + fades as the hero scrolls out — depth against
  // the fixed cursor-aura background.
  const y = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative flex min-h-screen items-center px-6 pt-28 pb-20 text-ink sm:px-10 lg:px-16"
    >
      <motion.div
        style={reduce ? undefined : { y, opacity }}
        className="relative z-10 w-full"
      >
        <Reveal trigger="load" className="mx-auto w-full max-w-6xl">
        <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-2.5">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/40 px-4 py-1.5 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-blue pulse-dot" />
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em]">
              Multidisciplinary Designer
            </span>
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/40 px-4 py-1.5 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-blue pulse-dot" />
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted">
              Technical + Creative
            </span>
          </span>
        </motion.div>

        <h1 className="mt-6 font-display text-[clamp(3rem,11vw,9rem)] font-extrabold uppercase leading-[0.86] tracking-[-0.035em]">
          <MaskLine>Creativity</MaskLine>
          <RotatingWord />
        </h1>

        <motion.ul variants={fadeUp} className="mt-8 flex flex-wrap gap-2.5">
          {capabilities.map(({ label, icon: Icon }) => (
            <li
              key={label}
              className="group inline-flex cursor-default items-center gap-2 rounded-full border border-border bg-surface/40 px-4 py-2 backdrop-blur-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-blue/60 hover:bg-blue/10 hover:shadow-[0_10px_24px_-10px_rgba(59,130,246,0.6)]"
            >
              <Icon />
              <span className="font-mono text-[0.7rem] uppercase tracking-[0.14em] transition-colors group-hover:text-blue">
                {label}
              </span>
            </li>
          ))}
        </motion.ul>

        <motion.div
          variants={fadeUp}
          className="mt-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"
        >
          <p className="max-w-xl text-lg leading-relaxed text-muted">
            I design brands, products, and digital experiences with a
            systems-first mindset. Combining creativity, technology, and AI to
            build work that{" "}
            <span className="font-medium text-ink">performs</span>—not just looks
            good.
          </p>

          <Link
            href="/work"
            className="group inline-flex shrink-0 items-center gap-2 self-start border-b-2 border-ink pb-1 font-display text-lg font-semibold text-ink transition-colors hover:border-blue hover:text-blue sm:self-auto"
          >
            View work
            <span className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>
        </motion.div>
      </Reveal>
      </motion.div>
    </section>
  );
}

/* Icons — line style, inherit color, blue accent */
function IconDiamond() {
  return (
    <svg className="h-4 w-4 text-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round">
      <path d="M12 3l9 9-9 9-9-9z" />
    </svg>
  );
}
function IconWave() {
  return (
    <svg className="h-4 w-4 text-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12c2.5-5 4.5-5 7 0s4.5 5 7 0" />
      <path d="M2 17c2.5-5 4.5-5 7 0s4.5 5 7 0" opacity="0.55" />
    </svg>
  );
}
function IconGrid() {
  return (
    <svg className="h-4 w-4 text-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M3 9h18M9 3v18" />
    </svg>
  );
}
function IconSpark() {
  return (
    <svg className="h-4 w-4 text-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round">
      <path d="M12 3l1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7z" />
      <path d="M18.5 4.5l.6 1.9 1.9.6-1.9.6-.6 1.9-.6-1.9-1.9-.6 1.9-.6z" opacity="0.6" />
    </svg>
  );
}
