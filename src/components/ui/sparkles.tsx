"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  r: number;
  baseAlpha: number;
  twPhase: number;
  twSpeed: number;
  vx: number;
  vy: number;
  color: string;
};

/**
 * Lightweight ambient "stardust" — drifting, twinkling dots on a canvas.
 * No dependencies. Subtle, slow, theme-tuned. Reduced-motion safe.
 */
export function Sparkles({
  colors,
  density = 70,
  className,
}: {
  colors?: string[];
  density?: number;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const palette = colors ?? ["#3b82f6", "#93c5fd", "#ffffff"];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let dpr = 1;
    let particles: Particle[] = [];
    let raf = 0;

    const seed = () => {
      const count = Math.round(
        density * Math.min(2.2, Math.max(0.4, (w * h) / (1280 * 800)))
      );
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.4 + Math.random() * 1.3,
        baseAlpha: 0.08 + Math.random() * 0.42,
        twPhase: Math.random() * Math.PI * 2,
        twSpeed: 0.4 + Math.random() * 1.1,
        vx: (Math.random() - 0.5) * 0.12,
        vy: (Math.random() - 0.5) * 0.12,
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
    const ro = new ResizeObserver(() => resize());
    ro.observe(canvas);

    const start = performance.now();
    const frame = () => {
      const t = (performance.now() - start) / 1000;
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -2) p.x = w + 2;
        else if (p.x > w + 2) p.x = -2;
        if (p.y < -2) p.y = h + 2;
        else if (p.y > h + 2) p.y = -2;

        const tw = 0.5 + 0.5 * Math.sin(t * p.twSpeed + p.twPhase);
        ctx.globalAlpha = p.baseAlpha * tw;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [density]);

  return <canvas ref={canvasRef} className={className} aria-hidden />;
}
