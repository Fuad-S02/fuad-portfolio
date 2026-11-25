"use client";

import Image from "next/image";
import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";

/**
 * "People I've worked with" — pinned headline + rising quote cards (after Framer's
 * "Pinned Quote Cards" idea, no imagery). A huge headline stays pinned in
 * the middle of the white sheet while quote cards scroll up over it, each at
 * its own staggered spot with a slight tilt, like notes pinned on a wall.
 * Each card's words light grey → ink as it reaches the middle of the screen.
 * (The single-stage version is kept as TestimonialsStage.tsx.)
 *
 * PLACEHOLDERS: these quotes are hypothetical, written only to design the
 * layout. Entries with `draft: true` show a "Placeholder" note on screen.
 * Use real words (or a line the person has approved) before publishing.
 */

type Quote = {
  quote: string;
  name: string;
  role: string;
  /** Company logo (e.g. "/logos/maktabitech.svg"); falls back to initials. */
  logo?: string;
  /** Hypothetical text: shows a "Placeholder" tag on screen. */
  draft?: boolean;
  /** Real person, paraphrased words: no tag, but confirm with them before launch. */
  pendingApproval?: boolean;
};

const QUOTES: Quote[] = [
  {
    quote:
      "Do what feels right to you. If you see a way to improve the brief, or a better way to do it, tell us.",
    name: "Sheikha Sharma",
    role: "Head of Marketing · MaktabiTech",
    logo: "/logos/maktabitech.svg",
    // Paraphrased from what she told Fuad; wording approved by her (2026-11-25).
  },
  {
    // Real quote from Banan, trimmed from his message; trimmed wording approved (2026-11-25).
    quote:
      "When it comes to marketing, you see things in a different way. Some posts are straightforward, and some give you space to be creative. Those are the ones I push on.",
    name: "Banan Masri",
    role: "Managing Partner · MaktabiTech",
    logo: "/logos/maktabitech.svg",
  },
  {
    // Paraphrased from what Ibrahim told Fuad; wording approved by him (2026-11-25).
    quote:
      "He has an artist's eye for detail, and the patience to match. I'd recommend him to anyone, especially if you're not sure yet what the process looks like or how to get the best result.",
    name: "Ibrahim Ali",
    role: "CEO · Canvas Art Furniture",
    // Cropped copy of the logo: "CANVAS" mark only; the "Art Furniture" line
    // was live text in a font visitors won't have. Swap for an outlined export.
    logo: "/logos/canvas-art-furniture.svg",
  },
];

/** Desktop placement + tilt per card, for an asymmetric "pinned notes" feel. */
const PLACE = [
  { cls: "lg:ml-[6%]", tilt: -1.6 },
  { cls: "lg:ml-auto lg:mr-[8%]", tilt: 1.3 },
  { cls: "lg:ml-[24%]", tilt: -0.9 },
];

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export function Testimonials() {
  return (
    <section id="testimonials" aria-label="Testimonials" className="relative text-[#0a0b0d]">
      {/* Pinned backdrop headline */}
      <div className="sticky top-0 flex h-svh flex-col items-center justify-center px-6 text-center">
        <h2 className="font-display text-[clamp(2.6rem,9vw,8.5rem)] font-extrabold uppercase leading-[0.88] tracking-[-0.045em]">
          People I&apos;ve
          <br />
          <span className="text-gradient">worked with</span>
        </h2>
      </div>

      {/* Cards scroll up over the pinned headline */}
      <div className="relative z-10 -mt-[100svh] space-y-[38svh] px-6 pb-[45svh] pt-[85svh] sm:px-10 lg:px-16">
        {QUOTES.map((q, i) => (
          <QuoteCard key={i} q={q} i={i} />
        ))}
      </div>
    </section>
  );
}

function QuoteCard({ q, i }: { q: Quote; i: number }) {
  const ref = useRef<HTMLElement>(null);
  // 0 as the card's top enters the lower screen → 1 as its centre reaches the middle.
  const { scrollYProgress: p } = useScroll({
    target: ref,
    offset: ["start 85%", "center 50%"],
  });
  const place = PLACE[i % PLACE.length];
  // Tilt settles a little as the card arrives (desktop only via CSS var).
  const rotate = useTransform(p, (v) => place.tilt * (1.6 - 0.6 * clamp01(v)));
  const words = q.quote.split(" ");

  return (
    <motion.figure
      ref={ref}
      style={{ "--tilt": rotate } as unknown as React.CSSProperties}
      className={`w-full max-w-[34rem] rounded-[1.75rem] border border-black/[0.06] bg-white p-7 shadow-[0_40px_90px_-45px_rgba(15,23,42,0.45),0_2px_6px_-2px_rgba(15,23,42,0.06)] sm:p-9 lg:rotate-[calc(var(--tilt)*1deg)] ${place.cls}`}
    >
      <span
        aria-hidden
        className="text-gradient block font-display text-[3.25rem] font-extrabold leading-[0.6]"
      >
        &ldquo;
      </span>
      <blockquote className="mt-3 font-display text-[clamp(1.3rem,2.1vw,1.85rem)] font-semibold leading-[1.18] tracking-[-0.02em]">
        {words.map((w, j) => (
          <Word key={j} p={p} at={j / words.length}>
            {w}
          </Word>
        ))}
      </blockquote>

      <figcaption className="mt-7 flex items-center gap-3.5 border-t border-black/[0.06] pt-5">
        {!q.logo && (
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#eef4ff] text-xs font-semibold text-blue-deep">
            {initials(q.name)}
          </span>
        )}
        <span className="min-w-0 text-sm leading-snug">
          <span className="block font-medium">{q.name}</span>
          {/* with a logo, the company is already shown — keep just the role */}
          <span className="block text-[#5b616e]">
            {q.logo ? q.role.split("·")[0].trim() : q.role}
          </span>
        </span>
        <span className="ml-auto flex shrink-0 items-center gap-3">
          {q.draft && (
            <span className="rounded-full border border-dashed border-black/20 px-2.5 py-0.5 text-[0.7rem] text-[#5b616e]">
              Placeholder
            </span>
          )}
          {q.logo && (
            <span className="relative h-7 w-[5.5rem]">
              <Image
                src={q.logo}
                alt={q.role.split("·").pop()?.trim() ?? ""}
                fill
                unoptimized
                className="object-contain object-right"
              />
            </span>
          )}
        </span>
      </figcaption>
    </motion.figure>
  );
}

/** One word that lights grey → ink as its card rises to the middle. */
function Word({
  p,
  at,
  children,
}: {
  p: MotionValue<number>;
  at: number;
  children: React.ReactNode;
}) {
  const start = 0.15 + at * 0.7;
  const opacity = useTransform(p, (v) => 0.16 + 0.84 * clamp01((v - start) / 0.1));
  return (
    <>
      <motion.span style={{ opacity }}>{children}</motion.span>{" "}
    </>
  );
}
