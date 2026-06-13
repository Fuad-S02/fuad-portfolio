"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

type Mode = "light" | "dark";

/**
 * Animated blue "lightning" — the original radiating light-line texture, recolored blue.
 * Instead of expanding outward in circles, the texture stays put and its origin
 * follows the cursor; cursor movement stretches it into a motion tail.
 *  - mode="dark":  ink base, glowing blue lightning (immersive hero background)
 *  - mode="light": white base, soft blue lightning
 * Renders nothing when reduced motion is set (parent shows a CSS fallback).
 */
export function ShaderLightning({
  mode = "dark",
  intensity = 1,
  interactive = false,
  className,
}: {
  mode?: Mode;
  intensity?: number;
  interactive?: boolean;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const vertexShader = /* glsl */ `
      void main() { gl_Position = vec4(position, 1.0); }
    `;

    const fragmentShader = /* glsl */ `
      precision highp float;
      uniform vec2 resolution;
      uniform float time;
      uniform float uMode;       // 0 = light, 1 = dark
      uniform float uIntensity;
      uniform vec2 uMouse;       // smoothed origin (trails the cursor)
      uniform vec2 uVel;         // cursor lag vector → tail direction & length

      void main(void) {
        vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);

        // Flashlight-in-a-dark-room: a soft light pool around the cursor reveals the
        // fixed background pattern. No warping/dragging — just reveal.
        float md = length(uv - uMouse);
        // Clear round pool with a HARD outer cutoff so the bright neon lines never
        // bleed across the rest of the screen — they exist only around the cursor.
        float light = smoothstep(0.95, 0.16, md);

        float t = time * 0.2;

        // Clean DIAGONAL lines that rise to the right ("/"), with the neon glowing on
        // the EDGES of each bar (dark through the middle, bright at the boundaries).
        // The round cursor pool sweeping across these straight diagonals is what gives
        // the curved/arc sense of depth.
        vec2 dir = normalize(vec2(1.5, -1.0));   // perpendicular → bars rise to the right
        float coord = dot(uv, dir);
        float s1 = fract(coord * 3.2 + 0.03 * sin(t));
        float s2 = fract(coord * 1.6 + 0.40);
        float pattern =
            0.016 / (min(s1, 1.0 - s1) + 0.022) +   // main edge lines
            0.008 / (min(s2, 1.0 - s2) + 0.05);     // sparser accent lines

        // Revealed only around the cursor.
        float a = clamp(pattern * light * 1.3 * uIntensity, 0.0, 1.5);

        vec3 blueDeep = vec3(0.114, 0.306, 0.847); // #1D4ED8
        vec3 blue     = vec3(0.231, 0.510, 0.965); // #3B82F6
        vec3 lineCol  = mix(blue, blueDeep, clamp(md * 0.5, 0.0, 1.0));

        if (uMode < 0.5) {
          gl_FragColor = vec4(mix(vec3(1.0), lineCol, clamp(a, 0.0, 1.0)), 1.0);
        } else {
          gl_FragColor = vec4(vec3(0.039, 0.043, 0.051) + lineCol * a, 1.0);
        }
      }
    `;

    const camera = new THREE.Camera();
    camera.position.z = 1;
    const scene = new THREE.Scene();
    const geometry = new THREE.PlaneGeometry(2, 2);

    const uniforms = {
      time: { value: 1.0 },
      resolution: { value: new THREE.Vector2() },
      uMode: { value: mode === "dark" ? 1.0 : 0.0 },
      uIntensity: { value: intensity },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uVel: { value: new THREE.Vector2(0, 0) },
    };

    const material = new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h);
      uniforms.resolution.value.set(renderer.domElement.width, renderer.domElement.height);
    };
    onResize();
    window.addEventListener("resize", onResize);

    // Cursor → target origin (uv space)
    const target = new THREE.Vector2(0, 0);
    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const m = Math.min(rect.width, rect.height);
      const ux = ((e.clientX - rect.left) * 2 - rect.width) / m;
      const uy = -(((e.clientY - rect.top) * 2 - rect.height) / m);
      target.set(Math.max(-1.4, Math.min(1.4, ux)), Math.max(-1.4, Math.min(1.4, uy)));
    };
    if (interactive) window.addEventListener("pointermove", onPointerMove, { passive: true });

    let raf = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      uniforms.time.value += 0.05;
      if (interactive) {
        // light pool follows the cursor directly (smooth, no liquid drag)
        uniforms.uMouse.value.lerp(target, 0.18);
      }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      if (interactive) window.removeEventListener("pointermove", onPointerMove);
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, [mode, intensity, interactive]);

  return <div ref={containerRef} className={className} aria-hidden />;
}
