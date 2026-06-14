"use client";

import { useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { ProjectMedia } from "./ui/project-media";
import { cn } from "@/lib/utils";
import { fadeUp, viewportOnce } from "@/lib/motion";
import { Reveal } from "./ui/reveal";
import { TiltCard } from "./ui/tilt-card";
import { featuredProjects as projects, mediaProps, type Project } from "@/lib/projects";

type LayoutVariant = "rows" | "masonry" | "spotlight";

export function SelectedWork() {
  const [variant, setVariant] = useState<LayoutVariant>("rows");

  return (
    <section id="work" className="relative scroll-mt-24 px-6 py-28 text-ink sm:px-10 sm:py-36 lg:px-16">
      <div className="mx-auto w-full max-w-6xl">
        {/* Header */}
        <Reveal className="flex flex-wrap items-end justify-between gap-6 border-b border-border pb-6">
          <div>
            <motion.p
              variants={fadeUp}
              className="font-mono text-xs uppercase tracking-[0.28em] text-muted"
            >
              Selected Work
            </motion.p>
            <motion.h2
              variants={fadeUp}
              className="mt-3 font-display text-[clamp(2rem,5vw,3.5rem)] font-extrabold uppercase leading-[0.95] tracking-[-0.03em]"
            >
              Work that <span className="text-gradient">performs</span>
            </motion.h2>
          </div>

          {/* View switcher — visitors can experience the work in 3 layouts */}
          <motion.div
            variants={fadeUp}
            role="group"
            aria-label="Choose work layout"
            className="flex items-center gap-1 rounded-full border border-border bg-surface/60 p-1 backdrop-blur"
          >
            {(["rows", "masonry", "spotlight"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setVariant(v)}
                aria-pressed={variant === v}
                title={`${v[0].toUpperCase()}${v.slice(1)} view`}
                className={cn(
                  "flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-[0.62rem] uppercase tracking-wider capitalize transition-colors",
                  variant === v ? "bg-ink text-bg" : "text-muted hover:text-ink"
                )}
              >
                <LayoutIcon variant={v} />
                <span className="hidden sm:inline">{v}</span>
              </button>
            ))}
          </motion.div>
        </Reveal>

        {variant === "rows" && <RowsLayout />}
        {variant === "masonry" && <MasonryLayout />}
        {variant === "spotlight" && <SpotlightLayout />}
      </div>
    </section>
  );
}

/* ---------------- Variant 1: Editorial rows ----------------
   Default + featured layout. Each row simply fades up as it scrolls in —
   no clip/wipe, no media drift. */
function RowsLayout() {
  return (
    <div className="mt-16 flex flex-col gap-24 sm:gap-32">
      {projects.map((p, i) => {
        const flip = i % 2 === 1;
        return (
          <motion.article
            key={p.slug}
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="group grid items-center gap-8 lg:grid-cols-2 lg:gap-14"
          >
            <TiltCard
              className={cn(
                flip && "lg:order-2",
                p.aspect === "portrait"
                  ? "mx-auto aspect-[4/5] w-full max-w-md lg:mx-0"
                  : "aspect-video w-full"
              )}
            >
              <Link
                href={`/work/${p.slug}`}
                className="relative block h-full w-full overflow-hidden rounded-2xl border border-border bg-surface"
              >
                <ProjectMedia {...mediaProps(p.media, p.title)} />
                <span className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/5 transition-opacity duration-300 group-hover:ring-blue/40" />
              </Link>
            </TiltCard>

            <div className={cn(flip && "lg:order-1")}>
              <div className="flex items-center gap-4">
                <span className="h-px flex-1 bg-border" />
                <span className="font-mono text-xs text-muted">{p.year}</span>
              </div>
              <h3 className="mt-5 font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold tracking-tight">
                {p.title}
              </h3>
              <div className="mt-4 flex flex-wrap gap-2">
                <TagPill>{p.industry}</TagPill>
                <TagPill>{p.discipline}</TagPill>
              </div>
              <Link
                href={`/work/${p.slug}`}
                className="group/link mt-7 inline-flex items-center gap-2 border-b-2 border-ink pb-1 font-display text-base font-semibold transition-colors hover:border-blue hover:text-blue"
              >
                View project
                <span className="transition-transform group-hover/link:translate-x-1">→</span>
              </Link>
            </div>
          </motion.article>
        );
      })}
    </div>
  );
}

/* ---------------- Variant 2: Masonry mosaic ---------------- */
function MasonryLayout() {
  return (
    <div className="mt-16 gap-5 [column-count:1] md:[column-count:2]">
      {projects.map((p) => (
        <motion.div
          key={p.slug}
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mb-5 break-inside-avoid"
        >
          <OverlayCard
            p={p}
            className={p.aspect === "portrait" ? "aspect-[4/5]" : "aspect-video"}
            titleClass="text-2xl"
          />
        </motion.div>
      ))}
    </div>
  );
}

/* ---------------- Variant 3: Spotlight stack ---------------- */
function SpotlightLayout() {
  return (
    <div className="mt-16 flex flex-col gap-8">
      {projects.map((p) => (
        <motion.div
          key={p.slug}
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
        >
          <OverlayCard
            p={p}
            className={
              p.aspect === "portrait"
                ? "mx-auto aspect-[4/5] max-w-xl"
                : "aspect-[16/8]"
            }
            titleClass="text-3xl sm:text-5xl"
          />
        </motion.div>
      ))}
    </div>
  );
}

/* ---------------- Shared overlay card ---------------- */
function OverlayCard({
  p,
  className,
  titleClass,
}: {
  p: Project;
  className?: string;
  titleClass?: string;
}) {
  return (
    <TiltCard className={className}>
      <Link
        href={`/work/${p.slug}`}
        className="group relative block h-full w-full overflow-hidden rounded-2xl border border-border bg-surface"
      >
        <div className="absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-[1.04]">
          <ProjectMedia {...mediaProps(p.media, p.title)} />
        </div>
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
          <div className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-white/70">
            {p.year}
          </div>
          <h3 className={cn("mt-1.5 font-display font-bold tracking-tight text-white", titleClass)}>
            {p.title}
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            <OverlayTag>{p.industry}</OverlayTag>
            <OverlayTag>{p.discipline}</OverlayTag>
          </div>
        </div>
        <span className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10 transition-colors duration-300 group-hover:ring-blue/50" />
      </Link>
    </TiltCard>
  );
}

function LayoutIcon({ variant }: { variant: LayoutVariant }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.5 };
  if (variant === "rows") {
    return (
      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" {...common}>
        <rect x="2" y="3.5" width="12" height="3.5" rx="1" />
        <rect x="2" y="9" width="12" height="3.5" rx="1" />
      </svg>
    );
  }
  if (variant === "masonry") {
    return (
      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" {...common}>
        <rect x="2" y="2" width="5" height="7" rx="1" />
        <rect x="9" y="2" width="5" height="4" rx="1" />
        <rect x="2" y="11" width="5" height="3" rx="1" />
        <rect x="9" y="8" width="5" height="6" rx="1" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" {...common}>
      <rect x="2" y="3.5" width="12" height="9" rx="1.5" />
    </svg>
  );
}

function TagPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-border bg-surface/40 px-3 py-1.5 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-muted backdrop-blur-sm">
      {children}
    </span>
  );
}

function OverlayTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-white/85 backdrop-blur-sm">
      {children}
    </span>
  );
}
