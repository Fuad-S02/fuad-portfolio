"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { useTheme } from "../theme";

// FS monogram paths (viewBox 0 0 321.81 633.04) — sampled into a dot grid.
const VIEW_W = 321.81;
const VIEW_H = 633.04;
const PATHS = [
  "m274.91,147.4l27.98-30.77L160.91,0,0,173.67c65.87,53.68,131.74,107.36,197.61,161.03,9.33-10.26,18.65-20.51,27.98-30.77-23.53-19.26-47.05-38.51-70.58-57.77,19.95-21.45,39.89-42.89,59.84-64.34l-32.21-26.46c-19.81,21.54-39.63,43.09-59.44,64.63-20.7-17.04-41.39-34.08-62.09-51.12,34.58-37.3,69.16-74.6,103.74-111.9l110.07,90.42Z",
  "m46.9,485.64l-27.98,30.77,141.98,116.64,160.91-173.67c-65.87-53.68-131.74-107.36-197.61-161.03-9.33,10.26-18.65,20.51-27.98,30.77,23.53,19.26,47.05,38.51,70.58,57.77-19.95,21.45-39.89,42.89-59.84,64.34l32.21,26.46c19.81-21.54,39.63-43.09,59.44-64.63,20.7,17.04,41.39,34.08,62.09,51.12-34.58,37.3-69.16,74.6-103.74,111.9l-110.07-90.42Z",
];

type Dot = {
  hx: number;
  hy: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  // Precomputed rest appearance (radial size/brightness falloff + colour).
  size: number;
  style: string;
  cr: number;
  cg: number;
  cb: number;
  ca: number;
};

// Tuning.
const DOTS_ACROSS = 108; // dots across the field — grid step scales with size,
// so the dot COUNT (and perf) stays bounded no matter how large the field gets.
const FALLOFF = 0.64; // radial reach (× side) where BACKGROUND dots fade out
const REPEL_RADIUS = 21; // tighter, cursor-sized
const REPEL_STRENGTH = 20; // a touch stronger push
const SPRING = 0.15;
const DAMPING = 0.84; // springy wiggle/overshoot before settling
const LIGHT_RADIUS = 58;
const PRESS_RADIUS = 50; // sustained "pressure" dimple reach
const PRESS_DEPTH = 7; // how far dots press outward (crater that wraps the cursor)
const GLOBAL_FACTOR = 0.05; // whole-object lean toward the cursor (membrane wrap)
const GLOBAL_MAX = 10; // cap (px) on the global lean
const INFLUENCE = Math.max(LIGHT_RADIUS, PRESS_RADIUS) + 34;

function inRoundRect(
  px: number,
  py: number,
  x: number,
  y: number,
  s: number,
  r: number
) {
  if (px < x || py < y || px > x + s || py > y + s) return false;
  const dx = Math.min(px - x, x + s - px);
  const dy = Math.min(py - y, y + s - py);
  if (dx > r || dy > r) return true;
  return (r - dx) ** 2 + (r - dy) ** 2 <= r * r;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function LogoDotField({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dark = theme === "dark";
    // Vertical colour gradient (cyan-white top → deep blue bottom) for the field.
    const top = dark ? [165, 215, 255] : [90, 150, 235];
    const bot = dark ? [44, 96, 220] : [40, 90, 210];
    const logoTop = dark ? [238, 247, 255] : [20, 30, 48];
    const logoBot = dark ? [150, 195, 255] : [30, 60, 130];
    const litC = [205, 235, 255];

    let dots: Dot[] = [];
    let w = 0;
    let h = 0;
    let raf = 0;
    let running = false;
    const pointer = { x: -9999, y: -9999, inside: false, energy: 0 };

    const buildDots = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      if (w < 2 || h < 2) {
        dots = [];
        return; // not laid out yet — wait for the ResizeObserver
      }
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const side = Math.min(h * 0.94, w * 0.82, 920);
      const gap = Math.max(4, side / DOTS_ACROSS); // spacing scales with size
      const bx = (w - side) / 2;
      const by = (h - side) / 2;
      const r = side * CORNER_R(side);
      const cx = bx + side / 2;
      const cy = by + side / 2;
      const R0 = side * FALLOFF;

      const logoH = side * 0.66;
      const logoW = logoH * (VIEW_W / VIEW_H);
      const off = document.createElement("canvas");
      off.width = Math.ceil(side);
      off.height = Math.ceil(side);
      const octx = off.getContext("2d");
      if (!octx) return;
      octx.translate((side - logoW) / 2, (side - logoH) / 2);
      octx.scale(logoH / VIEW_H, logoH / VIEW_H);
      octx.fillStyle = "#000";
      for (const d of PATHS) octx.fill(new Path2D(d));
      const img = octx.getImageData(0, 0, off.width, off.height).data;

      dots = [];
      for (let gy = gap / 2; gy < side; gy += gap) {
        for (let gx = gap / 2; gx < side; gx += gap) {
          const wx = bx + gx;
          const wy = by + gy;
          if (!inRoundRect(wx, wy, bx, by, side, r)) continue;
          const isLogo =
            img[(Math.floor(gy) * off.width + Math.floor(gx)) * 4 + 3] > 128;

          // Radial falloff: 1 at centre → 0 at the edge.
          const dist = Math.hypot(wx - cx, wy - cy);
          const rf = Math.max(0, 1 - dist / R0);
          const rf2 = rf * rf; // sharper centre bias

          const ty = Math.min(1, Math.max(0, (wy - by) / side));
          const src1 = isLogo ? logoTop : top;
          const src2 = isLogo ? logoBot : bot;
          const cr = Math.round(lerp(src1[0], src2[0], ty));
          const cg = Math.round(lerp(src1[1], src2[1], ty));
          const cb = Math.round(lerp(src1[2], src2[2], ty));

          // BACKGROUND dots: size + alpha fall off radially (dense bright centre
          // → small faint edges). LOGO dots stay large + bright across the WHOLE
          // monogram so the full shape reads evenly (only a gentle centre lift).
          const size = isLogo
            ? gap * 0.92 * (0.62 + 0.38 * rf)
            : gap * 0.78 * (0.26 + 0.74 * rf2) + 0.5;
          const alpha = isLogo
            ? Math.min(0.72 + 0.25 * rf, 1)
            : 0.44 * (0.28 + 0.72 * rf);

          dots.push({
            hx: wx,
            hy: wy,
            x: wx,
            y: wy,
            vx: 0,
            vy: 0,
            size,
            cr,
            cg,
            cb,
            ca: alpha,
            style: `rgba(${cr},${cg},${cb},${alpha.toFixed(3)})`,
          });
        }
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      let active = false;
      const interactive = !reduce && pointer.inside;
      pointer.energy *= 0.86;
      if (pointer.energy < 0.02) pointer.energy = 0;
      const push = REPEL_STRENGTH * pointer.energy;
      const inf2 = INFLUENCE * INFLUENCE;
      let cur = "";

      for (const d of dots) {
        const homed = d.x === d.hx && d.y === d.hy;
        let near = false;
        let lf = 0;
        let tx = d.hx; // spring target (home, unless pressed)
        let ty = d.hy;
        // Everything is gated by movement energy `m`: the object only deforms
        // WHILE the cursor moves. When it stops, `m` decays to 0 → targets fall
        // back to home → the object reassembles to its rest shape.
        const m = pointer.energy;
        if (interactive && m > 0.01) {
          // GLOBAL lean — the whole object wraps a little toward the cursor,
          // like pressing one connected membrane. Scaled by movement.
          const gx = pointer.x - d.hx;
          const gy = pointer.y - d.hy;
          const gd = Math.hypot(gx, gy) || 0.0001;
          const gmag = Math.min(gd * GLOBAL_FACTOR, GLOBAL_MAX) * m;
          tx += (gx / gd) * gmag;
          ty += (gy / gd) * gmag;

          const ddx = d.x - pointer.x;
          const ddy = d.y - pointer.y;
          const d2 = ddx * ddx + ddy * ddy;
          if (d2 < inf2) {
            near = true;
            const dist = Math.sqrt(d2) || 0.0001;
            if (dist < LIGHT_RADIUS) lf = (1 - dist / LIGHT_RADIUS) * m;
            // Movement kick — outward impulse on fast sweeps (the wiggle).
            if (push > 0.05 && dist < REPEL_RADIUS) {
              const f = (1 - dist / REPEL_RADIUS) ** 2 * push;
              d.vx += (ddx / dist) * f;
              d.vy += (ddy / dist) * f;
            }
            // Local PRESSURE dimple on top of the lean — a soft crater that wraps
            // the cursor (pushed outward from home), also scaled by movement.
            const hdx = d.hx - pointer.x;
            const hdy = d.hy - pointer.y;
            const hd = Math.hypot(hdx, hdy) || 0.0001;
            if (hd < PRESS_RADIUS) {
              const t = 1 - hd / PRESS_RADIUS;
              const off = PRESS_DEPTH * t * t * (3 - 2 * t) * m; // smoothstep
              tx += (hdx / hd) * off;
              ty += (hdy / hd) * off;
            }
          }
        }

        // Fast path: when not interacting, an at-home dot just stamps its cached
        // rest colour. (While interacting every dot leans, so all run physics.)
        if (!interactive && homed) {
          if (d.style !== cur) {
            ctx.fillStyle = d.style;
            cur = d.style;
          }
          ctx.beginPath();
          ctx.arc(d.x, d.y, d.size / 2, 0, 6.2832);
          ctx.fill();
          continue;
        }

        d.vx = (d.vx + (tx - d.x) * SPRING) * DAMPING;
        d.vy = (d.vy + (ty - d.y) * SPRING) * DAMPING;
        d.x += d.vx;
        d.y += d.vy;
        // Snap to the current target once slow. When the cursor is still the
        // target IS home (effects gated to 0), so dots settle home and the loop
        // halts; while moving the target shifts each frame so they keep chasing.
        if (
          Math.abs(d.x - tx) < 0.4 &&
          Math.abs(d.y - ty) < 0.4 &&
          Math.hypot(d.vx, d.vy) < 0.25
        ) {
          d.x = tx;
          d.y = ty;
          d.vx = d.vy = 0;
        } else {
          active = true;
        }

        const k = lf * 0.85;
        const cr = Math.round(d.cr + (litC[0] - d.cr) * k);
        const cg = Math.round(d.cg + (litC[1] - d.cg) * k);
        const cb = Math.round(d.cb + (litC[2] - d.cb) * k);
        const a = Math.min(d.ca + lf * 0.5, 1);
        const st = `rgba(${cr},${cg},${cb},${a.toFixed(3)})`;
        if (st !== cur) {
          ctx.fillStyle = st;
          cur = st;
        }
        const s = d.size + lf * 2.6;
        ctx.beginPath();
        ctx.arc(d.x, d.y, s / 2, 0, 6.2832);
        ctx.fill();
      }

      // Run while the cursor is moving (energy) or anything is still settling.
      // A still cursor lets energy decay → dots reassemble home → loop halts.
      if (active || pointer.energy > 0.02) {
        raf = requestAnimationFrame(draw);
      } else {
        running = false;
      }
    };

    const start = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(draw);
    };

    // Pointer events cover mouse, touch (drag), and pen — so it interacts on
    // phone/tablet too (movement-gated, so a touch-drag deforms it).
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const nx = e.clientX - rect.left;
      const ny = e.clientY - rect.top;
      if (pointer.inside) {
        const v = Math.hypot(nx - pointer.x, ny - pointer.y);
        pointer.energy = Math.min(1, pointer.energy + Math.min(v / 22, 1));
      }
      pointer.x = nx;
      pointer.y = ny;
      pointer.inside = true;
      start();
    };
    const onLeave = () => {
      pointer.inside = false;
      pointer.x = pointer.y = -9999;
      start();
    };
    // Safety net: if the pointer moves anywhere off the canvas, release — so a
    // missed leave can never leave the field stuck leaning (and the loop always
    // gets a chance to settle + halt).
    const onWinMove = (e: PointerEvent) => {
      if (!pointer.inside) return;
      const r = canvas.getBoundingClientRect();
      if (
        e.clientX < r.left ||
        e.clientX > r.right ||
        e.clientY < r.top ||
        e.clientY > r.bottom
      ) {
        onLeave();
      }
    };

    buildDots();
    draw();

    if (!reduce) {
      canvas.addEventListener("pointermove", onMove);
      canvas.addEventListener("pointerleave", onLeave);
      canvas.addEventListener("pointercancel", onLeave);
      window.addEventListener("pointermove", onWinMove);
    }

    const ro = new ResizeObserver(() => {
      buildDots();
      if (!running) draw();
    });
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("pointercancel", onLeave);
      window.removeEventListener("pointermove", onWinMove);
      ro.disconnect();
    };
  }, [theme, reduce]);

  // touch-action: pan-y → vertical swipes scroll the page (never trapped);
  // horizontal drags still reach the field to interact.
  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ touchAction: "pan-y" }}
      aria-hidden
    />
  );
}

// Rounded-square corner radius as a fraction of side.
function CORNER_R(_side: number) {
  return 0.16;
}
