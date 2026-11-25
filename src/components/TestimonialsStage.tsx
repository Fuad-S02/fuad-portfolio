"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";

/**
 * DRAFT (kept for comparison): single-stage version of Testimonials.
 * Swap it into page.tsx instead of <Testimonials /> to use it.
 *
 *
 * "In their words": an editorial, scroll-lit testimonials stage on the white
 * sheet. The section pins; one quote fills the stage at a time and its words
 * light up grey → ink as you scroll, then it lifts away for the next.
 * Desktop shows a quiet list of who's speaking.
 *
 * PLACEHOLDERS: these quotes are hypothetical, written only to design the
 * layout. Every entry with `draft: true` shows a "Placeholder" note on screen.
 * Replace with real, approved quotes (and remove `draft`) before publishing.
 */

type Quote = {
  quote: string;
  name: string;
  role: string;
  draft?: boolean;
};

const QUOTES: Quote[] = [
  {
    quote:
      "Fuad turns a rough brief into something people actually stop for. He gets the message right first, then makes it beautiful.",
    name: "Full Name",
    role: "Marketing Lead · Deep-tech company",
    draft: true,
  },
  {
    quote:
      "Working with him felt like having a partner, not a vendor. He asked the right questions before he opened a single file.",
    name: "Full Name",
    role: "Founder · Interiors brand",
    draft: true,
  },
  {
    quote:
      "A rare mix of an artist's eye and a builder's patience. Give him an idea and you get back more than you gave.",
    name: "Full Name",
    role: "Faculty · College of Arts & Design",
    draft: true,
  },
];

const N = QUOTES.length;
/** Scroll length per quote, in svh. */
const STEP = 90;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ease = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export function TestimonialsStage() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  // Storyline position: quote k owns [k, k+1).
  const p = useTransform(scrollYProgress, (v) => v * N);

  return (
    <section
      ref={ref}
      id="testimonials-stage"
      aria-label="Testimonials"
      className="relative text-[#0a0b0d]"
      style={{ height: `calc(100svh + ${(N - 1) * STEP}svh)` }}
    >
      <div className="sticky top-0 flex h-svh flex-col px-6 pb-12 pt-24 sm:px-10 sm:pt-28 lg:px-16">
        {/* Same label + title treatment as "Selected work" / "Work experience". */}
        <div>
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-[#5b616e]">
            People I&apos;ve worked with
          </p>
          <h2 className="mt-2 font-display text-[clamp(1.6rem,3.2vw,2.6rem)] font-extrabold uppercase leading-[0.95] tracking-[-0.03em] lg:text-[1.9rem]">
            In their <span className="text-gradient">words</span>
          </h2>
        </div>

        <div className="relative mt-6 grid min-h-0 flex-1 lg:grid-cols-12 lg:gap-10">
          {/* Who's speaking (desktop) */}
          <ul className="hidden flex-col justify-center gap-6 lg:col-span-3 lg:flex">
            {QUOTES.map((q, i) => (
              <Speaker key={i} q={q} i={i} p={p} />
            ))}
          </ul>

          {/* Quote stage */}
          <div className="relative lg:col-span-8 lg:col-start-5">
            {QUOTES.map((q, i) => (
              <QuoteSlide key={i} q={q} i={i} p={p} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/** Visibility of quote i at storyline position v (cross-fades between quotes). */
const shownAt = (v: number, i: number) => {
  const local = v - i;
  // Sequential, not overlapping: the outgoing quote is gone (local 0.9)
  // before the next one starts arriving (its local −0.06).
  const fadeIn = i === 0 ? 1 : ease((local + 0.06) / 0.12);
  const fadeOut = i === N - 1 ? 1 : 1 - ease((local - 0.78) / 0.12);
  return Math.min(fadeIn, fadeOut);
};

function QuoteSlide({ q, i, p }: { q: Quote; i: number; p: MotionValue<number> }) {
  const opacity = useTransform(p, (v) => shownAt(v, i));
  const y = useTransform(p, (v) => {
    const local = v - i;
    if (local < 0) return (1 - shownAt(v, i)) * 40; // rising in
    return -(1 - shownAt(v, i)) * 40; // lifting away
  });
  const words = q.quote.split(" ");

  return (
    <motion.figure
      style={{ opacity, y }}
      className="absolute inset-0 flex flex-col justify-center"
    >
      <span
        aria-hidden
        className="text-gradient block font-display text-[clamp(3.5rem,7vw,6rem)] font-extrabold leading-[0.6]"
      >
        &ldquo;
      </span>
      <blockquote className="mt-4 font-display text-[clamp(1.5rem,3.1vw,2.9rem)] font-semibold leading-[1.14] tracking-[-0.02em]">
        {words.map((w, j) => (
          <Word key={j} p={p} i={i} at={j / words.length}>
            {w}
          </Word>
        ))}
      </blockquote>

      <figcaption className="mt-8 flex items-center gap-3.5">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#eef4ff] text-xs font-semibold text-blue-deep">
          {initials(q.name)}
        </span>
        <span className="text-sm leading-snug">
          <span className="block font-medium">{q.name}</span>
          <span className="block text-[#5b616e]">{q.role}</span>
        </span>
        {q.draft && (
          <span className="ml-1 rounded-full border border-dashed border-black/20 px-2.5 py-0.5 text-[0.7rem] text-[#5b616e]">
            Placeholder
          </span>
        )}
      </figcaption>
    </motion.figure>
  );
}

/** One word that lights grey → ink as the quote's scroll progresses. */
function Word({
  p,
  i,
  at,
  children,
}: {
  p: MotionValue<number>;
  i: number;
  at: number;
  children: React.ReactNode;
}) {
  // Words light across the first ~60% of the quote's step; the rest is a rest.
  const start = 0.07 + at * 0.55;
  const opacity = useTransform(p, (v) => 0.16 + 0.84 * clamp01((v - i - start) / 0.06));
  return (
    <>
      <motion.span style={{ opacity }}>{children}</motion.span>{" "}
    </>
  );
}

function Speaker({ q, i, p }: { q: Quote; i: number; p: MotionValue<number> }) {
  const opacity = useTransform(p, (v) => 0.3 + 0.7 * shownAt(v, i));
  const x = useTransform(p, (v) => shownAt(v, i) * 8);
  return (
    <motion.li style={{ opacity, x }} className="text-sm leading-snug">
      <span className="block font-medium">{q.name}</span>
      <span className="block text-[#5b616e]">{q.role}</span>
    </motion.li>
  );
}
