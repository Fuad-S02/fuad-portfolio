"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type RefObject } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { useLenis } from "lenis/react";
import { projects, type Project } from "@/lib/projects";
import { WORK_SHEET_EVENT } from "@/lib/work-sheet";
import { ScrambleText } from "./ui/scramble-text";
import { EASE } from "@/lib/motion";

/**
 * "Work" as a full-screen white sheet that slides up over the page
 * (rounded top, like the site's other sheets). Projects drift down the space
 * at asymmetric positions; each title glitch-decodes (hero effect) as it
 * scrolls into view, and video projects play their loop on hover.
 * Opened from any "Work" link via openWorkSheet(); Esc / × closes.
 */
export function WorkSheet() {
  const [open, setOpen] = useState(false);
  const lenis = useLenis();
  const scroller = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener(WORK_SHEET_EVENT, onOpen);
    return () => window.removeEventListener(WORK_SHEET_EVENT, onOpen);
  }, []);

  // Lock the page behind (lock <html>, not <body>, so sticky sections survive).
  useEffect(() => {
    if (!open) return;
    lenis?.stop();
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      html.style.overflow = prev;
      lenis?.start();
      window.removeEventListener("keydown", onKey);
    };
  }, [open, lenis]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="worksheet"
          role="dialog"
          aria-modal="true"
          aria-label="Work"
          initial={reduce ? { opacity: 0 } : { y: "100%" }}
          animate={reduce ? { opacity: 1 } : { y: 0 }}
          exit={reduce ? { opacity: 0 } : { y: "100%" }}
          transition={{ duration: 0.75, ease: EASE }}
          className="fixed inset-x-0 bottom-0 top-3 z-[70] overflow-hidden rounded-t-[2rem] bg-white text-[#0a0b0d] shadow-[0_-40px_80px_-30px_rgba(0,0,0,0.6)] sm:top-4 sm:rounded-t-[3rem]"
        >
          <div ref={scroller} data-lenis-prevent className="h-full overflow-y-auto overscroll-contain">
            {/* Top bar */}
            <div className="sticky top-0 z-10 flex items-start justify-between bg-gradient-to-b from-white via-white/90 to-transparent px-6 pb-10 pt-8 sm:px-10 sm:pt-10 lg:px-16">
              <div>
                <p className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-[#5b616e]">
                  {projects.length} projects
                </p>
                <h2 className="mt-2 font-display text-[clamp(1.6rem,3.2vw,2.6rem)] font-extrabold uppercase leading-[0.95] tracking-[-0.03em] lg:text-[1.9rem]">
                  <span className="text-gradient">Work</span>
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close work"
                className="grid h-11 w-11 cursor-pointer place-items-center rounded-full border border-black/15 transition-colors hover:border-black/40 hover:bg-black/5"
              >
                <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                  <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" />
                </svg>
              </button>
            </div>

            {/* Projects, drifting down the space */}
            <ul className="px-6 pb-40 sm:px-10 lg:px-16">
              {projects.map((p, i) => (
                <WorkItem key={p.slug} p={p} i={i} root={scroller} onPick={() => setOpen(false)} />
              ))}
            </ul>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Asymmetric placement (desktop): items alternate left / right zones with
 * varying offsets, and right-zone items tuck up beside the previous one.
 * Widths stay within their zone (left ≤ 50%, right ≥ 54%), so nothing overlaps.
 */
const LEFT = ["lg:ml-[3%]", "lg:ml-0", "lg:ml-[7%]"];
/** Narrow glyphs + clipping, so multi-line titles never spill while decoding. */
const GLYPHS = "abcdefghijklmnopqrstuvwxyz/<>*+=";
const RIGHT = ["lg:mr-[4%]", "lg:mr-[10%]", "lg:mr-0"];

function WorkItem({
  p,
  i,
  root,
  onPick,
}: {
  p: Project;
  i: number;
  root: RefObject<HTMLDivElement | null>;
  onPick: () => void;
}) {
  const ref = useRef<HTMLLIElement>(null);
  const inView = useInView(ref, { root, once: true, margin: "0px 0px -12% 0px" });
  const reduce = useReducedMotion();
  const [hover, setHover] = useState(false);

  const right = i % 2 === 1;
  const portrait = p.aspect === "portrait";
  const width = portrait
    ? right ? "lg:w-[26%]" : "lg:w-[30%]"
    : right ? "lg:w-[40%]" : "lg:w-[44%]";
  const place = right
    ? `lg:ml-auto ${RIGHT[Math.floor(i / 2) % RIGHT.length]} lg:-mt-[14vh]`
    : LEFT[Math.floor(i / 2) % LEFT.length];
  const poster =
    p.media.type === "video" ? p.media.poster : p.media.type === "image" ? p.media.src : null;
  const video = p.media.type === "video" ? p.media.src : null;
  const shown = inView || !!reduce;

  return (
    <li ref={ref} className={`mt-16 w-full first:mt-4 sm:mt-24 ${width} ${place}`}>
      <Link
        href={`/work/${p.slug}`}
        onClick={onPick}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className="group block"
      >
        <motion.div
          initial={false}
          animate={shown ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8, ease: EASE }}
          className={`relative overflow-hidden rounded-2xl bg-[#eef0f3] ${portrait ? "aspect-[4/5]" : "aspect-[16/10]"}`}
        >
          {poster && (
            <Image
              src={poster}
              alt={p.title}
              fill
              sizes="(min-width: 1024px) 44vw, 100vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            />
          )}
          {video && hover && (
            <video
              src={video}
              autoPlay
              muted
              loop
              playsInline
              preload="none"
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
        </motion.div>

        <div className="mt-4 flex items-baseline justify-between gap-4">
          <h3
            aria-label={p.title}
            className={`font-display text-[clamp(1.25rem,2vw,1.9rem)] font-bold leading-[1.05] tracking-[-0.02em] transition-opacity duration-150 group-hover:text-[#2563eb] ${
              shown ? "opacity-100" : "opacity-0"
            }`}
          >
            <ScrambleText
              text={p.title}
              active={inView}
              duration={700}
              glyphs={GLYPHS}
              fillClassName="overflow-hidden"
            />
          </h3>
          <span className="shrink-0 text-sm text-[#5b616e]">{p.year}</span>
        </div>
        <motion.p
          initial={false}
          animate={shown ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: shown ? 0.35 : 0 }}
          className="mt-1 text-sm text-[#5b616e]"
        >
          {p.discipline} · {p.industry}
        </motion.p>
      </Link>
    </li>
  );
}
