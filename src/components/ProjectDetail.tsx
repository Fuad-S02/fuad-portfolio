"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { EASE, fadeUp, viewportOnce } from "@/lib/motion";
import { Reveal, MaskLine } from "./ui/reveal";
import { ProjectMedia } from "./ui/project-media";
import { VideoPlayer } from "./ui/video-player";
import {
  projects,
  mediaProps,
  type Project,
  type GalleryItem,
} from "@/lib/projects";
import { cn } from "@/lib/utils";

const PAD = "px-6 sm:px-10 lg:px-16";

export function ProjectDetail({ project: p }: { project: Project }) {
  const idx = projects.findIndex((x) => x.slug === p.slug);
  const prev = projects[(idx - 1 + projects.length) % projects.length];
  const next = projects[(idx + 1) % projects.length];

  return (
    <main className="relative pb-28 pt-36 text-ink sm:pt-40">
      <div className={cn("mx-auto w-full max-w-6xl", PAD)}>
        {/* Header — minimal meta, no body copy */}
        <Reveal>
          <motion.div variants={fadeUp}>
            <Link
              href="/#work"
              className="group inline-flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted transition-colors hover:text-blue"
            >
              <span className="transition-transform group-hover:-translate-x-1">←</span>
              Selected Work
            </Link>
          </motion.div>

          <h1 className="mt-6 font-display text-[clamp(2.25rem,7vw,5.5rem)] font-extrabold uppercase leading-[0.9] tracking-[-0.035em]">
            <MaskLine>{p.title}</MaskLine>
          </h1>

          <motion.dl
            variants={fadeUp}
            className="mt-8 grid grid-cols-2 gap-x-8 gap-y-6 border-y border-border py-6 sm:flex sm:flex-wrap sm:gap-x-16"
          >
            <MetaItem label="Industry" value={p.industry} />
            <MetaItem label="Discipline" value={p.discipline} />
            <MetaItem label="Year" value={p.year} />
          </motion.dl>
        </Reveal>

        {/* The work — hero media */}
        {p.media.type === "image" ? (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportOnce}
            transition={{ duration: 0.8, ease: EASE }}
            className="mt-12 overflow-hidden rounded-2xl border border-border bg-surface"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.media.src} alt={p.title} className="block h-auto w-full" />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportOnce}
            transition={{ duration: 0.8, ease: EASE }}
            className={cn(
              "mt-12 overflow-hidden rounded-2xl border border-border bg-black",
              p.aspect === "portrait"
                ? "mx-auto aspect-[4/5] w-full max-w-2xl"
                : "aspect-video w-full"
            )}
          >
            {p.media.type === "video" && !p.loopHero ? (
              <VideoPlayer
                src={p.media.src}
                poster={p.media.poster}
                className="h-full w-full"
              />
            ) : (
              <ProjectMedia {...mediaProps(p.media, p.title)} />
            )}
          </motion.div>
        )}
      </div>

      {/* Full-bleed gallery — the work, immersive */}
      {p.gallery && p.gallery.length > 0 && (
        <ProjectGallery items={p.gallery} title={p.title} />
      )}

      <div className={cn("mx-auto w-full max-w-6xl", PAD)}>
        {/* Previous (left) · Next (right) */}
        <Reveal className="mt-24 border-t border-border pt-10">
          <motion.div
            variants={fadeUp}
            className="flex items-start justify-between gap-6"
          >
            <Link
              href={`/work/${prev.slug}`}
              className="group max-w-[48%]"
            >
              <span className="block font-mono text-[0.7rem] uppercase tracking-[0.22em] text-muted">
                Previous
              </span>
              <span className="mt-2 flex items-baseline gap-2 font-display text-xl font-bold uppercase leading-tight tracking-tight transition-colors group-hover:text-blue sm:text-2xl">
                <span className="text-muted transition-transform group-hover:-translate-x-1 group-hover:text-blue">
                  ←
                </span>
                {prev.title}
              </span>
            </Link>

            <Link
              href={`/work/${next.slug}`}
              className="group max-w-[48%] text-right"
            >
              <span className="block font-mono text-[0.7rem] uppercase tracking-[0.22em] text-muted">
                Next
              </span>
              <span className="mt-2 flex items-baseline justify-end gap-2 font-display text-xl font-bold uppercase leading-tight tracking-tight transition-colors group-hover:text-blue sm:text-2xl">
                {next.title}
                <span className="text-muted transition-transform group-hover:translate-x-1 group-hover:text-blue">
                  →
                </span>
              </span>
            </Link>
          </motion.div>
        </Reveal>
      </div>
    </main>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted">
        {label}
      </dt>
      <dd className="mt-1.5 font-display text-base font-semibold">{value}</dd>
    </div>
  );
}

/**
 * Project gallery: "full" items go full-bleed (edge to edge) as cinematic
 * beats; consecutive "half" items group into contained 2-up rows for rhythm.
 */
function ProjectGallery({
  items,
  title,
}: {
  items: GalleryItem[];
  title: string;
}) {
  // Group consecutive half items into pairs; full items stand alone.
  const blocks: GalleryItem[][] = [];
  for (const it of items) {
    const last = blocks[blocks.length - 1];
    if (it.span === "half" && last && last.length === 1 && last[0].span === "half") {
      last.push(it);
    } else {
      blocks.push([it]);
    }
  }

  return (
    <section className={cn("mx-auto mt-4 flex w-full max-w-6xl flex-col gap-4 sm:mt-6 sm:gap-6", PAD)}>
      {blocks.map((block, bi) =>
        block[0].span === "full" ? (
          <GalleryReveal
            key={bi}
            className="overflow-hidden rounded-2xl border border-border bg-surface"
          >
            <GalleryMedia item={block[0]} title={title} />
          </GalleryReveal>
        ) : (
          <div key={bi} className="grid items-start gap-4 sm:grid-cols-2 sm:gap-6">
            {block.map((it, i) => (
              <GalleryReveal
                key={i}
                className="overflow-hidden rounded-2xl border border-border bg-surface"
              >
                <GalleryMedia item={it} title={title} />
              </GalleryReveal>
            ))}
          </div>
        )
      )}
    </section>
  );
}

function GalleryReveal({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.9, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function GalleryMedia({
  item,
  title,
  cover,
}: {
  item: GalleryItem;
  title: string;
  cover?: boolean;
}) {
  const cls = cover ? "h-full w-full object-cover" : "block h-auto w-full";
  if (item.type === "video") {
    return (
      <video
        src={item.src}
        autoPlay
        muted
        loop
        playsInline
        className={cls}
        aria-label={title}
      />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={item.src} alt={title} loading="lazy" className={cls} />
  );
}
