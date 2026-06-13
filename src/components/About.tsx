"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { fadeUp } from "@/lib/motion";
import { Reveal, MaskLine } from "./ui/reveal";

// Smooth ease for the looping capability swap (matches the hero rotator).
const CAP_EASE = [0.65, 0, 0.35, 1] as const;

const capabilities = [
  "Brand Design",
  "Motion Graphics",
  "UI/UX Design",
  "AI Creative",
];

export function About() {
  return (
    <main className="relative px-6 pb-28 pt-36 text-ink sm:px-10 sm:pt-40 lg:px-16">
      <div className="mx-auto w-full max-w-5xl">
        {/* Intro */}
        <Reveal>
          <motion.p
            variants={fadeUp}
            className="font-mono text-xs uppercase tracking-[0.28em] text-muted"
          >
            About
          </motion.p>
          <h1 className="mt-5 font-display text-[clamp(2.5rem,8vw,6rem)] font-extrabold uppercase leading-[0.9] tracking-[-0.035em]">
            <MaskLine>Multidisciplinary</MaskLine>
            <MaskLine className="text-gradient">by design.</MaskLine>
          </h1>
          <motion.div
            variants={fadeUp}
            className="mt-8 max-w-2xl space-y-5 text-lg leading-relaxed text-muted"
          >
            <p>
              I&apos;m Fuad Salma — a designer working across brand, motion,
              UI/UX, and AI-driven creative, based between{" "}
              <span className="text-ink">Amman</span> and{" "}
              <span className="text-ink">Dubai</span>.
            </p>
            <p>
              As Senior Graphic Designer at{" "}
              <span className="text-ink">MaktabiTech</span>, I turn complex
              deep-tech into{" "}
              <span className="font-medium text-ink">creative that sells</span> —
              building brand systems, motion, and product work, and growing the
              company&apos;s LinkedIn audience{" "}
              <span className="font-medium text-ink">from 8K to 12K</span>.
            </p>
            <p>
              I work systems-first: combining design, technology, and AI to make
              work that <span className="text-ink">performs</span>, not just
              looks good. BA in Visual Arts, University of Jordan (GPA
              3.64/4.0), and Advisory Board member at the College of Arts &amp;
              Design.
            </p>
          </motion.div>
        </Reveal>

        {/* What I do — one big word, looping through the services */}
        <div className="mt-20 border-t border-border pt-10 text-center">
          <Reveal>
            <motion.p
              variants={fadeUp}
              className="font-mono text-xs uppercase tracking-[0.28em] text-muted"
            >
              What I do
            </motion.p>
          </Reveal>
          <CapabilityRotator />
        </div>

        {/* More work */}
        <Reveal className="mt-24 border-t border-border pt-12">
          <motion.p
            variants={fadeUp}
            className="font-mono text-xs uppercase tracking-[0.28em] text-muted"
          >
            More work
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="mt-3 max-w-3xl font-display text-[clamp(1.75rem,4vw,3rem)] font-bold uppercase leading-[0.98] tracking-[-0.02em]"
          >
            Explore selected projects across brand, motion, product &amp; AI.
          </motion.h2>
          <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/#work"
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-blue-light/95 via-blue to-blue-deep px-5 py-2.5 text-sm font-medium text-white shadow-[0_8px_22px_-8px_rgba(37,99,235,0.7)] transition-[filter] hover:brightness-110"
            >
              View selected work
              <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </Link>
            <Link
              href="/#contact"
              className="group inline-flex items-center gap-2 rounded-full border border-border bg-surface/50 px-5 py-2.5 text-sm font-medium text-ink backdrop-blur transition-colors hover:border-blue/60 hover:text-blue"
            >
              Get in touch
              <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </Link>
          </motion.div>
        </Reveal>
      </div>
    </main>
  );
}

const BIG_CAP =
  "font-display text-[clamp(2rem,8vw,5rem)] font-extrabold uppercase leading-[0.95] tracking-[-0.02em] text-gradient";

/** One big word that loops through the services with a rise/sink transition. */
function CapabilityRotator() {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(
      () => setI((p) => (p + 1) % capabilities.length),
      3000
    );
    return () => clearInterval(id);
  }, [reduce]);

  // Reduced motion → show the full static list instead of cycling.
  if (reduce) {
    return (
      <ul className="mt-6 space-y-1">
        {capabilities.map((c) => (
          <li key={c} className={BIG_CAP}>
            {c}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="relative mt-6 block overflow-hidden pb-[0.12em]">
      <AnimatePresence mode="wait">
        <motion.div
          key={capabilities[i]}
          initial={{ y: "42%", opacity: 0, filter: "blur(4px)" }}
          animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
          exit={{ y: "-42%", opacity: 0, filter: "blur(4px)" }}
          transition={{ duration: 0.55, ease: CAP_EASE }}
          className={`${BIG_CAP} [will-change:transform,opacity,filter]`}
        >
          {capabilities[i]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
