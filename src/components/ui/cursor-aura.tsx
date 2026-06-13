"use client";

import { useEffect, useRef } from "react";

type Star = {
  x: number; // fixed position (CSS px, viewport-relative)
  y: number;
  r: number;
  baseAlpha: number;
  twPhase: number;
  twSpeed: number;
  color: string;
};

/**
 * A STATIC starfield that is invisible until the cursor light passes over it —
 * like a flashlight revealing fixed stars in the dark. The stars never move with
 * the cursor; only the soft glow follows. Single 2D canvas; renders only while
 * the cursor moves and halts when idle (smooth, near-zero idle cost).
 */
export function CursorAura({
  glowRgb = "96,165,250",
  sparkColors,
  density = 115,
  revealRadius = 165,
  additive = true,
  className,
}: {
  glowRgb?: string;
  sparkColors?: string[];
  density?: number;
  revealRadius?: number;
  additive?: boolean;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const palette = sparkColors ?? ["#dbeafe", "#93c5fd", "#ffffff"];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if ("ontouchstart" in window && !window.matchMedia("(pointer: fine)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let dpr = 1;
    let stars: Star[] = [];

    const seed = () => {
      const count = Math.round(
        density * Math.min(2.4, Math.max(0.4, (w * h) / (1280 * 800)))
      );
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.6 + Math.random() * 1.7,
        baseAlpha: 0.5 + Math.random() * 0.6,
        twPhase: Math.random() * Math.PI * 2,
        twSpeed: 0.8 + Math.random() * 2.0,
        color: palette[(Math.random() * palette.length) | 0],
      }));
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = Math.max(1, Math.floor(rect.width));
      h = Math.max(1, Math.floor(rect.height));
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let tx = w / 2;
    let ty = h / 2;
    let x = tx;
    let y = ty;
    let px = x; // previous frame position → velocity
    let py = y;
    let sp = 0; // smoothed speed
    let dirX = 1; // smoothed movement direction (unit-ish)
    let dirY = 0;
    const trail: Array<[number, number]> = [];
    const TRAIL = 20;
    let auraOp = 0;
    let active = false;
    let lastMove = performance.now();
    let running = false;
    let raf = 0;
    const start = performance.now();
    const idleDelay = 550;
    const R = revealRadius;
    const R2 = R * R;

    const frame = () => {
      const now = performance.now();
      const t = (now - start) / 1000;

      if (active && now - lastMove > idleDelay) active = false;
      auraOp += ((active ? 1 : 0) - auraOp) * 0.08;
      x += (tx - x) * 0.18;
      y += (ty - y) * 0.18;
      trail.push([x, y]);
      if (trail.length > TRAIL) trail.shift();

      // velocity → directional "comet" stretch of the glow (circle at rest)
      const vx = x - px;
      const vy = y - py;
      px = x;
      py = y;
      const speed = Math.hypot(vx, vy);
      sp += (speed - sp) * 0.25;
      if (speed > 0.4) {
        const nx = vx / speed;
        const ny = vy / speed;
        dirX += (nx - dirX) * 0.3;
        dirY += (ny - dirY) * 0.3;
      }
      const stretch = 1 + Math.min(sp * 0.05, 0.7); // subtle, caps ~1.7×
      const ang = Math.atan2(dirY, dirX);

      ctx.clearRect(0, 0, w, h);
      if (auraOp < 0.01 && !active) {
        running = false;
        raf = 0;
        return; // halt — zero cost while idle
      }

      ctx.globalCompositeOperation = additive ? "lighter" : "source-over";

      // soft ghost glow: a short smoky trail along recent positions, each blob
      // stretched along the movement direction so it streaks like a comet while
      // moving and relaxes to a circle at rest. (toned down)
      for (let i = 0; i < trail.length; i++) {
        const [gx, gy] = trail[i];
        const rec = (i + 1) / trail.length; // 0 = oldest (tail) → 1 = head
        // bright, large head fading to a small faint tail → comet
        const gr = 26 + rec * 92;
        const ga = 0.05 * Math.pow(rec, 1.5) * auraOp * (additive ? 1 : 1.5);
        ctx.save();
        ctx.translate(gx, gy);
        ctx.rotate(ang);
        ctx.scale(stretch, 1 / Math.sqrt(stretch)); // elongate along motion
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, gr);
        g.addColorStop(0, `rgba(${glowRgb},${ga})`);
        g.addColorStop(1, `rgba(${glowRgb},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(0, 0, gr, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // reveal the fixed stars near the cursor (they do NOT move)
      for (const s of stars) {
        const dx = s.x - x;
        const dy = s.y - y;
        const d2 = dx * dx + dy * dy;
        if (d2 > R2) continue;
        const fall = 1 - Math.sqrt(d2) / R; // 1 at center → 0 at edge
        const tw = 0.4 + 0.6 * Math.sin(t * s.twSpeed + s.twPhase);
        ctx.globalAlpha = Math.max(0, s.baseAlpha * tw * fall * fall * auraOp);
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
      raf = requestAnimationFrame(frame);
    };

    const ensureLoop = () => {
      if (!running) {
        running = true;
        raf = requestAnimationFrame(frame);
      }
    };
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      tx = e.clientX - rect.left;
      ty = e.clientY - rect.top;
      active = true;
      lastMove = performance.now();
      ensureLoop();
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [glowRgb, density, revealRadius, additive]);

  return <canvas ref={canvasRef} className={className} aria-hidden />;
}
