"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

type GhostCursorProps = {
  className?: string;
  color?: string;
  brightness?: number;
  trailLength?: number;
  inertia?: number;
  grainIntensity?: number;
  bloomStrength?: number;
  bloomRadius?: number;
  bloomThreshold?: number;
  mixBlendMode?: string;
  edgeIntensity?: number;
  maxDevicePixelRatio?: number;
  fadeDelayMs?: number;
  fadeDurationMs?: number;
};

/**
 * Smoky, glowing trail that follows the cursor across the whole page.
 * Adapted from React Bits "GhostCursor" — recolored, window-driven (works as a
 * fixed full-page background behind content), with idle fade-out.
 */
export function GhostCursor({
  className,
  color = "#3b82f6",
  brightness = 1.1,
  trailLength = 50,
  inertia = 0.5,
  grainIntensity = 0.04,
  bloomStrength = 0.55,
  bloomRadius = 1.0,
  bloomThreshold = 0.02,
  mixBlendMode = "screen",
  edgeIntensity = 0,
  maxDevicePixelRatio = 0.6,
  fadeDelayMs = 700,
  fadeDurationMs = 1400,
}: GhostCursorProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const baseVertexShader = `
    varying vec2 vUv;
    void main(){ vUv = uv; gl_Position = vec4(position, 1.0); }
  `;
  const fragmentShader = `
    uniform float iTime; uniform vec3 iResolution; uniform vec2 iMouse;
    uniform vec2 iPrevMouse[MAX_TRAIL_LENGTH];
    uniform float iOpacity; uniform float iScale; uniform vec3 iBaseColor;
    uniform float iBrightness; uniform float iEdgeIntensity; varying vec2 vUv;
    float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123); }
    float noise(vec2 p){ vec2 i=floor(p),f=fract(p); f*=f*(3.-2.*f);
      return mix(mix(hash(i+vec2(0,0)),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y); }
    float fbm(vec2 p){ float v=0.,a=.5; mat2 m=mat2(cos(.5),sin(.5),-sin(.5),cos(.5));
      for(int i=0;i<5;i++){ v+=a*noise(p); p=m*p*2.; a*=.5; } return v; }
    vec3 tint1(vec3 b){ return mix(b,vec3(1.),0.15); }
    vec3 tint2(vec3 b){ return mix(b,vec3(0.6,0.8,1.0),0.25); }
    vec4 blob(vec2 p, vec2 mp, float intensity, float activity){
      vec2 q=vec2(fbm(p*iScale+iTime*.1),fbm(p*iScale+vec2(5.2,1.3)+iTime*.1));
      vec2 r=vec2(fbm(p*iScale+q*1.5+iTime*.15),fbm(p*iScale+q*1.5+vec2(8.3,2.8)+iTime*.15));
      float smoke=fbm(p*iScale+r*.8);
      float radius=0.5+0.3*(1.0/iScale);
      float distFactor=1.0-smoothstep(0.0,radius*activity,length(p-mp));
      float alpha=pow(smoke,2.5)*distFactor;
      vec3 c1=tint1(iBaseColor),c2=tint2(iBaseColor);
      vec3 color=mix(c1,c2,sin(iTime*.5)*.5+.5);
      return vec4(color*alpha*intensity, alpha*intensity);
    }
    void main(){
      vec2 uv=(gl_FragCoord.xy/iResolution.xy*2.0-1.0)*vec2(iResolution.x/iResolution.y,1.0);
      vec2 mouse=(iMouse*2.0-1.0)*vec2(iResolution.x/iResolution.y,1.0);
      vec3 colorAcc=vec3(0.0); float alphaAcc=0.0;
      vec4 b=blob(uv,mouse,1.0,iOpacity); colorAcc+=b.rgb; alphaAcc+=b.a;
      for(int i=0;i<MAX_TRAIL_LENGTH;i++){
        vec2 pm=(iPrevMouse[i]*2.0-1.0)*vec2(iResolution.x/iResolution.y,1.0);
        float t=1.0-float(i)/float(MAX_TRAIL_LENGTH); t=pow(t,2.0);
        if(t>0.01){ vec4 bt=blob(uv,pm,t*0.8,iOpacity); colorAcc+=bt.rgb; alphaAcc+=bt.a; }
      }
      colorAcc*=iBrightness;
      vec2 uv01=gl_FragCoord.xy/iResolution.xy;
      float edgeDist=min(min(uv01.x,1.0-uv01.x),min(uv01.y,1.0-uv01.y));
      float distFromEdge=clamp(edgeDist*2.0,0.0,1.0);
      float k=clamp(iEdgeIntensity,0.0,1.0);
      float edgeMask=mix(1.0-k,1.0,distFromEdge);
      float outAlpha=clamp(alphaAcc*iOpacity*edgeMask,0.0,1.0);
      gl_FragColor=vec4(colorAcc,outAlpha);
    }
  `;

  const FilmGrainShader = useMemo(
    () => ({
      uniforms: { tDiffuse: { value: null }, iTime: { value: 0 }, intensity: { value: grainIntensity } },
      vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
      fragmentShader: `uniform sampler2D tDiffuse; uniform float iTime; uniform float intensity; varying vec2 vUv;
        float hash1(float n){ return fract(sin(n)*43758.5453); }
        void main(){ vec4 c=texture2D(tDiffuse,vUv); float n=hash1(vUv.x*1000.0+vUv.y*2000.0+iTime)*2.0-1.0; c.rgb+=n*intensity*c.rgb; gl_FragColor=c; }`,
    }),
    [grainIntensity]
  );

  useEffect(() => {
    const host = containerRef.current;
    if (!host) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let active = true;
    const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    if (isTouch) return; // skip on touch devices

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      depth: false,
      stencil: false,
      premultipliedAlpha: false,
    });
    renderer.setClearColor(0x000000, 0);
    const el = renderer.domElement;
    el.style.pointerEvents = "none";
    el.style.display = "block";
    el.style.width = "100%";
    el.style.height = "100%";
    el.style.mixBlendMode = mixBlendMode;
    host.appendChild(el);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geom = new THREE.PlaneGeometry(2, 2);
    const maxTrail = Math.max(1, Math.floor(trailLength));
    const trailBuf = Array.from({ length: maxTrail }, () => new THREE.Vector2(0.5, 0.5));
    let head = 0;
    const baseColor = new THREE.Color(color);

    const material = new THREE.ShaderMaterial({
      defines: { MAX_TRAIL_LENGTH: maxTrail },
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new THREE.Vector3(1, 1, 1) },
        iMouse: { value: new THREE.Vector2(0.5, 0.5) },
        iPrevMouse: { value: trailBuf.map((v) => v.clone()) },
        iOpacity: { value: 1.0 },
        iScale: { value: 1.6 },
        iBaseColor: { value: new THREE.Vector3(baseColor.r, baseColor.g, baseColor.b) },
        iBrightness: { value: brightness },
        iEdgeIntensity: { value: edgeIntensity },
      },
      vertexShader: baseVertexShader,
      fragmentShader,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });

    scene.add(new THREE.Mesh(geom, material));

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(1, 1), bloomStrength, bloomRadius, bloomThreshold);
    composer.addPass(bloomPass);
    const filmPass = new ShaderPass(FilmGrainShader as never);
    composer.addPass(filmPass);

    let validSize = false;
    const resize = () => {
      const rect = host.getBoundingClientRect();
      const cssW = Math.floor(rect.width);
      const cssH = Math.floor(rect.height);
      if (cssW <= 0 || cssH <= 0) {
        validSize = false;
        return;
      }
      const dpr = Math.min(window.devicePixelRatio || 1, maxDevicePixelRatio);
      renderer.setPixelRatio(dpr);
      renderer.setSize(cssW, cssH, false);
      composer.setPixelRatio?.(dpr);
      composer.setSize(cssW, cssH);
      const wpx = Math.max(1, Math.floor(cssW * dpr));
      const hpx = Math.max(1, Math.floor(cssH * dpr));
      material.uniforms.iResolution.value.set(wpx, hpx, 1);
      bloomPass.setSize(wpx, hpx);
      validSize = true;
    };
    resize();
    const ro = new ResizeObserver(() => resize());
    ro.observe(host);

    const current = new THREE.Vector2(0.5, 0.5);
    const velocity = new THREE.Vector2(0, 0);
    let fadeOpacity = 1.0;
    let lastMove = performance.now();
    let pointerActive = false;
    let running = false;
    let raf = 0;
    const startT = performance.now();

    const animate = () => {
      if (!active) return;
      if (!validSize) {
        raf = requestAnimationFrame(animate);
        return;
      }
      const now = performance.now();
      const t = (now - startT) / 1000;

      if (pointerActive && now - lastMove > fadeDelayMs) pointerActive = false;

      if (pointerActive) {
        velocity.set(current.x - material.uniforms.iMouse.value.x, current.y - material.uniforms.iMouse.value.y);
        material.uniforms.iMouse.value.copy(current);
        fadeOpacity = 1.0;
      } else {
        velocity.multiplyScalar(inertia);
        if (velocity.lengthSq() > 1e-6) material.uniforms.iMouse.value.add(velocity);
        const dt = now - lastMove;
        if (dt > fadeDelayMs) fadeOpacity = Math.max(0, 1 - Math.min(1, (dt - fadeDelayMs) / fadeDurationMs));
      }

      const N = trailBuf.length;
      head = (head + 1) % N;
      trailBuf[head].copy(material.uniforms.iMouse.value);
      const arr = material.uniforms.iPrevMouse.value as THREE.Vector2[];
      for (let i = 0; i < N; i++) arr[i].copy(trailBuf[(head - i + N) % N]);

      material.uniforms.iOpacity.value = fadeOpacity;
      material.uniforms.iTime.value = t;
      (filmPass as { uniforms?: { iTime?: { value: number } } }).uniforms!.iTime!.value = t;

      composer.render();

      if (!pointerActive && fadeOpacity <= 0.001) {
        running = false;
        raf = 0;
        return;
      }
      raf = requestAnimationFrame(animate);
    };
    const ensureLoop = () => {
      if (!running) {
        running = true;
        raf = requestAnimationFrame(animate);
      }
    };

    const onMove = (e: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      const x = THREE.MathUtils.clamp((e.clientX - rect.left) / Math.max(1, rect.width), 0, 1);
      const y = THREE.MathUtils.clamp(1 - (e.clientY - rect.top) / Math.max(1, rect.height), 0, 1);
      current.set(x, y);
      pointerActive = true;
      lastMove = performance.now();
      ensureLoop();
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    ensureLoop();

    return () => {
      active = false;
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      ro.disconnect();
      scene.clear();
      geom.dispose();
      material.dispose();
      composer.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      if (el.parentElement) el.parentElement.removeChild(el);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [color, brightness, mixBlendMode]);

  return <div ref={containerRef} className={className} aria-hidden />;
}
