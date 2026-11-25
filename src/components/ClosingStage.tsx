"use client";

import { useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { FSMonogram3D } from "./ui/fs-monogram-3d";
import { ScrambleText } from "./ui/scramble-text";
import { EASE } from "@/lib/motion";

/**
 * The ending: "back to the stage". The white sheet lifts away at the end of
 * the page and reveals the dark hero stage again, composed like the hero's
 * first screen: the FS mark (held front-facing, straight edges) flanked by
 * "Design" and "Code", then the call to action underneath.
 *
 * Sequence (scroll): the sheet lifts off while the mark's two halves (with
 * Figma-style selection boxes) swing back together — already moving as they
 * first peek out — locking just as the stage is fully uncovered; then
 * Design / Code and the headline decode in (hero glitch), and the buttons
 * fade in.
 *
 * Mechanics: this wrapper overlaps the white sheet's last screen
 * (-mt-[100svh]) and sits below it (z-0 vs z-10). Its stage is sticky, so it
 * stays put while the sheet slides up and off it, then the page ends on it.
 */

const EMAIL = "fuad-salma@outlook.com";
const LINKEDIN = "https://www.linkedin.com/in/fuad-salma-944051224/";
const CV =
  "https://drive.google.com/file/d/1qbYW2YdP-923hM1A7Y985XzbaoGRzWDG/view?usp=sharing";

/** Scroll budget inside the wrapper, in svh (wrapper = 100 + SCROLL). */
const SCROLL = 150;
// The reveal itself spans 0–100 (the sheet lifting off). The halves start
// rejoining as soon as they peek out from under the sheet, and lock together
// just as the stage is fully uncovered — so the mark is always in motion.
const JOIN_START = 15; // halves begin moving together
const JOIN_END = 108; // halves fully reattached
const SPEAK_AT = 104; // labels + headline start decoding

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (t: number) => t * t * (3 - 2 * t);

export function ClosingStage() {
  // Progress pinned at 0 = the hero's first-screen pose (whole, centred).
  const pose = useMotionValue(0);
  const reduce = useReducedMotion();
  const [webgl, setWebgl] = useState(true);

  const wrap = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: wrap, offset: ["start start", "end end"] });
  const svh = useTransform(scrollYProgress, (v) => v * SCROLL);
  // 1 = detached, 0 = joined. Rejoins across the reveal.
  const split = useTransform(svh, (x) =>
    reduce ? 0 : 1 - smooth(clamp01((x - JOIN_START) / (JOIN_END - JOIN_START))),
  );
  const [speak, setSpeak] = useState(false);
  useMotionValueEvent(svh, "change", (x) => setSpeak(x >= SPEAK_AT));
  const showText = speak || !!reduce;

  return (
    <div ref={wrap} className="relative z-0 -mt-[100svh]" style={{ height: `${100 + SCROLL}svh` }}>
      <section
        aria-label="Contact"
        className="sticky top-0 flex h-svh flex-col overflow-hidden bg-[#040816] text-white"
      >
        {/* Stage light — same family as the hero */}
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-[20%] bg-[radial-gradient(44%_40%_at_50%_80%,rgba(37,99,235,0.7)_0%,rgba(29,78,216,0.28)_45%,transparent_75%),radial-gradient(30%_30%_at_80%_10%,rgba(96,165,250,0.16)_0%,transparent_70%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_0%_0%,rgba(0,0,0,0.6)_0%,transparent_55%)]"
        />

        {/* Upper stage: the mark (centred at 36% of the screen), flanked by
            Design / Code like the hero's first screen. The canvas box is
            72svh tall, so the mark rests at ~33svh — sized by height, so the
            text below always has room on wide, short screens. */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[72svh]">
          <div className="absolute inset-0">
            {webgl ? (
              <FSMonogram3D
                progress={pose}
                split={split}
                steady
                still={!!reduce}
                onFail={() => setWebgl(false)}
                className="absolute inset-0"
              />
            ) : null}
          </div>
          <span
            className={`absolute top-1/2 right-[calc(50%+10vh+2rem)] hidden -translate-y-1/2 font-display text-[clamp(1.1rem,1.9vw,1.9rem)] font-medium transition-opacity duration-150 sm:block ${
              showText ? "opacity-100" : "opacity-0"
            }`}
          >
            <ScrambleText text="Design" active={speak} />
          </span>
          <span
            className={`absolute top-1/2 left-[calc(50%+10vh+2rem)] hidden -translate-y-1/2 font-display text-[clamp(1.1rem,1.9vw,1.9rem)] font-medium transition-opacity duration-150 sm:block ${
              showText ? "opacity-100" : "opacity-0"
            }`}
          >
            <ScrambleText text="Code" active={speak} />
          </span>
          {/* Phone: under the mark, as in the hero. Offset = the mark's half-height
              + a gap; the mark shrinks on tall, narrow screens (viewport aspect
              < 0.612, matching FSMonogram3D's "narrow"), so the offset does too. */}
          <span
            className={`absolute inset-x-0 top-[calc(50%+16.6svh+1.25rem)] text-center [@media(max-aspect-ratio:612/1000)]:top-[calc(50%+13svh+1.25rem)] font-display text-lg font-medium transition-opacity duration-150 sm:hidden ${
              showText ? "opacity-100" : "opacity-0"
            }`}
          >
            <ScrambleText text="Design × Code" active={speak} />
          </span>
        </div>

        {/* Call to action */}
        <div className="relative z-10 mt-auto flex flex-col items-center px-6 text-center">
          <h2
            aria-label="Let's make something that wins."
            className={`font-display text-[clamp(1.75rem,min(4.2vw,7svh),4rem)] font-extrabold uppercase leading-[0.92] tracking-[-0.035em] transition-opacity duration-150 ${
              showText ? "opacity-100" : "opacity-0"
            }`}
          >
            <ScrambleText text="Let's make" active={speak} duration={700} />
            <br />
            <ScrambleText
              text="something that wins."
              active={speak}
              duration={900}
              fillClassName="text-gradient"
              className="text-gradient"
            />
          </h2>

          <motion.div
            initial={false}
            animate={showText ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
            transition={{ duration: 0.6, ease: EASE, delay: showText ? 0.55 : 0 }}
            className={`mt-7 flex flex-wrap items-center justify-center gap-3 ${showText ? "" : "pointer-events-none"}`}
          >
            <a
              href={`mailto:${EMAIL}`}
              className="group inline-flex items-center gap-3 rounded-full border border-white/25 bg-white/5 py-1.5 pr-1.5 pl-5 font-mono text-[0.7rem] uppercase tracking-[0.18em] backdrop-blur-md transition-colors hover:bg-white/15"
            >
              Get in touch
              <span className="grid h-8 w-8 place-items-center rounded-full bg-white text-[#040816] transition-transform duration-300 group-hover:scale-105">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m3 7 9 6 9-6" />
                </svg>
              </span>
            </a>
            <a
              href={CV}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-3 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-white/85 transition-colors hover:border-white/50 hover:text-white"
            >
              CV
              <span className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                ↗
              </span>
            </a>
          </motion.div>
        </div>

        {/* Slim footer */}
        <footer className="relative z-10 mt-8 flex flex-col items-center justify-between gap-3 border-t border-white/10 px-6 py-5 text-xs text-white/50 sm:flex-row sm:px-10 lg:px-16">
          <span>© {new Date().getFullYear()} Fuad Salma · Amman · Dubai</span>
          <span className="flex items-center gap-5">
            <a href={LINKEDIN} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-white">
              LinkedIn ↗
            </a>
            <a href={`mailto:${EMAIL}`} className="transition-colors hover:text-white">
              {EMAIL}
            </a>
          </span>
        </footer>
      </section>

      {/* Anchor for "Get in touch": the point where the stage is fully revealed */}
      <div id="contact" aria-hidden className="pointer-events-none absolute bottom-0 h-svh w-px" />
    </div>
  );
}
