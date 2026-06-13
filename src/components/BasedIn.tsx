"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "motion/react";
import { InteractiveGlobe } from "./ui/interactive-globe";
import { staggerContainer, fadeUp, viewportOnce } from "@/lib/motion";

const positions = [
  { when: "Now", org: "MaktabiTech", role: "Senior Designer", current: true },
  { when: "2021–25", org: "Independent", role: "Visual Artist & Designer" },
  { when: "2024", org: "Canvas Art Furniture", role: "Dubai" },
  { when: "2022–23", org: "Green Fields", role: "Dubai" },
];

const stats = [
  { v: "5+", l: "Years experience" },
  { v: "40+", l: "Projects delivered" },
  { v: "8K → 12K", l: "LinkedIn reach" },
];

export function BasedIn() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });
  const rotateX = useTransform(scrollYProgress, [0, 1], [16, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.9, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [0, 1]);

  return (
    <section
      ref={ref}
      className="relative overflow-hidden px-6 py-28 text-ink sm:px-10 sm:py-36 lg:px-16"
    >
      {/* soft local glow to lift the globe */}
      <div className="pointer-events-none absolute right-0 top-1/2 hidden h-[34rem] w-[34rem] -translate-y-1/2 translate-x-1/4 rounded-full bg-blue/10 blur-[120px] lg:block" />

      {/* Globe — overlaps behind the headline on large screens */}
      <motion.div
        style={
          reduce ? undefined : { rotateX, scale, opacity, transformPerspective: 1000 }
        }
        className="relative z-0 mx-auto mt-12 aspect-square w-full max-w-sm [mask-image:radial-gradient(circle_at_center,#000_60%,transparent_71%)] [-webkit-mask-image:radial-gradient(circle_at_center,#000_60%,transparent_71%)] lg:absolute lg:right-[3%] lg:top-1/2 lg:mx-0 lg:mt-0 lg:w-[44%] lg:max-w-[34rem] lg:-translate-y-1/2"
      >
        <InteractiveGlobe />
      </motion.div>

      {/* Content */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="relative z-10 mx-auto w-full max-w-6xl"
      >
        <div className="max-w-xl">
          <motion.div
            variants={fadeUp}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/40 px-4 py-1.5 backdrop-blur-sm"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue opacity-70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-blue" />
            </span>
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em]">
              Currently — MaktabiTech
            </span>
          </motion.div>

          <motion.h2
            variants={fadeUp}
            className="mt-6 font-display text-[clamp(2.25rem,5.5vw,4rem)] font-extrabold uppercase leading-[0.95] tracking-[-0.03em]"
          >
            Based in
            <br />
            <span className="text-gradient">Amman &amp; Dubai</span>
          </motion.h2>

          {/* Work positions */}
          <motion.ul
            variants={fadeUp}
            className="mt-9 space-y-3 border-l border-border pl-5"
          >
            {positions.map((p) => (
              <li key={p.org} className="flex flex-wrap items-baseline gap-x-3">
                <span
                  className={`w-16 shrink-0 font-mono text-[0.7rem] uppercase tracking-wider ${
                    p.current ? "text-blue" : "text-muted"
                  }`}
                >
                  {p.when}
                </span>
                <span className="text-sm">
                  <span className="font-semibold">{p.org}</span>
                  <span className="text-muted"> — {p.role}</span>
                </span>
              </li>
            ))}
          </motion.ul>

          {/* Stats */}
          <motion.dl
            variants={fadeUp}
            className="mt-10 flex flex-wrap items-start gap-x-8 gap-y-6 border-t border-border pt-8"
          >
            {stats.map((s, i) => (
              <div key={s.l} className="flex items-start">
                {i > 0 && <span className="mr-8 hidden h-10 w-px bg-border sm:block" />}
                <div>
                  <dt className="font-display text-3xl font-bold tracking-tight">
                    {s.v}
                  </dt>
                  <dd className="mt-1 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-muted">
                    {s.l}
                  </dd>
                </div>
              </div>
            ))}
          </motion.dl>
        </div>
      </motion.div>
    </section>
  );
}
