"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { FSMonogram3D, type PieceRect } from "./ui/fs-monogram-3d";
import { ScrambleText } from "./ui/scramble-text";
import { Logo } from "./Logo";
import { ToolMarquee } from "./ToolMarquee";
import { EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Services as Figma-style multiplayer cursors pointing at the split logo
 * pieces. piece 0 = top "F" half, 1 = bottom "S" half; fy = height along the
 * piece's box; side = which edge (-1 left, 1 right) the cursor sits on.
 */
const SERVICES = [
  { name: "Brand Design", piece: 0, fy: 0.3, side: -1, bg: "#2563eb", ink: "#ffffff" },
  { name: "Motion Graphics", piece: 0, fy: 0.08, side: 1, bg: "#38bdf8", ink: "#04121f" },
  { name: "UI/UX Design", piece: 1, fy: 0.5, side: -1, bg: "#6366f1", ink: "#ffffff" },
  { name: "AI Creative", piece: 1, fy: 0.42, side: 1, bg: "#f8fafc", ink: "#0b1020" },
] as const;

/** Scroll windows (0–1 of the pinned sequence) for each text beat. */
const BEATS = {
  intro: [0, 0.01, 0.09, 0.14],
  headline: [0.15, 0.21, 0.4, 0.46],
  statement: [0.48, 0.54, 0.7, 0.76],
  outro: [0.8, 0.86, 0.99, 1],
} as const;
type Beat = keyof typeof BEATS;
/** Fraction of the section's scroll used by the sequence; the rest is the cover. */
const COVER_START = 0.75;

/** Piecewise-linear map of v through (xs → ys), clamped at both ends. */
function lerpPoints(v: number, xs: readonly number[], ys: readonly number[]) {
  if (v <= xs[0]) return ys[0];
  for (let i = 1; i < xs.length; i++) {
    if (v <= xs[i]) {
      const k = (v - xs[i - 1]) / (xs[i] - xs[i - 1] || 1);
      return ys[i - 1] + (ys[i] - ys[i - 1]) * k;
    }
  }
  return ys[ys.length - 1];
}

/**
 * Opacity + a small rise in, drift out, for one beat window.
 * Function-form transforms on purpose: motion's GPU-accelerated scroll
 * timeline drops inner keyframe offsets for ranges that start at 0.
 */
function useBeat(p: MotionValue<number>, beat: Beat) {
  const xs = BEATS[beat];
  const first = beat === "intro";
  const last = beat === "outro";
  const op = [first ? 1 : 0, 1, 1, last ? 1 : 0];
  const ys = [first ? 0 : 28, 0, 0, last ? 0 : -28];
  const opacity = useTransform(p, (v) => lerpPoints(v, xs, op));
  const y = useTransform(p, (v) => lerpPoints(v, xs, ys));
  return { opacity, y };
}

/**
 * HERO STAGE — a pinned, scroll-driven sequence on a deep-blue stage.
 * The FS monogram (3D) turns, splits and reassembles while four short beats
 * of copy decode in around it:
 *   1. Design × Code (flanking the mark)
 *   2. Creativity, engineered.
 *   3. What I do — services tagged onto the split pieces
 *   4. The mark reassembles alone, then the next section covers it
 */
export function HeroStage() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const [webgl, setWebgl] = useState(true);
  const onFail = useCallback(() => setWebgl(false), []);

  // The section is the sequence (first 3 screens of scroll) + one extra
  // screen where the stage stays pinned while the next section slides over
  // it (that section uses -mt-[100svh], see <StageCover>).
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const coverStart = reduce ? 0 : COVER_START;
  /** 0–1 progress of the 3D/text sequence only. */
  const seq = useTransform(scrollYProgress, (v) => Math.min(1, v / COVER_START));
  /** 0–1 while the next section covers the pinned stage. */
  const cover = useTransform(scrollYProgress, (v) =>
    Math.min(1, Math.max(0, (v - coverStart) / (1 - coverStart)))
  );
  const stageScale = useTransform(cover, (c) => 1 - 0.06 * c);
  const stageRadius = useTransform(cover, (c) => `${c * 32}px`);
  const stageDim = useTransform(cover, (c) => 0.6 * c);

  // Which beat is live → replays the decode effect each time it enters.
  const [live, setLive] = useState<Beat>("intro");
  useMotionValueEvent(seq, "change", (v) => {
    const next: Beat =
      v < BEATS.intro[3] ? "intro"
      : v < BEATS.headline[3] ? "headline"
      : v < BEATS.statement[3] ? "statement"
      : "outro";
    setLive((cur) => (cur === next ? cur : next));
  });

  const intro = useBeat(seq, "intro");
  const headline = useBeat(seq, "headline");
  const statement = useBeat(seq, "statement");
  const hint = useTransform(seq, (v) => lerpPoints(v, [0, 0.05], [1, 0]));
  // Tool-logo strip: visible on the first screen, gone as the story starts.
  const tools = useTransform(seq, (v) => lerpPoints(v, [0, 0.07], [1, 0]));
  const glowX = useTransform(seq, (v) => `${-12 + 34 * v}%`);
  const glowY = useTransform(seq, (v) => `${8 - 18 * v}%`);

  // Tell the fixed header when it sits on the dark stage (white logo/menu):
  // until the covering section's top edge reaches the header.
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const el = ref.current;
    if (!el) return;
    const range = el.offsetHeight - window.innerHeight;
    const headerH = 72;
    const root = document.documentElement;
    if (v < 1 - headerH / Math.max(1, range)) root.dataset.stage = "on";
    else delete root.dataset.stage;
  });
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.stage = "on";
    return () => {
      delete root.dataset.stage;
    };
  }, []);

  // Service tags follow the logo pieces: the 3D component reports their
  // screen boxes every frame and we place the tags straight in the DOM.
  const tagRefs = useRef<(HTMLDivElement | null)[]>([]);
  const tagW = useRef<number[]>([]);
  useEffect(() => {
    const ro = new ResizeObserver(() => {
      tagRefs.current.forEach((el, i) => {
        if (el) tagW.current[i] = el.offsetWidth;
      });
    });
    tagRefs.current.forEach((el) => el && ro.observe(el));
    return () => ro.disconnect();
  }, []);
  const onAnchors = useCallback((rects: PieceRect[]) => {
    const host = tagRefs.current[0]?.parentElement;
    if (!host) return;
    const W = host.clientWidth;
    const H = host.clientHeight;
    const t = performance.now() / 1000;
    SERVICES.forEach((sv, i) => {
      const el = tagRefs.current[i];
      const r = rects[sv.piece];
      if (!el || !r) return;
      const w = tagW.current[i] || 0;
      const ax = sv.side < 0 ? r.x0 - 10 : r.x1 + 10;
      // Small idle drift so the cursors feel "live", like collaborators.
      const dx = Math.sin(t * 0.8 + i * 2.1) * 5;
      const dy = Math.cos(t * 1.1 + i * 1.3) * 4;
      const y = Math.min(H - 120, Math.max(84, r.y0 + sv.fy * (r.y1 - r.y0) + dy));
      const left = Math.min(W - 12 - w, Math.max(12, (sv.side < 0 ? ax - w : ax) + dx));
      el.style.transform = `translate3d(${left}px, ${y}px, 0)`;
    });
  }, []);

  const pad = "px-6 sm:px-10 lg:px-16";

  return (
    <section
      ref={ref}
      id="intro"
      className={reduce ? "relative h-[200svh]" : "relative h-[500svh]"}
    >
      <motion.div
        style={{ scale: stageScale, borderRadius: stageRadius }}
        className="sticky top-0 h-svh origin-[50%_35%] overflow-hidden bg-[#040816] text-white"
      >
        {/* Darkens as the next section slides over */}
        <motion.div
          aria-hidden
          style={{ opacity: stageDim }}
          className="pointer-events-none absolute inset-0 z-20 bg-black"
        />
        {/* Stage light */}
        <motion.div
          aria-hidden
          style={reduce ? undefined : { x: glowX, y: glowY }}
          className="pointer-events-none absolute -inset-[20%] bg-[radial-gradient(42%_38%_at_62%_68%,rgba(37,99,235,0.85)_0%,rgba(29,78,216,0.35)_45%,transparent_75%),radial-gradient(30%_30%_at_20%_15%,rgba(96,165,250,0.22)_0%,transparent_70%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_0%_0%,rgba(0,0,0,0.65)_0%,transparent_55%)]"
        />

        {/* The mark */}
        {webgl ? (
          <FSMonogram3D
            progress={seq}
            still={!!reduce}
            onFail={onFail}
            onAnchors={reduce ? undefined : onAnchors}
            className="absolute inset-0"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center">
            <Logo gradient className="h-[42vh] w-auto" />
          </div>
        )}

        {/* 1 — Design × Code, flanking the mark */}
        {!reduce && (
          <motion.div style={intro} className="pointer-events-none absolute inset-0">
            {/* Labels are symmetric about the page centre. The 3D mark is centred too;
                it only drifts a few px as it sways / turns toward the pointer. */}
            <span className="absolute top-1/2 right-[calc(50%+14vh+2.5rem)] hidden -translate-y-1/2 font-display text-[clamp(1.25rem,2.2vw,2.25rem)] font-medium sm:block">
              <ScrambleText text="Design" active={live === "intro"} />
            </span>
            <span className="absolute top-1/2 left-[calc(50%+14vh+2.5rem)] hidden -translate-y-1/2 font-display text-[clamp(1.25rem,2.2vw,2.25rem)] font-medium sm:block">
              <ScrambleText text="Code" active={live === "intro"} />
            </span>
            <span className="absolute inset-x-0 top-[calc(50%+22vh)] text-center font-display text-xl font-medium sm:hidden">
              <ScrambleText text="Design × Code" active={live === "intro"} />
            </span>
          </motion.div>
        )}

        {/* 2 — Headline */}
        <motion.div
          style={reduce ? undefined : headline}
          className={`absolute inset-x-0 bottom-[16vh] ${pad}`}
        >
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-blue-light">
            <ScrambleText
              text="Fuad Salma — Multidisciplinary Designer"
              active={live === "headline"}
              duration={700}
            />
          </p>
          <h1 className="mt-4 max-w-[12ch] font-display text-[clamp(2.75rem,8.5vw,7.5rem)] font-extrabold uppercase leading-[0.88] tracking-[-0.035em]">
            <ScrambleText text="Creativity," active={live === "headline" || !!reduce} />
            <br />
            <ScrambleText
              text="Engineered."
              active={live === "headline" || !!reduce}
              duration={1100}
              fillClassName="bg-[linear-gradient(120deg,#93c5fd,#3b82f6)] bg-clip-text text-transparent"
            />
          </h1>
        </motion.div>

        {/* 3 — What I do */}
        {!reduce && (
          <motion.div
            style={statement}
            className={`absolute inset-x-0 bottom-[14vh] sm:inset-x-auto sm:right-0 sm:top-1/2 sm:bottom-auto sm:w-[min(34rem,48vw)] sm:-translate-y-1/2 ${pad}`}
          >
            <p className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-blue-light">
              What I do
            </p>
            <p className="mt-4 font-display text-[clamp(1.5rem,2.6vw,2.4rem)] font-medium leading-[1.15] tracking-[-0.01em]">
              <ScrambleText
                text="I design brands, products and experiences — then build them with code and AI."
                active={live === "statement"}
                duration={1200}
              />
            </p>
            <p className="mt-4 max-w-[34ch] text-[0.95rem] leading-relaxed text-white/65">
              Craft first — years in the classic design, video and web tools,
              long before AI.
            </p>
          </motion.div>
        )}

        {/* 3b — Services, tagged onto the split logo pieces */}
        {!reduce && webgl && (
          <motion.div
            aria-label="Services"
            role="list"
            style={{ opacity: statement.opacity }}
            className="pointer-events-none absolute inset-0"
          >
            {SERVICES.map((sv, i) => (
              <div
                key={sv.name}
                role="listitem"
                ref={(el) => {
                  tagRefs.current[i] = el;
                }}
                className="absolute left-0 top-0 will-change-transform"
              >
                <motion.div
                  initial={false}
                  animate={
                    live === "statement"
                      ? { opacity: 1, scale: 1, x: 0, y: 0 }
                      : { opacity: 0, scale: 0.6, x: sv.side * 28, y: 22 }
                  }
                  transition={{
                    duration: 0.7,
                    ease: EASE,
                    delay: live === "statement" ? 0.3 + i * 0.14 : 0,
                  }}
                  style={{ transformOrigin: sv.side < 0 ? "top right" : "top left" }}
                  className="relative"
                >
                  {/* cursor — its tip sits on the anchor point */}
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden
                    className={cn(
                      "absolute top-0 h-5 w-5 drop-shadow-[0_2px_6px_rgba(0,0,0,0.45)] sm:h-6 sm:w-6",
                      sv.side < 0 ? "right-0 -scale-x-100" : "left-0"
                    )}
                  >
                    <path
                      d="M2.5 2 L20.5 10.4 L12.6 12.6 L9.3 20.8 Z"
                      fill={sv.bg}
                      stroke="#fff"
                      strokeWidth="1.6"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span
                    style={{ backgroundColor: sv.bg, color: sv.ink }}
                    className={cn(
                      "mt-4 inline-block whitespace-nowrap rounded-[10px] px-2.5 py-1 font-display text-[0.8rem] font-semibold tracking-[-0.01em] shadow-[0_10px_28px_-10px_rgba(0,0,0,0.7)] ring-1 ring-white/25 sm:mt-5 sm:px-3.5 sm:py-1.5 sm:text-[clamp(0.95rem,1.2vw,1.15rem)]",
                      sv.side < 0 ? "mr-4 rounded-tr-[3px] sm:mr-5" : "ml-4 rounded-tl-[3px] sm:ml-5"
                    )}
                  >
                    {sv.name}
                  </span>
                </motion.div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Tool logos, under the 3D mark on the first screen */}
        <motion.div
          style={{ opacity: reduce ? 1 : tools }}
          className="absolute inset-x-0 bottom-24 flex justify-center sm:bottom-28"
        >
          <ToolMarquee className="w-full max-w-3xl" />
        </motion.div>

        {/* Persistent bottom bar */}
        <div className={`absolute inset-x-0 bottom-0 flex items-end justify-between pb-6 ${pad}`}>
          {!reduce && (
            <motion.span
              style={{ opacity: hint }}
              aria-hidden
              className="absolute bottom-7 left-1/2 -translate-x-1/2"
            >
              {/* Desktop/tablet: a slim mouse whose wheel dot scrolls down on a loop */}
              <span className="hidden h-9 w-[1.4rem] justify-center rounded-full border-[1.5px] border-white/45 pt-1.5 md:flex">
                <span className="block h-1.5 w-[3px] animate-[scrollWheel_2s_cubic-bezier(0.16,1,0.3,1)_infinite] rounded-full bg-white/85 motion-reduce:animate-none" />
              </span>
              {/* Phone: a mouse means nothing on touch, so a thin chevron in a ring */}
              <span className="grid h-9 w-9 place-items-center rounded-full border border-white/25 md:hidden">
                <svg
                  viewBox="0 0 16 16"
                  className="h-3.5 w-3.5 animate-[scrollCue_2.4s_cubic-bezier(0.16,1,0.3,1)_infinite] text-white/80 motion-reduce:animate-none"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3.5 6l4.5 4.5L12.5 6" />
                </svg>
              </span>
            </motion.span>
          )}
        </div>
      </motion.div>
    </section>
  );
}
