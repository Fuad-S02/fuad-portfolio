"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";

/**
 * DRAFT (kept for comparison): stacking-cards version of Experience.
 * Swap it into page.tsx instead of <Experience /> to use it.
 *
 *
 * Experience as a scroll storyline on the white sheet (continues from the
 * work sphere): the section pins and each role is a card that slides up and
 * stacks over the previous one. Starts on the current role and rewinds.
 * A progress rail on the left tracks where you are. Text + pills only.
 * Content from Fuad's 2026 CV.
 */

type Role = {
  rail: string;
  when: string;
  role: string;
  org: string;
  line: string;
  current?: boolean;
  points?: string[];
  chips?: string[];
};

const ROLES: Role[] = [
  {
    rail: "MaktabiTech",
    when: "Jul 2025 — Present",
    role: "Senior Graphic Designer",
    org: "MaktabiTech · Remote",
    line: "AV/IT deep-tech provider serving NEOM, PIF and government clients.",
    current: true,
    points: [
      "Designed the company profile, the flagship sales asset.",
      "Lead creative for LinkedIn and social; the following grew from ~8K to ~13K.",
      "Designed and launched the company website end to end.",
    ],
    chips: ["Brand content", "AI-driven films", "Motion graphics", "Web"],
  },
  {
    rail: "Self-employed",
    when: "2021 — 2025",
    role: "Visual Artist & Graphic Designer",
    org: "Self-employed",
    line: "Identities, web and print for brands finding their voice, adapting to each one's goals.",
    chips: ["Canvas Home", "Nook", "Hydralyte", "Taskrabbit", "PricyPal"],
  },
  {
    rail: "Canvas Art Furniture",
    when: "Jan — Feb 2024",
    role: "Freelance Graphic Designer",
    org: "Canvas Art Furniture · Dubai",
    line: "Recreated the logo and rebuilt the website UI as part of a focused brand refresh.",
    chips: ["Logo", "Website UI", "Visual system"],
  },
  {
    rail: "Green Fields",
    when: "2022 — 2023",
    role: "Freelance Graphic Designer",
    org: "Green Fields for Agricultural · Dubai",
    line: "Print marketing (flyers, brochures, business cards, banners) kept on one consistent identity.",
    chips: ["Print", "Brand consistency"],
  },
];

const N = ROLES.length;
/** Scroll length per card, in svh. */
const STEP = 70;
/** Share of each step spent sliding in; the rest is a short rest. */
const ENTER = 0.7;
/** Vertical peek of each card stacked underneath, in px. */
const PEEK = 14;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
/** 0 → 1 as card j slides into place, for storyline position v. */
const enterOf = (v: number, j: number) =>
  j === 0 ? 1 : easeOut(clamp01((v - (j - 1)) / ENTER));
/** How many cards (fractionally) currently sit on top of card i. */
const depthOf = (v: number, i: number) => {
  let d = 0;
  for (let j = i + 1; j < N; j++) d += enterOf(v, j);
  return d;
};

export function ExperienceStack() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  // Storyline position: a short rest on the first card, then one unit per card,
  // ending with a rest on the last.
  const p = useTransform(scrollYProgress, (v) => v * (N - 0.6) - 0.3);
  const seal = useTransform(p, (v) => clamp01((v - (N - 1.6)) / 0.4));

  return (
    <section
      ref={ref}
      id="experience-stack"
      aria-label="Experience"
      className="relative text-[#0a0b0d]"
      style={{ height: `calc(100svh + ${(N - 1) * STEP}svh)` }}
    >
      <div className="sticky top-0 flex h-svh flex-col px-6 pb-16 pt-24 sm:px-10 sm:pt-28 lg:px-16">
        <div className="mx-auto flex w-full max-w-6xl items-end justify-between gap-6">
          <h2 className="font-display text-[clamp(2.25rem,5vw,3.75rem)] font-extrabold uppercase leading-[0.95] tracking-[-0.03em]">
            <span className="text-gradient">Experience</span>
          </h2>
          <p className="hidden whitespace-nowrap pb-1 text-sm text-[#5b616e] sm:block">
            5+ years · 2021 — now
          </p>
        </div>

        <div className="mx-auto mt-6 flex min-h-0 w-full max-w-6xl flex-1 gap-10 sm:mt-8">
          {/* Progress rail (desktop) */}
          <div className="relative hidden w-44 shrink-0 flex-col lg:flex">
            <div className="relative flex-1">
              <div className="absolute bottom-0 left-[3px] top-1 w-px bg-black/10" />
              <motion.div
                style={{ scaleY: scrollYProgress }}
                className="absolute bottom-0 left-[3px] top-1 w-px origin-top bg-blue"
              />
              <ul className="relative space-y-7">
                {ROLES.map((r, i) => (
                  <RailItem key={r.rail} role={r} i={i} p={p} />
                ))}
              </ul>
            </div>
            <motion.div
              style={{ opacity: seal }}
              className="mt-6 rounded-2xl border border-blue/25 bg-blue/[0.06] p-4"
            >
              <p className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-blue-deep">
                Recognition
              </p>
              <p className="mt-2 text-sm font-medium leading-snug">Advisory Board Member</p>
              <p className="mt-1 text-xs leading-snug text-[#5b616e]">
                College of Arts &amp; Design, University of Jordan
              </p>
            </motion.div>
          </div>

          {/* Card stack */}
          <div className="relative min-h-0 flex-1">
            {ROLES.map((r, i) => (
              <Card key={r.rail} role={r} i={i} p={p} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function RailItem({ role, i, p }: { role: Role; i: number; p: MotionValue<number> }) {
  // Active while this card is on top (it has entered, the next hasn't yet).
  const on = useTransform(p, (v) =>
    enterOf(v, i) > 0.5 && (i === N - 1 || enterOf(v, i + 1) <= 0.5) ? 1 : 0,
  );
  const opacity = useTransform(on, (o) => (o ? 1 : 0.4));
  return (
    <motion.li style={{ opacity }} className="relative pl-6">
      <span className="absolute left-0 top-1.5 h-[7px] w-[7px] rounded-full border border-[#9aa0ab] bg-white" />
      <motion.span
        style={{ opacity: on }}
        className="absolute left-0 top-1.5 h-[7px] w-[7px] rounded-full bg-blue shadow-[0_0_0_4px_rgba(59,130,246,0.15)]"
      />
      <span className="block text-xs text-[#5b616e]">{role.when}</span>
      <span className="mt-0.5 block text-sm font-medium">{role.rail}</span>
    </motion.li>
  );
}

function Card({ role, i, p }: { role: Role; i: number; p: MotionValue<number> }) {
  // Slide-in is a % of the card's own height (same on server and client, so
  // no hydration mismatch); the stacked "peek" is a small px lift on the inner card.
  const slide = useTransform(p, (v) => `${(1 - enterOf(v, i)) * 135}%`);
  const lift = useTransform(p, (v) => -depthOf(v, i) * PEEK);
  const scale = useTransform(p, (v) => 1 - depthOf(v, i) * 0.05);
  const fade = useTransform(p, (v) => Math.min(0.55, depthOf(v, i) * 0.3));

  return (
    <motion.div
      style={{ y: slide, zIndex: i, top: (N - 1) * PEEK }}
      className="absolute inset-x-0 bottom-0"
    >
      <motion.article
        style={{ y: lift, scale }}
        className={`relative flex h-full origin-top flex-col overflow-hidden rounded-[1.75rem] border p-6 shadow-[0_-24px_60px_-34px_rgba(15,23,42,0.45)] sm:p-8 lg:p-12 ${
          role.current
            ? "border-blue/25 bg-[#eef4ff]"
            : "border-black/[0.07] bg-[#f5f6f8]"
        }`}
      >
        <div className="flex flex-wrap items-center gap-3">
          {role.current && (
            <span className="inline-flex items-center gap-2 rounded-full bg-blue/15 px-3 py-1 text-xs font-medium text-blue-deep">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue opacity-70" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-blue" />
              </span>
              Now
            </span>
          )}
          <span className="text-sm text-[#5b616e]">{role.when}</span>
        </div>

        <h3 className="mt-5 max-w-3xl font-display text-[clamp(1.75rem,4vw,3.4rem)] font-bold leading-[1.02] tracking-[-0.025em] sm:mt-7">
          {role.role}
        </h3>
        <p className="mt-3 text-base font-medium sm:text-lg">{role.org}</p>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#5b616e] sm:text-base">
          {role.line}
        </p>

        <div className="mt-auto pt-6">
          {role.points && (
            <ul className="mb-5 grid gap-2.5 border-t border-black/10 pt-5 lg:grid-cols-3 lg:gap-6">
              {role.points.map((t) => (
                <li key={t} className="flex gap-3 text-sm leading-relaxed text-[#2b2f36]">
                  <span className="mt-[0.6rem] h-px w-3 shrink-0 bg-blue" />
                  {t}
                </li>
              ))}
            </ul>
          )}
          {role.chips && (
            <ul className="flex flex-wrap gap-2">
              {role.chips.map((c) => (
                <li
                  key={c}
                  className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs text-[#2b2f36]"
                >
                  {c}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* fades the card back as newer ones stack over it */}
        <motion.div
          style={{ opacity: fade }}
          className="pointer-events-none absolute inset-0 bg-white"
        />
      </motion.article>
    </motion.div>
  );
}
