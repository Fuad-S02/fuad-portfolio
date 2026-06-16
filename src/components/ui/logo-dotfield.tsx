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
const GAP = 5; // grid step — denser (~7-8k dots in the field)
const FALLOFF = 0.64; // radial reach (× side) where BACKGROUND dots fade out
const REPEL_RADIUS = 26;
const REPEL_STRENGTH = 17;
const SPRING = 0.16;
const DAMPING = 0.8;
const LIGHT_RADIUS = 58;
const INFLUENCE = LIGHT_RADIUS + 34;

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

    const isTouch = window.matchMedia("(pointer: coarse)").matches;
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
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const side = Math.min(h * 0.86, w * 0.9, 470);
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
      for (let gy = GAP / 2; gy < side; gy += GAP) {
        for (let gx = GAP / 2; gx < side; gx += GAP) {
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
            ? GAP * 0.92 * (0.62 + 0.38 * rf)
            : GAP * 0.78 * (0.26 + 0.74 * rf2) + 0.5;
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
      const interactive = !reduce && !isTouch && pointer.inside;
      pointer.energy *= 0.86;
      if (pointer.energy < 0.02) pointer.energy = 0;
      const push = REPEL_STRENGTH * pointer.energy;
      const inf2 = INFLUENCE * INFLUENCE;
      let cur = "";

      for (const d of dots) {
        const homed = d.x === d.hx && d.y === d.hy;
        let near = false;
        let lf = 0;
        if (interactive) {
          const ddx = d.x - pointer.x;
          const ddy = d.y - pointer.y;
          const d2 = ddx * ddx + ddy * ddy;
          if (d2 < inf2) {
            near = true;
            const dist = Math.sqrt(d2) || 0.0001;
            if (push > 0.05 && dist < REPEL_RADIUS) {
              const f = (1 - dist / REPEL_RADIUS) ** 2 * push;
              d.vx += (ddx / dist) * f;
              d.vy += (ddy / dist) * f;
            }
            if (dist < LIGHT_RADIUS) lf = 1 - dist / LIGHT_RADIUS;
          }
        }

        // Fast path: untouched dot at home → stamp its cached rest colour.
        if (!near && homed) {
          if (d.style !== cur) {
            ctx.fillStyle = d.style;
            cur = d.style;
          }
          ctx.beginPath();
          ctx.arc(d.x, d.y, d.size / 2, 0, 6.2832);
          ctx.fill();
          continue;
        }

        d.vx = (d.vx + (d.hx - d.x) * SPRING) * DAMPING;
        d.vy = (d.vy + (d.hy - d.y) * SPRING) * DAMPING;
        d.x += d.vx;
        d.y += d.vy;
        if (
          !near &&
          Math.abs(d.x - d.hx) < 0.3 &&
          Math.abs(d.y - d.hy) < 0.3 &&
          Math.hypot(d.vx, d.vy) < 0.3
        ) {
          d.x = d.hx;
          d.y = d.hy;
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

    const onMove = (e: MouseEvent) => {
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

    buildDots();
    draw();

    if (!reduce && !isTouch) {
      canvas.addEventListener("mousemove", onMove);
      canvas.addEventListener("mouseleave", onLeave);
    }

    const ro = new ResizeObserver(() => {
      buildDots();
      if (!running) draw();
    });
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseleave", onLeave);
      ro.disconnect();
    };
  }, [theme, reduce]);

  return <canvas ref={canvasRef} className={className} aria-hidden />;
}

// Rounded-square corner radius as a fraction of side.
function CORNER_R(_side: number) {
  return 0.16;
}
