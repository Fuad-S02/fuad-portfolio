"use client";

/**
 * WorkOverlay — a project opened in place from the work sphere.
 *
 * The clicked card's video zooms from its spot on the sphere to fill the
 * screen; scrolling down reveals the case study. "Back" scrolls to the top
 * and shrinks the video back into its card. Rendered in a portal on <body>
 * so nothing in the page (sticky/overflow/transform) can clip it.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { motion } from "motion/react";
import { useLenis } from "lenis/react";
import { EASE } from "@/lib/motion";
import type { Project } from "@/lib/projects";
import { getCaseStudy } from "@/lib/case-studies";
import { cn } from "@/lib/utils";

export type Rect = { top: number; left: number; width: number; height: number };

type Props = {
  project: Project;
  poster: string;
  /** Video aspect ratio (w / h). */
  ratio: number;
  /** Where the card is on screen when opening. */
  from: Rect;
  /** Where the card is now (for the zoom back). */
  getReturnRect: () => Rect | null;
  onClosed: () => void;
};

/**
 * Full-bleed when the video's shape is close to the screen's. Otherwise it
 * sits as a large rounded frame on the white page, clear of the Back button
 * (top) and the controls row (bottom).
 */
function heroRect(ratio: number, W: number, H: number) {
  const k = ratio / (W / H);
  if (k > 0.78 && k < 1.3) return { top: 0, left: 0, width: W, height: H, fit: false };
  const padY = W < 640 ? 84 : 96;
  const padX = W < 640 ? 16 : 40;
  let h = H - padY * 2;
  let w = h * ratio;
  if (w > W - padX * 2) {
    w = W - padX * 2;
    h = w / ratio;
  }
  return { top: (H - h) / 2, left: (W - w) / 2, width: w, height: h, fit: true };
}

const ZOOM = { duration: 0.85, ease: EASE };

export function WorkOverlay({ project, poster, ratio, from, getReturnRect, onClosed }: Props) {
  const [phase, setPhase] = useState<"in" | "open" | "out">("in");
  const [view] = useState(() => ({ W: window.innerWidth, H: window.innerHeight }));
  const [hero] = useState(() => heroRect(ratio, view.W, view.H));
  const [back, setBack] = useState<Rect>(from);
  const [playing, setPlaying] = useState(false);
  // Hide the "Case study" hint as soon as the reader starts scrolling.
  const [scrolled, setScrolled] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const lenis = useLenis();

  const src = project.media.type === "video" ? project.media.src : null;
  const hasSound = !!src && !project.loopHero;
  const { study, draft } = getCaseStudy(project.slug);

  // Freeze the page behind while open. Lock <html>, not <body>: overflow on
  // body turns it into its own scroll box and un-sticks the pinned sphere.
  useEffect(() => {
    lenis?.stop();
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      lenis?.start();
      html.style.overflow = prev;
    };
  }, [lenis]);

  const close = useCallback(async () => {
    if (phase === "out") return;
    const sc = scroller.current;
    if (sc && sc.scrollTop > 2) {
      sc.scrollTo({ top: 0, behavior: "smooth" });
      const t0 = performance.now();
      await new Promise<void>((res) => {
        const tick = () =>
          sc.scrollTop <= 2 || performance.now() - t0 > 1200 ? res() : requestAnimationFrame(tick);
        tick();
      });
    }
    const v = video.current;
    if (v) {
      v.muted = true;
      v.controls = false;
    }
    setPlaying(false);
    const r = getReturnRect();
    if (r) setBack(r);
    setPhase("out");
  }, [phase, getReturnRect]);

  // Fail-safes: never leave the overlay stuck half-open or half-closed if an
  // animation-complete callback doesn't arrive (tab hidden, interrupted, etc.).
  useEffect(() => {
    if (phase === "open") return;
    const id = window.setTimeout(() => {
      if (phase === "in") setPhase("open");
      else onClosed();
    }, 1600);
    return () => window.clearTimeout(id);
  }, [phase, onClosed]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  /** Restart the film from the top with sound and the native player controls. */
  const playFilm = () => {
    const v = video.current;
    if (!v || playing) return;
    v.currentTime = 0;
    v.loop = false;
    v.muted = false;
    v.controls = true;
    void v.play().catch(() => {
      v.muted = true;
      void v.play();
    });
    setPlaying(true);
  };

  const gallery =
    project.gallery && project.gallery.length > 0 ? (
      <div className={cn("grid gap-5 sm:grid-cols-2", study.mediaFirst ? "mt-12" : "mt-16")}>
        {project.gallery.map((g) => (
          <div
            key={g.src}
            className={cn(
              "relative overflow-hidden rounded-2xl bg-[#e9ebef]",
              g.span === "full" && "sm:col-span-2"
            )}
          >
            {g.type === "video" ? (
              <video src={g.src} controls muted playsInline preload="metadata" className="block h-auto w-full" />
            ) : (
              <Image src={g.src} alt="" width={1600} height={1000} sizes="(max-width: 640px) 100vw, 1024px" className="h-auto w-full" />
            )}
          </div>
        ))}
      </div>
    ) : null;

  const shown = phase === "open";

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={project.title}
      // Inline (not a utility class) so the layer order never depends on a
      // stylesheet being up to date — the overlay must sit above everything.
      style={{ position: "fixed", inset: 0, zIndex: 70, pointerEvents: phase === "out" ? "none" : "auto" }}
    >
      {/* page backdrop */}
      <motion.div
        aria-hidden
        className="absolute inset-0 bg-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === "out" ? 0 : 1 }}
        transition={{ duration: 0.6, ease: EASE, delay: phase === "out" ? 0.2 : 0 }}
      />

      <div
        ref={scroller}
        data-lenis-prevent
        onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 24)}
        className={cn(
          "absolute inset-0 overscroll-contain text-[#0a0b0d]",
          shown ? "overflow-y-auto" : "overflow-hidden"
        )}
      >
        {/* hero area: one screen tall */}
        <div className="relative" style={{ height: view.H }}>

          {/* the zooming frame */}
          <motion.div
            className="absolute z-10 overflow-hidden bg-[#0b0d12] shadow-[0_40px_80px_-30px_rgba(12,22,48,0.45)]"
            initial={{ ...from, borderRadius: 22 }}
            animate={
              phase === "out"
                ? { ...back, borderRadius: 22 }
                : {
                    top: hero.top,
                    left: hero.left,
                    width: hero.width,
                    height: hero.height,
                    borderRadius: hero.fit ? 24 : 0,
                  }
            }
            transition={ZOOM}
            onAnimationComplete={() => {
              if (phase === "in") setPhase("open");
              else if (phase === "out") onClosed();
            }}
          >
            {src ? (
              <video
                ref={video}
                src={src}
                poster={poster}
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <Image src={poster} alt="" fill sizes="100vw" className="object-cover" />
            )}

            {/* Play the full film, with sound */}
            {hasSound && !playing && (
              <motion.button
                type="button"
                onClick={playFilm}
                aria-label="Play the full film with sound"
                initial={{ opacity: 0 }}
                animate={{ opacity: shown ? 1 : 0 }}
                transition={{ duration: 0.4, ease: EASE, delay: shown ? 0.15 : 0 }}
                style={{ pointerEvents: shown ? "auto" : "none" }}
                className="group absolute inset-0 grid cursor-pointer place-items-center bg-black/10 transition-colors hover:bg-black/25"
              >
                <span className="flex items-center gap-3 rounded-full bg-white py-2 pr-6 pl-2 font-display text-base font-semibold text-[#0a0b0d] shadow-[0_18px_40px_-12px_rgba(0,0,0,0.55)] transition-transform duration-300 group-hover:scale-105">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-[#2563eb] text-white">
                    <svg viewBox="0 0 24 24" className="ml-0.5 h-4 w-4" fill="currentColor" aria-hidden>
                      <path d="M7 4.5v15l13-7.5z" />
                    </svg>
                  </span>
                  Play film
                </span>
              </motion.button>
            )}
          </motion.div>

          {/* scroll hint (hidden once scrolling starts, and while the film plays —
              its controls take the bottom) */}
          <motion.div
            className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center pb-6 sm:pb-7"
            initial={{ opacity: 0 }}
            animate={{ opacity: shown && !playing && !scrolled ? 1 : 0 }}
            transition={{ duration: 0.4 }}
          >
            <span className="inline-flex items-center gap-2.5 rounded-full bg-[#0a0b0d]/85 py-2 pl-4 pr-2.5 font-mono text-[0.68rem] font-medium uppercase tracking-[0.2em] text-white shadow-[0_10px_30px_-12px_rgba(0,0,0,0.5)] backdrop-blur-md">
              Case study
              {/* scroll cue: a thin chevron drifting down (same motion as the hero) */}
              <span className="grid h-5 w-5 place-items-center overflow-hidden rounded-full border border-white/30">
                <svg
                  viewBox="0 0 16 16"
                  aria-hidden
                  className="h-3 w-3 animate-[scrollCue_2.4s_cubic-bezier(0.16,1,0.3,1)_infinite] motion-reduce:animate-none"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3.5 6l4.5 4.5L12.5 6" />
                </svg>
              </span>
            </span>
          </motion.div>
        </div>

        {/* case study */}
        <motion.article
          initial={{ opacity: 0, y: 40 }}
          animate={shown ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.7, ease: EASE, delay: shown ? 0.1 : 0 }}
          className="mx-auto w-full max-w-5xl px-6 pt-20 pb-28 sm:px-10 sm:pt-28"
        >
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.24em] text-[#5b616e]">
            {project.industry} · {project.year}
          </p>
          <h2 className="mt-4 font-display text-[clamp(2.25rem,6vw,4.75rem)] font-extrabold uppercase leading-[0.92] tracking-[-0.03em]">
            {project.title}
          </h2>
          <p className="mt-5 text-lg text-[#5b616e]">{study.summary ?? project.discipline}</p>

          {/* imagery-led projects (e.g. brand identities) show the work before the write-up */}
          {study.mediaFirst && gallery}

          {draft && (
            <p className="mt-10 inline-flex items-center gap-2 rounded-full border border-dashed border-black/20 px-3.5 py-1.5 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-[#5b616e]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#2563eb]" />
              Case study in progress
            </p>
          )}

          <div className="mt-14 divide-y divide-black/10 border-y border-black/10">
            {study.sections.map((sec) => (
              <section key={sec.label} className="grid gap-3 py-9 sm:grid-cols-[14rem_1fr] sm:gap-10">
                <h3 className="font-display text-xl font-bold tracking-tight">{sec.label}</h3>
                <p className={cn("text-lg leading-relaxed", draft ? "text-black/35 italic" : "text-[#2b2f38]")}>
                  {sec.body}
                </p>
              </section>
            ))}
          </div>

          {!study.mediaFirst && gallery}

          <button
            type="button"
            onClick={close}
            className="group mt-20 inline-flex cursor-pointer items-center gap-3 rounded-full bg-[#0a0b0d] px-6 py-3.5 font-display text-base font-semibold text-white transition-colors hover:bg-[#2563eb]"
          >
            <span className="transition-transform group-hover:-translate-x-1">←</span>
            Back to work
          </button>
        </motion.article>
      </div>

      {/* back button — always reachable */}
      <motion.button
        type="button"
        onClick={close}
        initial={{ opacity: 0, y: -10 }}
        animate={shown ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
        transition={{ duration: 0.4, ease: EASE }}
        style={{ pointerEvents: shown ? "auto" : "none" }}
        className="group absolute top-6 left-6 z-30 inline-flex cursor-pointer items-center gap-2.5 rounded-full bg-[#0a0b0d]/85 py-3 pr-5 pl-4 font-display text-sm font-semibold text-white shadow-[0_10px_30px_-12px_rgba(0,0,0,0.55)] ring-1 ring-white/15 backdrop-blur-md transition-colors hover:bg-[#2563eb] sm:top-8 sm:left-10 lg:left-16"
      >
        <span className="transition-transform group-hover:-translate-x-0.5">←</span>
        Back
      </motion.button>
    </div>,
    document.body
  );
}
