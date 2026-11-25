"use client";

import { useEffect, useRef } from "react";
import type { MotionValue } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * The FS monogram as a 3D object, driven by scroll.
 *
 * The two halves of the logo (top "F" stroke, bottom "S" stroke) are extruded
 * from the same SVG paths as <Logo />. As `progress` goes 0 → 1 the mark turns
 * once, splits apart, and reassembles. A 2D "design tool" HUD (selection
 * boxes, handles, a redline measurement) tracks the pieces on top — the
 * designer-who-codes signature.
 *
 * Perf guardrails: three.js is loaded lazily, pixel ratio is capped, and the
 * render loop only runs while the canvas is on screen.
 */

const VB_W = 321.81;
const VB_H = 633.04;
// Straight edges written as straight lines (the original export used
// collinear cubic curves, which the extruder sliced into wobbly bevel facets).
const PATHS = [
  // Top piece
  "m274.91,147.4l27.98-30.77L160.91,0,0,173.67l197.61,161.03,27.98-30.77,-70.58-57.77,59.84-64.34l-32.21-26.46l-59.44,64.63,-62.09-51.12,103.74-111.9l110.07,90.42Z",
  // Bottom piece
  "m46.9,485.64l-27.98,30.77,141.98,116.64,160.91-173.67l-197.61-161.03,-27.98,30.77,70.58,57.77,-59.84,64.34l32.21,26.46l59.44-64.63,62.09,51.12,-103.74,111.9l-110.07-90.42Z",
];
const LABELS = ["F", "S"];

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ease = (t: number) => t * t * (3 - 2 * t); // smoothstep
/** 0 → 1 as p moves from a to b, eased. */
const seg = (p: number, a: number, b: number) => ease(clamp01((p - a) / (b - a)));

/** A piece's on-screen box (px, relative to the component). */
export type PieceRect = { x0: number; y0: number; x1: number; y1: number };

type Props = {
  progress: MotionValue<number>;
  /** Called every frame with the screen boxes of the [top, bottom] pieces. */
  onAnchors?: (rects: PieceRect[]) => void;
  className?: string;
  /** Hold the mark front-facing: no pointer tilt, no idle sway (straight edges). */
  steady?: boolean;
  /**
   * Optional 0–1 override for how detached the two halves are (1 = apart,
   * 0 = joined), independent of `progress`. The HUD boxes follow it.
   */
  split?: MotionValue<number>;
  /** Render a single static frame (reduced motion). */
  still?: boolean;
  /** Called if WebGL is unavailable so the parent can show a 2D fallback. */
  onFail?: () => void;
};

export function FSMonogram3D({
  progress,
  className,
  still = false,
  steady = false,
  split: splitOverride,
  onFail,
  onAnchors,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const hudRef = useRef<HTMLCanvasElement>(null);
  const anchorsRef = useRef(onAnchors);
  useEffect(() => {
    anchorsRef.current = onAnchors;
  }, [onAnchors]);

  useEffect(() => {
    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const THREE = await import("three");
      const { SVGLoader } = await import("three/addons/loaders/SVGLoader.js");
      const { RoomEnvironment } = await import(
        "three/addons/environments/RoomEnvironment.js"
      );
      const wrap = wrapRef.current;
      const hud = hudRef.current;
      if (disposed || !wrap || !hud) return;

      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try {
        renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        });
      } catch {
        onFail?.();
        return;
      }
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      renderer.setPixelRatio(dpr);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      renderer.domElement.className = "absolute inset-0 h-full w-full";
      wrap.prepend(renderer.domElement);

      const scene = new THREE.Scene();
      const pmrem = new THREE.PMREMGenerator(renderer);
      const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      scene.environment = envTex;
      scene.environmentIntensity = 0.55;

      const FOV = 30;
      const camera = new THREE.PerspectiveCamera(FOV, 1, 1, 6000);
      const CAM_Z = 1500;
      camera.position.set(0, 0, CAM_Z);

      const key = new THREE.DirectionalLight(0xffffff, 1.6);
      key.position.set(500, 700, 900);
      const rim = new THREE.DirectionalLight(0x7fb0ff, 2.4);
      rim.position.set(-700, -300, -600);
      scene.add(key, rim, new THREE.AmbientLight(0x1d4ed8, 0.35));

      // Face = bright signature blue, sides = deeper blue for definition.
      const faceMat = new THREE.MeshPhysicalMaterial({
        color: 0x2563eb,
        metalness: 0.25,
        roughness: 0.3,
        clearcoat: 1,
        clearcoatRoughness: 0.12,
      });
      const sideMat = new THREE.MeshPhysicalMaterial({
        color: 0x1d4ed8,
        metalness: 0.3,
        roughness: 0.32,
        clearcoat: 0.6,
      });

      const loader = new SVGLoader();
      const logo = new THREE.Group();
      scene.add(logo);

      type Piece = {
        group: InstanceType<typeof THREE.Group>;
        base: InstanceType<typeof THREE.Vector3>;
        box: InstanceType<typeof THREE.Box3>;
      };
      const pieces: Piece[] = [];
      const geometries: InstanceType<typeof THREE.BufferGeometry>[] = [];
      const DEPTH = 64;

      for (const d of PATHS) {
        const data = loader.parse(
          `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VB_W} ${VB_H}"><path d="${d}"/></svg>`
        );
        const shapes = data.paths.flatMap((p) => SVGLoader.createShapes(p));
        const geo = new THREE.ExtrudeGeometry(shapes, {
          depth: DEPTH,
          bevelEnabled: true,
          bevelThickness: 5,
          bevelSize: 3.5,
          bevelSegments: 4,
          curveSegments: 10,
        });
        // Center on the whole logo, then re-center on this piece so it can
        // rotate about its own middle.
        geo.translate(-VB_W / 2, -VB_H / 2, -DEPTH / 2);
        geo.computeBoundingBox();
        const c = new THREE.Vector3();
        geo.boundingBox!.getCenter(c);
        geo.translate(-c.x, -c.y, -c.z);
        geo.computeBoundingBox();
        geometries.push(geo);

        const mesh = new THREE.Mesh(geo, [faceMat, sideMat]);
        mesh.scale.y = -1; // SVG y points down; three handles the mirrored winding.
        const group = new THREE.Group();
        const base = new THREE.Vector3(c.x, -c.y, 0);
        group.position.copy(base);
        group.add(mesh);
        logo.add(group);
        pieces.push({ group, base, box: geo.boundingBox!.clone() });
      }

      // ---- Sizing --------------------------------------------------------
      let W = 1;
      let H = 1;
      let visH = 1; // world units visible vertically at z=0 for CAM_Z
      let narrow = false;
      const resize = () => {
        const r = wrap.getBoundingClientRect();
        W = Math.max(1, r.width);
        H = Math.max(1, r.height);
        narrow = W / H < 0.85;
        renderer.setSize(W, H, false);
        camera.aspect = W / H;
        camera.updateProjectionMatrix();
        visH = 2 * CAM_Z * Math.tan((FOV * Math.PI) / 360);
        hud.width = Math.round(W * dpr);
        hud.height = Math.round(H * dpr);
      };
      resize();
      const ro = new ResizeObserver(() => {
        resize();
        if (still) frame(performance.now());
      });
      ro.observe(wrap);

      // ---- Pointer tilt ----------------------------------------------------
      const tilt = { x: 0, y: 0, tx: 0, ty: 0 };
      const onMove = (e: PointerEvent) => {
        if (steady || e.pointerType !== "mouse") return;
        tilt.tx = (e.clientX / window.innerWidth - 0.5) * 0.35;
        tilt.ty = (e.clientY / window.innerHeight - 0.5) * 0.25;
      };
      if (!still) window.addEventListener("pointermove", onMove, { passive: true });

      // ---- HUD ---------------------------------------------------------------
      const ctx = hud.getContext("2d")!;
      const v3 = new THREE.Vector3();
      const corners = Array.from({ length: 8 }, () => new THREE.Vector3());
      const toScreen = (v: InstanceType<typeof THREE.Vector3>) => {
        v.project(camera);
        return [(v.x * 0.5 + 0.5) * W, (-v.y * 0.5 + 0.5) * H] as const;
      };
      const rectOf = (piece: Piece) => {
        const b = piece.box;
        let i = 0;
        for (const x of [b.min.x, b.max.x])
          for (const y of [b.min.y, b.max.y])
            for (const z of [b.min.z, b.max.z]) corners[i++].set(x, y, z);
        let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
        const mesh = piece.group.children[0];
        for (const c of corners) {
          v3.copy(c).applyMatrix4(mesh.matrixWorld);
          const [sx, sy] = toScreen(v3);
          x0 = Math.min(x0, sx); y0 = Math.min(y0, sy);
          x1 = Math.max(x1, sx); y1 = Math.max(y1, sy);
        }
        return { x0, y0, x1, y1 };
      };

      const drawHud = (alpha: number, rects: PieceRect[]) => {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, W, H);
        if (alpha < 0.01) return;
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = "rgba(219,234,254,0.85)";
        ctx.fillStyle = "rgba(219,234,254,0.9)";
        ctx.lineWidth = 1;
        ctx.font = "10px ui-monospace, SFMono-Regular, Menlo, monospace";

        rects.forEach((r, i) => {
          const pad = 10;
          const x0 = r.x0 - pad, y0 = r.y0 - pad, x1 = r.x1 + pad, y1 = r.y1 + pad;
          // Selection box
          ctx.strokeRect(x0 + 0.5, y0 + 0.5, x1 - x0, y1 - y0);
          // Square handles
          const hs = 6;
          for (const [hx, hy] of [
            [x0, y0], [x1, y0], [x0, y1], [x1, y1],
            [(x0 + x1) / 2, y0], [(x0 + x1) / 2, y1],
          ]) {
            ctx.clearRect(hx - hs / 2, hy - hs / 2, hs, hs);
            ctx.strokeRect(hx - hs / 2 + 0.5, hy - hs / 2 + 0.5, hs, hs);
          }
          // Layer label + dimensions, Figma-style
          const label = `${LABELS[i]} — ${Math.round(x1 - x0)} × ${Math.round(y1 - y0)}`;
          ctx.fillText(label, x0, y0 - 8);
        });

        // Redline between the two pieces' centers
        if (rects.length === 2) {
          const [a, b] = rects;
          const ax = (a.x0 + a.x1) / 2, ay = (a.y0 + a.y1) / 2;
          const bx = (b.x0 + b.x1) / 2, by = (b.y0 + b.y1) / 2;
          ctx.save();
          ctx.setLineDash([3, 4]);
          ctx.strokeStyle = "rgba(147,197,253,0.9)";
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(bx, by);
          ctx.stroke();
          ctx.restore();
          const mx = (ax + bx) / 2, my = (ay + by) / 2;
          const dist = `${Math.round(Math.hypot(bx - ax, by - ay))} px`;
          const tw = ctx.measureText(dist).width + 10;
          ctx.fillStyle = "rgba(59,130,246,0.95)";
          ctx.fillRect(mx - tw / 2, my - 8, tw, 16);
          ctx.fillStyle = "#fff";
          ctx.fillText(dist, mx - tw / 2 + 5, my + 3.5);
          // Crosshairs on each center
          ctx.strokeStyle = "rgba(219,234,254,0.85)";
          for (const [cx, cy] of [[ax, ay], [bx, by]]) {
            ctx.beginPath();
            ctx.moveTo(cx - 7, cy); ctx.lineTo(cx + 7, cy);
            ctx.moveTo(cx, cy - 7); ctx.lineTo(cx, cy + 7);
            ctx.stroke();
          }
        }
        ctx.globalAlpha = 1;
      };

      // ---- Choreography ------------------------------------------------------
      let pS = progress.get(); // smoothed progress
      let sS = splitOverride ? splitOverride.get() : 0; // smoothed split override
      const frame = (now: number) => {
        const t = now / 1000;
        const target = still ? 0 : progress.get();
        pS += (target - pS) * (still ? 1 : 0.12);
        const p = pS;

        tilt.x += (tilt.tx - tilt.x) * 0.06;
        tilt.y += (tilt.ty - tilt.y) * 0.06;

        // Separation: 0 → 1 → 0 across the sequence.
        if (splitOverride) sS += (clamp01(splitOverride.get()) - sS) * (still ? 1 : 0.12);
        const split = splitOverride ? ease(sS) : seg(p, 0.14, 0.42) - seg(p, 0.7, 0.94);
        const turn = seg(p, 0.08, 0.95);
        const dolly = seg(p, 0.12, 0.4) - seg(p, 0.62, 0.92);
        const idle = still || steady ? 0 : 1 - seg(p, 0, 0.12);

        // Fit: logo ≈ 46% of the viewport height at rest (less on phones).
        const fit = ((narrow ? 0.36 : 0.46) * visH) / VB_H;
        const s = fit * (1 + 0.15 * dolly) * (1 - 0.18 * seg(p, 0.86, 1));
        logo.scale.setScalar(s);

        // Shift the mark away from whichever text block is on screen.
        const visW = visH * (W / H);
        if (narrow) {
          logo.position.x = 0;
          logo.position.y =
            visH * (0.15 * seg(p, 0.14, 0.3) - 0.15 * seg(p, 0.7, 0.85));
        } else {
          logo.position.x =
            visW *
            (0.16 * seg(p, 0.14, 0.32) - 0.36 * seg(p, 0.42, 0.6) + 0.2 * seg(p, 0.74, 0.9));
          logo.position.y = 0;
        }
        logo.position.y += idle * Math.sin(t * 0.9) * 6;

        logo.rotation.y = turn * Math.PI * 2 + tilt.x + idle * Math.sin(t * 0.6) * 0.18;
        logo.rotation.x = Math.sin(turn * Math.PI) * 0.35 + tilt.y + (still ? -0.12 : 0);
        logo.rotation.z = Math.sin(turn * Math.PI) * -0.12;
        if (still) logo.rotation.y = 0.35;

        const [top, bottom] = pieces;
        const sx = 150 * split, sy = 115 * split, sz = 140 * split;
        top.group.position.set(top.base.x - sx, top.base.y + sy, sz);
        top.group.rotation.set(-0.7 * split, 0.4 * split, 0.35 * split);
        bottom.group.position.set(bottom.base.x + sx, bottom.base.y - sy, -sz);
        bottom.group.rotation.set(0.7 * split, -0.4 * split, 0.35 * split);

        renderer.render(scene, camera);
        logo.updateMatrixWorld();
        const rects = pieces.map(rectOf);
        const hudA = splitOverride
          ? clamp01((sS - 0.2) / 0.4)
          : seg(p, 0.12, 0.24) - seg(p, 0.76, 0.88);
        drawHud(still ? 0 : hudA, rects);
        anchorsRef.current?.(rects);
      };

      // ---- Loop only while visible -----------------------------------------
      let raf = 0;
      let running = false;
      const loop = (now: number) => {
        frame(now);
        raf = requestAnimationFrame(loop);
      };
      const start = () => {
        if (running || still) return;
        running = true;
        raf = requestAnimationFrame(loop);
      };
      const stop = () => {
        running = false;
        cancelAnimationFrame(raf);
      };
      const io = new IntersectionObserver(
        ([e]) => (e.isIntersecting ? start() : stop()),
        { threshold: 0 }
      );
      io.observe(wrap);
      frame(performance.now());

      cleanup = () => {
        stop();
        io.disconnect();
        ro.disconnect();
        window.removeEventListener("pointermove", onMove);
        geometries.forEach((g) => g.dispose());
        faceMat.dispose();
        sideMat.dispose();
        envTex.dispose();
        pmrem.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, [progress, still, steady, splitOverride, onFail]);

  return (
    <div ref={wrapRef} aria-hidden className={cn("relative", className)}>
      <canvas ref={hudRef} className="pointer-events-none absolute inset-0 h-full w-full" />
    </div>
  );
}
