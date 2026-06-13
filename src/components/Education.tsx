"use client";

import { useRef } from "react";
import { motion } from "motion/react";
import { staggerContainer, fadeUp, viewportOnce } from "@/lib/motion";
import { Reveal } from "./ui/reveal";

const items = [
  {
    label: "Education",
    value: "BA — Visual Arts",
    gradient: false,
    sub: "University of Jordan · 2020 — 2025",
  },
  {
    label: "Academic",
    value: "GPA 3.64 / 4.0",
    gradient: true,
    sub: "College of Arts & Design",
  },
  {
    label: "Recognition",
    value: "Advisory Board Member",
    gradient: false,
    sub: "College of Arts & Design, University of Jordan · 2024 — 2025",
  },
];

export function Education() {
  return (
    <section className="relative px-6 py-28 text-ink sm:px-10 sm:py-32 lg:px-16">
      <div className="mx-auto w-full max-w-6xl">
        <Reveal className="border-b border-border pb-6">
          <motion.p
            variants={fadeUp}
            className="font-mono text-xs uppercase tracking-[0.28em] text-muted"
          >
            Education &amp; Recognition
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="mt-3 font-display text-[clamp(2rem,5vw,3.5rem)] font-extrabold uppercase leading-[0.95] tracking-[-0.03em]"
          >
            Trained in the craft —{" "}
            <span className="text-gradient">trusted to shape it</span>
          </motion.h2>
        </Reveal>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {items.map((item) => (
            <motion.div key={item.label} variants={fadeUp}>
              <GlowCard>
                <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted">
                  {item.label}
                </p>
                <p
                  className={`mt-5 font-display text-2xl font-bold leading-tight tracking-tight ${
                    item.gradient ? "text-gradient" : ""
                  }`}
                >
                  {item.value}
                </p>
                <p className="mt-2.5 text-sm leading-relaxed text-muted">
                  {item.sub}
                </p>
              </GlowCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/**
 * Glossy card: a blue spotlight follows the cursor inside the card, with a lift,
 * a soft blue glow, a glass top-sheen and a brightening border on hover.
 */
function GlowCard({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      className="group relative h-full overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-surface/60 to-surface/30 p-7 backdrop-blur-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-blue/50 hover:shadow-[0_20px_44px_-18px_rgba(59,130,246,0.5)]"
    >
      {/* cursor-following spotlight */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(16rem 16rem at var(--mx, 50%) var(--my, 0%), color-mix(in srgb, var(--color-blue) 20%, transparent), transparent 60%)",
        }}
      />
      {/* glass top sheen */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
