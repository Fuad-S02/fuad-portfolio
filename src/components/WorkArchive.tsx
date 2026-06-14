"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { fadeUp, staggerContainer, viewportOnce } from "@/lib/motion";
import { Reveal, MaskLine } from "./ui/reveal";
import { TiltCard } from "./ui/tilt-card";
import { ProjectMedia } from "./ui/project-media";
import { projects, mediaProps } from "@/lib/projects";

export function WorkArchive() {
  return (
    <main className="relative px-6 pb-28 pt-36 text-ink sm:px-10 sm:pt-40 lg:px-16">
      <div className="mx-auto w-full max-w-6xl">
        <Reveal>
          <motion.p
            variants={fadeUp}
            className="font-mono text-xs uppercase tracking-[0.28em] text-muted"
          >
            Work
          </motion.p>
          <h1 className="mt-5 font-display text-[clamp(2.5rem,8vw,6rem)] font-extrabold uppercase leading-[0.9] tracking-[-0.035em]">
            <MaskLine>Selected projects</MaskLine>
          </h1>
          <motion.p
            variants={fadeUp}
            className="mt-6 max-w-2xl text-lg leading-relaxed text-muted"
          >
            Brand, motion, product and AI-driven work — across deep-tech, F&amp;B,
            furniture, and more.
          </motion.p>
        </Reveal>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mt-14 grid gap-6 sm:grid-cols-2"
        >
          {projects.map((p) => (
            <motion.article key={p.slug} variants={fadeUp}>
              <TiltCard className="aspect-[4/3]">
                <Link
                  href={`/work/${p.slug}`}
                  className="group relative block h-full w-full overflow-hidden rounded-2xl border border-border bg-surface"
                >
                  <div className="absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-[1.04]">
                    <ProjectMedia {...mediaProps(p.media, p.title)} />
                  </div>
                  <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                    <div className="flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-white/70">
                      <span>{p.year}</span>
                      <span>·</span>
                      <span>{p.industry}</span>
                    </div>
                    <h2 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-white">
                      {p.title}
                    </h2>
                    <p className="mt-2 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-white/60">
                      {p.discipline}
                    </p>
                  </div>
                  <span className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10 transition-colors duration-300 group-hover:ring-blue/50" />
                </Link>
              </TiltCard>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </main>
  );
}
