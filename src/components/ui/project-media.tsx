"use client";

import { useEffect, useRef } from "react";

type ProjectMediaProps =
  | { type: "video"; src: string; poster: string; alt: string }
  | { type: "image"; src: string; alt: string }
  | { type: "placeholder"; label: string };

/**
 * Project thumbnail media. Videos are muted/looping and only play while in view
 * (IntersectionObserver) so just the project the visitor is looking at moves.
 */
export function ProjectMedia(props: ProjectMediaProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.55 }
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  if (props.type === "video") {
    return (
      <video
        ref={videoRef}
        src={props.src}
        poster={props.poster}
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={props.alt}
        className="h-full w-full object-cover"
      />
    );
  }

  if (props.type === "image") {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={props.src}
        alt={props.alt}
        className="h-full w-full object-cover"
        loading="lazy"
      />
    );
  }

  // Placeholder until the real asset is supplied
  return (
    <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(120%_120%_at_30%_20%,color-mix(in_srgb,var(--color-blue)_22%,var(--bg)),var(--bg))]">
      <div className="text-center">
        <p className="font-display text-lg font-semibold text-ink/70">
          {props.label}
        </p>
        <p className="mt-1 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted">
          Preview coming
        </p>
      </div>
    </div>
  );
}
