"use client";

import { useId, useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";

/**
 * Experience as clean year + card rows on the white sheet. No timeline line:
 * each row reveals with the scroll (the big year slides in from the left, the
 * card rises in), starting with the current role. Ends on Recognition.
 * Text + pills only. Content from Fuad's 2026 CV.
 * (The stacking-cards draft is kept as ExperienceStack.tsx.)
 */

type Role = {
  years: string;
  role: string;
  org: string;
  line: string;
  current?: boolean;
  points?: string[];
  chips?: string[];
  /** Work-mode tag on the title row's right ("Remote", "Freelance"). */
  tag?: string;
};

const ROLES: Role[] = [
  {
    years: "2025 — Now",
    role: "Senior Graphic Designer",
    org: "MaktabiTech · Full-time",
    tag: "Remote",
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
    years: "2021 — 2025",
    role: "Visual Artist & Graphic Designer",
    org: "Self-employed",
    tag: "Freelance",
    line: "Identities, web and print for brands like Canvas Home, Nook, Hydralyte, Taskrabbit and PricyPal.",
    chips: ["Brand identity", "Motion graphics", "Web design", "Social media design"],
  },
  {
    years: "2024",
    role: "Freelance Graphic Designer",
    org: "Canvas Art Furniture · Dubai",
    tag: "Freelance",
    line: "Recreated the logo and rebuilt the website UI as part of a focused brand refresh.",
    chips: ["Logo", "Website UI", "Visual system"],
  },
  {
    years: "2022 — 2023",
    role: "Freelance Graphic Designer",
    org: "Green Fields for Agricultural · Dubai",
    tag: "Freelance",
    line: "Print marketing (flyers, brochures, business cards, banners) kept on one consistent identity.",
    chips: ["Print", "Brand consistency"],
  },
];

const RECOGNITION = (
  <article className="rounded-[1.25rem] border border-blue/25 bg-blue/[0.06] p-5 sm:p-6">
    <p className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-blue-deep">
      Recognition
    </p>
    <h3 className="mt-2.5 font-display text-[clamp(1.25rem,1.8vw,1.55rem)] font-bold leading-[1.1] tracking-[-0.02em]">
      Advisory Board Member
    </h3>
    <p className="mt-1.5 text-sm text-[#5b616e]">
      College of Arts &amp; Design, University of Jordan
    </p>
  </article>
);

/** Scroll order: current role, self-employed, then Recognition, then earlier freelance roles. */
const ITEMS: { key: string; years: string; current?: boolean; muted?: boolean; node: React.ReactNode }[] = [
  ...ROLES.slice(0, 2).map((r) => ({ key: r.org, years: r.years, current: r.current, node: <RoleCard role={r} /> })),
  { key: "recognition", years: "2024 — 2025", muted: true, node: RECOGNITION },
  ...ROLES.slice(2).map((r) => ({ key: r.org, years: r.years, node: <RoleCard role={r} /> })),
];

const ease = (t: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);

export function Experience() {
  return (
    <section
      id="experience"
      aria-label="Experience"
      className="relative px-6 pb-32 pt-24 text-[#0a0b0d] sm:px-10 sm:pt-28 lg:px-16"
    >
      {/* Same label + title treatment as "Selected work" in the sphere. */}
      <div>
        <p className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-[#5b616e]">
          5+ years · 2021 — now
        </p>
        <h2 className="mt-2 font-display text-[clamp(1.6rem,3.2vw,2.6rem)] font-extrabold uppercase leading-[0.95] tracking-[-0.03em] lg:text-[1.9rem]">
          Work <span className="text-gradient">experience</span>
        </h2>
      </div>

      <div className="mt-14 space-y-16 sm:mt-20 lg:space-y-20">
        {ITEMS.map((it, i) => (
          <Row key={it.key} i={i} years={it.years} current={it.current} muted={it.muted}>
            {it.node}
          </Row>
        ))}
      </div>
    </section>
  );
}

/** Desktop left edge of each card (% of the row width): a staggered, asymmetric zig-zag. */
const OFFSETS = [26, 50, 20, 46, 30];

/**
 * One step: the year sits right beside its card as one unit. On desktop the
 * units are staggered across the page (OFFSETS) and the year alternates
 * between the card's left and right side, always hugging it. Each step
 * fades/rises in as it enters, then fades and lifts away as it scrolls past.
 * Phone: year above card.
 */
function Row({
  i,
  years,
  current,
  muted,
  children,
}: {
  i: number;
  years: string;
  current?: boolean;
  muted?: boolean;
  children: React.ReactNode;
}) {
  const yearLeft = i % 2 === 0;
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress: enter } = useScroll({
    target: ref,
    offset: ["start 95%", "start 55%"],
  });
  const { scrollYProgress: leave } = useScroll({
    target: ref,
    offset: ["end 45%", "end 5%"],
  });
  const opacity = useTransform([enter, leave], ([a, b]: number[]) => ease(a) * (1 - ease(b)));
  // the year slides in toward its card
  const yearX = useTransform(enter, (v) => (1 - ease(v)) * (yearLeft ? -36 : 36));
  const cardY = useTransform([enter, leave], ([a, b]: number[]) => (1 - ease(a)) * 56 - ease(b) * 40);
  const cardScale = useTransform(leave, (v) => 1 - ease(v) * 0.04);

  const off = OFFSETS[i % OFFSETS.length];
  // keep room for the year on its side: ≥17rem when it hangs left,
  // ≤ (row − card − gap − year) when it hangs right
  const ml = yearLeft ? `max(${off}%, 17rem)` : `min(${off}%, calc(100% - 46rem))`;

  return (
    <div
      ref={ref}
      className="relative w-full lg:ml-[var(--ml)] lg:w-[28rem]"
      style={{ "--ml": ml } as React.CSSProperties}
    >
      <motion.p
        style={{ opacity, x: yearX }}
        className={`mb-4 whitespace-nowrap font-display text-[clamp(1.6rem,2.8vw,2.6rem)] font-extrabold uppercase leading-[0.95] tracking-[-0.03em] lg:absolute lg:top-6 lg:mb-0 ${
          yearLeft ? "lg:right-full lg:mr-8 lg:text-right" : "lg:left-full lg:ml-8"
        } ${current ? "" : muted ? "text-[#0a0b0d]/35" : "text-[#0a0b0d]/80"}`}
      >
        <span className={current ? "text-gradient" : ""}>{years}</span>
      </motion.p>
      <motion.div style={{ opacity, y: cardY, scale: cardScale }}>{children}</motion.div>
    </div>
  );
}

function RoleCard({ role }: { role: Role }) {
  return (
    <article
      className={`rounded-[1.25rem] border p-5 sm:p-6 ${
        role.current ? "border-blue/25 bg-[#eef4ff]" : "border-black/[0.07] bg-[#f5f6f8]"
      }`}
    >

      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-[clamp(1.25rem,1.8vw,1.55rem)] font-bold leading-[1.1] tracking-[-0.02em]">
          {role.role}
        </h3>
        {role.tag && <WorkTag label={role.tag} />}
      </div>
      <p className="mt-1.5 text-sm font-medium">{role.org}</p>
      <p className="mt-1.5 text-sm leading-relaxed text-[#5b616e]">{role.line}</p>

      {role.points && (
        <ul className="mt-3.5 space-y-1.5 border-t border-black/10 pt-3.5">
          {role.points.map((t) => (
            <li key={t} className="flex gap-2.5 text-sm leading-relaxed text-[#2b2f36]">
              <Spark />
              {t}
            </li>
          ))}
        </ul>
      )}
      {role.chips && (
        <ul className="mt-3.5 flex flex-wrap gap-1.5">
          {role.chips.map((c) => (
            <li
              key={c}
              className="rounded-full border border-black/10 bg-white px-2.5 py-0.5 text-xs text-[#2b2f36]"
            >
              {c}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

/**
 * Work-mode tag ("Remote", "Freelance"): a dark ink pill, so it never reads
 * like the soft white skill pills.
 */
function WorkTag({ label }: { label: string }) {
  return (
    <span className="mt-0.5 inline-flex shrink-0 items-center rounded-full bg-[#0a0b0d] px-3 py-1 text-xs font-medium text-white">
      {label}
    </span>
  );
}

/** Bullet: a small four-point sparkle star (the "AI star"), in the site blue gradient. */
function Spark() {
  const id = useId();
  return (
    <svg aria-hidden viewBox="0 0 16 16" className="mt-[0.32rem] h-3 w-3 shrink-0">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#60a5fa" />
          <stop offset="1" stopColor="#1d4ed8" />
        </linearGradient>
      </defs>
      <path
        fill={`url(#${id})`}
        d="M8 0C8.4 4.3 11.7 7.6 16 8 11.7 8.4 8.4 11.7 8 16 7.6 11.7 4.3 8.4 0 8 4.3 7.6 7.6 4.3 8 0Z"
      />
    </svg>
  );
}
