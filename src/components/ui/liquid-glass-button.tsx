"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Liquid Glass button (adapted from the reference component).
 * - Frosted glass bevel via layered box-shadow
 * - Liquid distortion via the shared SVG turbulence filter (#liquid-glass)
 * - Hover scale + sheen, active press
 * Polymorphic: renders a Next <Link> when `href` is provided, else a <button>.
 */

type Tone = "ink" | "glass" | "blue";

type CommonProps = {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
};

type LiquidButtonProps =
  | (CommonProps & { href: string } & Omit<React.ComponentProps<typeof Link>, "href" | "className" | "children">)
  | (CommonProps & { href?: undefined } & Omit<React.ComponentProps<"button">, "className" | "children">);

export function LiquidButton({ tone = "glass", className, children, ...rest }: LiquidButtonProps) {
  const base =
    "group relative inline-flex h-12 items-center justify-center gap-2 overflow-hidden rounded-full px-7 text-sm font-semibold cursor-pointer transition-transform duration-300 ease-out hover:scale-[1.04] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue/50 focus-visible:ring-offset-2 focus-visible:ring-offset-bg";

  const toneClass =
    tone === "ink"
      ? "bg-ink/95 text-bg"
      : tone === "blue"
        ? "bg-gradient-to-b from-blue-light/95 via-blue to-blue-deep text-white shadow-[0_12px_34px_-8px_rgba(37,99,235,0.6)]"
        : "border border-border bg-ink/[0.06] text-ink backdrop-blur-md";

  const layers = (
    <>
      {/* liquid distortion (visible through translucent glass over content behind) */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 rounded-full"
        style={{ backdropFilter: 'url("#liquid-glass")' }}
      />
      {/* top gloss highlight (light only — no dark insets, avoids corner artifacts) */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-full bg-gradient-to-b from-white/25 to-transparent"
      />
      {/* hairline top edge */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35)" }}
      />
      {/* sheen sweep on hover */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
      />
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
    </>
  );

  if ("href" in rest && rest.href) {
    const { href, ...linkRest } = rest;
    return (
      <Link href={href} className={cn(base, toneClass, className)} {...linkRest}>
        {layers}
      </Link>
    );
  }

  const buttonRest = rest as React.ComponentProps<"button">;
  return (
    <button className={cn(base, toneClass, className)} {...buttonRest}>
      {layers}
    </button>
  );
}

/** Shared SVG turbulence filter — render once near the app root. */
export function GlassFilter() {
  return (
    <svg className="absolute h-0 w-0" aria-hidden focusable="false">
      <defs>
        <filter
          id="liquid-glass"
          x="0%"
          y="0%"
          width="100%"
          height="100%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence type="fractalNoise" baseFrequency="0.05 0.05" numOctaves="1" seed="1" result="turbulence" />
          <feGaussianBlur in="turbulence" stdDeviation="2" result="blurredNoise" />
          <feDisplacementMap in="SourceGraphic" in2="blurredNoise" scale="16" xChannelSelector="R" yChannelSelector="B" result="displaced" />
          <feGaussianBlur in="displaced" stdDeviation="3" result="finalBlur" />
          <feComposite in="finalBlur" in2="finalBlur" operator="over" />
        </filter>
      </defs>
    </svg>
  );
}
