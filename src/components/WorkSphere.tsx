"use client";

/**
 * WorkSphere — "Latest work" as a sphere of cards that turns with the scroll.
 *
 * Geometry/projection adapted from the "Interactive Card Sphere" component
 * (Cue Foundations, cue200), rewritten for this site:
 *  - scroll-driven (pinned section) instead of wheel/drag capture, so Lenis
 *    smooth scroll and touch scrolling keep working;
 *  - 8 feature cards ride an equatorial band; each scroll step turns the
 *    sphere and zooms the next one to the front, where its loop plays;
 *  - the remaining cards are stills of other work + FS brand tiles.
 * All motion is written straight to the DOM in one rAF loop (no re-renders),
 * and the loop only runs while the section is on screen.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { onWorkLinkClick } from "@/lib/work-sheet";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "motion/react";
import { useLenis } from "lenis/react";
import { getProject } from "@/lib/projects";
import { WorkOverlay, type Rect } from "./WorkOverlay";
import { EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

/* ---------------- content ---------------- */

const MT = "/work/maktabitech";

type Feature = { slug: string; loop: string; poster: string; ratio: number };

const FEATURES: Feature[] = [
  { slug: "biggest-boardroom", loop: `${MT}/biggest-boardroom-loop.mp4`, poster: `${MT}/biggest-boardroom.jpg`, ratio: 9 / 16 },
  { slug: "tesla-trend", loop: `${MT}/tesla-trend-loop.mp4`, poster: `${MT}/tesla-trend.jpg`, ratio: 4 / 5 },
  { slug: "smart-workplace", loop: `${MT}/smart-workplace-ai-loop.mp4`, poster: `${MT}/smart-workplace-ai.jpg`, ratio: 16 / 9 },
  { slug: "smartphone-talk-back", loop: `${MT}/smartphone-talk-back-loop.mp4`, poster: `${MT}/smartphone-talk-back.jpg`, ratio: 16 / 9 },
  { slug: "command-center", loop: `${MT}/command-center-motion-loop.mp4`, poster: `${MT}/command-center-motion.jpg`, ratio: 16 / 9 },
  { slug: "smart-parking", loop: `${MT}/smart-parking.mp4`, poster: `${MT}/smart-parking.jpg`, ratio: 4 / 5 },
  { slug: "eid-mascot", loop: `${MT}/eid-al-fitr.mp4`, poster: `${MT}/eid-al-fitr.jpg`, ratio: 4 / 5 },
  { slug: "triangle", loop: "/work/triangle.mp4", poster: "/work/triangle.jpg", ratio: 16 / 9 },
];

/** Stills for the small cards (other work). */
const STILLS = [
  "/work/office-assembling.jpg",
  "/work/retractable-screen.jpg",
  "/work/audio-zoning.jpg",
  "/work/pricypal.jpg",
  "/work/canvas-home.jpg",
  "/work/nook/hero.jpg",
  "/work/hydralyte/hero.jpg",
  "/work/toyota-sequoia/hero.jpg",
  "/work/personal-identity/hero.jpg",
  ...FEATURES.map((f) => f.poster),
];

const WORDS = ["Design × Code", "Brand", "Motion", "UI / UX", "AI Creative", "Amman · Dubai", "Since 2021", "Craft first"];

/** Scroll length per feature card. */
const STEP_SVH = 45;

/* ---------------- maths (from the Cue sphere) ---------------- */

type Vec = { x: number; y: number; z: number };
type Quat = [number, number, number, number];
const V = (x: number, y: number, z: number): Vec => ({ x, y, z });
const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => t * t * (3 - 2 * t);
const norm = (a: Vec) => {
  const n = Math.hypot(a.x, a.y, a.z) || 1;
  return V(a.x / n, a.y / n, a.z / n);
};
const dot = (a: Vec, b: Vec) => a.x * b.x + a.y * b.y + a.z * b.z;
const qmul = (a: Quat, b: Quat): Quat => [
  a[0] * b[0] - a[1] * b[1] - a[2] * b[2] - a[3] * b[3],
  a[0] * b[1] + a[1] * b[0] + a[2] * b[3] - a[3] * b[2],
  a[0] * b[2] - a[1] * b[3] + a[2] * b[0] + a[3] * b[1],
  a[0] * b[3] + a[1] * b[2] - a[2] * b[1] + a[3] * b[0],
];
const qaxis = (axis: Vec, ang: number): Quat => {
  const s = Math.sin(ang / 2), a = norm(axis);
  return [Math.cos(ang / 2), a.x * s, a.y * s, a.z * s];
};
const qrot = (q: Quat, v: Vec): Vec => {
  const [w, x, y, z] = q;
  const ix = w * v.x + y * v.z - z * v.y, iy = w * v.y + z * v.x - x * v.z;
  const iz = w * v.z + x * v.y - y * v.x, iw = -x * v.x - y * v.y - z * v.z;
  return V(
    ix * w + iw * -x + iy * -z - iz * -y,
    iy * w + iw * -y + iz * -x - ix * -z,
    iz * w + iw * -z + ix * -y - iy * -x
  );
};
const fib = (n: number, i: number, off = 0) => {
  const y = 1 - (2 * (i + 0.5)) / n, r = Math.sqrt(1 - y * y);
  const t = Math.PI * (3 - Math.sqrt(5)) * i + off;
  return V(Math.cos(t) * r, y, Math.sin(t) * r);
};
const AX_X = V(1, 0, 0), AX_Y = V(0, 1, 0);
/** Sphere orientation from yaw (about Y) then pitch (about X). */
const orient = (yaw: number, pitch: number) => qmul(qaxis(AX_X, pitch), qaxis(AX_Y, yaw));

const P = 2; // camera distance / sphere radius

/* ---------------- card field ---------------- */

type TileKind = "still" | "ink" | "dots" | "hud";
type Card = {
  p: Vec;
  w: number;
  h: number;
  rz: number;
  feature?: number; // index into FEATURES
  kind?: TileKind;
  src?: string;
  word?: string;
};

const N = FEATURES.length;
const lon = (k: number) => (k * 2 * Math.PI) / N;
const lat = (k: number) => (k % 2 ? 0.2 : -0.16);

function buildCards(): Card[] {
  let seed = 11;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

  // Feature cards: equal area, own aspect ratio.
  const AREA = 420 * 525;
  const heroes: Card[] = FEATURES.map((f, k) => {
    const th = lon(k), ph = lat(k);
    const w = Math.sqrt(AREA * f.ratio);
    return {
      p: V(Math.sin(th) * Math.cos(ph), Math.sin(ph), Math.cos(th) * Math.cos(ph)),
      w,
      h: w / f.ratio,
      rz: (k % 2 ? 1 : -1) * (0.6 + rnd()),
      feature: k,
    };
  });

  const KINDS: TileKind[] = ["still", "still", "still", "still", "ink", "dots", "hud"];
  const small: Card[] = [];
  const NS = 40;
  let s = 0, wd = 0;
  for (let i = 0; i < NS; i++) {
    const p = fib(NS, i, 0.37);
    p.x += (rnd() - 0.5) * 0.08;
    p.y += (rnd() - 0.5) * 0.08;
    p.z += (rnd() - 0.5) * 0.08;
    const q = norm(p);
    if (heroes.some((h) => dot(h.p, q) > 0.86)) continue; // air around heroes
    const kind = KINDS[Math.floor(rnd() * KINDS.length)];
    const w = 120 + rnd() * 110;
    const h = kind === "still" ? w * (0.75 + rnd() * 0.55) : w * (1.0 + rnd() * 0.3);
    const c: Card = { p: q, w, h, rz: (rnd() - 0.5) * 7, kind };
    if (kind === "still") c.src = STILLS[s++ % STILLS.length];
    if (kind === "ink" || kind === "hud") c.word = WORDS[wd++ % WORDS.length];
    small.push(c);
  }
  return [...heroes, ...small];
}

const CARDS = buildCards();
const FEATURE_DATA = FEATURES.map((f) => ({ ...f, project: getProject(f.slug) }));

/* ---------------- component ---------------- */

export function WorkSphere() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const els = useRef<(HTMLDivElement | null)[]>([]);
  const target = useRef(0); // scroll position in "card units" 0..N-1
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  const lenis = useLenis();
  /** Project opened in place (zoomed to full screen). */
  const [open, setOpen] = useState<{ k: number; from: Rect } | null>(null);

  const cards = CARDS;
  const features = FEATURE_DATA;

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    target.current = clamp(v) * (N - 1);
  });

  // Header ink over the white sheet is handled by <LightSheet> (page.tsx).

  useEffect(() => {
    const stage = stageRef.current!;
    let W = 0, H = 0, u = 1, F = 1, Ax = 1, Ay = 1;
    const size = () => {
      const r = stage.getBoundingClientRect();
      W = r.width;
      H = r.height;
      u = Math.min(W, H * 0.8) / 720;
      F = 502 * u;
      Ax = Math.max(1, (W / 2 / (F * 0.577)) * 0.97);
      Ay = Math.max(1, (H / 2 / (F * 0.577)) * 0.97);
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(stage);

    // Pointer parallax (mouse only — touch just scrolls).
    let mx = 0, my = 0, sx = 0, sy = 0;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || window.innerWidth < 768) {
        mx = my = 0;
        return;
      }
      mx = (e.clientX / window.innerWidth) * 2 - 1;
      my = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    let f = target.current, shown = -1, raf = 0, last = performance.now(), visible = false;
    const t0 = performance.now();

    const render = (dt: number) => {
      // Ease toward the scroll target, then add a dwell so each card rests.
      f = lerp(f, target.current, 1 - Math.pow(0.0025, dt));
      const i = Math.min(N - 2, Math.floor(f));
      const t = f - i;
      const e = smooth(clamp((t - 0.2) / 0.6));
      const pos = i + e; // 0..N-1, held near integers

      const idx = Math.round(pos);
      if (idx !== shown) {
        shown = idx;
        setActive(idx);
      }

      sx = lerp(sx, mx, 1 - Math.pow(0.02, dt));
      sy = lerp(sy, my, 1 - Math.pow(0.02, dt));
      const drift = reduce ? 0 : Math.sin((performance.now() - t0) / 2600) * 0.025;

      const k0 = Math.floor(pos), k1 = Math.min(N - 1, k0 + 1), kt = pos - k0;
      const yaw = -lerp(lon(k0), lon(k1), kt) + sx * 0.12 + drift;
      const pitch = lerp(lat(k0), lat(k1), kt) + sy * 0.08;
      const rot = orient(yaw, pitch);

      const cx = W / 2, cy = H * (W < 768 ? 0.43 : 0.47);
      for (let c = 0; c < cards.length; c++) {
        const o = cards[c], el = els.current[c];
        if (!el) continue;
        const q = qrot(rot, o.p), d = P - q.z, s = 1 / d;
        const px = cx + q.x * F * s * Ax, py = cy - q.y * F * s * Ay;

        let hf = 0.62, front = 0;
        if (o.feature !== undefined) {
          front = smooth(clamp((q.z - 0.8) / 0.2));
          const maxS = Math.min(1.15, (0.84 * W) / (o.w * u), (0.6 * H) / (o.h * u));
          hf = lerp(0.55, maxS, front);
        }
        const sc = s * u * hf;
        const ew = o.w * sc, eh = o.h * sc;
        if (px + ew < -40 || px - ew > W + 40 || py + eh < -40 || py - eh > H + 40) {
          if (el.style.display !== "none") el.style.display = "none";
          continue;
        }
        if (el.style.display === "none") el.style.display = "";
        const ry = Math.atan2(q.x, Math.max(0.2, q.z)) * 57.3 * 0.35;
        const rx = Math.atan2(q.y, Math.max(0.2, q.z)) * 57.3 * 0.35;
        el.style.transform = `translate(${px}px,${py}px) scale(${sc}) perspective(${o.w * 2.6}px) rotateX(${rx}deg) rotateY(${ry}deg) rotate(${o.rz}deg) translate(${-o.w / 2}px,${-o.h / 2}px)`;
        el.style.zIndex = String(Math.round((3 - d) * 1000));
        // Fade toward the white page with depth.
        const depth = lerp(0.15, 1, (q.z + 1) / 2);
        let op = clamp((q.z + 0.85) / 0.35) * depth;
        if (o.feature === undefined) {
          // Clear zone: background cards fade out around the focal card so
          // the work at the front reads on its own.
          const r = Math.hypot((px - cx) / (W * 0.5), (py - cy) / (H * 0.5));
          op *= 0.8 * smooth(clamp((r - 0.3) / 0.45));
        } else {
          op *= lerp(0.7, 1, front);
        }
        el.style.opacity = String(op);
      }
    };

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (visible && !document.hidden) render(dt);
    };
    const io = new IntersectionObserver(([en]) => {
      visible = en.isIntersecting;
      last = performance.now();
    });
    io.observe(stage);
    render(0);
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
    };
  }, [cards, reduce]);

  /** Scroll so feature k sits at the front. */
  const goTo = (k: number) => {
    const sec = sectionRef.current;
    if (!sec) return;
    const top = sec.getBoundingClientRect().top + window.scrollY;
    const range = sec.offsetHeight - window.innerHeight;
    const y = top + (k / (N - 1)) * range;
    if (lenis) lenis.scrollTo(y, { duration: 1.2 });
    else window.scrollTo({ top: y, behavior: "smooth" });
  };
  const skip = () => {
    const sec = sectionRef.current;
    if (!sec) return;
    const y = sec.getBoundingClientRect().bottom + window.scrollY - 1;
    if (lenis) lenis.scrollTo(y, { duration: 1.4 });
    else window.scrollTo({ top: y, behavior: "smooth" });
  };

  /** Feature cards are the first N cards, so card index === feature index. */
  const cardRect = (k: number): Rect | null => {
    const el = els.current[k];
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { top: r.top, left: r.left, width: r.width, height: r.height };
  };
  const openProject = (k: number) => {
    if (open) return;
    const from = cardRect(k);
    if (from) setOpen({ k, from });
  };
  const closeProject = useCallback(() => setOpen(null), []);

  const cur = features[active] ?? features[0];
  const p = cur.project;

  return (
    <section
      ref={sectionRef}
      id="work"
      aria-label="Latest work"
      className="relative text-[#0a0b0d]"
      style={{ height: `calc(100svh + ${N * STEP_SVH}svh)` }}
    >
      <div className="sticky top-0 h-svh overflow-hidden rounded-t-[2rem] sm:rounded-t-[3rem]">
        {/* soft paper texture so white isn't flat */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(rgba(10,11,13,0.07)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]"
        />

        {/* sphere */}
        <div ref={stageRef} className="absolute inset-0 z-0 select-none">
          {cards.map((c, i) => {
            const isFeature = c.feature !== undefined;
            const f = isFeature ? features[c.feature!] : null;
            const isActive = isFeature && c.feature === active;
            return (
              <div
                key={i}
                ref={(el) => {
                  els.current[i] = el;
                }}
                className={cn(
                  "absolute left-0 top-0 origin-top-left overflow-hidden will-change-transform [backface-visibility:hidden]",
                  isFeature
                    ? "rounded-[22px] bg-[#e9ebef] shadow-[0_40px_80px_-30px_rgba(12,22,48,0.45)] ring-1 ring-black/5"
                    : "rounded-[14px] ring-1 ring-black/[0.06]",
                  !isFeature && tileBg(c.kind!),
                  isFeature && open?.k === c.feature && "invisible"
                )}
                style={{ width: c.w, height: c.h, display: "none" }}
              >
                {isFeature && f ? (
                  <button
                    type="button"
                    tabIndex={-1}
                    aria-hidden
                    onClick={() =>
                      isActive ? openProject(c.feature!) : goTo(c.feature!)
                    }
                    className="absolute inset-0 cursor-pointer"
                  >
                    <Image
                      src={f.poster}
                      alt=""
                      fill
                      sizes="(max-width: 768px) 85vw, 720px"
                      className="object-cover"
                    />
                    {isActive && (
                      <video
                        key={f.loop}
                        src={f.loop}
                        poster={f.poster}
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="auto"
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    )}
                  </button>
                ) : (
                  <Tile card={c} />
                )}
              </div>
            );
          })}
        </div>

        {/* white scrims so the copy stays readable over passing cards */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-[5] h-56 bg-gradient-to-b from-white via-white/80 to-transparent" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-64 bg-gradient-to-t from-white via-white/80 to-transparent" />

        {/* top bar */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between px-6 pt-24 sm:px-10 sm:pt-28 lg:px-16 lg:pt-24">
          <div>
            <p className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-[#5b616e]">
              Latest work — 2026
            </p>
            <h2 className="mt-2 font-display text-[clamp(1.6rem,3.2vw,2.6rem)] font-extrabold lg:text-[1.9rem] uppercase leading-[0.95] tracking-[-0.03em]">
              Selected <span className="text-gradient">work</span>
            </h2>
          </div>
          <div className="hidden items-center gap-1.5 pt-1 sm:flex" aria-hidden>
            {features.map((_, k) => (
              <span
                key={k}
                className={cn(
                  "h-1 rounded-full transition-all duration-500",
                  k === active ? "w-7 bg-[#2563eb]" : "w-2.5 bg-black/15"
                )}
              />
            ))}
          </div>
        </div>

        {/* caption for the card at the front */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-end [&_a]:pointer-events-auto [&_button]:pointer-events-auto justify-between gap-6 px-6 pb-8 sm:px-10 sm:pb-10 lg:px-16">
          <div className="relative min-h-[7rem] max-w-md flex-1 sm:min-h-[8rem]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.45, ease: EASE }}
                className="absolute bottom-0 left-0 right-0"
              >
                <h3 className="font-display text-[clamp(1.5rem,3vw,2.4rem)] font-bold leading-[1.02] tracking-tight">
                  {p?.title}
                </h3>
                <p className="mt-2 text-sm text-[#5b616e]">{p?.discipline}</p>
                <button
                  type="button"
                  onClick={() => openProject(active)}
                  className="group mt-4 inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#0a0b0d] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2563eb]"
                >
                  View project
                  <span className="transition-transform group-hover:translate-x-0.5">→</span>
                </button>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="hidden flex-col items-end gap-2 font-mono text-[0.68rem] uppercase tracking-[0.2em] text-[#5b616e] sm:flex">
            <Link href="/work" onClick={onWorkLinkClick} className="transition-colors hover:text-[#2563eb]">
              Work →
            </Link>
            <button
              type="button"
              onClick={skip}
              className="cursor-pointer transition-colors hover:text-[#2563eb]"
            >
              Skip ↓
            </button>
          </div>
        </div>
      </div>

      {open && features[open.k].project && (
        <WorkOverlay
          key={open.k}
          project={features[open.k].project!}
          poster={features[open.k].poster}
          ratio={features[open.k].ratio}
          from={open.from}
          getReturnRect={() => cardRect(open.k)}
          onClosed={closeProject}
        />
      )}
    </section>
  );
}

/* ---------------- small tiles ---------------- */

function tileBg(kind: TileKind) {
  switch (kind) {
    case "ink":
      return "bg-[#0b0d12]";
    case "dots":
      return "bg-[#eef1f6]";
    case "hud":
      return "bg-white";
    default:
      return "bg-[#e9ebef]";
  }
}

function Tile({ card }: { card: Card }) {
  switch (card.kind) {
    case "still":
      return <Image src={card.src!} alt="" fill sizes="240px" className="object-cover" />;
    case "ink":
      return (
        <div className="flex h-full w-full items-end p-[10%]">
          <span className="font-display text-[22px] font-bold leading-[1.05] tracking-tight text-white">
            {card.word}
          </span>
        </div>
      );
    case "dots":
      return (
        <div className="h-full w-full [background-image:radial-gradient(#2563eb_2.2px,transparent_2.6px)] [background-size:18px_18px] opacity-80" />
      );
    case "hud":
      // Figma-style selection box — the designer-who-codes signature.
      return (
        <div className="relative grid h-full w-full place-items-center">
          <div className="relative border-[1.5px] border-[#2563eb] px-3 py-2">
            <span className="font-display text-[17px] font-semibold tracking-tight">
              {card.word}
            </span>
            {["-left-1 -top-1", "-right-1 -top-1", "-left-1 -bottom-1", "-right-1 -bottom-1"].map((pos) => (
              <span
                key={pos}
                className={cn("absolute h-2 w-2 border-[1.5px] border-[#2563eb] bg-white", pos)}
              />
            ))}
          </div>
          <span className="absolute left-[10%] top-[10%] rounded-sm bg-[#2563eb] px-1 py-0.5 font-mono text-[9px] text-white">
            {Math.round(card.w)} × {Math.round(card.h)}
          </span>
        </div>
      );
    default:
      return null;
  }
}
