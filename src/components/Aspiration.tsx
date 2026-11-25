"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { ScrambleText } from "./ui/scramble-text";
import { cn } from "@/lib/utils";

/**
 * Aspiration statement (no heading, no CTA): a calm editorial line after the
 * testimonials, on the white sheet. It decodes into place with the same
 * glitch effect as the hero — but word by word, left to right, so a long
 * sentence stays readable — bookending the page's "Design × Code" idea.
 */

type Part = { text: string; accent?: boolean };

const STATEMENT: Part[] = [
  { text: "I'm growing toward" },
  { text: "creative and art direction:", accent: true },
  {
    text: "shaping ideas from the first sketch to the final frame, making work that leaves a real impact, and building it alongside talented people who share the same eye for design.",
  },
];

const WORDS = STATEMENT.flatMap((p) =>
  p.text.split(" ").map((w) => ({ w, accent: !!p.accent })),
);

/** Delay between words starting to decode (ms), and each word's decode time. */
const STAGGER = 38;
const DECODE = 520;
/** Lowercase glyphs: close to the real letters' widths, so words don't spill. */
const GLYPHS = "abcdefghijklmnopqrstuvwxyz/<>*+=";

export function Aspiration() {
  const ref = useRef<HTMLParagraphElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });
  const reduce = useReducedMotion();

  return (
    <section
      id="next"
      aria-label="Where I'm heading"
      className="relative px-6 py-32 text-[#0a0b0d] sm:px-10 lg:px-16 lg:py-44"
    >
      <p
        ref={ref}
        aria-label={WORDS.map((x) => x.w).join(" ")}
        className="max-w-6xl font-display text-[clamp(1.75rem,3.7vw,3.5rem)] font-semibold leading-[1.12] tracking-[-0.025em]"
      >
        {WORDS.map((x, i) => (
          <span key={i}>
            {reduce ? (
              <span className={x.accent ? "text-gradient" : undefined}>{x.w}</span>
            ) : (
              <DecodeWord word={x.w} accent={x.accent} start={inView} delay={i * STAGGER} />
            )}{" "}
          </span>
        ))}
      </p>
    </section>
  );
}

/** One word: hidden until its turn, then glitches through glyphs into place. */
function DecodeWord({
  word,
  accent,
  start,
  delay,
}: {
  word: string;
  accent: boolean;
  start: boolean;
  delay: number;
}) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (!start) return;
    const t = setTimeout(() => setOn(true), delay);
    return () => clearTimeout(t);
  }, [start, delay]);

  return (
    <span className={cn("transition-opacity duration-150", on ? "opacity-100" : "opacity-0")}>
      <ScrambleText
        text={word}
        active={on}
        duration={DECODE}
        glyphs={GLYPHS}
        fillClassName={cn("overflow-x-clip whitespace-nowrap", accent && "text-gradient")}
        className={accent ? "text-gradient" : undefined}
      />
    </span>
  );
}
