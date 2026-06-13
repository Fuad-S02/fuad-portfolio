"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

function fmt(t: number) {
  if (!Number.isFinite(t) || t < 0) return "0:00";
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * Custom video player styled to the site design system: blue scrubber,
 * mono timestamps, glass control bar + center play button, blue hovers.
 * Autoplays muted; user unmutes / scrubs / fullscreens via the custom UI.
 */
export function VideoPlayer({
  src,
  poster,
  className,
}: {
  src: string;
  poster?: string;
  className?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [cur, setCur] = useState(0);
  const [dur, setDur] = useState(0);
  const [hover, setHover] = useState(false);
  const [scrubbing, setScrubbing] = useState(false);
  const [fs, setFs] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onTime = () => setCur(v.currentTime);
    const onMeta = () => setDur(v.duration);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onVol = () => setMuted(v.muted);
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("loadedmetadata", onMeta);
    v.addEventListener("durationchange", onMeta);
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    v.addEventListener("volumechange", onVol);
    // Sync initial state in case events fired before this effect ran (autoplay).
    if (v.readyState >= 1) setDur(v.duration);
    setCur(v.currentTime);
    setMuted(v.muted);
    setPlaying(!v.paused);
    return () => {
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("loadedmetadata", onMeta);
      v.removeEventListener("durationchange", onMeta);
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("volumechange", onVol);
    };
  }, []);

  useEffect(() => {
    const onFs = () => setFs(document.fullscreenElement === wrapRef.current);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  };
  const toggleMute = () => {
    const v = videoRef.current;
    if (v) v.muted = !v.muted;
  };
  const toggleFs = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else wrapRef.current?.requestFullscreen?.();
  };

  const seekTo = (clientX: number) => {
    const v = videoRef.current;
    const bar = barRef.current;
    if (!v || !bar || !dur) return;
    const r = bar.getBoundingClientRect();
    const frac = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
    v.currentTime = frac * dur;
    setCur(frac * dur);
  };

  const pct = dur ? (cur / dur) * 100 : 0;
  const showControls = hover || !playing || scrubbing;

  return (
    <div
      ref={wrapRef}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={cn("group relative bg-black", className)}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        playsInline
        preload="metadata"
        onClick={togglePlay}
        className="h-full w-full cursor-pointer object-contain"
      />

      {/* Center play — shows when paused */}
      <button
        type="button"
        onClick={togglePlay}
        aria-label={playing ? "Pause" : "Play"}
        className={cn(
          "absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/40 text-white backdrop-blur-md transition-all duration-300 hover:border-blue hover:bg-blue/20 hover:text-blue-light",
          playing
            ? "pointer-events-none scale-90 opacity-0"
            : "scale-100 opacity-100"
        )}
      >
        <Icon name="play" className="ml-0.5 h-6 w-6" />
      </button>

      {/* Control bar */}
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent px-3.5 pb-3 pt-12 transition-opacity duration-300",
          showControls ? "opacity-100" : "opacity-0"
        )}
      >
        {/* Scrubber */}
        <div
          ref={barRef}
          role="slider"
          aria-label="Seek"
          aria-valuemin={0}
          aria-valuemax={Math.round(dur)}
          aria-valuenow={Math.round(cur)}
          tabIndex={0}
          onPointerDown={(e) => {
            setScrubbing(true);
            (e.target as HTMLElement).setPointerCapture(e.pointerId);
            seekTo(e.clientX);
          }}
          onPointerMove={(e) => {
            if (scrubbing) seekTo(e.clientX);
          }}
          onPointerUp={(e) => {
            setScrubbing(false);
            (e.target as HTMLElement).releasePointerCapture(e.pointerId);
          }}
          className="group/bar relative flex cursor-pointer touch-none items-center py-2"
        >
          <div className="relative h-1 w-full overflow-visible rounded-full bg-white/25 transition-[height] duration-200 group-hover/bar:h-1.5">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-blue-deep via-blue to-blue-light"
              style={{ width: `${pct}%` }}
            />
            <div
              className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full bg-white shadow-[0_0_0_3px_rgba(59,130,246,0.5)] transition-transform duration-200 group-hover/bar:scale-100"
              style={{ left: `${pct}%` }}
            />
          </div>
        </div>

        {/* Buttons + time */}
        <div className="mt-1.5 flex items-center gap-3 text-white">
          <button
            type="button"
            onClick={togglePlay}
            aria-label={playing ? "Pause" : "Play"}
            className="transition-colors hover:text-blue-light"
          >
            <Icon name={playing ? "pause" : "play"} className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={toggleMute}
            aria-label={muted ? "Unmute" : "Mute"}
            className="transition-colors hover:text-blue-light"
          >
            <Icon name={muted ? "muted" : "volume"} className="h-4 w-4" />
          </button>
          <span className="font-mono text-[0.7rem] tabular-nums tracking-wide text-white/80">
            {fmt(cur)} <span className="text-white/40">/</span> {fmt(dur)}
          </span>
          <button
            type="button"
            onClick={toggleFs}
            aria-label={fs ? "Exit fullscreen" : "Fullscreen"}
            className="ml-auto transition-colors hover:text-blue-light"
          >
            <Icon name={fs ? "minimize" : "fullscreen"} className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function Icon({ name, className }: { name: string; className?: string }) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (name) {
    case "play":
      return (
        <svg {...common} fill="currentColor" stroke="none">
          <path d="M7 5.5v13l11-6.5z" />
        </svg>
      );
    case "pause":
      return (
        <svg {...common} fill="currentColor" stroke="none">
          <rect x="6" y="5" width="4" height="14" rx="1" />
          <rect x="14" y="5" width="4" height="14" rx="1" />
        </svg>
      );
    case "volume":
      return (
        <svg {...common}>
          <path d="M4 9v6h4l5 4V5L8 9z" />
          <path d="M16.5 8.5a5 5 0 0 1 0 7" />
          <path d="M19 6a8 8 0 0 1 0 12" />
        </svg>
      );
    case "muted":
      return (
        <svg {...common}>
          <path d="M4 9v6h4l5 4V5L8 9z" />
          <path d="M22 9l-6 6M16 9l6 6" />
        </svg>
      );
    case "fullscreen":
      return (
        <svg {...common}>
          <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
        </svg>
      );
    case "minimize":
      return (
        <svg {...common}>
          <path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" />
        </svg>
      );
    default:
      return null;
  }
}
